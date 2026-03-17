const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory for local fallback
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Check if Cloudinary is configured properly
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let storage;

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Configure Cloudinary Storage
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'civicfix_reports',
      allowed_formats: ['jpg', 'png', 'jpeg'],
    },
  });
  console.log('Using Cloudinary Storage');
} else {
  // Fallback to Disk Storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Use forward slashes even on Windows for the final path
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  console.log('Using Local Disk Storage (Cloudinary not configured)');
}

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = upload;
