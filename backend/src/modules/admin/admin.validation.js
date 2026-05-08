const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const officerRoles = ["CONSTABLE", "INSPECTOR", "SP", "DGP"];
const accountRoles = [...officerRoles, "ADMIN"];

const createOfficerSchema = Joi.object({
  name: Joi.string().trim().min(3).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
    "any.required": "Name is required",
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.email": "Email must be a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone must be a 10-digit number",
      "string.empty": "Phone is required",
      "any.required": "Phone is required",
    }),
  role: Joi.string().valid(...officerRoles).required().messages({
    "any.only": "Role must be one of CONSTABLE, INSPECTOR, SP, DGP",
    "any.required": "Role is required",
  }),
  police_station_id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Police station ID must be a valid ObjectId",
    "string.empty": "Police station ID is required",
    "any.required": "Police station ID is required",
  }),
});

const objectIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "ID must be a valid ObjectId",
    "any.required": "ID is required",
  }),
});

const verifyOfficerSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required().messages({
    "any.only": "Status must be either approved or rejected",
    "any.required": "Status is required",
  }),
});

const changeRoleSchema = Joi.object({
  role: Joi.string().valid(...accountRoles).required().messages({
    "any.only": "Role must be one of CONSTABLE, INSPECTOR, SP, DGP, ADMIN",
    "any.required": "Role is required",
  }),
});

const getOfficersQuerySchema = Joi.object({
  role: Joi.string().valid(...accountRoles),
  police_station_id: Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": "Police station ID must be a valid ObjectId",
  }),
  status: Joi.string().valid("pending", "active", "rejected"),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const auditLogsQuerySchema = Joi.object({
  user_id: Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": "User ID must be a valid ObjectId",
  }),
  action: Joi.string().trim(),
  from: Joi.date().iso(),
  to: Joi.date().iso().min(Joi.ref("from")),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
});

const createCrimeTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).required().messages({
    "string.empty": "Crime type name is required",
    "string.min": "Crime type name must be at least 2 characters long",
    "any.required": "Crime type name is required",
  }),
  description: Joi.string().trim().allow("", null),
  severity: Joi.string().valid("low", "medium", "high", "critical").default("medium"),
});

module.exports = {
  auditLogsQuerySchema,
  changeRoleSchema,
  createCrimeTypeSchema,
  createOfficerSchema,
  getOfficersQuerySchema,
  objectIdParamSchema,
  verifyOfficerSchema,
};
