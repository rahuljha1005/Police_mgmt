const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const allowedMimeTypes = new Set(["image/png", "image/jpeg", "application/pdf", "video/mp4"]);

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (!isCloudinaryConfigured()) {
      throw new Error("Cloudinary environment variables are not configured");
    }

    return {
      folder: "police-management/evidence",
      resource_type: "auto",
      public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
      use_filename: false,
      unique_filename: true,
    };
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
