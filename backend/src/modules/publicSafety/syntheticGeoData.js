const { faker } = require("@faker-js/faker");

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, index) => CURRENT_YEAR - 4 + index);
const CRIME_TYPES = ["Theft", "Fraud", "Cyber Crime", "Assault", "Robbery", "Domestic Violence", "Drug Trafficking", "Kidnapping"];

const stateProfiles = [
  { state: "Kerala", center: [10.8505, 76.2711], scoreRange: [82, 90], baseCrime: 62000, urbanRisk: 38, resolution: [84, 90], dominant: ["Cyber Crime", "Fraud", "Domestic Violence"], growth: [0.8, 2.4], emergencyRate: 0.065, drivers: ["high reporting maturity", "strong complaint resolution", "low violent incident pressure"] },
  { state: "Himachal Pradesh", center: [31.1048, 77.1734], scoreRange: [81, 89], baseCrime: 22000, urbanRisk: 24, resolution: [82, 89], dominant: ["Theft", "Domestic Violence", "Fraud"], growth: [0.6, 2.2], emergencyRate: 0.052, drivers: ["lower urban density", "tourist season theft pockets", "strong district response"] },
  { state: "Goa", center: [15.2993, 74.124], scoreRange: [80, 88], baseCrime: 14500, urbanRisk: 32, resolution: [81, 88], dominant: ["Theft", "Fraud", "Drug Trafficking"], growth: [1.2, 3.1], emergencyRate: 0.07, drivers: ["tourism-linked calls", "coastal nightlife incidents", "compact response geography"] },
  { state: "Sikkim", center: [27.533, 88.5122], scoreRange: [84, 92], baseCrime: 7600, urbanRisk: 18, resolution: [84, 91], dominant: ["Theft", "Fraud", "Domestic Violence"], growth: [0.4, 1.8], emergencyRate: 0.045, drivers: ["low density districts", "limited urban crime pressure", "stable public order trend"] },
  { state: "Karnataka", center: [15.3173, 75.7139], scoreRange: [63, 72], baseCrime: 132000, urbanRisk: 70, resolution: [76, 82], dominant: ["Cyber Crime", "Fraud", "Theft"], growth: [3.8, 5.8], emergencyRate: 0.085, drivers: ["cybercrime reporting surge", "metro property offences", "technology corridor risk"] },
  { state: "Tamil Nadu", center: [11.1271, 78.6569], scoreRange: [65, 74], baseCrime: 118000, urbanRisk: 58, resolution: [79, 85], dominant: ["Theft", "Domestic Violence", "Fraud"], growth: [2.0, 3.8], emergencyRate: 0.075, drivers: ["urban theft", "road safety calls", "high complaint closure rate"] },
  { state: "Gujarat", center: [22.2587, 71.1924], scoreRange: [62, 71], baseCrime: 104000, urbanRisk: 57, resolution: [77, 84], dominant: ["Fraud", "Theft", "Robbery"], growth: [2.6, 4.4], emergencyRate: 0.073, drivers: ["industrial corridor offences", "financial fraud", "highway incident reporting"] },
  { state: "Telangana", center: [18.1124, 79.0193], scoreRange: [60, 70], baseCrime: 93000, urbanRisk: 68, resolution: [75, 82], dominant: ["Cyber Crime", "Fraud", "Theft"], growth: [3.5, 5.4], emergencyRate: 0.079, drivers: ["Hyderabad cybercrime growth", "peri-urban property offences", "metro theft pockets"] },
  { state: "Punjab", center: [31.1471, 75.3412], scoreRange: [61, 70], baseCrime: 76000, urbanRisk: 52, resolution: [74, 81], dominant: ["Drug Trafficking", "Theft", "Assault"], growth: [2.8, 4.7], emergencyRate: 0.08, drivers: ["drug trafficking pressure", "border district incidents", "urban property crime"] },
  { state: "Maharashtra", center: [19.7515, 75.7139], scoreRange: [47, 56], baseCrime: 198000, urbanRisk: 82, resolution: [72, 78], dominant: ["Fraud", "Theft", "Cyber Crime"], growth: [5.2, 7.4], emergencyRate: 0.095, drivers: ["high metro density", "financial fraud growth", "vehicle theft corridors"] },
  { state: "Rajasthan", center: [27.0238, 74.2179], scoreRange: [52, 59], baseCrime: 89000, urbanRisk: 46, resolution: [73, 80], dominant: ["Assault", "Theft", "Fraud"], growth: [2.6, 4.4], emergencyRate: 0.076, drivers: ["highway incident corridors", "tourist-zone theft", "district response variation"] },
  { state: "West Bengal", center: [22.9868, 87.855], scoreRange: [50, 58], baseCrime: 96000, urbanRisk: 55, resolution: [72, 79], dominant: ["Theft", "Assault", "Fraud"], growth: [2.8, 4.8], emergencyRate: 0.078, drivers: ["urban theft", "festival crowd incidents", "border district pressure"] },
  { state: "Haryana", center: [29.0588, 76.0856], scoreRange: [48, 57], baseCrime: 84000, urbanRisk: 66, resolution: [70, 77], dominant: ["Robbery", "Assault", "Fraud"], growth: [4.2, 6.0], emergencyRate: 0.09, drivers: ["NCR spillover risk", "highway crime pressure", "urban assault complaints"] },
  { state: "Odisha", center: [20.9517, 85.0985], scoreRange: [49, 58], baseCrime: 74000, urbanRisk: 42, resolution: [70, 77], dominant: ["Domestic Violence", "Theft", "Assault"], growth: [2.8, 4.6], emergencyRate: 0.082, drivers: ["rural response distance", "domestic complaint volume", "industrial belt theft"] },
  { state: "Delhi", center: [28.7041, 77.1025], scoreRange: [28, 37], baseCrime: 231000, urbanRisk: 94, resolution: [65, 73], dominant: ["Robbery", "Assault", "Theft"], growth: [7.0, 9.6], emergencyRate: 0.11, drivers: ["dense commuter zones", "repeat street offences", "high reporting pressure"] },
  { state: "Uttar Pradesh", center: [26.8467, 80.9462], scoreRange: [36, 45], baseCrime: 214000, urbanRisk: 72, resolution: [65, 72], dominant: ["Assault", "Robbery", "Kidnapping"], growth: [5.0, 7.2], emergencyRate: 0.1, drivers: ["high population exposure", "violent complaint volume", "district-level resolution variation"] },
  { state: "Bihar", center: [25.0961, 85.3131], scoreRange: [34, 43], baseCrime: 108000, urbanRisk: 61, resolution: [62, 70], dominant: ["Assault", "Kidnapping", "Robbery"], growth: [4.6, 6.9], emergencyRate: 0.104, drivers: ["violent incident pressure", "low resolution pockets", "rural response variation"] },
  { state: "Jharkhand", center: [23.6102, 85.2799], scoreRange: [35, 44], baseCrime: 68000, urbanRisk: 48, resolution: [63, 71], dominant: ["Robbery", "Drug Trafficking", "Assault"], growth: [4.2, 6.4], emergencyRate: 0.096, drivers: ["mining belt offences", "remote response gaps", "organized crime signals"] },
  { state: "Chhattisgarh", center: [21.2787, 81.8661], scoreRange: [36, 45], baseCrime: 72000, urbanRisk: 44, resolution: [64, 72], dominant: ["Assault", "Drug Trafficking", "Theft"], growth: [4.0, 6.2], emergencyRate: 0.098, drivers: ["remote district coverage", "violent incident pressure", "transport corridor risk"] },
  { state: "Assam", center: [26.2006, 92.9376], scoreRange: [35, 45], baseCrime: 78000, urbanRisk: 46, resolution: [63, 71], dominant: ["Assault", "Kidnapping", "Drug Trafficking"], growth: [4.4, 6.8], emergencyRate: 0.101, drivers: ["border area pressure", "trafficking risk", "flood-season response disruption"] },
];

