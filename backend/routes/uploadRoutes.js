const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '../uploads/portfolio');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only JPG, PNG, WEBP, and SVG images are allowed'));
  },
});

router.post('/image', protect, authorize('admin'), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl.replace(/\/$/, '')}/uploads/portfolio/${req.file.filename}`;

  return res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    imageUrl,
  });
});

module.exports = router;
