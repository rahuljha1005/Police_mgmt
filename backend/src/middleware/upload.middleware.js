const fs = require("fs");
const os = require("os");
const path = require("path");
const multer = require("multer");

const uploadBase = process.env.VERCEL ? os.tmpdir() : path.join(__dirname, "../../uploads");
const uploadRoot = path.join(uploadBase, "evidence");
fs.mkdirSync(uploadRoot, { recursive: true });

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "application/pdf", "video/mp4"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }

  return cb(null, true);
};

const evidenceUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 5,
  },
});

module.exports = {
  evidenceUpload,
};
