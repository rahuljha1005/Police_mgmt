const civilianAuthService = require("./civilianAuth.service");
const { civilianLoginSchema, civilianRegisterSchema } = require("./civilianAuth.validation");

const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

const validationErrorResponse = (res, error) =>
  res.status(400).json({
    success: false,
    message: error.details.map((detail) => detail.message).join(", "),
  });

const register = async (req, res, next) => {
  try {
    const { error, value } = validate(civilianRegisterSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const civilian = await civilianAuthService.registerCivilian(value);

    return res.status(201).json({
      success: true,
      message: "Civilian registered successfully",
      civilian,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("[auth:civilian] login request received", {
      email: req.body?.email,
      hasPassword: Boolean(req.body?.password),
      origin: req.get("origin"),
    });

    const { error, value } = validate(civilianLoginSchema, req.body);
    if (error) {
      console.log("[auth:civilian] login validation failed", {
        email: req.body?.email,
        message: error.details.map((detail) => detail.message).join(", "),
      });
      return validationErrorResponse(res, error);
    }

    const result = await civilianAuthService.loginCivilian(value);
    console.log("[auth:civilian] login success", {
      email: result.civilian.email,
      type: result.civilian.type,
      tokenGenerated: Boolean(result.token),
    });

    return res.status(200).json({
      success: true,
      message: "Civilian login successful",
      token: result.token,
      civilian: result.civilian,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  register,
};
