const { Complaint, CrimeType, EmergencySOS, FIR, PoliceStation, PublicSafetyAnalytics } = require("../../models");
const {
  categoryForScore,
  buildDashboardPayload,
  getIndiaAnalytics,
  getIndiaMap,
  getIndiaStateById,
  slugify,
  toDashboardState,
} = require("./syntheticGeoData");

const severityWeight = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const scoreFromRisk = (risk) => Math.max(0, Math.min(100, Math.round(100 - risk)));

const getZones = async () => {
  const [stations, firsByZone, complaintsByZone, sosByZone] = await Promise.all([
    PoliceStation.find().select("name zone latitude longitude").lean(),
    FIR.aggregate([
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
        $lookup: {
          from: CrimeType.collection.name,
          localField: "crime_type_id",
          foreignField: "_id",
          as: "crimeType",
        },
      },
      { $unwind: { path: "$crimeType", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$station.zone",
          firCount: { $sum: 1 },
          recentFirCount: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)] }, 1, 0],
            },
          },
          severityRisk: { $sum: { $ifNull: [{ $literal: 2 }, 2] } },
          crimeTypes: { $push: "$crimeType.name" },
        },
      },
    ]),
    Complaint.aggregate([
      {
        $lookup: {
          from: PoliceStation.collection.name,
          localField: "police_station_id",
          foreignField: "_id",
          as: "station",
        },
      },
      { $unwind: "$station" },
      { $group: { _id: "$station.zone", complaintCount: { $sum: 1 } } },
    ]),
    EmergencySOS.aggregate([
      {
        $group: {
          _id: {
            latitude: { $round: ["$location.latitude", 1] },
            longitude: { $round: ["$location.longitude", 1] },
          },
          emergencyCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stationZones = stations.reduce((acc, station) => {
    const zone = station.zone || "Unassigned";
    if (!acc[zone]) acc[zone] = { zone, stations: [], latitude: 0, longitude: 0 };
    acc[zone].stations.push(station);
    acc[zone].latitude += station.latitude || 0;
    acc[zone].longitude += station.longitude || 0;
    return acc;
  }, {});

  const complaintMap = Object.fromEntries(complaintsByZone.map((item) => [item._id || "Unassigned", item.complaintCount]));
  const firMap = Object.fromEntries(firsByZone.map((item) => [item._id || "Unassigned", item]));
  const emergencyTotal = sosByZone.reduce((sum, item) => sum + item.emergencyCount, 0);

  return Object.values(stationZones).map((zoneInfo) => {
    const fir = firMap[zoneInfo.zone] || { firCount: 0, recentFirCount: 0, crimeTypes: [] };
    const complaintCount = complaintMap[zoneInfo.zone] || 0;
    const emergencyShare = Math.round(emergencyTotal / Math.max(Object.keys(stationZones).length, 1));
    const risk = fir.firCount * 2 + fir.recentFirCount * 3 + complaintCount * 1.2 + emergencyShare * 4;
    const safetyScore = scoreFromRisk(risk);
    const crimeCounts = fir.crimeTypes.filter(Boolean).reduce((acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return {
      id: zoneInfo.zone,
      zone: zoneInfo.zone,
      latitude: zoneInfo.latitude / zoneInfo.stations.length,
      longitude: zoneInfo.longitude / zoneInfo.stations.length,
      stationCount: zoneInfo.stations.length,
      firCount: fir.firCount,
      recentIncidentCount: fir.recentFirCount,
      complaintCount,
      emergencyCount: emergencyShare,
      safetyScore,
      safetyCategory: categoryForScore(safetyScore),
      mostCommonCrimes: Object.entries(crimeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([crimeType, count]) => ({ crimeType, count })),
      crimeTrend: fir.recentFirCount > fir.firCount / 6 ? "INCREASING" : "STABLE",
    };
  }).sort((a, b) => a.safetyScore - b.safetyScore);
};

const getZone = async (zoneId) => {
  const zones = await getZones();
  return zones.find((zone) => zone.id === zoneId || zone.zone === zoneId);
};

const getSafetyMap = async () => {
  const zones = await getZones();
  const liveZones = zones.map((zone) => ({
    id: zone.id,
    zone: zone.zone,
    latitude: zone.latitude,
    longitude: zone.longitude,
    safetyScore: zone.safetyScore,
    safetyCategory: zone.safetyCategory,
    firDensity: zone.firCount / Math.max(zone.stationCount, 1),
    crimeCategoryDistribution: zone.mostCommonCrimes,
    recentEmergencies: zone.emergencyCount,
  }));

  return liveZones.length ? liveZones : getIndiaMap().states;
};

const loadPublicSafetyPayload = async () => {
  const records = await PublicSafetyAnalytics.find().sort({ year: 1, state: 1 }).lean();
  if (!records.length) return buildDashboardPayload();
  return buildDashboardPayload(records);
};

const getIndiaSafetyMap = async () => {
  const payload = await loadPublicSafetyPayload();
  return getIndiaMap(payload.states);
};

const getIndiaPublicAnalytics = async () => loadPublicSafetyPayload();

const getIndiaState = async (stateId) => {
  const payload = await loadPublicSafetyPayload();
  const normalized = slugify(stateId);
  const state = payload.states.find((item) => item.id === normalized || slugify(item.state) === normalized);
  if (state) return state;

  const latestRecord = await PublicSafetyAnalytics.findOne({ stateKey: normalized }).sort({ year: -1 }).lean();
  return latestRecord ? toDashboardState(latestRecord) : getIndiaStateById(stateId);
};

const getRiskRankings = async () => {
  const payload = await loadPublicSafetyPayload();
  return {
    highRiskStates: [...payload.states].sort((a, b) => a.safetyScore - b.safetyScore).slice(0, 10),
    safestStates: [...payload.states].sort((a, b) => b.safetyScore - a.safetyScore).slice(0, 10),
    fastestGrowthStates: [...payload.states].sort((a, b) => b.growthPercent - a.growthPercent).slice(0, 10),
  };
};

const getTrendAnalytics = async () => {
  const payload = await loadPublicSafetyPayload();
  const monthlyTrend = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    label: new Date(2026, index, 1).toLocaleString("en-US", { month: "short" }),
    crimeCount: 0,
    emergencyIncidents: 0,
  }));

  payload.states.forEach((state) => {
    (state.monthlyTrend || []).forEach((point, index) => {
      if (!monthlyTrend[index]) return;
      monthlyTrend[index].crimeCount += point.crimeCount || 0;
      monthlyTrend[index].emergencyIncidents += point.emergencyIncidents || 0;
    });
  });

  return {
    yearlyTrend: payload.yearlyTrend,
    monthlyTrend,
    improvingStates: payload.states
      .filter((state) => state.safetyScore >= 60 || state.trend === "DECLINING")
      .sort((a, b) => b.complaintResolutionPercent - a.complaintResolutionPercent)
      .slice(0, 8),
  };
};

const getDominantCrimeAnalytics = async () => {
  const payload = await loadPublicSafetyPayload();
  return {
    categoryDistribution: payload.categoryDistribution,
    statesByDominantCrime: payload.states.reduce((acc, state) => {
      acc[state.commonCrimeType] = acc[state.commonCrimeType] || [];
      acc[state.commonCrimeType].push({
        state: state.state,
        safetyScore: state.safetyScore,
        growthPercent: state.growthPercent,
      });
      return acc;
    }, {}),
  };
};

const getRiskMatrix = async () => {
  const payload = await loadPublicSafetyPayload();
  return payload.states.map((state) => ({
    id: state.id,
    state: state.state,
    safetyScore: state.safetyScore,
    growthPercent: state.growthPercent,
    yearlyCrimeCount: state.yearlyCrimeCount,
    riskCategory: state.safetyCategory,
    dominantCrimeType: state.commonCrimeType,
  }));
};

module.exports = {
  getDominantCrimeAnalytics,
  getIndiaPublicAnalytics,
  getIndiaSafetyMap,
  getIndiaState,
  getRiskMatrix,
  getRiskRankings,
  getSafetyMap,
  getTrendAnalytics,
  getZone,
  getZones,
};
