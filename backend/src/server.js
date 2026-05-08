const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const adminRoutes = require("./modules/admin/admin.routes");
const analyticsRoutes = require("./modules/analytics/analytics.routes");
const authRoutes = require("./modules/auth/auth.routes");
const caseUpdateRoutes = require("./modules/caseUpdate/caseUpdate.routes");
const complaintRoutes = require("./modules/complaint/complaint.routes");
const firRoutes = require("./modules/fir/fir.routes");
const heatmapRoutes = require("./modules/heatmap/heatmap.routes");
const notificationRoutes = require("./modules/notification/notification.routes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Police Management API is running",
    timestamp: new Date().toISOString(),
  });
});

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
  });
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
