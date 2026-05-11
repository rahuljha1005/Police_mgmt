const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AuditLog, User } = require("../../models");
const { repairDemoAccounts } = require("../../utils/repairDemoAccounts");

class AuthError extends Error {
  constructor(message, statusCode = 401) {
    super(message);
    this.statusCode = statusCode;
  }
}

const activeStatuses = new Set(["ACTIVE", "active"]);
const blockedStatuses = new Set(["SUSPENDED", "rejected"]);
const demoPoliceEmails = new Set(["admin@police.com", "dgp@police.com", "inspector@police.com"]);
const demoPasswords = new Set(["Password@123", "admin123"]);

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
  state_id: user.state_id,
  district_id: user.district_id,
  police_station_id: user.police_station_id,
  zone_id: user.zone_id,
  assigned_zone_id: user.assigned_zone_id,
  profileImage: user.profileImage,
  isFirstLogin: Boolean(user.isFirstLogin),
  type: "POLICE",
});

const assertJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new AuthError("JWT secret is not configured", 500);
  }
};

const maybeRepairDemoPoliceAccount = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!demoPoliceEmails.has(normalizedEmail) || !demoPasswords.has(password)) return false;

  await repairDemoAccounts({ connect: false, password });
  return true;
};

const registerPoliceUser = async (payload, actor) => {
  const role = payload.role || "CONSTABLE";
  const actorRole = actor?.role;

  if (role !== "CONSTABLE" && !["ADMIN", "DGP"].includes(actorRole)) {
    throw new AuthError("Only command authority can create DGP, SP, INSPECTOR, or ADMIN users", 403);
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
    isFirstLogin: actorRole === "ADMIN" && role !== "ADMIN",
  });

  await writeAuditLog({
    userId: actor?.id || user._id,
    action: "REGISTER_USER",
    newValues: { registered_user_id: user._id, role: user.role, status: user.status },
  });

  return sanitizeUser(user);
};

const loginPoliceUser = async ({ email, badgeNumber, password }, options = {}) => {
  const normalizedEmail = email.trim().toLowerCase();
  console.log("[auth:police] finding user", { email: normalizedEmail });
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    console.log("[auth:police] user not found", { email: normalizedEmail });
    if (!options.repaired && (await maybeRepairDemoPoliceAccount({ email, password }))) {
      return loginPoliceUser({ email, badgeNumber, password }, { repaired: true });
    }

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
  console.log("[auth:police] password comparison complete", {
    email: normalizedEmail,
    role: user.role,
    status: user.status,
    isPasswordValid,
  });

  if (!isPasswordValid) {
    if (!options.repaired && (await maybeRepairDemoPoliceAccount({ email, password }))) {
      return loginPoliceUser({ email, badgeNumber, password }, { repaired: true });
    }

    await writeAuditLog({ userId: user._id, action: "FAILED_LOGIN", status: "failed" });
    throw new AuthError("Invalid email or password");
  }

  if (badgeNumber && user.badgeNumber && user.badgeNumber !== badgeNumber) {
    await writeAuditLog({ userId: user._id, action: "FAILED_LOGIN", status: "failed" });
    throw new AuthError("Invalid badge ID, email, or password");
  }

  if (blockedStatuses.has(user.status)) {
    if (!options.repaired && (await maybeRepairDemoPoliceAccount({ email, password }))) {
      return loginPoliceUser({ email, badgeNumber, password }, { repaired: true });
    }

    throw new AuthError("User account is suspended", 403);
  }

  if (!activeStatuses.has(user.status)) {
    if (!options.repaired && (await maybeRepairDemoPoliceAccount({ email, password }))) {
      return loginPoliceUser({ email, badgeNumber, password }, { repaired: true });
    }

    throw new AuthError("User account is pending verification", 403);
  }

  assertJwtSecret();
  console.log("[auth:police] JWT secret present, generating token", {
    email: normalizedEmail,
    role: user.role,
    type: "POLICE",
  });

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
    requiresPasswordReset: Boolean(user.isFirstLogin),
    token,
    user: sanitizeUser(user),
  };
};

const resetTemporaryPassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new AuthError("Police user not found", 404);

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) throw new AuthError("Current password is incorrect", 400);

  user.password = await bcrypt.hash(newPassword, 12);
  user.isFirstLogin = false;
  await user.save();

  await writeAuditLog({
    userId: user._id,
    action: "VERIFY_USER",
    newValues: { password_reset: true, first_login_completed: true },
  });

  return sanitizeUser(user);
};

module.exports = {
  loginPoliceUser,
  registerPoliceUser,
  resetTemporaryPassword,
};
