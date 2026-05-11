const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { AuditLog, CrimeType, EmergencySOS, FIR, OfficerVerification, PatrolUnit, PoliceStation, User } = require("../../models");
const { buildFirScope, buildPoliceStationScope, getJurisdictionLabel } = require("../../utils/jurisdiction");

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
const accountRoles = [...officerRoles, "ADMIN"];
const generateTemporaryPassword = () => crypto.randomBytes(12).toString("base64url");
const generateBadgeNumber = (role) => `${role.slice(0, 3)}-${new Date().getFullYear()}-${crypto.randomInt(10000, 99999)}`;

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : user;
  delete userObject.password;
  return userObject;
};

const writeAuditLog = async ({ adminId, action, entityType, entityId, oldValues, newValues }) =>
  AuditLog.create({
    user_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_values: oldValues,
    new_values: newValues,
    createdAt: new Date(),
  });

const createOfficer = async (officerData, adminId) => {
  const { name, email, phone, role, police_station_id } = officerData;

  const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
  if (existingUser) {
    throw new ConflictError("A user with this email or phone already exists");
  }

  const policeStation = await PoliceStation.findById(police_station_id);
  if (!policeStation) {
    throw new NotFoundError("Police station not found");
  }

  const tempPassword = generateTemporaryPassword();
  let badgeNumber = generateBadgeNumber(role);
  while (await User.exists({ badgeNumber })) {
    badgeNumber = generateBadgeNumber(role);
  }
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  const createdUser = await User.create({
    name,
    email,
    phone,
    role,
    badgeNumber,
    police_station_id,
    state_id: policeStation.state || "Maharashtra",
    district_id: policeStation.district || policeStation.zone,
    zone_id: policeStation.zone,
    assigned_zone_id: role === "SP" ? policeStation.district || policeStation.zone : policeStation.zone,
    password: hashedPassword,
    status: "ACTIVE",
    isFirstLogin: true,
  });

  await writeAuditLog({
    adminId,
    action: "CREATE_OFFICER",
    entityType: "USER",
    entityId: createdUser._id,
    newValues: {
      name,
      email,
      phone,
      role,
      badgeNumber,
      police_station_id,
      status: "ACTIVE",
      isFirstLogin: true,
    },
  });

  return {
    officer: sanitizeUser(createdUser),
    tempPassword,
  };
};

const verifyOfficer = async (officerId, verificationStatus, adminId) => {
  const officer = await User.findById(officerId);
  if (!officer) {
    throw new NotFoundError("Officer not found");
  }

  if (!officerRoles.includes(officer.role)) {
    throw new BadRequestError("Only officer accounts can be verified");
  }

  const previousValues = {
    status: officer.status,
    verified_by: officer.verified_by,
    verified_at: officer.verified_at,
  };
  const nextStatus = verificationStatus === "approved" ? "ACTIVE" : "SUSPENDED";

  officer.status = nextStatus;
  if (verificationStatus === "approved") {
    officer.verified_by = adminId;
    officer.verified_at = new Date();
  } else {
    officer.verified_by = undefined;
    officer.verified_at = undefined;
  }
  await officer.save();

  const verificationUpdate = {
    $set: {
      verification_status: verificationStatus,
    },
  };

  if (verificationStatus === "approved") {
    verificationUpdate.$set.verified_by = adminId;
    verificationUpdate.$set.verified_at = officer.verified_at;
    verificationUpdate.$unset = { rejection_reason: "" };
  } else {
    verificationUpdate.$unset = { verified_by: "", verified_at: "" };
  }

  await OfficerVerification.updateOne({ user_id: officer._id }, verificationUpdate);

  await writeAuditLog({
    adminId,
    action: "VERIFY_OFFICER",
    entityType: "USER",
    entityId: officer._id,
    oldValues: previousValues,
    newValues: {
      status: officer.status,
      verified_by: officer.verified_by,
      verified_at: officer.verified_at,
    },
  });

  return sanitizeUser(officer);
};

const changeOfficerRole = async (officerId, role, adminId) => {
  const officer = await User.findById(officerId);
  if (!officer) {
    throw new NotFoundError("Officer not found");
  }

  const previousRole = officer.role;
  if (role !== "ADMIN" && !officer.police_station_id) {
    throw new BadRequestError("Police station is required before assigning an officer role");
  }

  officer.role = role;
  await officer.save();

  await writeAuditLog({
    adminId,
    action: "UPDATE_ROLE",
    entityType: "USER",
    entityId: officer._id,
    oldValues: { role: previousRole },
    newValues: { role },
  });

  return sanitizeUser(officer);
};

