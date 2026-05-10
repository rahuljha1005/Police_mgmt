const express = require("express");
const complaintController = require("./complaint.controller");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireCivilianAuth } = require("../../middleware/requireCivilianAuth");
const { requireRoles } = require("../../middleware/role.middleware");

const router = express.Router();
const requirePoliceStaff = requireRoles("ADMIN", "CONSTABLE", "INSPECTOR", "SP");

router.post("/my", requireCivilianAuth, complaintController.createCivilianComplaint);
router.get("/my", requireCivilianAuth, complaintController.getMyComplaints);
router.get("/my/:id", requireCivilianAuth, complaintController.getMyComplaintById);

router.use(requireAuth);

router.post("/", requireAuth, complaintController.createComplaint);
router.get("/", requirePoliceStaff, complaintController.getComplaints);
router.get("/:id", requirePoliceStaff, complaintController.getComplaintById);
router.post("/:id/convert-to-fir", requirePoliceStaff, complaintController.convertComplaintToFir);
router.patch("/:id/assign", requirePoliceStaff, complaintController.assignOfficer);
router.patch("/:id/status", requirePoliceStaff, complaintController.updateComplaintStatus);

module.exports = router;
