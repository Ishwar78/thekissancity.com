const express = require('express');
const multer = require('multer');
const path = require('path');
const Health = require('../models/Health');
const router = express.Router();

// Multer Config for Health Images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'health-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST create health category
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ success: false, message: 'Name and image are required' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    const health = new Health({ name, imageUrl });
    await health.save();

    res.status(201).json({ success: true, health });
  } catch (error) {
    console.error('Error creating health category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all health categories
router.get('/', async (req, res) => {
  try {
    const healthCategories = await Health.find().sort({ createdAt: -1 });
    res.json({ success: true, healthCategories });
  } catch (error) {
    console.error('Error fetching health categories:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update health category
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const updateData = { name };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const health = await Health.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!health) {
      return res.status(404).json({ success: false, message: 'Health category not found' });
    }

    res.json({ success: true, health });
  } catch (error) {
    console.error('Error updating health category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE health category
router.delete('/:id', async (req, res) => {
  try {
    const healthId = req.params.id;
    await Health.findByIdAndDelete(healthId);
    
    res.json({ success: true, message: 'Health category deleted' });
  } catch (error) {
    console.error('Error deleting health category:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
