const dotenv = require("dotenv");
const app = require("../src/app");
const connectDB = require("../src/config/db");

dotenv.config();

let dbConnection;

module.exports = async (req, res) => {
  if (req.url === "/" || req.url.startsWith("/api/health")) {
    return app(req, res);
  }

  try {
    dbConnection = dbConnection || connectDB();
    await dbConnection;
  } catch (error) {
    console.error("Database connection failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }

  return app(req, res);
};
