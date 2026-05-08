const mongoose = require("mongoose");

const criminalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    history_notes: {
      type: String,
    },
    photo_url: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Criminal", criminalSchema);
