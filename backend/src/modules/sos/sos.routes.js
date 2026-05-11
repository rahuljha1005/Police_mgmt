const express = require("express");
const sosController = require("./sos.controller");
const { requireCivilianAuth } = require("../../middleware/requireCivilianAuth");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();

router.post("/", requireCivilianAuth, sosController.createSos);
router.get("/my", requireCivilianAuth, sosController.mySos);
router.get("/", requireAuth, requireRoles("ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"), sosController.policeSos);
router.get("/analytics", requireAuth, requireRoles("ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"), sosController.analytics);
router.post("/:id/respond", requireAuth, requireRoles("SP", "INSPECTOR", "CONSTABLE"), sosController.respond);
router.post("/:id/on-scene", requireAuth, requireRoles("INSPECTOR", "CONSTABLE"), sosController.onScene);
router.post("/:id/resolve", requireAuth, requireRoles("INSPECTOR", "CONSTABLE"), sosController.resolve);
router.post("/:id/escalate", requireAuth, requireRoles("DGP", "SP", "INSPECTOR", "CONSTABLE"), sosController.escalate);
router.post("/:id/false-alert", requireAuth, requireRoles("SP", "INSPECTOR"), sosController.falseAlert);
router.patch("/:id", requireAuth, requireRoles("ADMIN", "DGP", "SP", "INSPECTOR"), sosController.updateSos);

module.exports = router;
