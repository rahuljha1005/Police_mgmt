const Joi = require("joi");

const civilianRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().trim().min(8).max(20).required(),
  password: Joi.string().min(8).max(128).required(),
  address: Joi.string().trim().max(300).allow("").optional(),
  profileImage: Joi.string().trim().uri().optional(),
});

const civilianLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});

module.exports = {
  civilianLoginSchema,
  civilianRegisterSchema,
};
