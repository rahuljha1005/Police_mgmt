const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { Civilian, PoliceStation, User } = require("../models");

const DEFAULT_PASSWORD = "Password@123";

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

const upsertUser = async (payload, password) => {
  const hashedPassword = await bcrypt.hash(password, 12);
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

const upsertCivilian = async (password) => {
  const hashedPassword = await bcrypt.hash(password, 12);
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

const repairDemoAccounts = async ({ connect = true, disconnect = false, password = process.env.DEMO_PASSWORD || DEFAULT_PASSWORD } = {}) => {
  try {
    if (connect) {
      await connectDB();
    }

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
    }, password);

    const dgp = await upsertUser({
      name: "DGP Maharashtra Command",
      email: "dgp@police.com",
      phone: "9999990001",
      badgeNumber: "MH-DGP-00001",
      role: "DGP",
      state_id: "Maharashtra",
    }, password);

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
    }, password);

    const civilian = await upsertCivilian(password);

    console.log("Demo accounts repaired:");
    console.table([
      { type: "ADMIN", email: admin.email, password },
      { type: "DGP", email: dgp.email, badgeNumber: dgp.badgeNumber, password },
      { type: "INSPECTOR", email: officer.email, badgeNumber: officer.badgeNumber, password },
      { type: "CIVILIAN", email: civilian.email, password },
    ]);

    return { admin, dgp, officer, civilian };
  } catch (error) {
    console.error("Failed to repair demo accounts:", error.message);
    throw error;
  } finally {
    if (disconnect) {
      await mongoose.disconnect();
    }
  }
};

if (require.main === module) {
  require("../config/env");
  repairDemoAccounts({ disconnect: true }).catch(() => {
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_PASSWORD,
  repairDemoAccounts,
};
