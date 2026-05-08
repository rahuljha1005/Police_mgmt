const mongoose = require("mongoose");

const officerVerificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    badge_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    government_id: {
      type: String,
      required: true,
      unique: true,
    },
    document_url: {
      type: String,
      required: true,
    },
    verification_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
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
    rejection_reason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfficerVerification", officerVerificationSchema);
