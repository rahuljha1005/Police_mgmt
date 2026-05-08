const express = require("express");
const firController = require("./fir.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireAdmin } = require("../../middleware/role.middleware");

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.post("/", firController.createFir);
router.get("/", firController.getFirs);
router.get("/:id", firController.getFirById);
router.patch("/:id/assign", firController.assignOfficer);

module.exports = router;
