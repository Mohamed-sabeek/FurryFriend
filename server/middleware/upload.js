const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // If it's a PDF, we might need a different resource_type
    const isPdf = file.mimetype === 'application/pdf';
    return {
      folder: 'furryfriend/pets',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf'],
      resource_type: isPdf ? 'raw' : 'auto',
      transformation: isPdf ? [] : [{ width: 500, height: 500, crop: 'limit' }]
    };
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
