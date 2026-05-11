const mongoose = require("mongoose");

const sosLocationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { _id: false }
);

const emergencySOSSchema = new mongoose.Schema(
  {
    civilian_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Civilian",
      required: true,
      index: true,
    },
    emergencyType: {
      type: String,
      enum: ["MEDICAL", "ROBBERY", "ASSAULT", "ACCIDENT", "WOMEN_SAFETY", "FIRE", "OTHER"],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: sosLocationSchema,
      required: true,
    },
    state_id: {
      type: String,
      default: "Maharashtra",
      trim: true,
      index: true,
    },
    district_id: {
      type: String,
      trim: true,
      index: true,
    },
    police_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "RESPONDING", "ON_SCENE", "RESOLVED", "ESCALATED", "FALSE_ALERT", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    assigned_patrol_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PatrolUnit",
      index: true,
    },
    assigned_officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "HIGH",
      index: true,
    },
    distanceKm: {
      type: Number,
      min: 0,
    },
    respondedAt: Date,
    arrivedAt: Date,
    resolvedAt: Date,
    escalationLevel: {
      type: Number,
      default: 0,
      min: 0,
    },
    incidentTimeline: [
      {
        action: {
          type: String,
          required: true,
          trim: true,
        },
        officer_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        officerName: {
          type: String,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    resolutionSummary: {
      incidentSummary: { type: String, trim: true },
      actionTaken: { type: String, trim: true },
      injuriesReported: { type: Boolean, default: false },
      arrestsMade: { type: Boolean, default: false },
      firRequired: { type: Boolean, default: false },
      additionalNotes: { type: String, trim: true },
      falseAlertReason: { type: String, trim: true },
    },
    firId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      index: true,
    },
    transferHistory: [
      {
        fromOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        toOfficer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        transferredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: {
          type: String,
          enum: [
            "Officer Transfer",
            "Suspension",
            "Workload Redistribution",
            "Emergency Reassignment",
            "Promotion",
            "Temporary Assignment",
          ],
          required: true,
        },
        notes: { type: String, trim: true },
        transferredAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

emergencySOSSchema.index({ status: 1, createdAt: -1 });
emergencySOSSchema.index({ emergencyType: 1, createdAt: -1 });
emergencySOSSchema.index({ "location.latitude": 1, "location.longitude": 1 });

module.exports = mongoose.model("EmergencySOS", emergencySOSSchema);
