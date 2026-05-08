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
      required() {
        return this.role !== "ADMIN";
      },
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["CONSTABLE", "INSPECTOR", "SP", "DGP", "ADMIN"],
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
    status: {
      type: String,
      enum: ["pending", "active", "rejected"],
      default: "pending",
      index: true,
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
