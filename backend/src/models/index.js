/**
 * Central export for all MongoDB models
 * Import models from here instead of individual files
 */

const Organization = require("./Organization");
const PoliceStation = require("./PoliceStation");
const User = require("./User");
const OfficerVerification = require("./OfficerVerification");
const CrimeType = require("./CrimeType");
const Civilian = require("./Civilian");
const Criminal = require("./Criminal");
const FIR = require("./FIR");
const FirCriminal = require("./FirCriminal");
const Complaint = require("./Complaint");
const CaseUpdate = require("./CaseUpdate");
const CrimeLocation = require("./CrimeLocation");
const AuditLog = require("./AuditLog");
const Notification = require("./Notification");

module.exports = {
  Organization,
  PoliceStation,
  User,
  OfficerVerification,
  CrimeType,
  Civilian,
  Criminal,
  FIR,
  FirCriminal,
  Complaint,
  CaseUpdate,
  CrimeLocation,
  AuditLog,
  Notification,
};
