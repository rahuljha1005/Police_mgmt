require("../config/env");

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { PublicSafetyAnalytics } = require("../models");
const { generatePublicSafetyRecords } = require("../modules/publicSafety/syntheticGeoData");

const run = async () => {
  await connectDB();

  const records = generatePublicSafetyRecords().map((record) => ({
    state: record.state,
    stateKey: record.stateKey,
    year: record.year,
    safetyScore: record.safetyScore,
    riskCategory: record.riskCategory,
    yearlyCrimeCount: record.yearlyCrimeCount,
    crimeGrowthPercent: record.crimeGrowthPercent,
    complaintResolutionPercent: record.complaintResolutionPercent,
    emergencyIncidentCount: record.emergencyIncidentCount,
    dominantCrimeType: record.dominantCrimeType,
    publicSafetyRank: record.publicSafetyRank,
    firGrowthTrend: record.firGrowthTrend,
    urbanDensityRisk: record.urbanDensityRisk,
    monthlyTrend: record.monthlyTrend,
    riskDrivers: record.riskDrivers,
  }));

  await PublicSafetyAnalytics.deleteMany({});
  await PublicSafetyAnalytics.insertMany(records);

  const latestYear = Math.max(...records.map((record) => record.year));
  const latestRecords = records.filter((record) => record.year === latestYear);
  const safestState = [...latestRecords].sort((a, b) => b.safetyScore - a.safetyScore)[0];
  const highestRiskState = [...latestRecords].sort((a, b) => a.safetyScore - b.safetyScore)[0];

  console.log(`Seeded ${records.length} public_safety_analytics records across ${latestRecords.length} states.`);
  console.log(`Latest year: ${latestYear}`);
  console.log(`Safest: ${safestState.state} (${safestState.safetyScore})`);
  console.log(`Highest risk: ${highestRiskState.state} (${highestRiskState.safetyScore})`);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Public safety analytics seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
