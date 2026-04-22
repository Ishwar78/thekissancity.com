const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public route: Get active videos for frontend
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const items = await Video.find({ active: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit);
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Admin route: Get all videos
router.get('/admin/list', requireAuth, requireAdmin, async (req, res) => {
  try {
    const items = await Video.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: items });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Admin route: Create a new video entry
router.post('/admin/create', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, videoUrl, thumbnailUrl, active, sortOrder } = req.body;
    if (!videoUrl) {
      return res.status(400).json({ ok: false, message: 'Video URL is required' });
    }
    const newVideo = new Video({
      title,
      videoUrl,
      thumbnailUrl,
      active: active !== undefined ? active : true,
      sortOrder: sortOrder || 0,
    });
    await newVideo.save();
    res.json({ ok: true, data: newVideo });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Admin route: Update video
router.put('/admin/update/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, videoUrl, thumbnailUrl, active, sortOrder } = req.body;
    const updated = await Video.findByIdAndUpdate(
      req.params.id,
      { title, videoUrl, thumbnailUrl, active, sortOrder },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ ok: false, message: 'Video not found' });
    }
    res.json({ ok: true, data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Admin route: Delete video
router.delete('/admin/delete/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Video.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ ok: false, message: 'Video not found' });
    }
    res.json({ ok: true, message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
