const express = require("express");
const analyticsController = require("./analytics.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/crime-trends", analyticsController.getCrimeTrends);
router.get("/station-analysis", analyticsController.getStationAnalysis);
router.get("/heatmap-summary", analyticsController.getHeatmapSummary);

module.exports = router;
