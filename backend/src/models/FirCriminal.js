const mongoose = require("mongoose");

const firCriminalSchema = new mongoose.Schema(
  {
    fir_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FIR",
      required: true,
      index: true,
    },
    criminal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Criminal",
      required: true,
      index: true,
    },
    role_in_crime: {
      type: String,
      enum: ["suspect", "accomplice", "witness", "victim"],
      required: true,
    },
  },
  { timestamps: true }
);

// Unique constraint to prevent duplicate entries
firCriminalSchema.index({ fir_id: 1, criminal_id: 1 }, { unique: true });

module.exports = mongoose.model("FirCriminal", firCriminalSchema);
