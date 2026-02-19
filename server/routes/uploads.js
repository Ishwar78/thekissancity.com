const express = require('express');
const router = express.Router();

router.use((req, res, next) => {
  console.log(`[UPLOADS ROUTER] ${req.method} ${req.path}`);
  next();
});
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const { requireAuth, requireAdmin } = require('../middleware/auth');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'uni10_uploads',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: ['jpg', 'png', 'webp', 'avif', 'mp4', 'webm', 'mov'],
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/avif',
      'video/mp4', 'video/webm', 'video/quicktime', // Original video mimes
      'video/mpeg', 'video/mpg', 'video/3gpp', 'video/x-msvideo' // Additional video mimes
    ];
    console.log('File mimetype:', file.mimetype);
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      console.log('Disallowed mimetype:', file.mimetype);
      cb(new Error('Only JPEG, PNG, WebP, AVIF images, MP4, WebM, MOV, MPEG, and AVI videos are allowed'));
    }
  }
});

// General uploads (admin-only)
router.post('/', requireAuth, requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: 'No file uploaded' });
  console.log('[Cloudinary Upload Success]', req.file.path);
  // Cloudinary will provide the file path (URL)
  return res.json({ ok: true, url: req.file.path });
});

// Review image uploads (authenticated users)
router.post('/images', requireAuth, (req, res) => {
  console.log('[UPLOADS /images] Request received.');
  upload.single('file')(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      console.error('[MULTER ERROR /images]', err);
      return res.status(400).json({ ok: false, message: err.message });
    } else if (err) {
      console.error('[UNKNOWN UPLOAD ERROR /images]', err);
      return res.status(500).json({ ok: false, message: err.message });
    }

    if (!req.file) {
      console.log('[UPLOADS /images] No file uploaded after multer processing.');
      return res.status(400).json({ ok: false, message: 'No file uploaded' });
    }

    console.log('[UPLOADS /images] File processed by multer. Uploading to Cloudinary...', req.file.path);
    // At this point, req.file should contain the Cloudinary response if storage is CloudinaryStorage
    // The path property of req.file is the URL from Cloudinary
    console.log('[Cloudinary Upload Success /images]', req.file.path);
    return res.json({ ok: true, url: req.file.path });
  });
});

// Admin video uploads
const uploadMiddleware = upload.single('file');

router.post('/admin/video', requireAuth, requireAdmin, (req, res, next) => {
  uploadMiddleware(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.error('[MULTER ERROR]', err);
      return res.status(400).json({ ok: false, message: err.message });
    } else if (err) {
      // An unknown error occurred when uploading.
      console.error('[UNKNOWN UPLOAD ERROR]', err);
      return res.status(500).json({ ok: false, message: err.message });
    }
    next();
  });
}, (req, res) => {
  console.log('[VIDEO UPLOAD] req.file:', req.file);
  console.log('[VIDEO UPLOAD] req.body:', req.body);
  if (!req.file) return res.status(400).json({ ok: false, message: 'No video file uploaded' });
  console.log('[Cloudinary Upload Success]', req.file.path);
  // Cloudinary will provide the file path (URL)
  return res.json({ ok: true, url: req.file.path });
});

module.exports = router;
module.exports.upload = upload;
