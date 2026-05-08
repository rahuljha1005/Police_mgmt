const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const firStatuses = ["open", "investigating", "closed", "archived"];

const analyticsQuerySchema = Joi.object({
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
  crime_type_id: Joi.string().pattern(objectIdPattern),
  police_station_id: Joi.string().pattern(objectIdPattern),
  zone: Joi.string().trim(),
  status: Joi.string().valid(...firStatuses),
});

module.exports = {
  analyticsQuerySchema,
};
