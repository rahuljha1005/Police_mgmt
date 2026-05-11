const express = require("express");
const firController = require("./fir.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRoles("ADMIN", "SP", "INSPECTOR"), firController.createFir);
router.get("/", requireRoles("ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"), firController.getFirs);
router.get("/:id", requireRoles("ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"), firController.getFirById);
router.patch("/:id/assign", requireRoles("ADMIN", "SP", "INSPECTOR"), firController.assignOfficer);

module.exports = router;
