const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const emergencyTypes = ["MEDICAL", "ROBBERY", "ASSAULT", "ACCIDENT", "WOMEN_SAFETY", "FIRE", "OTHER"];
const statuses = ["PENDING", "RESPONDING", "ON_SCENE", "RESOLVED", "ESCALATED", "FALSE_ALERT", "REJECTED"];
const priorities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const objectId = (label) =>
  Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": `${label} must be a valid ObjectId`,
  });

const locationSchema = Joi.object({
  address: Joi.string().trim().min(3).max(300).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const createSosSchema = Joi.object({
  emergencyType: Joi.string()
    .uppercase()
    .valid(...emergencyTypes)
    .required(),
  description: Joi.string().trim().min(5).max(1000).required(),
  location: locationSchema.required(),
  priority: Joi.string()
    .uppercase()
    .valid(...priorities)
    .optional(),
});

const sosQuerySchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .valid(...statuses),
  emergencyType: Joi.string()
    .uppercase()
    .valid(...emergencyTypes),
  priority: Joi.string()
    .uppercase()
    .valid(...priorities),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const updateSosSchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .valid(...statuses)
    .optional(),
  assigned_patrol_id: objectId("Patrol ID").allow(null).optional(),
  assigned_officer_id: objectId("Officer ID").allow(null).optional(),
  priority: Joi.string()
    .uppercase()
    .valid(...priorities)
    .optional(),
}).min(1);

const resolveSosSchema = Joi.object({
  incidentSummary: Joi.string().trim().min(5).max(1000).required(),
  actionTaken: Joi.string().trim().min(3).max(1000).required(),
  injuriesReported: Joi.boolean().default(false),
  arrestsMade: Joi.boolean().default(false),
  firRequired: Joi.boolean().default(false),
  additionalNotes: Joi.string().trim().allow("", null).max(1000),
});

const escalateSosSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(1000).required(),
  supportType: Joi.string().trim().valid("BACKUP", "MEDICAL", "FIRE", "SENIOR_OFFICER", "OTHER").default("BACKUP"),
});

const falseAlertSchema = Joi.object({
  reason: Joi.string().trim().min(5).max(1000).required(),
});

const objectIdParamSchema = Joi.object({
  id: objectId("SOS ID").required(),
});

module.exports = {
  createSosSchema,
  objectIdParamSchema,
  sosQuerySchema,
  escalateSosSchema,
  falseAlertSchema,
  resolveSosSchema,
  updateSosSchema,
};
