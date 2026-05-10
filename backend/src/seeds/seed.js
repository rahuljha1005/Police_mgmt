const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const {
  AuditLog,
  CaseUpdate,
  Civilian,
  Complaint,
  CrimeLocation,
  CrimeType,
  FIR,
  OfficerVerification,
  PoliceStation,
  User,
} = require("../models");
const { crimeTypes, policeStations, state } = require("./data/indiaBaseData");
const {
  caseUpdateTitle,
  crimeDescription,
  crimeTitle,
  createPhoneFactory,
  generateClusteredLocation,
  randomIndianName,
  randomMumbaiAddress,
} = require("./utils/generators");
const { addRandomMinutes, pickOne, randomInt, randomPastDate } = require("./utils/random");

dotenv.config();

const DEFAULT_PASSWORD = "Password@123";
const OFFICER_COUNT = 36;
const CIVILIAN_COUNT = 420;
const FIR_COUNT = 760;
const COMPLAINT_COUNT = 460;
const CASE_UPDATE_TARGET = 3100;
const AUDIT_LOG_TARGET = 6500;

const clearDatabase = async () => {
  await mongoose.connection.dropDatabase();
};

const seedBaseData = async () => {
  const stations = await PoliceStation.insertMany(
    policeStations.map((station) => ({
      ...station,
      state,
      phone: `022${randomInt(20000000, 29999999)}`,
    }))
  );

  const types = await CrimeType.insertMany(crimeTypes);

  return { stations, types };
};

const seedUsers = async ({ stations }) => {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const officerPhone = createPhoneFactory("98");

  const admin = await User.create({
    name: "Mumbai Police Admin",
    email: "admin@police.com",
    password,
    role: "ADMIN",
    status: "active",
    createdAt: randomPastDate(500),
    updatedAt: new Date(),
  });

  const roles = ["CONSTABLE", "CONSTABLE", "CONSTABLE", "INSPECTOR", "INSPECTOR", "SP"];
  const officerDocs = Array.from({ length: OFFICER_COUNT }, (_, index) => {
    const name = randomIndianName();
    const station = stations[index % stations.length];
    return {
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}.${index + 1}@mumbaipolice.gov.in`,
      phone: officerPhone(),
      password,
      role: pickOne(roles),
      police_station_id: station._id,
      status: "active",
      verified_by: admin._id,
      verified_at: randomPastDate(300),
      createdAt: randomPastDate(420),
      updatedAt: new Date(),
    };
  });

  const officers = await User.insertMany(officerDocs);

  await OfficerVerification.insertMany(
    officers.map((officer, index) => ({
      user_id: officer._id,
      badge_number: `MH-MUM-${String(index + 1).padStart(5, "0")}`,
      government_id: `GOV-MH-${String(700000 + index)}`,
      document_url: `https://res.cloudinary.com/demo/raw/upload/officers/mh-mum-${String(index + 1).padStart(5, "0")}.pdf`,
      verification_status: "approved",
      verified_by: admin._id,
      verified_at: officer.verified_at,
      createdAt: officer.createdAt,
      updatedAt: new Date(),
    }))
  );

  return { admin, officers };
};

const seedCivilians = async (faker) => {
  const civilianPhone = createPhoneFactory("97");
  const civilians = Array.from({ length: CIVILIAN_COUNT }, (_, index) => {
    const name = randomIndianName();
    return {
      name,
      phone: civilianPhone(),
      email: `${name.toLowerCase().replace(/\s+/g, ".")}.${index + 1}@example.in`,
      address: randomMumbaiAddress(),
      createdAt: randomPastDate(365),
      updatedAt: new Date(),
    };
  });

  return Civilian.insertMany(civilians);
};

const officersForStation = (officers, stationId) => {
  const stationOfficers = officers.filter((officer) => String(officer.police_station_id) === String(stationId));
  return stationOfficers.length ? stationOfficers : officers;
};

const chooseFirStatus = () => {
  const roll = Math.random();
  if (roll < 0.34) return "open";
  if (roll < 0.72) return "investigating";
  return "closed";
};

