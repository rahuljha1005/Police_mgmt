const mongoose = require("mongoose");

const policeStationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    phone: {
      type: String,
    },
    state: {
      type: String,
      required: true,
      index: true,
    },
    district: {
      type: String,
      trim: true,
      index: true,
    },
    zone: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index for location
policeStationSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model("PoliceStation", policeStationSchema);