const getOfficers = async ({ role, police_station_id, status, page, limit }) => {
  const filter = {
    role: { $in: accountRoles },
  };

  if (role) filter.role = role;
  if (police_station_id) filter.police_station_id = police_station_id;
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [officers, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .populate("police_station_id", "name address state zone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    officers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getAuditLogs = async ({ user_id, action, from, to, page, limit }) => {
  const filter = {};

  if (user_id) filter.user_id = user_id;
  if (action) filter.action = action;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .populate("user_id", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AuditLog.countDocuments(filter),
  ]);

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const createCrimeType = async (crimeTypeData, adminId) => {
  const existingCrimeType = await CrimeType.findOne({
    name: new RegExp(`^${crimeTypeData.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });

  if (existingCrimeType) {
    throw new ConflictError("Crime type with this name already exists");
  }

  const crimeType = await CrimeType.create(crimeTypeData);

  await writeAuditLog({
    adminId,
    action: "CREATE_CRIME_TYPE",
    entityType: "CRIME_TYPE",
    entityId: crimeType._id,
    newValues: crimeType.toObject(),
  });

  return crimeType;
};

const getCrimeTypes = async () => CrimeType.find().sort({ name: 1 });

const getReferenceData = async (actor) => {
  const stationScope = actor ? await buildPoliceStationScope(actor) : {};
  const stationFilter = stationScope.police_station_id?.$in ? { _id: { $in: stationScope.police_station_id.$in } } : {};
  const [policeStations, crimeTypes, officers] = await Promise.all([
    PoliceStation.find(stationFilter).select("name address state district zone").sort({ name: 1 }),
    CrimeType.find().select("name severity").sort({ name: 1 }),
    User.find({
      role: { $in: ["CONSTABLE", "INSPECTOR", "SP"] },
      status: { $in: ["ACTIVE", "active"] },
      ...(stationScope.police_station_id?.$in ? { police_station_id: { $in: stationScope.police_station_id.$in } } : {}),
    })
      .select("name email role police_station_id")
      .sort({ name: 1 }),
  ]);

  return {
    policeStations,
    crimeTypes,
    officers,
  };
};

const deleteCrimeType = async (crimeTypeId, adminId) => {
  const crimeType = await CrimeType.findById(crimeTypeId);
  if (!crimeType) {
    throw new NotFoundError("Crime type not found");
  }

  await CrimeType.deleteOne({ _id: crimeType._id });

  await writeAuditLog({
    adminId,
    action: "DELETE_CRIME_TYPE",
    entityType: "CRIME_TYPE",
    entityId: crimeType._id,
    oldValues: crimeType.toObject(),
  });

  return crimeType;
};

const getDashboard = async (actor) => {
  const firScope = actor ? await buildFirScope(actor) : {};
  const stationScope = actor ? await buildPoliceStationScope(actor) : {};
  const scopedStationIds = stationScope.police_station_id?.$in;
  const sosScope = scopedStationIds ? { police_station_id: { $in: scopedStationIds } } : {};
  const patrolScope = scopedStationIds ? { police_station_id: { $in: scopedStationIds } } : {};
  const [
    totalFirs,
    openFirCount,
    closedFirCount,
    activeSosCount,
    patrolCoverage,
    jurisdiction,
    crimeTypeDistribution,
    stationWiseFirCount,
    latestAuditLogs,
  ] = await Promise.all([
    FIR.countDocuments(firScope),
    FIR.countDocuments({ ...firScope, status: "open" }),
    FIR.countDocuments({ ...firScope, status: "closed" }),
    EmergencySOS.countDocuments({ ...sosScope, status: { $in: ["PENDING", "RESPONDING", "ON_SCENE", "ESCALATED"] } }),
    PatrolUnit.aggregate([
      { $match: patrolScope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    actor ? getJurisdictionLabel(actor) : { level: "STATE", label: "All jurisdictions" },
    FIR.aggregate([
      { $match: firScope },
      { $group: { _id: "$crime_type_id", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "crimetypes",
          localField: "_id",
          foreignField: "_id",
          as: "crimeType",
        },
      },
      { $unwind: { path: "$crimeType", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          crime_type_id: "$_id",
          name: "$crimeType.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),
    FIR.aggregate([
      { $match: firScope },
      { $group: { _id: "$police_station_id", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "policestations",
          localField: "_id",
          foreignField: "_id",
          as: "station",
        },
      },
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          police_station_id: "$_id",
          name: "$station.name",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),
    AuditLog.find().populate("user_id", "name email role").sort({ createdAt: -1 }).limit(10),
  ]);

  return {
    totalFirs,
    openFirCount,
    closedFirCount,
    activeSosCount,
    patrolCoverage,
    jurisdiction,
    crimeTypeDistribution,
    stationWiseFirCount,
    latestAuditLogs,
  };
};

module.exports = {
  changeOfficerRole,
  createCrimeType,
  createOfficer,
  deleteCrimeType,
  getAuditLogs,
  getCrimeTypes,
  getDashboard,
  getOfficers,
  getReferenceData,
  verifyOfficer,
};