const seedFirs = async ({ faker, stations, types, officers, civilians, admin }) => {
  const firDocs = [];

  for (let index = 0; index < FIR_COUNT; index += 1) {
    const station = pickOne(stations);
    const crimeType = pickOne(types);
    const location = generateClusteredLocation();
    const status = chooseFirStatus();
    const createdAt = randomPastDate(365);
    const stationOfficers = officersForStation(officers, station._id);
    const assignedOfficer = pickOne(stationOfficers);
    const civilian = pickOne(civilians);

    firDocs.push({
      fir_number: `FIR-${createdAt.getFullYear()}-${String(index + 1).padStart(6, "0")}`,
      title: crimeTitle(crimeType.name),
      description: crimeDescription(faker, crimeType.name, location),
      location,
      crime_type_id: crimeType._id,
      filed_by_type: Math.random() < 0.7 ? "civilian" : "officer",
      filed_by_id: Math.random() < 0.7 ? civilian._id : assignedOfficer._id,
      assigned_officer_id: assignedOfficer._id,
      created_by: admin._id,
      police_station_id: station._id,
      status,
      priority: crimeType.severity === "critical" ? "critical" : pickOne(["low", "medium", "high"]),
      closedAt: status === "closed" ? addRandomMinutes(createdAt, 1440, 120000) : undefined,
      createdAt,
      updatedAt: new Date(),
    });
  }

  return FIR.insertMany(firDocs);
};

const seedComplaints = async ({ faker, stations, officers, civilians, firs }) => {
  const statuses = ["PENDING", "UNDER_REVIEW", "CONVERTED_TO_FIR", "REJECTED"];
  const complaints = Array.from({ length: COMPLAINT_COUNT }, (_, index) => {
    const station = pickOne(stations);
    const assignedOfficer = pickOne(officersForStation(officers, station._id));
    const civilian = pickOne(civilians);
    const status = pickOne(statuses);
    const location = generateClusteredLocation();
    const linkedFir = status === "CONVERTED_TO_FIR" ? pickOne(firs) : null;
    const createdAt = randomPastDate(240);

    return {
      civilian_id: civilian._id,
      title: pickOne(["Noise and public nuisance complaint", "Suspicious activity reported", "Local dispute complaint", "Lost property complaint"]),
      description: `${faker.lorem.sentences({ min: 2, max: 4 })} Complaint registered from ${location.address}.`,
      police_station_id: station._id,
      status,
      priority: pickOne(["LOW", "MEDIUM", "HIGH"]),
      complaint_location: location,
      assigned_officer_id: status === "PENDING" && Math.random() < 0.5 ? undefined : assignedOfficer._id,
      fir_id: linkedFir?._id,
      createdAt,
      updatedAt: new Date(),
    };
  });

  return Complaint.insertMany(complaints);
};

const statusFromDb = {
  open: "OPEN",
  investigating: "INVESTIGATING",
  closed: "CLOSED",
};

