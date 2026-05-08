const { clamp, pickOne, pickWeighted, randomFloat, randomInt } = require("./random");
const { hotspots } = require("../data/indiaBaseData");

const indianFirstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Arjun",
  "Kabir",
  "Rohan",
  "Rahul",
  "Vikram",
  "Siddharth",
  "Amit",
  "Priya",
  "Ananya",
  "Sneha",
  "Pooja",
  "Neha",
  "Kavya",
  "Aditi",
  "Meera",
  "Isha",
  "Nisha",
];

const indianLastNames = [
  "Sharma",
  "Verma",
  "Patel",
  "Iyer",
  "Nair",
  "Deshmukh",
  "Kulkarni",
  "Joshi",
  "Khan",
  "Shaikh",
  "Menon",
  "Rao",
  "Singh",
  "Yadav",
  "Chavan",
  "Pawar",
];

const streetAreas = [
  "Fort",
  "Colaba",
  "Dadar",
  "Byculla",
  "Bandra",
  "Andheri",
  "Kurla",
  "Chembur",
  "Ghatkopar",
  "Borivali",
  "Sion",
  "Marine Lines",
];

const crimeTemplates = {
  Theft: [
    "Mobile phone stolen near railway station",
    "Two-wheeler theft reported from parking area",
    "Wallet and documents stolen in crowded market",
  ],
  Robbery: [
    "Chain snatching reported on public road",
    "Cash robbed after threat near ATM",
    "Shopkeeper robbed during late evening business hours",
  ],
  Murder: [
    "Fatal assault under investigation",
    "Body found with suspicious injuries",
    "Homicide case registered after medical report",
  ],
  "Cyber Crime": [
    "UPI fraud after phishing link",
    "Social media account compromised",
    "Online investment scam reported",
  ],
  Fraud: [
    "Loan document forgery complaint",
    "Property deposit fraud reported",
    "Business payment cheating complaint",
  ],
  Assault: [
    "Physical assault after local dispute",
    "Group altercation reported near market",
    "Threat and assault complaint registered",
  ],
  Kidnapping: [
    "Missing minor suspected abduction",
    "Unlawful confinement complaint under inquiry",
    "Abduction report filed by family",
  ],
  "Domestic Violence": [
    "Domestic harassment complaint filed",
    "Physical abuse reported by spouse",
    "Protection complaint under domestic dispute",
  ],
};

const updateTitles = {
  NOTE: ["Witness statement recorded", "CCTV footage reviewed", "Patrol team update filed"],
  STATUS_CHANGED: ["FIR status updated", "Investigation phase changed", "Case closure update"],
  EVIDENCE_ADDED: ["Evidence uploaded", "Digital proof attached", "Scene document added"],
};

const randomIndianName = () => `${pickOne(indianFirstNames)} ${pickOne(indianLastNames)}`;

const randomMumbaiAddress = () =>
  `${randomInt(10, 940)}, ${pickOne(["MG Road", "SV Road", "LBS Marg", "Hill Road", "Station Road", "Linking Road"])}, ${pickOne(streetAreas)}, Mumbai`;

const createPhoneFactory = (prefix) => {
  let sequence = 100000;
  return () => `${prefix}${String(sequence++).padStart(6, "0")}`;
};

const generateClusteredLocation = () => {
  const hotspot = pickWeighted(hotspots);
  const tightCluster = Math.random() < 0.72;
  const offset = tightCluster ? 0.006 : 0.018;

  return {
    address: `${hotspot.name}, Mumbai`,
    latitude: Number(clamp(hotspot.latitude + randomFloat(-offset, offset), -90, 90).toFixed(6)),
    longitude: Number(clamp(hotspot.longitude + randomFloat(-offset, offset), -180, 180).toFixed(6)),
  };
};

const crimeTitle = (crimeTypeName) => pickOne(crimeTemplates[crimeTypeName] || [`${crimeTypeName} complaint registered`]);

const crimeDescription = (faker, crimeTypeName, location) =>
  `${crimeTitle(crimeTypeName)} at ${location.address}. ${faker.lorem.sentences({ min: 2, max: 4 })}`;

const caseUpdateTitle = (updateType) => pickOne(updateTitles[updateType]);

module.exports = {
  caseUpdateTitle,
  crimeDescription,
  crimeTitle,
  createPhoneFactory,
  generateClusteredLocation,
  randomIndianName,
  randomMumbaiAddress,
};
