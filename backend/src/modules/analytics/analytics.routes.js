const express = require("express");
const analyticsController = require("./analytics.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/crime-trends", requireRoles("ADMIN", "SP"), analyticsController.getCrimeTrends);
router.get("/station-analysis", requireRoles("ADMIN", "SP", "INSPECTOR"), analyticsController.getStationAnalysis);
router.get("/heatmap-summary", requireRoles("ADMIN", "SP"), analyticsController.getHeatmapSummary);

module.exports = router;
