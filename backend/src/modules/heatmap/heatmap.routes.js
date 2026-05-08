const express = require("express");
const heatmapController = require("./heatmap.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", heatmapController.getHeatmapData);

module.exports = router;
