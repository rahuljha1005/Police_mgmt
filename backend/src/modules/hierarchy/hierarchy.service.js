const { EmergencySOS, FIR, PatrolUnit, PoliceStation, User } = require("../../models");
const { buildFirScope, buildPoliceStationScope, buildSosScope, getJurisdictionLabel } = require("../../utils/jurisdiction");

const getRoleCapabilities = (role) => {
  const map = {
    ADMIN: ["statewide analytics", "officer management", "all district monitoring", "audit oversight"],
    DGP: ["statewide analytics", "district command", "patrol coverage", "state SOS monitoring"],
    SP: ["district FIR access", "station performance", "patrol monitoring", "emergency escalation"],
    INSPECTOR: ["station FIR management", "complaint conversion", "officer assignment", "SOS response"],
    CONSTABLE: ["assigned FIR updates", "evidence upload", "assigned SOS response", "patrol task execution"],
  };
  return map[role] || [];
};

const getOperationalOverview = async (actor) => {
  const [jurisdiction, firScope, stationScope, sosScope] = await Promise.all([
    getJurisdictionLabel(actor),
    buildFirScope(actor),
    buildPoliceStationScope(actor),
    buildSosScope(actor),
  ]);

  const stationIds = stationScope.police_station_id?.$in;
  const patrolScope = stationIds ? { police_station_id: { $in: stationIds } } : {};
  const officerScope = stationIds ? { police_station_id: { $in: stationIds } } : {};

  const [firStatus, sosStatus, patrolStatus, officerRoles, districtLoad, stations] = await Promise.all([
    FIR.aggregate([
      { $match: firScope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    EmergencySOS.aggregate([
      { $match: sosScope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    PatrolUnit.aggregate([
      { $match: patrolScope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
    User.aggregate([
      { $match: { ...officerScope, role: { $in: ["DGP", "SP", "INSPECTOR", "CONSTABLE"] } } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
      { $project: { _id: 0, role: "$_id", count: 1 } },
    ]),
    FIR.aggregate([
      { $match: firScope },
      { $lookup: { from: "policestations", localField: "police_station_id", foreignField: "_id", as: "station" } },
      { $unwind: { path: "$station", preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ["$station.district", "$station.zone"] }, total: { $sum: 1 }, open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } } } },
      { $project: { _id: 0, district: "$_id", total: 1, open: 1 } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]),
    PoliceStation.find(stationIds ? { _id: { $in: stationIds } } : {}).select("name district zone state").sort({ name: 1 }).limit(25),
  ]);

  return {
    role: actor.role,
    jurisdiction,
    capabilities: getRoleCapabilities(actor.role),
    firStatus,
    sosStatus,
    patrolStatus,
    officerRoles,
    districtLoad,
    stations,
  };
};

module.exports = {
  getOperationalOverview,
};
