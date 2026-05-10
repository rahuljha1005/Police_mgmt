const mongoose = require("mongoose");

const civilianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false,
    },
    address: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "BLOCKED"],
      default: "ACTIVE",
      index: true,
    },
  },
  {
    collection: "civilians",
    timestamps: true,
  }
);

civilianSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Civilian", civilianSchema);
