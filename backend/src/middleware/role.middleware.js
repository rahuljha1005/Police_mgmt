const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.type !== "POLICE" || !["ADMIN", "DGP"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Command authority access is required",
    });
  }

  return next();
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || req.user.type !== "POLICE" || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource",
    });
  }

  return next();
};

module.exports = {
  requireAdmin,
  requireRoles,
};
