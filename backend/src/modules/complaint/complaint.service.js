const {
  AuditLog,
  Civilian,
  Complaint,
  CrimeLocation,
  CrimeType,
  FIR,
  PoliceStation,
  User,
} = require("../../models");
const { createNotification } = require("../notification/notification.service");

class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConflictError";
    this.statusCode = 409;
  }
}

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
const priorityToFirPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

const generateFirNumber = () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `FIR-${datePart}-${randomPart}`;
};

const writeAuditLog = async ({ userId, action, entityType, entityId, oldValues, newValues }) =>
  AuditLog.create({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
  });

const populateComplaint = (query) =>
  query
    .populate("civilian_id", "name phone email address")
    .populate("police_station_id", "name address state zone")
    .populate("assigned_officer_id", "name email role phone")
    .populate("fir_id", "fir_number title status priority");

const assertPoliceStation = async (policeStationId) => {
  if (!policeStationId) return null;
  const station = await PoliceStation.findById(policeStationId);
  if (!station) throw new NotFoundError("Police station not found");
  return station;
};

const assertOfficer = async (officerId, policeStationId) => {
  if (!officerId) return null;

  const officer = await User.findById(officerId);
  if (!officer) throw new NotFoundError("Assigned officer not found");
  if (!officerRoles.includes(officer.role)) {
    throw new BadRequestError("Assigned user must be an officer");
  }
  if (officer.status !== "active") {
    throw new BadRequestError("Assigned officer must be active");
  }
  if (policeStationId && String(officer.police_station_id) !== String(policeStationId)) {
    throw new BadRequestError("Assigned officer must belong to the selected police station");
  }

  return officer;
};

const findOrCreateCivilian = async (civilianData) => {
  const existingCivilian = await Civilian.findOne({ phone: civilianData.phone });
  if (existingCivilian) {
    return existingCivilian;
  }

  return Civilian.create(civilianData);
};

const createComplaint = async (complaintData, actorId) => {
  await assertPoliceStation(complaintData.police_station_id);
  await assertOfficer(complaintData.assigned_officer_id, complaintData.police_station_id);

  const civilian = await findOrCreateCivilian(complaintData.civilian);

  const complaint = await Complaint.create({
    civilian_id: civilian._id,
    title: complaintData.title,
    description: complaintData.description,
    police_station_id: complaintData.police_station_id,
    status: "PENDING",
    priority: complaintData.priority,
    complaint_location: complaintData.complaint_location,
    assigned_officer_id: complaintData.assigned_officer_id,
  });

  await writeAuditLog({
    userId: actorId,
    action: "CREATE_COMPLAINT",
    entityType: "COMPLAINT",
    entityId: complaint._id,
    newValues: complaint.toObject(),
  });

  return populateComplaint(Complaint.findById(complaint._id));
};

