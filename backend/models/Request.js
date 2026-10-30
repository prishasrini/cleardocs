const mongoose = require("mongoose");

// The stages a document request moves through, in order.
const STATUSES = ["submitted", "in_review", "processing", "completed", "rejected"];

const fileSchema = new mongoose.Schema(
  {
    originalName: String, // the name on the user's device, e.g. "degree.pdf"
    storedName: String,   // the unique name we saved it under in /uploads
    mimeType: String,
    size: Number,         // bytes
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    files: [fileSchema],
    status: { type: String, enum: STATUSES, default: "submitted" },
    // Every status change is recorded, so the app can show a timeline
    history: [
      {
        status: { type: String, enum: STATUSES },
        note: String,
        at: { type: Date, default: Date.now },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", requestSchema);
module.exports.STATUSES = STATUSES;
