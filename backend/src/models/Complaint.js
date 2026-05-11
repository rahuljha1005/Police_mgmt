const mongoose = require("mongoose");

const complaintLocationSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      trim: true,
    },
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    civilian_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Civilian",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    police_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "CONVERTED_TO_FIR", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
      index: true,
    },
    complaint_location: {
      type: complaintLocationSchema,
    },
    assigned_officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    fir_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
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
  {
    collection: "complaints",
    timestamps: true,
  }
);

complaintSchema.index({ police_station_id: 1, status: 1 });
complaintSchema.index({ assigned_officer_id: 1, status: 1 });
complaintSchema.index({ civilian_id: 1, createdAt: -1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
