const express = require("express");
const caseUpdateController = require("./caseUpdate.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { evidenceUpload } = require("../../middleware/upload.middleware");

const router = express.Router();

router.use(requireAuth);

router.post("/", caseUpdateController.createCaseUpdate);
router.get("/fir/:firId", caseUpdateController.getFirTimeline);
router.post("/:id/upload-evidence", evidenceUpload.array("files", 5), caseUpdateController.uploadEvidence);
router.patch("/:id/status", caseUpdateController.updateFirStatus);

module.exports = router;
