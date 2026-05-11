const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const objectId = Joi.string().pattern(objectIdPattern);

const transferReasons = [
  "Officer Transfer",
  "Suspension",
  "Workload Redistribution",
  "Emergency Reassignment",
  "Promotion",
  "Temporary Assignment",
];

const assignmentQuerySchema = Joi.object({
  officerId: objectId.required(),
});

const suggestionsQuerySchema = Joi.object({
  fromOfficerId: objectId.required(),
  includeDistrict: Joi.boolean().truthy("true").falsy("false").default(true),
});

const bulkTransferSchema = Joi.object({
  fromOfficerId: objectId.allow(null, ""),
  toOfficerId: objectId.required(),
  reason: Joi.string().valid(...transferReasons).required(),
  notes: Joi.string().trim().min(5).max(2000).required(),
  firIds: Joi.array().items(objectId).default([]),
  complaintIds: Joi.array().items(objectId).default([]),
  sosIds: Joi.array().items(objectId).default([]),
}).custom((value, helpers) => {
  if (!value.firIds.length && !value.complaintIds.length && !value.sosIds.length) {
    return helpers.error("any.custom", { message: "Select at least one FIR, complaint, or SOS incident" });
  }
  return value;
});

module.exports = {
  assignmentQuerySchema,
  bulkTransferSchema,
  suggestionsQuerySchema,
  transferReasons,
};