const slugify = (value = "") =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const seededNumber = (seed, min, max, precision = 0) => {
  faker.seed(seed);
  return faker.number.float({ min, max, fractionDigits: precision });
};

const categoryForScore = (score) => {
  if (score >= 80) return "SAFE";
  if (score >= 60) return "MODERATE";
  if (score >= 40) return "RISKY";
  return "HIGH RISK";
};

const trendForGrowth = (growth) => {
  if (growth >= 7) return "SPIKING";
  if (growth >= 4) return "RISING";
  if (growth >= 1.5) return "STABLE";
  return "DECLINING";
};

const buildMonthlyTrend = ({ baseCount, growth, emergencyRate, resolution, volatility, seed }) =>
  Array.from({ length: 12 }, (_, index) => {
    const seasonal = [0.93, 0.89, 0.96, 1.02, 1.08, 1.13, 1.1, 1.06, 1.0, 1.05, 1.12, 1.18][index];
    const noise = seededNumber(seed + index * 17, -volatility, volatility, 3);
    const monthlyCrime = Math.max(50, Math.round((baseCount / 12) * seasonal * (1 + growth / 100 / 2 + noise)));
    return {
      month: index + 1,
      label: new Date(2026, index, 1).toLocaleString("en-US", { month: "short" }),
      crimeCount: monthlyCrime,
      emergencyIncidents: Math.max(10, Math.round(monthlyCrime * emergencyRate * (0.82 + index * 0.015))),
      complaintResolutionPercent: Math.max(45, Math.min(95, Math.round(resolution + seededNumber(seed + index * 31, -2.8, 2.8, 1)))),
    };
  });

