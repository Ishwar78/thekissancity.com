const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Blog = require('../models/Blog');

// Ensure uploads/blogs directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'blogs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for blog images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `blog-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Helper to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// @route   GET /api/blogs
// @desc    Get all active blogs (Public) or all blogs (Admin)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const blogs = await Blog.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isActive: true });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/blogs
// @desc    Create a blog
// @access  Private/Admin
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, category, author, metaDescription, content, readTime } = req.body;
    
    if (!title || !category || !metaDescription || !content) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    let slug = generateSlug(title);
    
    // Check if slug exists
    let existing = await Blog.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const blog = new Blog({
      title,
      slug,
      category,
      author: author || 'The Kissan City',
      image: `/uploads/blogs/${req.file.filename}`,
      metaDescription,
      content,
      readTime: readTime || '5 min read'
    });

    await blog.save();
    res.status(201).json({ success: true, blog, message: 'Blog created successfully' });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private/Admin
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const { title, category, author, metaDescription, content, readTime, isActive } = req.body;

    if (title && title !== blog.title) {
      blog.title = title;
      let newSlug = generateSlug(title);
      let existing = await Blog.findOne({ slug: newSlug, _id: { $ne: blog._id } });
      if (existing) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      blog.slug = newSlug;
    }

    blog.category = category || blog.category;
    blog.author = author || blog.author;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.content = content || blog.content;
    blog.readTime = readTime || blog.readTime;
    
    if (isActive !== undefined) {
      blog.isActive = isActive === 'true' || isActive === true;
    }

    if (req.file) {
      blog.image = `/uploads/blogs/${req.file.filename}`;
    }

    await blog.save();
    res.json({ success: true, blog, message: 'Blog updated successfully' });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    await blog.deleteOne();
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
