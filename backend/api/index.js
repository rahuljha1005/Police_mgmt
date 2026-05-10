let dbConnection;
let app;
let connectDB;

const getApp = () => {
  app = app || require("../src/app");
  return app;
};

module.exports = async (req, res) => {
  if (req.url === "/favicon.ico") {
    return res.status(204).end();
  }

  if (req.url === "/" || req.url.startsWith("/api/health")) {
    return res.status(200).json({
      success: true,
      message: "Police Management API is running",
      timestamp: new Date().toISOString(),
    });
  }

  try {
    connectDB = connectDB || require("../src/config/db");
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

  try {
    return getApp()(req, res);
  } catch (error) {
    console.error("Application handler failed:", error);

    return res.status(500).json({
      success: false,
      message: "Application handler failed",
      error: error.message,
    });
  }
};
