const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get all blogs (public)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const filter = {};
    
    if (all !== 'true') {
      filter.isActive = true;
    }

    const blogs = await Blog.find(filter).sort({ date: -1, createdAt: -1 });
    res.json({ ok: true, data: blogs });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Get single blog by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isActive: true });
    if (!blog) {
      return res.status(404).json({ ok: false, message: 'Blog post not found' });
    }
    res.json({ ok: true, data: blog });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Admin: Create new blog
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('[BLOG CREATE] Payload received:', req.body);
    const blog = new Blog(req.body);
    const savedBlog = await blog.save();
    console.log('[BLOG CREATE] Saved successfully:', savedBlog._id);
    res.status(201).json({ ok: true, data: savedBlog });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ ok: false, message: 'A blog post with this slug already exists.' });
    }
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Admin: Update blog
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('[BLOG UPDATE] ID:', req.params.id, 'Payload:', req.body);
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) {
      console.log('[BLOG UPDATE] Not found:', req.params.id);
      return res.status(404).json({ ok: false, message: 'Blog post not found' });
    }
    console.log('[BLOG UPDATE] Success:', blog._id);
    res.json({ ok: true, data: blog });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ ok: false, message: 'A blog post with this slug already exists.' });
    }
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Admin: Delete blog
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ ok: false, message: 'Blog post not found' });
    }
    res.json({ ok: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;
