const mongoose = require("mongoose");

// A message sent from the website's Contact form
const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 20 },
    service: { type: String, trim: true }, // which service they asked about (optional)
    message: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
