const analyticsService = require("./analytics.service");
const { analyticsQuerySchema } = require("./analytics.validation");

const validate = (schema, data) => schema.validate(data, { abortEarly: false, stripUnknown: true });

const validationErrorResponse = (res, error) =>
  res.status(400).json({
    success: false,
    message: error.details.map((detail) => detail.message).join(", "),
  });

const handleAnalytics = (serviceMethod, message) => async (req, res, next) => {
  try {
    const { error, value } = validate(analyticsQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const data = await serviceMethod(value, req.user._id);
    return res.status(200).json({ success: true, message, data });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCrimeTrends: handleAnalytics(analyticsService.getCrimeTrends, "Crime trends fetched successfully"),
  getHeatmapSummary: handleAnalytics(analyticsService.getHeatmapSummary, "Heatmap summary fetched successfully"),
  getStationAnalysis: handleAnalytics(analyticsService.getStationAnalysis, "Station analysis fetched successfully"),
};
