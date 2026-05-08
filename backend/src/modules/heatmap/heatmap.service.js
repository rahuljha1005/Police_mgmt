const { FIR, PoliceStation } = require("../../models");

const getHeatmapData = async ({ from, to, crime_type_id, zone_id, status }) => {
  const filter = {
    "location.latitude": { $type: "number", $gte: -90, $lte: 90 },
    "location.longitude": { $type: "number", $gte: -180, $lte: 180 },
  };

  if (crime_type_id) filter.crime_type_id = crime_type_id;
  if (status) filter.status = status;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  if (zone_id) {
    const stations = await PoliceStation.find({ zone: zone_id }).select("_id");
    filter.police_station_id = { $in: stations.map((station) => station._id) };
  }

  const firs = await FIR.find(filter)
    .select("location crime_type_id status createdAt")
    .populate("crime_type_id", "name")
    .sort({ createdAt: -1 })
    .lean();

  return firs.map((fir) => ({
    latitude: fir.location.latitude,
    longitude: fir.location.longitude,
    crimeType: fir.crime_type_id?.name || "Unknown",
    status: fir.status,
    createdAt: fir.createdAt,
  }));
};

module.exports = {
  getHeatmapData,
};
