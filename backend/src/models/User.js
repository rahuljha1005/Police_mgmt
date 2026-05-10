const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      trim: true,
    },
    badgeNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "SP", "INSPECTOR", "CONSTABLE"],
      required: true,
      index: true,
    },
    police_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
      required() {
        return this.role !== "ADMIN";
      },
      index: true,
    },
    zone_id: {
      type: String,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACTIVE", "SUSPENDED", "pending", "active", "rejected"],
      default: "PENDING",
      index: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verified_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Compound index for role-based queries
userSchema.index({ role: 1, status: 1 });
userSchema.index({ police_station_id: 1, role: 1 });
userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ status: 1, createdAt: -1 });
userSchema.index({ police_station_id: 1, createdAt: -1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