const buildStateYearRecord = (profile, year, profileIndex) => {
  const yearOffset = year - YEARS[0];
  const seed = 12000 + profileIndex * 313 + yearOffset * 47;
  const [scoreMin, scoreMax] = profile.scoreRange;
  const [growthMin, growthMax] = profile.growth;
  const [resolutionMin, resolutionMax] = profile.resolution;
  const scorePressure = yearOffset * seededNumber(seed + 3, -0.8, 0.4, 2);
  const safetyScore = Math.max(5, Math.min(98, Math.round(seededNumber(seed, scoreMin, scoreMax, 1) + scorePressure)));
  const crimeGrowthPercent = seededNumber(seed + 5, growthMin, growthMax, 1);
  const baseMultiplier = 0.84 + yearOffset * (crimeGrowthPercent / 100 + 0.018);
  const yearlyCrimeCount = Math.round(profile.baseCrime * baseMultiplier * seededNumber(seed + 9, 0.965, 1.045, 3));
  const complaintResolutionPercent = Math.round(seededNumber(seed + 11, resolutionMin, resolutionMax, 1) + yearOffset * 0.5);
  const emergencyIncidentCount = Math.round(yearlyCrimeCount * profile.emergencyRate * seededNumber(seed + 13, 0.9, 1.12, 3));
  const dominantCrimeType = profile.dominant[Math.floor(seededNumber(seed + 15, 0, profile.dominant.length - 0.001, 3))];
  const urbanDensityRisk = Math.max(0, Math.min(100, Math.round(profile.urbanRisk + seededNumber(seed + 19, -4, 4, 1))));

  return {
    state: profile.state,
    stateKey: slugify(profile.state),
    center: profile.center,
    year,
    safetyScore,
    riskCategory: categoryForScore(safetyScore),
    yearlyCrimeCount,
    crimeGrowthPercent,
    complaintResolutionPercent,
    emergencyIncidentCount,
    dominantCrimeType,
    firGrowthTrend: trendForGrowth(crimeGrowthPercent),
    urbanDensityRisk,
    monthlyTrend: buildMonthlyTrend({
      baseCount: yearlyCrimeCount,
      growth: crimeGrowthPercent,
      emergencyRate: profile.emergencyRate,
      resolution: complaintResolutionPercent,
      volatility: safetyScore >= 80 ? 0.035 : safetyScore >= 60 ? 0.055 : 0.085,
      seed: seed + 101,
    }),
    riskDrivers: profile.drivers,
  };
};

const generatePublicSafetyRecords = () => {
  const records = stateProfiles.flatMap((profile, profileIndex) =>
    YEARS.map((year) => buildStateYearRecord(profile, year, profileIndex))
  );

  YEARS.forEach((year) => {
    const yearlyRecords = records
      .filter((record) => record.year === year)
      .sort((a, b) => b.safetyScore - a.safetyScore);
    yearlyRecords.forEach((record, index) => {
      record.publicSafetyRank = index + 1;
    });
  });

  return records;
};

const latestFallbackRecords = () => {
  const latestYear = Math.max(...YEARS);
  return generatePublicSafetyRecords().filter((record) => record.year === latestYear);
};