const getComplaints = async ({ status, police_station_id, assigned_officer_id, priority, page, limit }) => {
  const filter = {};
  if (status) filter.status = status;
  if (police_station_id) filter.police_station_id = police_station_id;
  if (assigned_officer_id) filter.assigned_officer_id = assigned_officer_id;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;
  const [complaints, total] = await Promise.all([
    populateComplaint(Complaint.find(filter))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  return {
    complaints,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getComplaintById = async (complaintId) => {
  const complaint = await populateComplaint(Complaint.findById(complaintId));
  if (!complaint) throw new NotFoundError("Complaint not found");
  return complaint;
};

const assignOfficer = async (complaintId, assignedOfficerId, actorId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new NotFoundError("Complaint not found");

  await assertOfficer(assignedOfficerId, complaint.police_station_id);

  const previousOfficerId = complaint.assigned_officer_id;
  complaint.assigned_officer_id = assignedOfficerId;
  if (complaint.status === "PENDING") {
    complaint.status = "UNDER_REVIEW";
  }
  await complaint.save();

  await writeAuditLog({
    userId: actorId,
    action: "ASSIGN_COMPLAINT_OFFICER",
    entityType: "COMPLAINT",
    entityId: complaint._id,
    oldValues: { assigned_officer_id: previousOfficerId },
    newValues: { assigned_officer_id: assignedOfficerId },
  });

  await createNotification({
    userId: assignedOfficerId,
    title: "Complaint assigned",
    message: `Complaint "${complaint.title}" has been assigned to you`,
    type: "COMPLAINT_ASSIGNED",
    relatedEntityType: "COMPLAINT",
    relatedEntityId: complaint._id,
  });

  return getComplaintById(complaint._id);
};

const updateComplaintStatus = async (complaintId, status, actorId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new NotFoundError("Complaint not found");

  if (complaint.status === "CONVERTED_TO_FIR" && status !== "CONVERTED_TO_FIR") {
    throw new BadRequestError("Converted complaints cannot be moved to another status");
  }
  if (status === "CONVERTED_TO_FIR" && !complaint.fir_id) {
    throw new BadRequestError("Use the convert-to-fir endpoint to convert a complaint");
  }

  const previousStatus = complaint.status;
  complaint.status = status;
  await complaint.save();

  await writeAuditLog({
    userId: actorId,
    action: "UPDATE_COMPLAINT_STATUS",
    entityType: "COMPLAINT",
    entityId: complaint._id,
    oldValues: { status: previousStatus },
    newValues: { status },
  });

  return getComplaintById(complaint._id);
};

const convertComplaintToFir = async (complaintId, conversionData, actorId) => {
  const complaint = await Complaint.findById(complaintId);
  if (!complaint) throw new NotFoundError("Complaint not found");
  if (complaint.fir_id || complaint.status === "CONVERTED_TO_FIR") {
    throw new ConflictError("Complaint is already converted to an FIR");
  }

  const policeStationId = conversionData.police_station_id || complaint.police_station_id;
  const assignedOfficerId = conversionData.assigned_officer_id || complaint.assigned_officer_id;

  if (!policeStationId) {
    throw new BadRequestError("Police station is required to convert complaint to FIR");
  }
  if (!assignedOfficerId) {
    throw new BadRequestError("Assigned officer is required to convert complaint to FIR");
  }
  if (
    !complaint.complaint_location?.address ||
    typeof complaint.complaint_location.latitude !== "number" ||
    typeof complaint.complaint_location.longitude !== "number"
  ) {
    throw new BadRequestError("Complaint location coordinates are required to convert complaint to FIR");
  }

  const [crimeType] = await Promise.all([
    CrimeType.findById(conversionData.crime_type_id),
    assertPoliceStation(policeStationId),
    assertOfficer(assignedOfficerId, policeStationId),
  ]);

  if (!crimeType) throw new NotFoundError("Crime type not found");

  const fir = await FIR.create({
    fir_number: generateFirNumber(),
    title: complaint.title,
    description: complaint.description,
    location: {
      address: complaint.complaint_location?.address,
      latitude: complaint.complaint_location?.latitude,
      longitude: complaint.complaint_location?.longitude,
    },
    crime_type_id: conversionData.crime_type_id,
    filed_by_type: "civilian",
    filed_by_id: complaint.civilian_id,
    assigned_officer_id: assignedOfficerId,
    created_by: actorId,
    police_station_id: policeStationId,
    status: "open",
    priority: priorityToFirPriority[complaint.priority] || "medium",
  });

  if (
    complaint.complaint_location?.address &&
    typeof complaint.complaint_location.latitude === "number" &&
    typeof complaint.complaint_location.longitude === "number"
  ) {
    await CrimeLocation.create({
      fir_id: fir._id,
      address: complaint.complaint_location.address,
      latitude: complaint.complaint_location.latitude,
      longitude: complaint.complaint_location.longitude,
    });
  }

  complaint.fir_id = fir._id;
  complaint.police_station_id = policeStationId;
  complaint.assigned_officer_id = assignedOfficerId;
  complaint.status = "CONVERTED_TO_FIR";
  await complaint.save();

  await Promise.all([
    writeAuditLog({
      userId: actorId,
      action: "CONVERT_COMPLAINT_TO_FIR",
      entityType: "COMPLAINT",
      entityId: complaint._id,
      newValues: { fir_id: fir._id },
    }),
    writeAuditLog({
      userId: actorId,
      action: "CREATE_FIR",
      entityType: "FIR",
      entityId: fir._id,
      newValues: fir.toObject(),
    }),
  ]);

  return {
    complaint: await getComplaintById(complaint._id),
    fir,
  };
};

module.exports = {
  assignOfficer,
  convertComplaintToFir,
  createComplaint,
  getComplaintById,
  getComplaints,
  updateComplaintStatus,
};
