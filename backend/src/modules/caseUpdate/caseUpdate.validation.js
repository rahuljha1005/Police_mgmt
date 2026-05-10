const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const updateTypes = ["NOTE", "STATUS_CHANGED", "EVIDENCE_ADDED", "OFFICER_ASSIGNED", "SUSPECT_UPDATED"];
const firStatuses = ["OPEN", "INVESTIGATING", "CLOSED"];

const objectId = (label) =>
  Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": `${label} must be a valid ObjectId`,
  });

const attachmentSchema = Joi.object({
  fileUrl: Joi.string().trim().uri({ allowRelative: true }).required().messages({
    "string.empty": "Attachment file URL is required",
    "any.required": "Attachment file URL is required",
  }),
  secureUrl: Joi.string().trim().uri().optional(),
  publicId: Joi.string().trim().max(300).optional(),
  provider: Joi.string().valid("cloudinary", "external").default("cloudinary"),
  fileType: Joi.string().trim().min(2).max(80).required().messages({
    "string.empty": "Attachment file type is required",
    "any.required": "Attachment file type is required",
  }),
  fileName: Joi.string().trim().max(255).optional(),
  resourceType: Joi.string().trim().max(40).optional(),
  bytes: Joi.number().integer().min(0).optional(),
  uploadedAt: Joi.date().iso().default(() => new Date()),
});

const createCaseUpdateSchema = Joi.object({
  fir_id: objectId("FIR ID").required(),
  officer_id: objectId("Officer ID").required(),
  updateType: Joi.string()
    .uppercase()
    .valid(...updateTypes)
    .required(),
  title: Joi.string().trim().min(3).max(180).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters long",
    "any.required": "Title is required",
  }),
  description: Joi.string().trim().min(5).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 5 characters long",
    "any.required": "Description is required",
  }),
  newStatus: Joi.when("updateType", {
    is: "STATUS_CHANGED",
    then: Joi.string()
      .uppercase()
      .valid(...firStatuses)
      .required(),
    otherwise: Joi.string()
      .uppercase()
      .valid(...firStatuses)
      .optional(),
  }),
  attachments: Joi.when("updateType", {
    is: "EVIDENCE_ADDED",
    then: Joi.array().items(attachmentSchema).min(1).max(5).required().messages({
      "array.min": "At least one attachment is required for evidence updates",
      "array.max": "A case update can include at most 5 attachments",
      "any.required": "Attachments are required for evidence updates",
    }),
    otherwise: Joi.array().items(attachmentSchema).max(5).default([]),
  }),
});

const firTimelineParamSchema = Joi.object({
  firId: objectId("FIR ID").required(),
});

const objectIdParamSchema = Joi.object({
  id: objectId("Case update ID").required(),
});

const timelineQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const updateStatusSchema = Joi.object({
  newStatus: Joi.string()
    .uppercase()
    .valid(...firStatuses)
    .required(),
  title: Joi.string().trim().min(3).max(180).default("FIR status changed"),
  description: Joi.string().trim().min(5).default("FIR status updated from investigation timeline"),
});

module.exports = {
  createCaseUpdateSchema,
  firTimelineParamSchema,
  objectIdParamSchema,
  timelineQuerySchema,
  updateStatusSchema,
};
