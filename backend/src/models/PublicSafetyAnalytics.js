const mongoose = require("mongoose");

const publicSafetyAnalyticsSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    stateKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    safetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskCategory: {
      type: String,
      enum: ["SAFE", "MODERATE", "RISKY", "HIGH RISK"],
      required: true,
      index: true,
    },
    yearlyCrimeCount: {
      type: Number,
      required: true,
      min: 0,
    },
    crimeGrowthPercent: {
      type: Number,
      required: true,
    },
    complaintResolutionPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    emergencyIncidentCount: {
      type: Number,
      required: true,
      min: 0,
    },
    dominantCrimeType: {
      type: String,
      required: true,
      trim: true,
    },
    publicSafetyRank: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    firGrowthTrend: {
      type: String,
      enum: ["DECLINING", "STABLE", "RISING", "SPIKING"],
      required: true,
    },
    urbanDensityRisk: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    monthlyTrend: [
      {
        month: Number,
        label: String,
        crimeCount: Number,
        emergencyIncidents: Number,
        complaintResolutionPercent: Number,
      },
    ],
    riskDrivers: [String],
  },
  {
    collection: "public_safety_analytics",
    timestamps: true,
  }
);

publicSafetyAnalyticsSchema.index({ stateKey: 1, year: 1 }, { unique: true });
publicSafetyAnalyticsSchema.index({ year: 1, safetyScore: -1 });
publicSafetyAnalyticsSchema.index({ year: 1, riskCategory: 1 });

module.exports = mongoose.model("PublicSafetyAnalytics", publicSafetyAnalyticsSchema);
