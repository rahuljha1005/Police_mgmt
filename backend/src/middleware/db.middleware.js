const connectDB = require("../config/db");

const databaseMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    return next();
  } catch (error) {
    console.error("Database connection failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

module.exports = databaseMiddleware;
