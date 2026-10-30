const express = require("express");
const cors = require("cors");
const multer = require("multer");

const authRoutes = require("./routes/auth");
const serviceRoutes = require("./routes/services");
const requestRoutes = require("./routes/requests");
const enquiryRoutes = require("./routes/enquiries");

// The app is built here and started in server.js.
// Keeping them separate lets the tests use the app without opening a port.
const app = express();

// When deployed behind a host like Render, this makes req.protocol "https" (used for file links)
app.set("trust proxy", 1);

// Which websites may call this API. In .env: CLIENT_ORIGINS=http://localhost:3000,https://yoursite.vercel.app
// The mobile app doesn't need this: CORS only applies to browsers.
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:3000,http://localhost:8081")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "ClearDocs API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/files", requestRoutes.signedFileRouter);
app.use("/api/enquiries", enquiryRoutes);

// Any /api route that doesn't exist
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// One place that turns errors into clean JSON responses.
// (Express 5 sends errors from async routes here automatically.)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Each file must be 5 MB or smaller." :
      err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE" ? "You can upload up to 5 files." :
      err.message;
    return res.status(400).json({ message });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: Object.values(err.errors)[0].message });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Invalid JSON in request body." });
  }

  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? "Something went wrong on our side." : err.message });
});

module.exports = app;
