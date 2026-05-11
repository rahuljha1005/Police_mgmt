const express = require("express");
const transferController = require("./transfer.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRoles("ADMIN", "DGP", "SP", "INSPECTOR"));

router.get("/workloads", transferController.workloads);
router.get("/assignments", transferController.assignments);
router.get("/suggestions", transferController.suggestions);
router.post("/bulk", transferController.bulkTransfer);

module.exports = router;
