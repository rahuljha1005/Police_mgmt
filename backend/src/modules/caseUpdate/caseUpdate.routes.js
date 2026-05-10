const express = require("express");
const caseUpdateController = require("./caseUpdate.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");
const { evidenceUpload } = require("../../middleware/upload.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", requireRoles("ADMIN", "SP", "INSPECTOR", "CONSTABLE"), caseUpdateController.createCaseUpdate);
router.get("/fir/:firId", requireRoles("ADMIN", "SP", "INSPECTOR", "CONSTABLE"), caseUpdateController.getFirTimeline);
router.post("/:id/upload-evidence", requireRoles("ADMIN", "INSPECTOR", "CONSTABLE"), evidenceUpload.array("files", 5), caseUpdateController.uploadEvidence);
router.patch("/:id/status", requireRoles("ADMIN", "INSPECTOR"), caseUpdateController.updateFirStatus);

module.exports = router;
