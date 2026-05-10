const rolePermissions = {
  ADMIN: ["*"],
  SP: ["ZONE_ANALYTICS", "PATROL_MONITORING", "ZONE_FIR_ACCESS", "COMPLAINT_READ"],
  INSPECTOR: ["STATION_FIR_MANAGEMENT", "OFFICER_ASSIGNMENT", "COMPLAINT_MANAGEMENT", "EVIDENCE_UPLOAD"],
  CONSTABLE: ["ASSIGNED_FIR_ACCESS", "PATROL_TASKS", "EVIDENCE_UPLOAD", "NOTIFICATION_READ"],
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user || req.user.type !== "POLICE") {
    return res.status(403).json({ success: false, message: "Police access is required" });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "You do not have permission to access this resource" });
  }

  return next();
};

const requirePermission = (permission) => (req, res, next) => {
  if (!req.user || req.user.type !== "POLICE") {
    return res.status(403).json({ success: false, message: "Police access is required" });
  }

  const permissions = rolePermissions[req.user.role] || [];
  if (!permissions.includes("*") && !permissions.includes(permission)) {
    return res.status(403).json({ success: false, message: "You do not have permission to access this resource" });
  }

  return next();
};

module.exports = {
  requirePermission,
  requireRole,
  rolePermissions,
};
