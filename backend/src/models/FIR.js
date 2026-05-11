const mongoose = require("mongoose");

const firSchema = new mongoose.Schema(
  {
    fir_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180,
      },
    },
    crime_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrimeType",
      required: true,
      index: true,
    },
    filed_by_type: {
      type: String,
      enum: ["civilian", "officer"],
      required: true,
    },
    filed_by_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "filed_by_type",
      required: true,
      index: true,
    },
    assigned_officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    police_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "investigating", "closed", "archived"],
      default: "open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    closedAt: {
      type: Date,
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

// Compound indexes for common queries
firSchema.index({ police_station_id: 1, status: 1 });
firSchema.index({ assigned_officer_id: 1, status: 1 });
firSchema.index({ crime_type_id: 1, status: 1 });
firSchema.index({ crime_type_id: 1, createdAt: -1 });
firSchema.index({ createdAt: -1, status: 1 });
firSchema.index({ police_station_id: 1, createdAt: -1 });
firSchema.index({ assigned_officer_id: 1, createdAt: -1 });

module.exports = mongoose.model("FIR", firSchema);
