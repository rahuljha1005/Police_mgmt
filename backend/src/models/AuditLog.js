const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entity_type: {
      type: String,
      required: true,
      index: true,
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    old_values: {
      type: mongoose.Schema.Types.Mixed,
    },
    new_values: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip_address: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for audit trail
auditLogSchema.index({ user_id: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ entity_type: 1, entity_id: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
