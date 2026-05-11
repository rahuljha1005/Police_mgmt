const mongoose = require("mongoose");
const { AuditLog, CaseUpdate, Complaint, EmergencySOS, FIR, PoliceStation, User } = require("../../models");
const { createNotification } = require("../notification/notification.service");
const { buildComplaintScope, buildFirScope, buildSosScope, getAccessibleStations, getJurisdictionLabel } = require("../../utils/jurisdiction");

class TransferError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ACTIVE_STATUSES = ["ACTIVE", "active"];
const FIELD_ROLES = ["INSPECTOR", "CONSTABLE"];
const MAX_ACTIVE_WORKLOAD = 28;
const activeFirStatuses = ["open", "investigating"];
const pendingComplaintStatuses = ["PENDING", "UNDER_REVIEW"];
const activeSosStatuses = ["PENDING", "RESPONDING", "ON_SCENE", "ESCALATED"];

const objectId = (id) => new mongoose.Types.ObjectId(id);

const writeAuditLog = (actor, action, newValues) =>
  AuditLog.create({
    user_id: actor.id || actor._id,
    action,
    entity_type: "TRANSFER",
    entity_id: actor.id || actor._id,
    new_values: newValues,
  }).catch(() => null);

const getOfficerWorkload = async (officerId) => {
  const [activeFirs, pendingComplaints, activeSos] = await Promise.all([
    FIR.countDocuments({ assigned_officer_id: officerId, status: { $in: activeFirStatuses } }),
    Complaint.countDocuments({ assigned_officer_id: officerId, status: { $in: pendingComplaintStatuses } }),
    EmergencySOS.countDocuments({ assigned_officer_id: officerId, status: { $in: activeSosStatuses } }),
  ]);

  return {
    activeFirs,
    pendingComplaints,
    activeSos,
    total: activeFirs + pendingComplaints + activeSos,
  };
};

const assertTransferAuthority = (actor) => {
  if (!["ADMIN", "DGP", "SP", "INSPECTOR"].includes(actor.role)) {
    throw new TransferError("Constables do not have reassignment authority", 403);
  }
};

const assertTargetOfficer = async ({ actor, toOfficerId }) => {
  const officer = await User.findById(toOfficerId).select("-password");
  if (!officer) throw new TransferError("Replacement officer not found", 404);
  if (!FIELD_ROLES.includes(officer.role)) throw new TransferError("Replacement must be an inspector or constable", 400);
  if (!ACTIVE_STATUSES.includes(officer.status)) throw new TransferError("Cannot assign suspended or inactive officers", 400);

  const accessibleStations = await getAccessibleStations(actor);
  const allowedStationIds = accessibleStations.map((station) => String(station._id));
  if (!["ADMIN", "DGP"].includes(actor.role) && !allowedStationIds.includes(String(officer.police_station_id))) {
    throw new TransferError("Replacement officer is outside your jurisdiction", 403);
  }

  const workload = await getOfficerWorkload(officer._id);
  if (workload.total >= MAX_ACTIVE_WORKLOAD) {
    throw new TransferError("Replacement officer is overloaded. Choose another officer.", 400);
  }

  return { officer, workload };
};

const getTransferAssignments = async ({ actor, officerId }) => {
  assertTransferAuthority(actor);
  const firScope = await buildFirScope(actor);
  const complaintScope = await buildComplaintScope(actor);
  const sosScope = await buildSosScope(actor);

  const [firs, complaints, sosIncidents] = await Promise.all([
    FIR.find({ ...firScope, assigned_officer_id: officerId, status: { $in: activeFirStatuses } })
      .populate("police_station_id", "name district zone")
      .populate("assigned_officer_id", "name role badgeNumber")
      .sort({ updatedAt: -1 })
      .limit(80),
    Complaint.find({ ...complaintScope, assigned_officer_id: officerId, status: { $in: pendingComplaintStatuses } })
      .populate("police_station_id", "name district zone")
      .populate("assigned_officer_id", "name role badgeNumber")
      .sort({ updatedAt: -1 })
      .limit(80),
    EmergencySOS.find({ ...sosScope, assigned_officer_id: officerId, status: { $in: activeSosStatuses } })
      .populate("police_station_id", "name district zone")
      .populate("assigned_officer_id", "name role badgeNumber")
      .sort({ updatedAt: -1 })
      .limit(80),
  ]);

  return { firs, complaints, sosIncidents };
};

