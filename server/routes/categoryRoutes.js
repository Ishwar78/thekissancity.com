const express = require('express');
const multer = require('multer');
const path = require('path');
const Category = require('../models/Category');
const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST create category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, parentCategory } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ success: false, message: 'Name and image are required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const category = new Category({ 
      name, 
      imageUrl,
      parentCategory: parentCategory || null 
    });
    await category.save();

    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory').sort({ createdAt: -1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, parentCategory } = req.body;
    const updateData = { name };
    
    if (parentCategory !== undefined) {
      updateData.parentCategory = parentCategory || null;
    }

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = req.params.id;
    // Also remove subcategories or update them (for now just delete the category itself)
    await Category.updateMany({ parentCategory: categoryId }, { parentCategory: null });
    await Category.findByIdAndDelete(categoryId);
    
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
