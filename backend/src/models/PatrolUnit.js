const mongoose = require("mongoose");

const patrolUnitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "ASSIGNED", "BUSY", "OFFLINE"],
      default: "AVAILABLE",
      index: true,
    },
    zone_id: {
      type: String,
      trim: true,
      index: true,
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
    currentLocation: {
      address: { type: String, trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    assigned_officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

patrolUnitSchema.index({ status: 1, zone_id: 1 });
patrolUnitSchema.index({ "currentLocation.latitude": 1, "currentLocation.longitude": 1 });

module.exports = mongoose.model("PatrolUnit", patrolUnitSchema);
