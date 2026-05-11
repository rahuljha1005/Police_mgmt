const express = require("express");
const publicSafetyController = require("./publicSafety.controller");

const router = express.Router();

router.get("/zones", publicSafetyController.zones);
router.get("/map", publicSafetyController.map);
router.get("/india-map", publicSafetyController.indiaMap);
router.get("/india-analytics", publicSafetyController.indiaAnalytics);
router.get("/risk-rankings", publicSafetyController.riskRankings);
router.get("/trend-analytics", publicSafetyController.trendAnalytics);
router.get("/dominant-crimes", publicSafetyController.dominantCrimeAnalytics);
router.get("/risk-matrix", publicSafetyController.riskMatrix);
router.get("/state/:id", publicSafetyController.state);
router.get("/zone/:id", publicSafetyController.zone);

module.exports = router;
