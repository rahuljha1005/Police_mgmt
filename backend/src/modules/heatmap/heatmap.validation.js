const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const firStatuses = ["open", "investigating", "closed", "archived"];

const objectId = (label) =>
  Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": `${label} must be a valid ObjectId`,
  });

const heatmapQuerySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
  crime_type_id: objectId("Crime type ID"),
  zone_id: Joi.string().trim().max(100),
  status: Joi.string().valid(...firStatuses),
});

module.exports = {
  heatmapQuerySchema,
};
