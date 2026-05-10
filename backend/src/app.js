const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const databaseMiddleware = require("./middleware/db.middleware");
const adminRoutes = require("./modules/admin/admin.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const authRoutes = require("./modules/auth/auth.routes");
const caseUpdateRoutes = require("./modules/caseUpdate/caseUpdate.routes");
const complaintRoutes = require("./modules/complaint/complaint.routes");
const firRoutes = require("./modules/fir/fir.routes");
const heatmapRoutes = require("./modules/heatmap/heatmap.routes");
const notificationRoutes = require("./modules/notification/notification.routes");
const { isCloudinaryConfigured } = require("./config/cloudinary");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Police Management API is running",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API running",
    mongoUriExists: Boolean(process.env.MONGO_URI),
    jwtExists: Boolean(process.env.JWT_SECRET),
    cloudinaryConfigured: isCloudinaryConfigured(),
  });
});

app.get("/api/db-health", async (req, res) => {
  try {
    await connectDB();

    return res.status(200).json({
      success: true,
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Health checks stay above this middleware so Vercel can verify the function
// even when MongoDB credentials or Atlas networking are misconfigured.
app.use("/api", databaseMiddleware);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/firs", firRoutes);
app.use("/api/case-updates", caseUpdateRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/heatmap", heatmapRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  console.error("Unhandled request error:", {
    message: error.message,
    stack: error.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";

    return res.status(409).json({
      success: false,
      message: `A record with this ${duplicateField} already exists`,
    });
  }

  if (error.name === "MulterError" || error.message === "Unsupported file type") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : error.message,
    error: process.env.NODE_ENV === "production" ? undefined : error.message,
  });
});

module.exports = app;
