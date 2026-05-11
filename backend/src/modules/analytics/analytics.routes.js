const express = require("express");
const analyticsController = require("./analytics.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/crime-trends", requireRoles("ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"), analyticsController.getCrimeTrends);
router.get("/station-analysis", requireRoles("ADMIN", "DGP", "SP", "INSPECTOR"), analyticsController.getStationAnalysis);
router.get("/heatmap-summary", requireRoles("ADMIN", "DGP", "SP", "INSPECTOR"), analyticsController.getHeatmapSummary);

module.exports = router;
