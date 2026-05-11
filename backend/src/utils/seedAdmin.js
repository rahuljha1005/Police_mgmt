const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: "admin@police.com", role: "ADMIN" });
    if (existingAdmin) {
      console.log("Default admin user already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash("Password@123", 12);

    await User.create({
      name: "System Admin",
      email: "admin@police.com",
      phone: "9999990000",
      password: hashedPassword,
      role: "ADMIN",
      status: "active",
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Failed to seed admin user:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

seedAdmin();
