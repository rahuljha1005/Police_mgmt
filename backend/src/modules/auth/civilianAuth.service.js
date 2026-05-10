const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AuditLog, Civilian } = require("../../models");

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

const sanitizeCivilian = (civilian) => ({
  id: civilian._id,
  name: civilian.name,
  email: civilian.email,
  phone: civilian.phone,
  address: civilian.address,
  profileImage: civilian.profileImage,
  status: civilian.status,
  type: "CIVILIAN",
});

const assertJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AuthError("JWT secret is not configured", 500);
  }
};

const writeAuditLog = async ({ civilianId, action, status = "success", newValues }) =>
  AuditLog.create({
    user_id: civilianId,
    actor_model: "Civilian",
    action,
    entity_type: "CIVILIAN",
    entity_id: civilianId,
    status,
    new_values: newValues,
  }).catch(() => null);

const registerCivilian = async (payload) => {
  const duplicate = await Civilian.findOne({
    $or: [{ email: payload.email }, { phone: payload.phone }],
  });

  if (duplicate) {
    throw new AuthError("A civilian with this email or phone already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const civilian = await Civilian.create({
    ...payload,
    password: hashedPassword,
    status: "ACTIVE",
  });

  await writeAuditLog({
    civilianId: civilian._id,
    action: "CIVILIAN_REGISTER",
    newValues: { civilian_id: civilian._id },
  });

  return sanitizeCivilian(civilian);
};

const loginCivilian = async ({ email, password }) => {
  const civilian = await Civilian.findOne({ email }).select("+password");

  if (!civilian) {
    throw new AuthError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, civilian.password || "");
  if (!isPasswordValid) {
    await writeAuditLog({ civilianId: civilian._id, action: "FAILED_LOGIN", status: "failed" });
    throw new AuthError("Invalid email or password");
  }

  if (civilian.status === "BLOCKED") {
    throw new AuthError("Civilian account is blocked", 403);
  }

  assertJwtSecret();

  const token = jwt.sign(
    {
      id: civilian._id,
      type: "CIVILIAN",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await writeAuditLog({ civilianId: civilian._id, action: "CIVILIAN_LOGIN" });

  return {
    token,
    civilian: sanitizeCivilian(civilian),
  };
};

module.exports = {
  loginCivilian,
  registerCivilian,
};
