const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["cloudinary", "external"],
      default: "cloudinary",
    },
    fileType: {
      type: String,
      required: true,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resourceType: {
      type: String,
      trim: true,
    },
    bytes: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const caseUpdateSchema = new mongoose.Schema(
  {
    fir_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
      index: true,
    },
    officer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    updateType: {
      type: String,
      enum: ["NOTE", "STATUS_CHANGED", "EVIDENCE_ADDED", "OFFICER_ASSIGNED", "OFFICER_TRANSFERRED", "SUSPECT_UPDATED"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    previousStatus: {
      type: String,
      enum: ["OPEN", "INVESTIGATING", "CLOSED"],
    },
    newStatus: {
      type: String,
      enum: ["OPEN", "INVESTIGATING", "CLOSED"],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
      validate: {
        validator(value) {
          return value.length <= 5;
        },
        message: "A case update can include at most 5 attachments",
      },
    },
  },
  {
    collection: "case_updates",
    timestamps: true,
  }
);

caseUpdateSchema.index({ fir_id: 1, createdAt: -1 });
caseUpdateSchema.index({ officer_id: 1, createdAt: -1 });
caseUpdateSchema.index({ fir_id: 1, updateType: 1, createdAt: -1 });
caseUpdateSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CaseUpdate", caseUpdateSchema);
