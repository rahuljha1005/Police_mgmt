const express = require("express");
const civilianAuthController = require("./civilianAuth.controller");

const router = express.Router();

router.post("/register", civilianAuthController.register);
router.post("/login", civilianAuthController.login);

module.exports = router;
