const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Only these file types are allowed: PDFs and common images
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

// Save each file with a random name so two files called "degree.pdf" never clash,
// and so nobody can guess another user's file URL.
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, crypto.randomUUID() + ext);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  const err = new Error("Only PDF, JPG, PNG or WEBP files are allowed.");
  err.status = 400;
  cb(err);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024, files: 5 },
});

module.exports = { upload, UPLOAD_DIR };
