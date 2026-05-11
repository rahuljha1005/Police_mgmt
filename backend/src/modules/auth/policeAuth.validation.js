const Joi = require("joi");

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const policeRoles = ["ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"];

const objectId = (label) =>
  Joi.string().pattern(objectIdPattern).messages({
    "string.pattern.base": `${label} must be a valid ObjectId`,
  });

const policeRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  phone: Joi.string().trim().min(8).max(20).required(),
  password: Joi.string().min(8).max(128).required(),
  badgeNumber: Joi.string().trim().min(3).max(50).when("role", {
    is: "CONSTABLE",
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  role: Joi.string()
    .uppercase()
    .valid(...policeRoles)
    .default("CONSTABLE"),
  police_station_id: objectId("Police station ID").optional(),
  zone_id: Joi.string().trim().max(80).optional(),
  profileImage: Joi.string().trim().uri().optional(),
});

const policeLoginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  badgeNumber: Joi.string().trim().min(3).max(50).allow("", null).optional(),
  password: Joi.string().required(),
});

const policePasswordResetSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).invalid(Joi.ref("currentPassword")).required().messages({
    "any.invalid": "New password must be different from current password",
  }),
});

module.exports = {
  policeLoginSchema,
  policePasswordResetSchema,
  policeRegisterSchema,
};
