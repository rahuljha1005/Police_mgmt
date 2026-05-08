const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const firStatuses = ["open", "investigating", "closed", "archived"];

const objectId = (label) =>
  Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": `${label} must be a valid ObjectId`,
  });

const objectIdParamSchema = Joi.object({
  id: objectId("FIR ID").required().messages({
    "any.required": "FIR ID is required",
  }),
});

const createFirSchema = Joi.object({
  title: Joi.string().trim().min(3).max(180).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().min(10).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 10 characters long",
    "any.required": "Description is required",
  }),
  location: Joi.object({
    address: Joi.string().trim().min(3).required().messages({
      "string.empty": "FIR location address is required",
      "any.required": "FIR location address is required",
    }),
    latitude: Joi.number().min(-90).max(90).required().messages({
      "number.min": "Latitude must be between -90 and 90",
      "number.max": "Latitude must be between -90 and 90",
      "any.required": "Latitude is required",
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
      "number.min": "Longitude must be between -180 and 180",
      "number.max": "Longitude must be between -180 and 180",
      "any.required": "Longitude is required",
    }),
  }).required(),
  crime_type_id: objectId("Crime type ID").required(),
  police_station_id: objectId("Police station ID").required(),
  assigned_officer_id: objectId("Assigned officer ID").required(),
  priority: Joi.string().valid("low", "medium", "high", "critical").default("medium"),
});

const assignOfficerSchema = Joi.object({
  assigned_officer_id: objectId("Assigned officer ID").required(),
});

const getFirsQuerySchema = Joi.object({
  status: Joi.string().valid(...firStatuses),
  police_station_id: objectId("Police station ID"),
  assigned_officer_id: objectId("Assigned officer ID"),
  crime_type_id: objectId("Crime type ID"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  assignOfficerSchema,
  createFirSchema,
  getFirsQuerySchema,
  objectIdParamSchema,
};
