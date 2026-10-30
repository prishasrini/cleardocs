const express = require("express");
const Enquiry = require("../models/Enquiry");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/enquiries  — the website's Contact form (public, no login)
router.post("/", async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  await Enquiry.create({ name, email, phone, service, message });
  res.status(201).json({ message: "Thanks! We'll get back to you within one working day." });
});

// GET /api/enquiries  — list enquiries (admin only)
router.get("/", protect, adminOnly, async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  res.json(enquiries);
});

module.exports = router;
