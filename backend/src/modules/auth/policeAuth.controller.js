const policeAuthService = require("./policeAuth.service");
const { policeLoginSchema, policePasswordResetSchema, policeRegisterSchema } = require("./policeAuth.validation");

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
    const { error, value } = validate(policeRegisterSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const user = await policeAuthService.registerPoliceUser(value, req.user);

    return res.status(201).json({
      success: true,
      message: "Police user registered successfully",
      user,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("[auth:police] login request received", {
      email: req.body?.email,
      hasBadgeNumber: Boolean(req.body?.badgeNumber),
      hasPassword: Boolean(req.body?.password),
      origin: req.get("origin"),
    });

    const { error, value } = validate(policeLoginSchema, req.body);
    if (error) {
      console.log("[auth:police] login validation failed", {
        email: req.body?.email,
        message: error.details.map((detail) => detail.message).join(", "),
      });
      return validationErrorResponse(res, error);
    }

    const result = await policeAuthService.loginPoliceUser(value);
    console.log("[auth:police] login success", {
      email: result.user.email,
      role: result.user.role,
      requiresPasswordReset: result.requiresPasswordReset,
      tokenGenerated: Boolean(result.token),
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      requiresPasswordReset: result.requiresPasswordReset,
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
};

const resetTemporaryPassword = async (req, res, next) => {
  try {
    const { error, value } = validate(policePasswordResetSchema, req.body);
    if (error) return validationErrorResponse(res, error);

    const user = await policeAuthService.resetTemporaryPassword({
      userId: req.user.id,
      ...value,
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  register,
  resetTemporaryPassword,
};
