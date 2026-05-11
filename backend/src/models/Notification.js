const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    user_model: {
      type: String,
      enum: ["User", "Civilian"],
      default: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "FIR_ASSIGNED",
        "CASE_TRANSFERRED",
        "CASE_HANDOVER",
        "CASE_UPDATED",
        "COMPLAINT_ASSIGNED",
        "STATUS_CHANGED",
        "EVIDENCE_ADDED",
        "SOS_CREATED",
        "SOS_ASSIGNED",
        "SOS_RESPONDING",
        "SOS_ON_SCENE",
        "SOS_ESCALATED",
        "SOS_RESOLVED",
        "SOS_FALSE_ALERT",
        "SOS_CONVERTED_TO_FIR",
        "ZONE_SAFETY_ALERT",
      ],
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    related_entity_type: {
      type: String,
      required: true,
      trim: true,
    },
    related_entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ user_id: 1, createdAt: -1 });
notificationSchema.index({ user_id: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