const getOfficerWorkloads = async (actor) => {
  assertTransferAuthority(actor);
  const accessibleStations = await getAccessibleStations(actor);
  const stationIds = accessibleStations.map((station) => station._id);
  const filter = {
    role: { $in: FIELD_ROLES },
    status: { $in: ACTIVE_STATUSES },
    ...(stationIds.length && !["ADMIN", "DGP"].includes(actor.role) ? { police_station_id: { $in: stationIds } } : {}),
  };

  const officers = await User.find(filter).select("name email role badgeNumber police_station_id").populate("police_station_id", "name district zone").sort({ role: 1, name: 1 });
  const workloads = await Promise.all(
    officers.map(async (officer) => ({
      officer,
      workload: await getOfficerWorkload(officer._id),
    }))
  );

  return {
    jurisdiction: await getJurisdictionLabel(actor),
    officers: workloads.sort((a, b) => b.workload.total - a.workload.total),
    overloaded: workloads.filter((item) => item.workload.total >= Math.floor(MAX_ACTIVE_WORKLOAD * 0.75)).length,
    averageLoad: workloads.length
      ? Math.round(workloads.reduce((sum, item) => sum + item.workload.total, 0) / workloads.length)
      : 0,
  };
};

const getReplacementSuggestions = async ({ actor, fromOfficerId, includeDistrict = true }) => {
  assertTransferAuthority(actor);
  const fromOfficer = await User.findById(fromOfficerId).populate("police_station_id", "district zone state");
  if (!fromOfficer) throw new TransferError("Source officer not found", 404);

  const accessibleStations = await getAccessibleStations(actor);
  const allowedStationIds = accessibleStations.map((station) => station._id);
  const sourceStation = fromOfficer.police_station_id;
  const districtStationIds = includeDistrict
    ? accessibleStations
        .filter((station) => {
          const district = sourceStation?.district || sourceStation?.zone;
          return district && [station.district, station.zone].includes(district);
        })
        .map((station) => station._id)
    : [];

  const candidateStationIds = [
    sourceStation?._id,
    ...districtStationIds,
    ...allowedStationIds,
  ].filter(Boolean);

  const candidates = await User.find({
    _id: { $ne: fromOfficer._id },
    role: { $in: FIELD_ROLES },
    status: { $in: ACTIVE_STATUSES },
    police_station_id: { $in: candidateStationIds },
  })
    .select("name email role badgeNumber police_station_id")
    .populate("police_station_id", "name district zone");

  const enriched = await Promise.all(
    candidates.map(async (candidate) => {
      const workload = await getOfficerWorkload(candidate._id);
      const sameStation = String(candidate.police_station_id?._id || candidate.police_station_id) === String(sourceStation?._id);
      const sameDistrict = [candidate.police_station_id?.district, candidate.police_station_id?.zone].includes(sourceStation?.district || sourceStation?.zone);
      const score = workload.total + (sameStation ? -8 : 0) + (sameDistrict ? -3 : 0) + (candidate.role === fromOfficer.role ? -2 : 0);
      return { officer: candidate, workload, sameStation, sameDistrict, recommendationScore: score };
    })
  );

  return enriched.sort((a, b) => a.recommendationScore - b.recommendationScore).slice(0, 8);
};

const notifyTransfer = async ({ fromOfficerId, toOfficerId, entityType, entityId, reason }) => {
  const tasks = [
    createNotification({
      userId: toOfficerId,
      title: `${entityType} assigned through handover`,
      message: `A ${entityType} has been transferred to you. Reason: ${reason}.`,
      type: "CASE_TRANSFERRED",
      relatedEntityType: entityType,
      relatedEntityId: entityId,
    }),
  ];

  if (fromOfficerId) {
    tasks.push(
      createNotification({
        userId: fromOfficerId,
        title: `${entityType} handed over`,
        message: `A ${entityType} has been reassigned from your queue. Reason: ${reason}.`,
        type: "CASE_HANDOVER",
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      })
    );
  }

  return Promise.all(tasks.map((task) => task.catch(() => null)));
};

