const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      index: true,
    },
    zone: {
      type: String,
      required: true,
      index: true,
    },
    police_station_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoliceStation",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
