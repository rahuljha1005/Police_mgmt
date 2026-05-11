const express = require("express");
const complaintController = require("./complaint.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireCivilianAuth } = require("../../middleware/requireCivilianAuth");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();
const requirePoliceStaff = requireRoles("ADMIN", "DGP", "CONSTABLE", "INSPECTOR", "SP");

router.post("/my", requireCivilianAuth, complaintController.createCivilianComplaint);
router.get("/my", requireCivilianAuth, complaintController.getMyComplaints);
router.get("/my/:id", requireCivilianAuth, complaintController.getMyComplaintById);

router.use(requireAuth);

router.post("/", requireRoles("ADMIN", "SP", "INSPECTOR"), complaintController.createComplaint);
router.get("/", requirePoliceStaff, complaintController.getComplaints);
router.get("/:id", requirePoliceStaff, complaintController.getComplaintById);
router.post("/:id/convert-to-fir", requireRoles("ADMIN", "SP", "INSPECTOR"), complaintController.convertComplaintToFir);
router.patch("/:id/assign", requireRoles("ADMIN", "SP", "INSPECTOR"), complaintController.assignOfficer);
router.patch("/:id/status", requireRoles("ADMIN", "SP", "INSPECTOR"), complaintController.updateComplaintStatus);

module.exports = router;
