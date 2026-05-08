const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const notificationQuerySchema = Joi.object({
  unread: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

const objectIdParamSchema = Joi.object({
  id: Joi.string().pattern(objectIdPattern).required().messages({
    "string.pattern.base": "Notification ID must be a valid ObjectId",
  }),
});

module.exports = {
  notificationQuerySchema,
  objectIdParamSchema,
};
