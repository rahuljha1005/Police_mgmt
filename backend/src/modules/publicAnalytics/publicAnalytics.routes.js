const express = require("express");
const publicAnalyticsController = require("./publicAnalytics.controller");

const router = express.Router();

router.get("/crime-trends", publicAnalyticsController.crimeTrends);
router.get("/crime-types", publicAnalyticsController.crimeTypes);
router.get("/zone-safety", publicAnalyticsController.zoneSafety);

module.exports = router;
