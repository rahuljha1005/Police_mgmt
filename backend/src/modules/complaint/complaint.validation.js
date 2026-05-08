const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const complaintStatuses = ["PENDING", "UNDER_REVIEW", "CONVERTED_TO_FIR", "REJECTED"];
const priorities = ["LOW", "MEDIUM", "HIGH"];

const objectId = (label) =>
  Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": `${label} must be a valid ObjectId`,
  });

const civilianSchema = Joi.object({
  name: Joi.string().trim().min(3).max(120).required().messages({
    "string.empty": "Civilian name is required",
    "string.min": "Civilian name must be at least 3 characters long",
    "any.required": "Civilian name is required",
  }),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Civilian phone must be a 10-digit number",
      "string.empty": "Civilian phone is required",
      "any.required": "Civilian phone is required",
    }),
  email: Joi.string().trim().lowercase().email().allow("", null),
  address: Joi.string().trim().allow("", null),
});

const complaintLocationSchema = Joi.object({
  address: Joi.string().trim().min(3).required().messages({
    "string.empty": "Complaint location address is required",
    "any.required": "Complaint location address is required",
  }),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const createComplaintSchema = Joi.object({
  civilian: civilianSchema.required(),
  title: Joi.string().trim().min(3).max(180).required().messages({
    "string.empty": "Complaint title is required",
    "string.min": "Complaint title must be at least 3 characters long",
    "any.required": "Complaint title is required",
  }),
  description: Joi.string().trim().min(10).required().messages({
    "string.empty": "Complaint description is required",
    "string.min": "Complaint description must be at least 10 characters long",
    "any.required": "Complaint description is required",
  }),
  police_station_id: objectId("Police station ID").optional(),
  priority: Joi.string()
    .uppercase()
    .valid(...priorities)
    .default("MEDIUM"),
  complaint_location: complaintLocationSchema.required(),
  assigned_officer_id: objectId("Assigned officer ID").optional(),
});

const getComplaintsQuerySchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .valid(...complaintStatuses),
  police_station_id: objectId("Police station ID"),
  assigned_officer_id: objectId("Assigned officer ID"),
  priority: Joi.string()
    .uppercase()
    .valid(...priorities),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const objectIdParamSchema = Joi.object({
  id: objectId("Complaint ID").required(),
});

const assignOfficerSchema = Joi.object({
  assigned_officer_id: objectId("Assigned officer ID").required(),
});

const updateComplaintStatusSchema = Joi.object({
  status: Joi.string()
    .uppercase()
    .valid(...complaintStatuses)
    .required(),
});

const convertComplaintToFirSchema = Joi.object({
  crime_type_id: objectId("Crime type ID").required(),
  police_station_id: objectId("Police station ID").optional(),
  assigned_officer_id: objectId("Assigned officer ID").optional(),
});

module.exports = {
  assignOfficerSchema,
  convertComplaintToFirSchema,
  createComplaintSchema,
  getComplaintsQuerySchema,
  objectIdParamSchema,
  updateComplaintStatusSchema,
};