const toDashboardState = (record) => ({
  id: record.stateKey,
  state: record.state,
  center: record.center || stateProfiles.find((profile) => slugify(profile.state) === record.stateKey)?.center || [22.7, 79.5],
  safetyScore: record.safetyScore,
  safetyCategory: record.riskCategory,
  yearlyCrimeCount: record.yearlyCrimeCount,
  growthPercent: record.crimeGrowthPercent,
  commonCrimeType: record.dominantCrimeType,
  complaintResolutionPercent: record.complaintResolutionPercent,
  emergencyIncidentCount: record.emergencyIncidentCount,
  publicSafetyRank: record.publicSafetyRank,
  trend: record.firGrowthTrend,
  urbanDensityRisk: record.urbanDensityRisk,
  monthlyTrend: record.monthlyTrend || [],
  riskDrivers: record.riskDrivers || [],
  annualTrend: [],
});

const buildDashboardPayload = (records = generatePublicSafetyRecords()) => {
  const latestYear = Math.max(...records.map((record) => record.year));
  const latest = records
    .filter((record) => record.year === latestYear)
    .sort((a, b) => a.publicSafetyRank - b.publicSafetyRank);
  const grouped = records.reduce((acc, record) => {
    acc[record.stateKey] = acc[record.stateKey] || [];
    acc[record.stateKey].push(record);
    return acc;
  }, {});

  const states = latest.map((record) => ({
    ...toDashboardState(record),
    annualTrend: (grouped[record.stateKey] || [])
      .sort((a, b) => a.year - b.year)
      .map((item) => ({
        year: item.year,
        crimeCount: item.yearlyCrimeCount,
        emergencyIncidents: item.emergencyIncidentCount,
        resolutionPercent: item.complaintResolutionPercent,
      })),
  }));

  const yearlyTrend = YEARS.map((year) => {
    const yearRecords = records.filter((record) => record.year === year);
    return {
      year,
      crimeCount: yearRecords.reduce((sum, record) => sum + record.yearlyCrimeCount, 0),
      emergencyIncidents: yearRecords.reduce((sum, record) => sum + record.emergencyIncidentCount, 0),
      avgResolution: Math.round(yearRecords.reduce((sum, record) => sum + record.complaintResolutionPercent, 0) / yearRecords.length),
    };
  });

  const categoryDistribution = CRIME_TYPES.map((crimeType) => ({
    category: crimeType,
    count: latest.filter((record) => record.dominantCrimeType === crimeType).length,
  })).filter((item) => item.count > 0);

  return {
    states,
    yearlyTrend,
    categoryDistribution,
    riskyStates: [...states].sort((a, b) => a.safetyScore - b.safetyScore).slice(0, 5),
    safestStates: states.slice(0, 5),
    insights: [
      "High-density NCR and northern belt states show elevated violent and street-crime pressure.",
      "Southern and smaller tourism-led states show stronger public safety scores and resolution rates.",
      "Cyber and fraud categories are concentrated in high-urbanization technology and financial corridors.",
      "This is synthetic public-safe intelligence for awareness dashboards, not official NCRB data.",
    ],
  };
};

const getIndiaMap = (states = buildDashboardPayload().states) => ({
  geoJsonUrl: "/geo/india-states.geojson",
  boundarySource: {
    name: "india-maps-data GeoJSON state/district boundaries",
    property: "st_nm",
  },
  states,
  summary: {
    coveredStates: states.length,
    safestState: states[0]?.state,
    highestRiskState: [...states].sort((a, b) => a.safetyScore - b.safetyScore)[0]?.state,
    averageSafetyScore: Math.round(states.reduce((sum, state) => sum + state.safetyScore, 0) / Math.max(states.length, 1)),
  },
});

const getIndiaAnalytics = () => buildDashboardPayload();

const getIndiaStateById = (id) => {
  const normalized = slugify(id);
  return buildDashboardPayload().states.find((state) => state.id === normalized || slugify(state.state) === normalized);
};

module.exports = {
  YEARS,
  buildDashboardPayload,
  categoryForScore,
  generatePublicSafetyRecords,
  getIndiaAnalytics,
  getIndiaMap,
  getIndiaStateById,
  latestFallbackRecords,
  slugify,
  stateProfiles,
  toDashboardState,
};
