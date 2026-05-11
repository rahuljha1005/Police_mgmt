const { Complaint, CrimeType, FIR, PoliceStation } = require("../../models");

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getCrimeTrends = async () => {
  const [yearly, monthly, complaints] = await Promise.all([
    FIR.aggregate([
      { $group: { _id: { $year: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, year: "$_id", count: 1 } },
    ]),
    FIR.aggregate([
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $project: { _id: 0, year: "$_id.year", month: "$_id.month", count: 1 } },
    ]),
    Complaint.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          averageResolutionMs: {
            $avg: {
              $cond: [
                { $in: ["$status", ["CONVERTED_TO_FIR", "REJECTED"]] },
                { $subtract: ["$updatedAt", "$createdAt"] },
                null,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const totalComplaints = complaints.reduce((sum, item) => sum + item.count, 0);
  const resolvedComplaints = complaints
    .filter((item) => ["CONVERTED_TO_FIR", "REJECTED"].includes(item._id))
    .reduce((sum, item) => sum + item.count, 0);
  const averageResolutionMs =
    complaints.reduce((sum, item) => sum + (item.averageResolutionMs || 0), 0) /
    Math.max(complaints.filter((item) => item.averageResolutionMs).length, 1);

  return {
    yearly,
    monthly: monthly.map((item) => ({
      ...item,
      label: `${monthNames[item.month - 1]} ${item.year}`,
    })),
    complaintResolution: {
      total: totalComplaints,
      resolved: resolvedComplaints,
      resolutionRate: totalComplaints ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
      averageResolutionHours: Math.round((averageResolutionMs / (1000 * 60 * 60)) * 10) / 10,
    },
  };
};

const getCrimeTypes = async () => {
  const distribution = await FIR.aggregate([
    { $group: { _id: "$crime_type_id", count: { $sum: 1 } } },
    {
      $lookup: {
        from: CrimeType.collection.name,
        localField: "_id",
        foreignField: "_id",
        as: "crimeType",
      },
    },
    { $unwind: "$crimeType" },
    { $sort: { count: -1 } },
    { $project: { _id: 0, crimeType: "$crimeType.name", severity: "$crimeType.severity", count: 1 } },
  ]);

  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return distribution.map((item) => ({
    ...item,
    percentage: total ? Math.round((item.count / total) * 1000) / 10 : 0,
  }));
};

const getZoneSafety = async () => {
  const zoneStats = await FIR.aggregate([
    {
      $lookup: {
        from: PoliceStation.collection.name,
        localField: "police_station_id",
        foreignField: "_id",
        as: "station",
      },
    },
    { $unwind: "$station" },
    {
      $group: {
        _id: "$station.zone",
        firCount: { $sum: 1 },
        closedCount: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] } },
      },
    },
    { $sort: { firCount: -1 } },
    {
      $project: {
        _id: 0,
        zone: { $ifNull: ["$_id", "Unassigned"] },
        firCount: 1,
        closedCount: 1,
        safetyScore: {
          $max: [
            0,
            {
              $subtract: [
                100,
                { $min: [80, { $multiply: ["$firCount", 2] }] },
              ],
            },
          ],
        },
      },
    },
  ]);

  return zoneStats;
};

module.exports = {
  getCrimeTrends,
  getCrimeTypes,
  getZoneSafety,
};
