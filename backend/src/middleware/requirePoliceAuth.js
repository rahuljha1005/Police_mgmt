const jwt = require("jsonwebtoken");
const { User } = require("../models");

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) return null;
  return authorizationHeader.split(" ")[1];
};

const buildPoliceAuth = ({ optional = false } = {}) => async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      if (optional) return next();
      return res.status(401).json({ success: false, message: "Police authentication token is required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT secret is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "POLICE") {
      return res.status(403).json({ success: false, message: "Police token is required" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Authenticated police user not found" });
    }

    if (!["ACTIVE", "active"].includes(user.status)) {
      return res.status(403).json({ success: false, message: "Police user account is not active" });
    }

    req.user = {
      id: user._id,
      _id: user._id,
      type: "POLICE",
      role: user.role,
      email: user.email,
      name: user.name,
      police_station_id: user.police_station_id,
      zone_id: user.zone_id,
    };

    return next();
  } catch (error) {
    if (optional) return next();
    return res.status(401).json({ success: false, message: "Invalid or expired police token" });
  }
};

module.exports = {
  optionalPoliceAuth: buildPoliceAuth({ optional: true }),
  requirePoliceAuth: buildPoliceAuth(),
};
