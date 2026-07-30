const express = require('express');
const multer = require('multer');
const path = require('path');
const Banner = require('../models/Banner');
const router = express.Router();

// Multer Config for Banner Images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'banner-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST create banner
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { type, link } = req.body;
    if (!type || !req.file) {
      return res.status(400).json({ success: false, message: 'Type and image are required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const banner = new Banner({ type, link: link || '#products', imageUrl });
    await banner.save();

    res.status(201).json({ success: true, banner });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE a banner
router.delete('/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
