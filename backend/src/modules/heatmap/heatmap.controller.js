const heatmapService = require("./heatmap.service");
const { heatmapQuerySchema } = require("./heatmap.validation");

const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

const validationErrorResponse = (res, error) =>
  res.status(400).json({
    success: false,
    message: error.details.map((detail) => detail.message).join(", "),
  });

const getHeatmapData = async (req, res, next) => {
  try {
    const { error, value } = validate(heatmapQuerySchema, req.query);
    if (error) return validationErrorResponse(res, error);

    const data = await heatmapService.getHeatmapData(value);

    return res.status(200).json({
      success: true,
      message: "Crime heatmap data fetched successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getHeatmapData,
};
