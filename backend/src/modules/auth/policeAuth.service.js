const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AuditLog, User } = require("../../models");

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

const activeStatuses = new Set(["ACTIVE", "active"]);
const blockedStatuses = new Set(["SUSPENDED", "rejected"]);

const writeAuditLog = async ({ userId, action, status = "success", newValues }) =>
  AuditLog.create({
    user_id: userId,
    actor_model: "User",
    action,
    entity_type: "USER",
    entity_id: userId,
    status,
    new_values: newValues,
  }).catch(() => null);

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  badgeNumber: user.badgeNumber,
  role: user.role,
  status: user.status,
  police_station_id: user.police_station_id,
  zone_id: user.zone_id,
  profileImage: user.profileImage,
  type: "POLICE",
});

const assertJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AuthError("JWT secret is not configured", 500);
  }
};

const registerPoliceUser = async (payload, actor) => {
  const role = payload.role || "CONSTABLE";
  const actorRole = actor?.role;

  if (role !== "CONSTABLE" && actorRole !== "ADMIN") {
    throw new AuthError("Only an admin can create SP, INSPECTOR, or ADMIN users", 403);
  }

  const duplicate = await User.findOne({
    $or: [
      { email: payload.email },
      { phone: payload.phone },
      ...(payload.badgeNumber ? [{ badgeNumber: payload.badgeNumber }] : []),
    ],
  });

  if (duplicate) {
    throw new AuthError("A police user with this email, phone, or badge number already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    ...payload,
    password: hashedPassword,
    role,
    status: actorRole === "ADMIN" ? "ACTIVE" : "PENDING",
  });

  await writeAuditLog({
    userId: actor?.id || user._id,
    action: "REGISTER_USER",
    newValues: { registered_user_id: user._id, role: user.role, status: user.status },
  });

  return sanitizeUser(user);
};

const loginPoliceUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    await AuditLog.create({
      actor_model: "System",
      action: "FAILED_LOGIN",
      entity_type: "USER",
      entity_id: undefined,
      status: "failed",
      new_values: { email, type: "POLICE" },
    }).catch(() => null);
    throw new AuthError("Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    await writeAuditLog({ userId: user._id, action: "FAILED_LOGIN", status: "failed" });
    throw new AuthError("Invalid email or password");
  }

  if (blockedStatuses.has(user.status)) {
    throw new AuthError("User account is suspended", 403);
  }

  if (!activeStatuses.has(user.status)) {
    throw new AuthError("User account is pending verification", 403);
  }

  assertJwtSecret();

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      type: "POLICE",
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  await writeAuditLog({ userId: user._id, action: "LOGIN" });

  return {
    token,
    user: sanitizeUser(user),
  };
};

module.exports = {
  loginPoliceUser,
  registerPoliceUser,
};
