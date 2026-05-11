const publicSafetyService = require("./publicSafety.service");

const zones = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getZones();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const zone = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getZone(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "Zone not found" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const map = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getSafetyMap();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const indiaMap = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getIndiaSafetyMap();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const state = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getIndiaState(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: "State not found" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const indiaAnalytics = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getIndiaPublicAnalytics();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const riskRankings = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getRiskRankings();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const trendAnalytics = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getTrendAnalytics();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const dominantCrimeAnalytics = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getDominantCrimeAnalytics();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const riskMatrix = async (req, res, next) => {
  try {
    const data = await publicSafetyService.getRiskMatrix();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  dominantCrimeAnalytics,
  indiaAnalytics,
  indiaMap,
  map,
  riskMatrix,
  riskRankings,
  state,
  trendAnalytics,
  zone,
  zones,
};
