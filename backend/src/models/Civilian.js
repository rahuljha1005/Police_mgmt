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
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "civilians",
    timestamps: true,
  }
);

civilianSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Civilian", civilianSchema);
