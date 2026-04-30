const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "det0zwlkc",
  api_key: process.env.CLOUDINARY_API_KEY || "321828957565793",
  api_secret: process.env.CLOUDINARY_API_SECRET || "SRDXLASG7ybNCpPTsbuXqd-m-1A"
});

// Create Cloudinary storage engine for images
const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "auction-images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  }
});

// Create Cloudinary storage engine for payment slips
const slipStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "payment-slips",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "pdf"],
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  }
});

// Export multer upload instances
const uploadImage = multer({ storage: imageStorage });
const uploadSlip = multer({ storage: slipStorage });

module.exports = {
  uploadImage,
  uploadSlip,
  cloudinary
};
