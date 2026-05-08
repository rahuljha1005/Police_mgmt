const { AuditLog, Complaint, FIR, PoliceStation } = require("../../models");

const buildFirFilter = async ({ from, to, crime_type_id, police_station_id, zone, status }) => {
  const filter = {};
  if (crime_type_id) filter.crime_type_id = crime_type_id;
  if (police_station_id) filter.police_station_id = police_station_id;
  if (status) filter.status = status;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (zone) {
    const stations = await PoliceStation.find({ zone }).select("_id");
    filter.police_station_id = { $in: stations.map((station) => station._id) };
  }
  return filter;
};

const logAnalyticsView = (userId, action = "VIEW_ANALYTICS") =>
  AuditLog.create({
    user_id: userId,
    action,
    entity_type: "ANALYTICS",
    entity_id: userId,
  });

const getCrimeTrends = async (filters, userId) => {
  const match = await buildFirFilter(filters);
  const [monthlyTrends, crimeTypeGrowth, openClosedRatio, highCrimeZones, stationWiseCounts, officerWorkload] =
    await Promise.all([
      FIR.aggregate([
        { $match: match },
        { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $project: { _id: 0, month: { $concat: [{ $toString: "$_id.year" }, "-", { $toString: "$_id.month" }] }, count: 1 } },
      ]),
      FIR.aggregate([
        { $match: match },
        { $group: { _id: "$crime_type_id", count: { $sum: 1 } } },
        { $lookup: { from: "crimetypes", localField: "_id", foreignField: "_id", as: "crimeType" } },
        { $unwind: "$crimeType" },
        { $project: { _id: 0, name: "$crimeType.name", count: 1 } },
        { $sort: { count: -1 } },
      ]),
      FIR.aggregate([
        { $match: match },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      FIR.aggregate([
        { $match: match },
        { $lookup: { from: "policestations", localField: "police_station_id", foreignField: "_id", as: "station" } },
        { $unwind: "$station" },
        { $group: { _id: "$station.zone", count: { $sum: 1 } } },
        { $project: { _id: 0, zone: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),
      FIR.aggregate([
        { $match: match },
        { $group: { _id: "$police_station_id", count: { $sum: 1 } } },
        { $lookup: { from: "policestations", localField: "_id", foreignField: "_id", as: "station" } },
        { $unwind: "$station" },
        { $project: { _id: 0, station: "$station.name", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      FIR.aggregate([
        { $match: match },
        { $group: { _id: "$assigned_officer_id", total: { $sum: 1 }, open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "officer" } },
        { $unwind: "$officer" },
        { $project: { _id: 0, officer: "$officer.name", total: 1, open: 1 } },
        { $sort: { total: -1 } },
        { $limit: 15 },
      ]),
    ]);

  await logAnalyticsView(userId);
  return { monthlyTrends, crimeTypeGrowth, openClosedRatio, highCrimeZones, stationWiseCounts, officerWorkload };
};

const getStationAnalysis = async (filters, userId) => {
  const match = await buildFirFilter(filters);
  const [stationComparison, complaintConversionRate] = await Promise.all([
    FIR.aggregate([
      { $match: match },
      { $group: { _id: "$police_station_id", total: { $sum: 1 }, closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } } } },
      { $lookup: { from: "policestations", localField: "_id", foreignField: "_id", as: "station" } },
      { $unwind: "$station" },
      { $project: { _id: 0, station: "$station.name", zone: "$station.zone", total: 1, closed: 1 } },
      { $sort: { total: -1 } },
    ]),
    Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]),
  ]);

  await logAnalyticsView(userId);
  return { stationComparison, complaintConversionRate };
};

const getHeatmapSummary = async (filters, userId) => {
  const match = await buildFirFilter(filters);
  const [hotspots, recentSpikes, activeZones] = await Promise.all([
    FIR.aggregate([
      { $match: match },
      { $group: { _id: "$location.address", count: { $sum: 1 }, latitude: { $avg: "$location.latitude" }, longitude: { $avg: "$location.longitude" } } },
      { $project: { _id: 0, area: "$_id", count: 1, latitude: 1, longitude: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    FIR.aggregate([
      { $match: { ...match, createdAt: { ...(match.createdAt || {}), $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: "$crime_type_id", count: { $sum: 1 } } },
      { $lookup: { from: "crimetypes", localField: "_id", foreignField: "_id", as: "crimeType" } },
      { $unwind: "$crimeType" },
      { $project: { _id: 0, crimeType: "$crimeType.name", count: 1 } },
      { $sort: { count: -1 } },
    ]),
    FIR.aggregate([
      { $match: match },
      { $lookup: { from: "policestations", localField: "police_station_id", foreignField: "_id", as: "station" } },
      { $unwind: "$station" },
      { $group: { _id: "$station.zone", count: { $sum: 1 } } },
      { $project: { _id: 0, zone: "$_id", count: 1 } },
      { $sort: { count: -1 } },
    ]),
  ]);

  await logAnalyticsView(userId);
  return { hotspots, recentSpikes, activeZones };
};

module.exports = {
  getCrimeTrends,
  getHeatmapSummary,
  getStationAnalysis,
};
