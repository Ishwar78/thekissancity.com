const express = require('express');
const multer = require('multer');
const path = require('path');
const FarmerExpert = require('../models/FarmerExpert');
const router = express.Router();

// Multer Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// GET all profiles (or filter by type/visibility)
router.get('/', async (req, res) => {
  try {
    const { type, activeOnly } = req.query;
    let query = {};
    if (type) {
      query.type = type;
    }
    if (activeOnly === 'true') {
      query.isVisible = true;
    }

    const profiles = await FarmerExpert.find(query).sort({ createdAt: -1 });
    res.json({ success: true, profiles });
  } catch (error) {
    console.error('Error fetching farmer/expert profiles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create a new profile
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, type, location, specialty, experience, quote, isVisible } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const profile = new FarmerExpert({
      name,
      type: type || 'Farmer',
      location: location || '',
      specialty: specialty || '',
      experience: experience || '',
      image: imageUrl,
      quote: quote || '',
      isVisible: isVisible === 'false' || isVisible === false ? false : true,
    });

    await profile.save();
    res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update a profile
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, location, specialty, experience, quote, isVisible } = req.body;

    const profile = await FarmerExpert.findById(id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (name) profile.name = name;
    if (type) profile.type = type;
    if (location !== undefined) profile.location = location;
    if (specialty !== undefined) profile.specialty = specialty;
    if (experience !== undefined) profile.experience = experience;
    if (quote !== undefined) profile.quote = quote;
    if (isVisible !== undefined) {
      profile.isVisible = isVisible === 'true' || isVisible === true;
    }

    if (req.file) {
      profile.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      profile.image = req.body.image;
    }

    await profile.save();
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE a profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await FarmerExpert.findByIdAndDelete(id);
    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
