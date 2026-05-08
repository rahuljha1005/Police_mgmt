const state = "Maharashtra";

const policeZones = ["South Mumbai", "Central Mumbai", "Western Mumbai", "Eastern Mumbai"];

const policeStations = [
  {
    name: "Colaba Police Station",
    address: "Shahid Bhagat Singh Road, Colaba, Mumbai",
    latitude: 18.9067,
    longitude: 72.8147,
    zone: "South Mumbai",
  },
  {
    name: "Marine Drive Police Station",
    address: "Netaji Subhash Chandra Bose Road, Marine Lines, Mumbai",
    latitude: 18.9432,
    longitude: 72.8236,
    zone: "South Mumbai",
  },
  {
    name: "Azad Maidan Police Station",
    address: "Mahapalika Marg, Fort, Mumbai",
    latitude: 18.9398,
    longitude: 72.8355,
    zone: "South Mumbai",
  },
  {
    name: "Byculla Police Station",
    address: "Dr Babasaheb Ambedkar Road, Byculla, Mumbai",
    latitude: 18.975,
    longitude: 72.8337,
    zone: "Central Mumbai",
  },
  {
    name: "Dadar Police Station",
    address: "Dr D Silva Road, Dadar West, Mumbai",
    latitude: 19.018,
    longitude: 72.8424,
    zone: "Central Mumbai",
  },
  {
    name: "Sion Police Station",
    address: "Sion Circle, Sion East, Mumbai",
    latitude: 19.0435,
    longitude: 72.8619,
    zone: "Central Mumbai",
  },
  {
    name: "Bandra Police Station",
    address: "Hill Road, Bandra West, Mumbai",
    latitude: 19.0544,
    longitude: 72.8402,
    zone: "Western Mumbai",
  },
  {
    name: "Andheri Police Station",
    address: "JP Road, Andheri West, Mumbai",
    latitude: 19.1197,
    longitude: 72.8468,
    zone: "Western Mumbai",
  },
  {
    name: "Borivali Police Station",
    address: "SV Road, Borivali West, Mumbai",
    latitude: 19.229,
    longitude: 72.8571,
    zone: "Western Mumbai",
  },
  {
    name: "Kurla Police Station",
    address: "LBS Marg, Kurla West, Mumbai",
    latitude: 19.0726,
    longitude: 72.8845,
    zone: "Eastern Mumbai",
  },
  {
    name: "Chembur Police Station",
    address: "RC Marg, Chembur, Mumbai",
    latitude: 19.0622,
    longitude: 72.9024,
    zone: "Eastern Mumbai",
  },
  {
    name: "Ghatkopar Police Station",
    address: "MG Road, Ghatkopar East, Mumbai",
    latitude: 19.0863,
    longitude: 72.9089,
    zone: "Eastern Mumbai",
  },
];

const crimeTypes = [
  {
    name: "Theft",
    severity: "medium",
    description: "Unlawful taking of movable property including mobile phones, wallets, and vehicles.",
  },
  {
    name: "Robbery",
    severity: "high",
    description: "Theft involving force, intimidation, or threat against a person.",
  },
  {
    name: "Murder",
    severity: "critical",
    description: "Unlawful killing requiring immediate senior investigation oversight.",
  },
  {
    name: "Cyber Crime",
    severity: "high",
    description: "Online fraud, identity theft, account compromise, and digital extortion.",
  },
  {
    name: "Fraud",
    severity: "high",
    description: "Financial deception including investment scams, forgery, and cheating.",
  },
  {
    name: "Assault",
    severity: "medium",
    description: "Physical attack or threat causing harm or fear of harm.",
  },
  {
    name: "Kidnapping",
    severity: "critical",
    description: "Abduction or unlawful confinement of a person.",
  },
  {
    name: "Domestic Violence",
    severity: "high",
    description: "Violence, abuse, harassment, or intimidation in a domestic setting.",
  },
];

const hotspots = [
  { name: "CST and Fort business district", latitude: 18.9402, longitude: 72.8356, weight: 0.18 },
  { name: "Dadar transport hub", latitude: 19.018, longitude: 72.8448, weight: 0.16 },
  { name: "Bandra Linking Road market", latitude: 19.0649, longitude: 72.8359, weight: 0.14 },
  { name: "Andheri station corridor", latitude: 19.1197, longitude: 72.8468, weight: 0.16 },
  { name: "Kurla LBS Marg corridor", latitude: 19.0726, longitude: 72.8845, weight: 0.13 },
  { name: "Chembur commercial belt", latitude: 19.0622, longitude: 72.9024, weight: 0.11 },
  { name: "Borivali market area", latitude: 19.229, longitude: 72.8571, weight: 0.12 },
];

module.exports = {
  crimeTypes,
  hotspots,
  policeStations,
  policeZones,
  state,
};
