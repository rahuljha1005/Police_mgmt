const mongoose = require("mongoose");

const crimeLocationSchema = new mongoose.Schema(
  {
    fir_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
      index: true,
    },
    area: {
      type: String,
    },
    radius_meters: {
      type: Number,
    },
  },
  { timestamps: true }
);

// Geospatial index for heatmap queries
crimeLocationSchema.index({ latitude: 1, longitude: 1 });

module.exports = mongoose.model("CrimeLocation", crimeLocationSchema);