const transferFir = async ({ fir, toOfficer, actor, reason, notes }) => {
  if (fir.status === "closed" || fir.status === "archived") {
    throw new TransferError(`FIR ${fir.fir_number} is closed or archived and cannot be transferred`, 400);
  }

  const fromOfficer = fir.assigned_officer_id;
  fir.assigned_officer_id = toOfficer._id;
  fir.transferHistory.push({ fromOfficer, toOfficer: toOfficer._id, transferredBy: actor.id || actor._id, reason, notes });
  await fir.save();

  await CaseUpdate.create({
    fir_id: fir._id,
    officer_id: actor.id || actor._id,
    updateType: "OFFICER_TRANSFERRED",
    title: "Case handover completed",
    description: `FIR reassigned from ${fromOfficer || "unassigned"} to ${toOfficer.name}. Reason: ${reason}. Notes: ${notes}`,
  });

  await notifyTransfer({ fromOfficerId: fromOfficer, toOfficerId: toOfficer._id, entityType: "FIR", entityId: fir._id, reason });
  return fir._id;
};

const transferComplaint = async ({ complaint, toOfficer, actor, reason, notes }) => {
  const fromOfficer = complaint.assigned_officer_id;
  complaint.assigned_officer_id = toOfficer._id;
  if (complaint.status === "PENDING") complaint.status = "UNDER_REVIEW";
  complaint.transferHistory.push({ fromOfficer, toOfficer: toOfficer._id, transferredBy: actor.id || actor._id, reason, notes });
  await complaint.save();
  await notifyTransfer({ fromOfficerId: fromOfficer, toOfficerId: toOfficer._id, entityType: "COMPLAINT", entityId: complaint._id, reason });
  return complaint._id;
};

const transferSos = async ({ sos, toOfficer, actor, reason, notes }) => {
  const fromOfficer = sos.assigned_officer_id;
  sos.assigned_officer_id = toOfficer._id;
  sos.transferHistory.push({ fromOfficer, toOfficer: toOfficer._id, transferredBy: actor.id || actor._id, reason, notes });
  sos.incidentTimeline.push({
    action: "SOS_REASSIGNED",
    officer_id: actor.id || actor._id,
    officerName: actor.name,
    notes: `SOS reassigned to ${toOfficer.name}. Reason: ${reason}. ${notes}`,
    createdAt: new Date(),
  });
  await sos.save();
  await notifyTransfer({ fromOfficerId: fromOfficer, toOfficerId: toOfficer._id, entityType: "SOS", entityId: sos._id, reason });
  return sos._id;
};

const bulkTransfer = async ({ actor, payload }) => {
  assertTransferAuthority(actor);
  const { officer: toOfficer, workload } = await assertTargetOfficer({ actor, toOfficerId: payload.toOfficerId });
  const requestedCount = payload.firIds.length + payload.complaintIds.length + payload.sosIds.length;
  if (workload.total + requestedCount > MAX_ACTIVE_WORKLOAD) {
    throw new TransferError("This transfer would overload the replacement officer", 400);
  }

  const [firScope, complaintScope, sosScope] = await Promise.all([buildFirScope(actor), buildComplaintScope(actor), buildSosScope(actor)]);
  const [firs, complaints, sosIncidents] = await Promise.all([
    FIR.find({ ...firScope, _id: { $in: payload.firIds.map(objectId) } }),
    Complaint.find({ ...complaintScope, _id: { $in: payload.complaintIds.map(objectId) } }),
    EmergencySOS.find({ ...sosScope, _id: { $in: payload.sosIds.map(objectId) } }),
  ]);

  if (firs.length !== payload.firIds.length || complaints.length !== payload.complaintIds.length || sosIncidents.length !== payload.sosIds.length) {
    throw new TransferError("One or more selected items are outside your jurisdiction", 403);
  }

  const transferred = {
    firIds: [],
    complaintIds: [],
    sosIds: [],
  };

  for (const fir of firs) {
    transferred.firIds.push(await transferFir({ fir, toOfficer, actor, reason: payload.reason, notes: payload.notes }));
  }
  for (const complaint of complaints) {
    transferred.complaintIds.push(await transferComplaint({ complaint, toOfficer, actor, reason: payload.reason, notes: payload.notes }));
  }
  for (const sos of sosIncidents) {
    transferred.sosIds.push(await transferSos({ sos, toOfficer, actor, reason: payload.reason, notes: payload.notes }));
  }

  await writeAuditLog(actor, "BULK_CASE_TRANSFER", {
    fromOfficerId: payload.fromOfficerId,
    toOfficerId: toOfficer._id,
    reason: payload.reason,
    notes: payload.notes,
    transferred,
  });

  return {
    toOfficer,
    transferred,
    totalTransferred: transferred.firIds.length + transferred.complaintIds.length + transferred.sosIds.length,
  };
};

module.exports = {
  bulkTransfer,
  getOfficerWorkloads,
  getReplacementSuggestions,
  getTransferAssignments,
};
