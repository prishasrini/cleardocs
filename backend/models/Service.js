const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true }, // URL-friendly id, e.g. "apostille"
    title: { type: String, required: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    turnaround: { type: String, required: true },
    startingPrice: { type: Number, required: true }, // in rupees
    requiredDocuments: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
