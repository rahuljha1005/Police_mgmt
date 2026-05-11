const { AuditLog, CrimeType, EmergencySOS, FIR, PatrolUnit, PoliceStation, User } = require("../../models");
const { createNotification } = require("../notification/notification.service");
const { buildSosScope } = require("../../utils/jurisdiction");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class WorkflowError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

const criticalTypes = new Set(["ROBBERY", "ASSAULT", "WOMEN_SAFETY", "FIRE"]);
const terminalStatuses = new Set(["RESOLVED", "FALSE_ALERT", "REJECTED"]);
const allowedTransitions = {
  PENDING: ["RESPONDING", "ESCALATED", "REJECTED", "FALSE_ALERT"],
  RESPONDING: ["ON_SCENE", "ESCALATED", "FALSE_ALERT"],
  ON_SCENE: ["RESOLVED", "ESCALATED", "FALSE_ALERT"],
  ESCALATED: ["RESPONDING", "ON_SCENE", "RESOLVED", "FALSE_ALERT"],
  RESOLVED: [],
  FALSE_ALERT: [],
  REJECTED: [],
};

const distanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const writeAuditLog = (payload) =>
  AuditLog.create({
    user_id: payload.userId,
    actor_model: payload.actorModel || "User",
    action: payload.action,
    entity_type: "SOS",
    entity_id: payload.entityId,
    new_values: payload.newValues,
  }).catch(() => null);

const populateSos = (query) =>
  query
    .populate("civilian_id", "name phone email")
    .populate("assigned_patrol_id", "name status zone_id currentLocation")
    .populate("assigned_officer_id", "name email phone role")
    .populate("incidentTimeline.officer_id", "name role")
    .populate("firId", "fir_number title status priority");

const assertTransition = (from, to) => {
  if (from === to) return;
  if (terminalStatuses.has(from) || !allowedTransitions[from]?.includes(to)) {
    throw new WorkflowError(`Invalid SOS transition from ${from} to ${to}`);
  }
};

const addTimeline = (sos, { action, officer, notes }) => {
  sos.incidentTimeline.push({
    action,
    officer_id: officer?._id || officer?.id,
    officerName: officer?.name,
    notes,
    createdAt: new Date(),
  });
};

const notifyCivilian = (sos, { title, message, type }) =>
  createNotification({
    userId: sos.civilian_id,
    userModel: "Civilian",
    title,
    message,
    type,
    relatedEntityType: "SOS",
    relatedEntityId: sos._id,
  });

