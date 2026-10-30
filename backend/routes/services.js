const express = require("express");
const Service = require("../models/Service");

const router = express.Router();

// GET /api/services  — list all services (public)
router.get("/", async (req, res) => {
  const services = await Service.find().sort({ title: 1 });
  res.json(services);
});

// GET /api/services/:slug  — one service (public)
router.get("/:slug", async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug });
  if (!service) return res.status(404).json({ message: "Service not found." });
  res.json(service);
});

module.exports = router;
