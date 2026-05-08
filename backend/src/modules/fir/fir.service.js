const { AuditLog, CrimeType, FIR, PoliceStation, User } = require("../../models");
const { createNotification } = require("../notification/notification.service");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadRequestError";
    this.statusCode = 400;
  }
}

const officerRoles = ["CONSTABLE", "INSPECTOR", "SP", "DGP"];

const writeAuditLog = async ({ adminId, action, entityType, entityId, oldValues, newValues }) =>
  AuditLog.create({
    user_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
  });

const assertReferenceData = async ({ crimeTypeId, policeStationId, assignedOfficerId }) => {
  const [crimeType, policeStation, officer] = await Promise.all([
    CrimeType.findById(crimeTypeId),
    PoliceStation.findById(policeStationId),
    User.findById(assignedOfficerId),
  ]);

  if (!crimeType) throw new NotFoundError("Crime type not found");
  if (!policeStation) throw new NotFoundError("Police station not found");
  if (!officer) throw new NotFoundError("Assigned officer not found");

  if (!officerRoles.includes(officer.role)) {
    throw new BadRequestError("Assigned user must be an officer");
  }

  if (officer.status !== "active") {
    throw new BadRequestError("Assigned officer must be active");
  }

  if (String(officer.police_station_id) !== String(policeStationId)) {
    throw new BadRequestError("Assigned officer must belong to the selected police station");
  }

  return { crimeType, policeStation, officer };
};

const generateFirNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FIR-${datePart}-${randomPart}`;
};

const createFir = async (firData, adminId) => {
  await assertReferenceData({
    crimeTypeId: firData.crime_type_id,
    policeStationId: firData.police_station_id,
    assignedOfficerId: firData.assigned_officer_id,
  });

  const fir = await FIR.create({
    ...firData,
    fir_number: generateFirNumber(),
    filed_by_type: "officer",
    filed_by_id: adminId,
    created_by: adminId,
    status: "open",
  });

  await writeAuditLog({
    adminId,
    action: "CREATE_FIR",
    entityType: "FIR",
    entityId: fir._id,
    newValues: fir.toObject(),
  });

  await createNotification({
    userId: assignedOfficerId,
    title: "FIR assigned",
    message: `${fir.fir_number} has been assigned to you`,
    type: "FIR_ASSIGNED",
    relatedEntityType: "FIR",
    relatedEntityId: fir._id,
  });

  return getFirById(fir._id);
};

const assignOfficer = async (firId, assignedOfficerId, adminId) => {
  const fir = await FIR.findById(firId);
  if (!fir) throw new NotFoundError("FIR not found");

  await assertReferenceData({
    crimeTypeId: fir.crime_type_id,
    policeStationId: fir.police_station_id,
    assignedOfficerId,
  });

  const previousOfficerId = fir.assigned_officer_id;
  fir.assigned_officer_id = assignedOfficerId;
  await fir.save();

  await writeAuditLog({
    adminId,
    action: "ASSIGN_OFFICER",
    entityType: "FIR",
    entityId: fir._id,
    oldValues: { assigned_officer_id: previousOfficerId },
    newValues: { assigned_officer_id: assignedOfficerId },
  });

  return getFirById(fir._id);
};

const getFirs = async ({ status, police_station_id, assigned_officer_id, crime_type_id, page, limit }) => {
  const filter = {};
  if (status) filter.status = status;
  if (police_station_id) filter.police_station_id = police_station_id;
  if (assigned_officer_id) filter.assigned_officer_id = assigned_officer_id;
  if (crime_type_id) filter.crime_type_id = crime_type_id;

  const skip = (page - 1) * limit;
  const [firs, total] = await Promise.all([
    FIR.find(filter)
      .populate("assigned_officer_id", "name email role phone")
      .populate("police_station_id", "name address state zone")
      .populate("crime_type_id", "name severity")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    FIR.countDocuments(filter),
  ]);

  return {
    firs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getFirById = async (firId) => {
  const fir = await FIR.findById(firId)
    .populate("assigned_officer_id", "name email role phone")
    .populate("crime_type_id", "name severity description")
    .populate("police_station_id", "name address state zone phone")
    .populate("created_by", "name email role");

  if (!fir) throw new NotFoundError("FIR not found");
  return fir;
};

module.exports = {
  assignOfficer,
  createFir,
  getFirById,
  getFirs,
};
