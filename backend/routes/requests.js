const express = require("express");
const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Request = require("../models/Request");
const Service = require("../models/Service");
const { STATUSES } = require("../models/Request");
const { protect, adminOnly } = require("../middleware/auth");
const { upload, UPLOAD_DIR } = require("../middleware/upload");

const router = express.Router();

// Every route in this file needs a logged-in user
router.use(protect);

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Can this user see this request? Owners and admins only.
function canView(user, request) {
  return user.role === "admin" || request.user._id.equals(user._id);
}

// POST /api/requests  — submit a new document request with files
// The form sends multipart/form-data with fields: serviceId, notes, files (1–5)
router.post("/", upload.array("files", 5), async (req, res) => {
  const { serviceId, notes } = req.body;

  // If something is wrong, delete the files multer already saved
  const cleanup = () =>
    Promise.all((req.files || []).map((f) => fs.unlink(f.path).catch(() => {})));

  if (!serviceId || !isValidId(serviceId)) {
    await cleanup();
    return res.status(400).json({ message: "Please choose a valid service." });
  }
  const service = await Service.findById(serviceId);
  if (!service) {
    await cleanup();
    return res.status(404).json({ message: "Service not found." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Please attach at least one document." });
  }

  const request = await Request.create({
    user: req.user._id,
    service: service._id,
    notes,
    files: req.files.map((f) => ({
      originalName: f.originalname,
      storedName: f.filename,
      mimeType: f.mimetype,
      size: f.size,
    })),
    history: [{ status: "submitted", note: "Request received" }],
  });

  await request.populate("service", "title slug");
  res.status(201).json(request);
});

// GET /api/requests/mine  — the logged-in user's own requests
router.get("/mine", async (req, res) => {
  const requests = await Request.find({ user: req.user._id })
    .populate("service", "title slug")
    .sort({ createdAt: -1 });
  res.json(requests);
});

// GET /api/requests  — ALL requests (admin only), optional ?status=in_review
router.get("/", adminOnly, async (req, res) => {
  const filter = {};
  if (req.query.status && STATUSES.includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const requests = await Request.find(filter)
    .populate("service", "title slug")
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(requests);
});

// GET /api/requests/:id  — one request (owner or admin)
router.get("/:id", async (req, res) => {
  if (!isValidId(req.params.id)) return res.status(404).json({ message: "Request not found." });

  const request = await Request.findById(req.params.id)
    .populate("service", "title slug turnaround")
    .populate("user", "name email");

  // 404 (not 403) for other people's requests, so we don't reveal they exist
  if (!request || !canView(req.user, request)) {
    return res.status(404).json({ message: "Request not found." });
  }
  res.json(request);
});

// PATCH /api/requests/:id/status  — move a request to a new stage (admin only)
router.patch("/:id/status", adminOnly, async (req, res) => {
  const { status, note } = req.body;

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${STATUSES.join(", ")}` });
  }
  if (!isValidId(req.params.id)) return res.status(404).json({ message: "Request not found." });

  const request = await Request.findById(req.params.id);
  if (!request) return res.status(404).json({ message: "Request not found." });

  request.status = status;
  request.history.push({ status, note });
  await request.save();
  await request.populate([
    { path: "service", select: "title slug" },
    { path: "user", select: "name email" },
  ]);
  res.json(request);
});

// Finds a file on a request the user is allowed to see, or returns null
async function findViewableFile(user, requestId, storedName) {
  if (!isValidId(requestId)) return null;
  const request = await Request.findById(requestId);
  if (!request || !canView(user, request)) return null;
  return request.files.find((f) => f.storedName === storedName) || null;
}

// GET /api/requests/:id/files/:storedName  — download an uploaded file
// Files are NOT served publicly; you must be the owner or an admin.
router.get("/:id/files/:storedName", async (req, res) => {
  const file = await findViewableFile(req.user, req.params.id, req.params.storedName);
  if (!file) return res.status(404).json({ message: "File not found." });

  // path.basename stops tricks like "../../.env"
  res.download(path.join(UPLOAD_DIR, path.basename(file.storedName)), file.originalName);
});

// GET /api/requests/:id/files/:storedName/link  — a link that opens the file for 5 minutes
// The phone's browser can't send our "Authorization" header, so instead of putting the
// login token in a URL (where it could leak), we sign a short-lived link for this one file.
router.get("/:id/files/:storedName/link", async (req, res) => {
  const file = await findViewableFile(req.user, req.params.id, req.params.storedName);
  if (!file) return res.status(404).json({ message: "File not found." });

  const sig = jwt.sign(
    { rid: req.params.id, file: file.storedName, purpose: "file" },
    process.env.JWT_SECRET,
    { expiresIn: "5m" }
  );
  const url = `${req.protocol}://${req.get("host")}/api/files/${encodeURIComponent(file.storedName)}?sig=${sig}`;
  res.json({ url, expiresInSeconds: 300 });
});

module.exports = router;

// GET /api/files/:storedName?sig=...  — opens a file using a signed link (no login header needed).
// Mounted separately in app.js because it must NOT go through "protect".
module.exports.signedFileRouter = express
  .Router()
  .get("/:storedName", async (req, res) => {
    let payload;
    try {
      payload = jwt.verify(String(req.query.sig || ""), process.env.JWT_SECRET);
    } catch {
      return res.status(403).json({ message: "This link has expired. Open the file again from the app." });
    }
    if (payload.purpose !== "file" || payload.file !== req.params.storedName) {
      return res.status(403).json({ message: "This link is not valid." });
    }
    const request = await Request.findById(payload.rid);
    const file = request?.files.find((f) => f.storedName === payload.file);
    if (!file) return res.status(404).json({ message: "File not found." });

    // inline: show PDFs and images in the browser instead of forcing a download
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(file.originalName)}"`);
    res.type(file.mimeType);
    res.sendFile(path.join(UPLOAD_DIR, path.basename(file.storedName)));
  });
