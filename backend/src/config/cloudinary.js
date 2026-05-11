const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = () =>
  Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured()) {
  // Cloudinary is the production file store. Vercel's filesystem is read-only
  // for deployed code and cannot persist evidence files between invocations.
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