const seedCaseUpdates = async ({ faker, firs }) => {
  const updates = [];
  const perFirBase = Math.floor(CASE_UPDATE_TARGET / firs.length);

  for (const fir of firs) {
    const count = Math.max(2, perFirBase + randomInt(0, 3));
    let timelineStatus = "OPEN";

    for (let index = 0; index < count; index += 1) {
      const createdAt = addRandomMinutes(fir.createdAt, 60 * (index + 1), 60 * 24 * 45);
      const canStatusChange =
        (timelineStatus === "OPEN" && fir.status !== "open" && index === 1) ||
        (timelineStatus === "INVESTIGATING" && fir.status === "closed" && index === 2);
      const updateType = canStatusChange ? "STATUS_CHANGED" : Math.random() < 0.18 ? "EVIDENCE_ADDED" : "NOTE";
      const previousStatus = updateType === "STATUS_CHANGED" ? timelineStatus : undefined;
      const newStatus =
        updateType === "STATUS_CHANGED"
          ? timelineStatus === "OPEN"
            ? "INVESTIGATING"
            : "CLOSED"
          : undefined;

      if (newStatus) timelineStatus = newStatus;

      updates.push({
        fir_id: fir._id,
        officer_id: fir.assigned_officer_id,
        updateType,
        title: caseUpdateTitle(updateType),
        description: faker.lorem.sentences({ min: 2, max: 4 }),
        previousStatus,
        newStatus,
        attachments:
          updateType === "EVIDENCE_ADDED"
            ? [
                {
                  fileUrl: `https://res.cloudinary.com/demo/image/upload/evidence/${fir.fir_number.toLowerCase()}-${index + 1}.jpg`,
                  secureUrl: `https://res.cloudinary.com/demo/image/upload/evidence/${fir.fir_number.toLowerCase()}-${index + 1}.jpg`,
                  publicId: `evidence/${fir.fir_number.toLowerCase()}-${index + 1}`,
                  provider: "external",
                  fileType: "image/jpeg",
                  uploadedAt: createdAt,
                },
              ]
            : [],
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return CaseUpdate.insertMany(updates.slice(0, CASE_UPDATE_TARGET));
};

const seedCrimeLocations = async (firs) =>
  CrimeLocation.insertMany(
    firs.map((fir) => ({
      fir_id: fir._id,
      address: fir.location.address,
      latitude: fir.location.latitude,
      longitude: fir.location.longitude,
      createdAt: fir.createdAt,
      updatedAt: fir.updatedAt,
    }))
  );

const seedAuditLogs = async ({ users, firs, complaints, caseUpdates, admin }) => {
  const actions = [
    "LOGIN",
    "CREATE_OFFICER",
    "CREATE_FIR",
    "UPDATE_FIR_STATUS",
    "ADD_CASE_UPDATE",
    "VERIFY_OFFICER",
    "CONVERT_COMPLAINT_TO_FIR",
  ];

  const logs = Array.from({ length: AUDIT_LOG_TARGET }, () => {
    const action = pickOne(actions);
    const user = pickOne(users);
    const fir = pickOne(firs);
    const complaint = pickOne(complaints);
    const caseUpdate = pickOne(caseUpdates);

    const entity =
      action === "CREATE_OFFICER" || action === "VERIFY_OFFICER"
        ? { type: "USER", id: user._id }
        : action === "CONVERT_COMPLAINT_TO_FIR"
          ? { type: "COMPLAINT", id: complaint._id }
          : action === "ADD_CASE_UPDATE"
            ? { type: "FIR", id: caseUpdate.fir_id }
            : { type: "FIR", id: fir._id };

    return {
      user_id: action === "CREATE_OFFICER" || action === "VERIFY_OFFICER" ? admin._id : user._id,
      action,
      entity_type: entity.type,
      entity_id: entity.id,
      status: "success",
      createdAt: randomPastDate(365),
    };
  });

  return AuditLog.insertMany(logs);
};

const runSeed = async () => {
  const { fakerEN_IN: faker } = await import("@faker-js/faker");
  faker.seed(20260508);

  await connectDB();
  console.log("Clearing existing demo data...");
  await clearDatabase();

  console.log("Seeding stations and crime types...");
  const { stations, types } = await seedBaseData();

  console.log("Seeding officers and admin...");
  const { admin, officers } = await seedUsers({ stations });

  console.log("Seeding civilians...");
  const civilians = await seedCivilians(faker);

  console.log("Seeding FIRs with clustered Mumbai coordinates...");
  const firs = await seedFirs({ faker, stations, types, officers, civilians, admin });
  await seedCrimeLocations(firs);

  console.log("Seeding complaints...");
  const complaints = await seedComplaints({ faker, stations, officers, civilians, firs });

  console.log("Seeding investigation timelines...");
  const caseUpdates = await seedCaseUpdates({ faker, firs });

  console.log("Seeding audit logs...");
  const auditLogs = await seedAuditLogs({
    users: [admin, ...officers],
    firs,
    complaints,
    caseUpdates,
    admin,
  });

  console.log("Seed complete:");
  console.table({
    policeStations: stations.length,
    crimeTypes: types.length,
    officers: officers.length,
    civilians: civilians.length,
    firs: firs.length,
    complaints: complaints.length,
    caseUpdates: caseUpdates.length,
    auditLogs: auditLogs.length,
  });
  console.log(`Admin login: admin@police.com / ${DEFAULT_PASSWORD}`);

  await mongoose.disconnect();
};

runSeed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
