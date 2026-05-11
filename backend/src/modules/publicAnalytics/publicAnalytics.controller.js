const publicAnalyticsService = require("./publicAnalytics.service");

const crimeTrends = async (req, res, next) => {
  try {
    const data = await publicAnalyticsService.getCrimeTrends();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const crimeTypes = async (req, res, next) => {
  try {
    const data = await publicAnalyticsService.getCrimeTypes();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

const zoneSafety = async (req, res, next) => {
  try {
    const data = await publicAnalyticsService.getZoneSafety();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  crimeTrends,
  crimeTypes,
  zoneSafety,
};
