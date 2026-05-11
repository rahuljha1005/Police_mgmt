require("../config/env");

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { Civilian, PoliceStation, User } = require("../models");

const DEFAULT_PASSWORD = process.env.DEMO_PASSWORD || "Password@123";

const stationData = {
  name: "Colaba Police Station",
  address: "Shahid Bhagat Singh Road, Colaba, Mumbai",
  latitude: 18.9067,
  longitude: 72.8147,
  phone: "02222040000",
  state: "Maharashtra",
  district: "South Mumbai",
  zone: "South Mumbai",
};

const upsertUser = async (payload) => {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const identity = [
    { email: payload.email },
    { phone: payload.phone },
    ...(payload.badgeNumber ? [{ badgeNumber: payload.badgeNumber }] : []),
  ];

  const user = await User.findOneAndUpdate(
    { $or: identity },
    {
      $set: {
        ...payload,
        password: hashedPassword,
        status: "ACTIVE",
        isFirstLogin: false,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  return user;
};

const upsertCivilian = async () => {
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  return Civilian.findOneAndUpdate(
    { email: "civilian@example.com" },
    {
      $set: {
        name: "Demo Civilian",
        email: "civilian@example.com",
        phone: "9700000000",
        password: hashedPassword,
        address: "Mumbai, Maharashtra",
        status: "ACTIVE",
        updatedAt: new Date(),
      },
      $setOnInsert: {
        createdAt: new Date(),
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );
};

const repairDemoAccounts = async () => {
  try {
    await connectDB();

    const station = await PoliceStation.findOneAndUpdate(
      { name: stationData.name },
      { $set: stationData },
      { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
    );

    const admin = await upsertUser({
      name: "Mumbai Police Admin",
      email: "admin@police.com",
      phone: "9999990000",
      role: "ADMIN",
      state_id: "Maharashtra",
    });

    const dgp = await upsertUser({
      name: "DGP Maharashtra Command",
      email: "dgp@police.com",
      phone: "9999990001",
      badgeNumber: "MH-DGP-00001",
      role: "DGP",
      state_id: "Maharashtra",
    });

    const officer = await upsertUser({
      name: "Demo Inspector",
      email: "inspector@police.com",
      phone: "9999990002",
      badgeNumber: "MH-MUM-00001",
      role: "INSPECTOR",
      police_station_id: station._id,
      state_id: "Maharashtra",
      district_id: station.district,
      zone_id: station.zone,
      assigned_zone_id: station.zone,
    });

    const civilian = await upsertCivilian();

    console.log("Demo accounts repaired:");
    console.table([
      { type: "ADMIN", email: admin.email, password: DEFAULT_PASSWORD },
      { type: "DGP", email: dgp.email, badgeNumber: dgp.badgeNumber, password: DEFAULT_PASSWORD },
      { type: "INSPECTOR", email: officer.email, badgeNumber: officer.badgeNumber, password: DEFAULT_PASSWORD },
      { type: "CIVILIAN", email: civilian.email, password: DEFAULT_PASSWORD },
    ]);
  } catch (error) {
    console.error("Failed to repair demo accounts:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

repairDemoAccounts();
