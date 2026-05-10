const express = require("express");
const policeAuthController = require("./policeAuth.controller");
const { optionalPoliceAuth } = require("../../middleware/requirePoliceAuth");

const router = express.Router();

router.post("/register", optionalPoliceAuth, policeAuthController.register);
router.post("/login", policeAuthController.login);

module.exports = router;
