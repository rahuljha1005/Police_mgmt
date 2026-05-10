const jwt = require("jsonwebtoken");
const { Civilian } = require("../models");

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) return null;
  return authorizationHeader.split(" ")[1];
};

const requireCivilianAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ success: false, message: "Civilian authentication token is required" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT secret is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== "CIVILIAN") {
      return res.status(403).json({ success: false, message: "Civilian token is required" });
    }

    const civilian = await Civilian.findById(decoded.id);
    if (!civilian) {
      return res.status(401).json({ success: false, message: "Authenticated civilian not found" });
    }

    if (civilian.status === "BLOCKED") {
      return res.status(403).json({ success: false, message: "Civilian account is blocked" });
    }

    req.user = {
      id: civilian._id,
      _id: civilian._id,
      type: "CIVILIAN",
      email: civilian.email,
      name: civilian.name,
      phone: civilian.phone,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired civilian token" });
  }
};

module.exports = {
  requireCivilianAuth,
};
