const express = require("express");
const adminController = require("./admin.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireAdmin } = require("../../middleware/role.middleware");

const router = express.Router();

router.post("/officers", requireAuth, requireAdmin, adminController.createOfficer);
router.get("/officers", requireAuth, requireAdmin, adminController.getOfficers);
router.patch("/officers/:id/verify", requireAuth, requireAdmin, adminController.verifyOfficer);
router.patch("/officers/:id/role", requireAuth, requireAdmin, adminController.changeOfficerRole);

router.get("/audit-logs", requireAuth, requireAdmin, adminController.getAuditLogs);
router.get("/reference-data", requireAuth, requireAdmin, adminController.getReferenceData);

router.post("/crime-types", requireAuth, requireAdmin, adminController.createCrimeType);
router.get("/crime-types", requireAuth, requireAdmin, adminController.getCrimeTypes);
router.delete("/crime-types/:id", requireAuth, requireAdmin, adminController.deleteCrimeType);

router.get("/dashboard", requireAuth, requireAdmin, adminController.getDashboard);

module.exports = router;
