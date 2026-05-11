const express = require("express");
const policeAuthController = require("./policeAuth.controller");
const { requirePoliceAuth } = require("../../middleware/requirePoliceAuth");
const { requireRole } = require("../../middleware/requireRole");

const router = express.Router();

router.post("/register", requirePoliceAuth, requireRole("ADMIN"), policeAuthController.register);
router.post("/login", policeAuthController.login);
router.post("/reset-temporary-password", requirePoliceAuth, policeAuthController.resetTemporaryPassword);

module.exports = router;
