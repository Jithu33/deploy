const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedTypes.test(file.mimetype);
  
  if (isValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Protect routes with authentication
router.use(checkAuth);

// Upload route
router.post('/', upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Create URL to the uploaded file
  const protocol = req.protocol; // http or https
  const host = req.get('host');
  const imageUrl = `${protocol}://${host}/${req.file.path.replace(/\\/g, '/')}`;
  
  res.status(201).json({ 
    message: 'File uploaded successfully',
    imageUrl: imageUrl
  });
});

module.exports = router;