const findNearestPatrol = async (location) => {
  const patrols = await PatrolUnit.find({
    status: "AVAILABLE",
    "currentLocation.latitude": { $type: "number" },
    "currentLocation.longitude": { $type: "number" },
  }).limit(100);

  return patrols
    .map((patrol) => ({
      patrol,
      distance: distanceKm(location, {
        latitude: patrol.currentLocation.latitude,
        longitude: patrol.currentLocation.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
};

const findNearestOfficer = async (location) => {
  const nearestStation = await PoliceStation.find({
    latitude: { $type: "number" },
    longitude: { $type: "number" },
  }).then((stations) =>
    stations
      .map((station) => ({
        station,
        distance: distanceKm(location, {
          latitude: station.latitude,
          longitude: station.longitude,
        }),
      }))
      .sort((a, b) => a.distance - b.distance)[0]
  );

  if (!nearestStation) return null;

  const officer = await User.findOne({
    role: { $in: ["CONSTABLE", "INSPECTOR"] },
    status: { $in: ["ACTIVE", "active"] },
    police_station_id: nearestStation.station._id,
  }).select("_id name role police_station_id");

  return officer ? { officer, distance: nearestStation.distance } : null;
};

const findNearestStation = async (location) => {
  const stations = await PoliceStation.find({
    latitude: { $type: "number" },
    longitude: { $type: "number" },
  }).select("_id state district zone latitude longitude");

  return stations
    .map((station) => ({
      station,
      distance: distanceKm(location, {
        latitude: station.latitude,
        longitude: station.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
};

const createSos = async ({ civilianId, payload }) => {
  const priority = payload.priority || (criticalTypes.has(payload.emergencyType) ? "CRITICAL" : "HIGH");
  const nearestPatrol = await findNearestPatrol(payload.location);
  const nearestOfficer = await findNearestOfficer(payload.location);
  const nearestStation = await findNearestStation(payload.location);

  const sos = await EmergencySOS.create({
    civilian_id: civilianId,
    emergencyType: payload.emergencyType,
    description: payload.description,
    location: payload.location,
    priority,
    status: "PENDING",
    state_id: nearestStation?.station?.state || "Maharashtra",
    district_id: nearestStation?.station?.district || nearestStation?.station?.zone,
    police_station_id: nearestStation?.station?._id,
    assigned_patrol_id: nearestPatrol?.patrol?._id,
    assigned_officer_id: nearestPatrol?.patrol?.assigned_officer_id || nearestOfficer?.officer?._id,
    distanceKm: nearestPatrol?.distance || nearestOfficer?.distance,
    incidentTimeline: [
      {
        action: "SOS_CREATED",
        notes: `${payload.emergencyType} emergency reported near ${payload.location.address}`,
        createdAt: new Date(),
      },
    ],
  });

  await Promise.all([
    writeAuditLog({
      userId: civilianId,
      actorModel: "Civilian",
      action: "SOS_CREATED",
      entityId: sos._id,
      newValues: { emergencyType: sos.emergencyType, priority: sos.priority },
    }),
    notifyCivilian(sos, {
      title: "SOS request created",
      message: "Your SOS request has been received by the emergency desk.",
      type: "SOS_CREATED",
    }),
  ]);

  return populateSos(EmergencySOS.findById(sos._id));
};

const getMySos = async ({ civilianId, page, limit }) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    populateSos(EmergencySOS.find({ civilian_id: civilianId })).sort({ createdAt: -1 }).skip(skip).limit(limit),
    EmergencySOS.countDocuments({ civilian_id: civilianId }),
  ]);

  return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getPoliceSos = async ({ status, emergencyType, priority, page, limit }, actor) => {
  const filter = actor ? await buildSosScope(actor) : {};
  if (status) filter.status = status;
  if (emergencyType) filter.emergencyType = emergencyType;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    populateSos(EmergencySOS.find(filter)).sort({ createdAt: -1 }).skip(skip).limit(limit),
    EmergencySOS.countDocuments(filter),
  ]);

  return { items, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};

const getSosOrThrow = async (sosId) => {
  const sos = await EmergencySOS.findById(sosId);
  if (!sos) throw new NotFoundError("SOS request not found");
  return sos;
};

const assertSosAccess = async (sos, officer) => {
  const scope = await buildSosScope(officer);
  if (!scope.police_station_id && !scope.$or) return;
  if (scope.$or) {
    const hasAssignedAccess = scope.$or.some((condition) => {
      if (condition.assigned_officer_id) return String(sos.assigned_officer_id || "") === String(condition.assigned_officer_id);
      if (condition.police_station_id?.$in) {
        return condition.police_station_id.$in.some((id) => String(id) === String(sos.police_station_id || "")) && condition.status.$in.includes(sos.status);
      }
      return false;
    });
    if (!hasAssignedAccess) throw new WorkflowError("SOS incident is outside your jurisdiction");
    return;
  }
  if (scope.police_station_id?.$in && !scope.police_station_id.$in.some((id) => String(id) === String(sos.police_station_id || ""))) {
    throw new WorkflowError("SOS incident is outside your jurisdiction");
  }
};

const respondToSos = async ({ sosId, officer }) => {
  const sos = await getSosOrThrow(sosId);
  await assertSosAccess(sos, officer);
  assertTransition(sos.status, "RESPONDING");

  const nearestPatrol = sos.assigned_patrol_id ? null : await findNearestPatrol(sos.location);
  sos.status = "RESPONDING";
  sos.respondedAt = sos.respondedAt || new Date();
  sos.assigned_officer_id = sos.assigned_officer_id || officer.id || officer._id;
  if (nearestPatrol?.patrol) {
    sos.assigned_patrol_id = nearestPatrol.patrol._id;
    sos.distanceKm = nearestPatrol.distance;
    await PatrolUnit.updateOne({ _id: nearestPatrol.patrol._id }, { status: "BUSY" });
  } else if (sos.assigned_patrol_id) {
    await PatrolUnit.updateOne({ _id: sos.assigned_patrol_id }, { status: "BUSY" });
  }
  addTimeline(sos, {
    action: "SOS_RESPONDING",
    officer,
    notes: `${officer.name} accepted emergency request. Officer responding to incident.`,
  });
  await sos.save();

  await Promise.all([
    writeAuditLog({ userId: officer.id, action: "SOS_RESPONDING", entityId: sos._id, newValues: { status: sos.status } }),
    notifyCivilian(sos, {
      title: "Officer responding",
      message: "An officer has accepted your emergency request and is responding.",
      type: "SOS_RESPONDING",
    }),
  ]);

  return populateSos(EmergencySOS.findById(sos._id));
};

const markOnScene = async ({ sosId, officer }) => {
  const sos = await getSosOrThrow(sosId);
  await assertSosAccess(sos, officer);
  assertTransition(sos.status, "ON_SCENE");
  sos.status = "ON_SCENE";
  sos.arrivedAt = new Date();
  addTimeline(sos, { action: "SOS_ON_SCENE", officer, notes: "Officer arrived at emergency location." });
  await sos.save();

  await Promise.all([
    writeAuditLog({ userId: officer.id, action: "SOS_ON_SCENE", entityId: sos._id, newValues: { status: sos.status } }),
    notifyCivilian(sos, {
      title: "Officer on scene",
      message: "The responding officer has arrived at your emergency location.",
      type: "SOS_ON_SCENE",
    }),
  ]);

  return populateSos(EmergencySOS.findById(sos._id));
};

const ensureSosCrimeType = async () => {
  let crimeType = await CrimeType.findOne({ name: "SOS Emergency" });
  if (!crimeType) {
    crimeType = await CrimeType.create({
      name: "SOS Emergency",
      severity: "high",
      description: "Emergency incident converted from a civilian SOS request.",
    });
  }
  return crimeType;
};

const convertSosToFir = async ({ sos, officer, resolution }) => {
  const crimeType = await ensureSosCrimeType();
  const stationId =
    officer.police_station_id ||
    (await PoliceStation.findOne({ latitude: { $type: "number" }, longitude: { $type: "number" } }).select("_id"))?._id;
  if (!stationId) return null;

  const fir = await FIR.create({
    fir_number: `SOS-${Date.now()}-${String(sos._id).slice(-5)}`,
    title: `${sos.emergencyType} emergency converted from SOS`,
    description: `${sos.description}\n\nResolution summary: ${resolution.incidentSummary}\nAction taken: ${resolution.actionTaken}`,
    location: sos.location,
    crime_type_id: crimeType._id,
    filed_by_type: "civilian",
    filed_by_id: sos.civilian_id,
    assigned_officer_id: officer.id || officer._id,
    created_by: officer.id || officer._id,
    police_station_id: stationId,
    status: "open",
    priority: sos.priority.toLowerCase() === "critical" ? "critical" : "high",
  });

  sos.firId = fir._id;
  addTimeline(sos, { action: "SOS_CONVERTED_TO_FIR", officer, notes: `FIR ${fir.fir_number} created from SOS incident.` });
  await writeAuditLog({ userId: officer.id, action: "SOS_CONVERTED_TO_FIR", entityId: sos._id, newValues: { firId: fir._id } });
  await notifyCivilian(sos, {
    title: "FIR created from SOS",
    message: `Your SOS emergency has been converted into FIR ${fir.fir_number}.`,
    type: "SOS_CONVERTED_TO_FIR",
  });

  return fir;
};

const resolveSos = async ({ sosId, officer, payload }) => {
  const sos = await getSosOrThrow(sosId);
  await assertSosAccess(sos, officer);
  assertTransition(sos.status, "RESOLVED");
  sos.status = "RESOLVED";
  sos.resolvedAt = new Date();
  sos.resolutionSummary = payload;
  addTimeline(sos, {
    action: "SOS_RESOLVED",
    officer,
    notes: `${payload.actionTaken}. ${payload.additionalNotes || ""}`.trim(),
  });
  if (payload.firRequired) await convertSosToFir({ sos, officer, resolution: payload });
  await sos.save();

  if (sos.assigned_patrol_id) await PatrolUnit.updateOne({ _id: sos.assigned_patrol_id }, { status: "AVAILABLE" });

  await Promise.all([
    writeAuditLog({ userId: officer.id, action: "SOS_RESOLVED", entityId: sos._id, newValues: payload }),
    notifyCivilian(sos, {
      title: "SOS resolved",
      message: "Your emergency request has been resolved by the response team.",
      type: "SOS_RESOLVED",
    }),
  ]);

  return populateSos(EmergencySOS.findById(sos._id));
};

const escalateSos = async ({ sosId, officer, payload }) => {
  const sos = await getSosOrThrow(sosId);
  await assertSosAccess(sos, officer);
  assertTransition(sos.status, "ESCALATED");
  sos.status = "ESCALATED";
  sos.priority = "CRITICAL";
  sos.escalationLevel = (sos.escalationLevel || 0) + 1;
  addTimeline(sos, {
    action: "SOS_ESCALATED",
    officer,
    notes: `${payload.supportType} requested. ${payload.reason}`,
  });
  await sos.save();

  await Promise.all([
    writeAuditLog({ userId: officer.id, action: "SOS_ESCALATED", entityId: sos._id, newValues: payload }),
    notifyCivilian(sos, {
      title: "SOS escalated",
      message: "Your emergency has been escalated for additional support.",
      type: "SOS_ESCALATED",
    }),
  ]);

  return populateSos(EmergencySOS.findById(sos._id));
};

const markFalseAlert = async ({ sosId, officer, payload }) => {
  const sos = await getSosOrThrow(sosId);
  await assertSosAccess(sos, officer);
  assertTransition(sos.status, "FALSE_ALERT");
  sos.status = "FALSE_ALERT";
  sos.resolvedAt = new Date();
  sos.resolutionSummary = { ...(sos.resolutionSummary || {}), falseAlertReason: payload.reason };
  addTimeline(sos, { action: "SOS_FALSE_ALERT", officer, notes: payload.reason });
  await sos.save();
  if (sos.assigned_patrol_id) await PatrolUnit.updateOne({ _id: sos.assigned_patrol_id }, { status: "AVAILABLE" });

  await Promise.all([
    writeAuditLog({ userId: officer.id, action: "SOS_FALSE_ALERT", entityId: sos._id, newValues: payload }),
    notifyCivilian(sos, {
      title: "SOS marked false alert",
      message: "Your emergency request has been reviewed and marked as a false alert.",
      type: "SOS_FALSE_ALERT",
    }),
  ]);

  return populateSos(EmergencySOS.findById(sos._id));
};

const getSosAnalytics = async (actor) => {
  const filter = actor ? await buildSosScope(actor) : {};
  const sosItems = await EmergencySOS.find(filter).select("status priority respondedAt arrivedAt resolvedAt createdAt escalationLevel assigned_patrol_id district_id police_station_id").lean();
  const activeStatuses = ["PENDING", "RESPONDING", "ON_SCENE", "ESCALATED"];
  const responseTimes = sosItems
    .filter((item) => item.respondedAt)
    .map((item) => (new Date(item.respondedAt) - new Date(item.createdAt)) / 60000);
  const resolutionTimes = sosItems
    .filter((item) => item.resolvedAt)
    .map((item) => (new Date(item.resolvedAt) - new Date(item.createdAt)) / 60000);
  const average = (items) => (items.length ? Math.round(items.reduce((sum, value) => sum + value, 0) / items.length) : 0);

  return {
    total: sosItems.length,
    active: sosItems.filter((item) => activeStatuses.includes(item.status)).length,
    critical: sosItems.filter((item) => item.priority === "CRITICAL").length,
    escalated: sosItems.filter((item) => item.status === "ESCALATED" || item.escalationLevel > 0).length,
    averageResponseMinutes: average(responseTimes),
    averageResolutionMinutes: average(resolutionTimes),
    patrolUtilization: sosItems.filter((item) => item.assigned_patrol_id && activeStatuses.includes(item.status)).length,
    statusBreakdown: Object.entries(
      sosItems.reduce((acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({ status, count })),
    districtLoad: Object.entries(
      sosItems.reduce((acc, item) => {
        const key = item.district_id || "Unmapped";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([district, count]) => ({ district, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
};

const updateSos = async ({ sosId, payload, actorId }) => {
  const sos = await getSosOrThrow(sosId);
  Object.assign(sos, payload);
  addTimeline(sos, { action: "SOS_UPDATED", officer: { id: actorId }, notes: "SOS details updated." });
  await sos.save();
  return populateSos(EmergencySOS.findById(sos._id));
};

module.exports = {
  createSos,
  escalateSos,
  getMySos,
  getPoliceSos,
  getSosAnalytics,
  markFalseAlert,
  markOnScene,
  respondToSos,
  resolveSos,
  updateSos,
};
