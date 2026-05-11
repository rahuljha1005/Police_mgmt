const express = require("express");
const hierarchyController = require("./hierarchy.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();

router.use(requireAuth);
router.get(
  "/overview",
  requireRoles("ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"),
  hierarchyController.getOverview
);

module.exports = router;
