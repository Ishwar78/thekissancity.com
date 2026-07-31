const express = require('express');
const multer = require('multer');
const path = require('path');
const InfluencerVideo = require('../models/InfluencerVideo');
const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'video-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST create video
router.post('/', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), async (req, res) => {
  try {
    const { productName, productSlug, tag } = req.body;
    
    if (!productName || !productSlug || !tag) {
      return res.status(400).json({ success: false, message: 'Product Name, Slug, and Tag are required' });
    }
    
    if (!req.files || !req.files.video) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    const videoUrl = `/uploads/${req.files.video[0].filename}`;
    let posterUrl = '';
    
    if (req.files.poster) {
      posterUrl = `/uploads/${req.files.poster[0].filename}`;
    }

    const video = new InfluencerVideo({
      videoUrl,
      posterUrl,
      productName,
      productSlug,
      tag
    });
    await video.save();

    res.status(201).json({ success: true, video });
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all videos
router.get('/', async (req, res) => {
  try {
    const videos = await InfluencerVideo.find().sort({ createdAt: -1 });
    res.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update video
router.put('/:id', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'poster', maxCount: 1 }]), async (req, res) => {
  try {
    const videoId = req.params.id;
    const { productName, productSlug, tag } = req.body;

    const video = await InfluencerVideo.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Influencer video not found' });
    }

    if (productName) video.productName = productName.trim();
    if (productSlug) video.productSlug = productSlug.trim();
    if (tag) video.tag = tag.trim();

    if (req.files && req.files.video && req.files.video[0]) {
      video.videoUrl = `/uploads/${req.files.video[0].filename}`;
    }

    if (req.files && req.files.poster && req.files.poster[0]) {
      video.posterUrl = `/uploads/${req.files.poster[0].filename}`;
    }

    await video.save();
    res.json({ success: true, video });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ success: false, message: 'Server error updating video' });
  }
});

// DELETE video
router.delete('/:id', async (req, res) => {
  try {
    const videoId = req.params.id;
    await InfluencerVideo.findByIdAndDelete(videoId);
    
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
