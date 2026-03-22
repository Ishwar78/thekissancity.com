const express = require('express');
const router = express.Router();
const AboutUs = require('../models/AboutUs');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get active About Us content
router.get('/', async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({ isActive: true });
    if (!aboutUs) {
      // Return default content if no data exists
      return res.json({
        eyebrow: { text: 'Kissan City', icon: 'Mountain' },
        title: { main: 'Our Story', highlighted: 'Story' },
        content: {
          main: [
            { text: 'Every jar, every packet tells a story. A story of farmers in the misty valleys of Himachal Pradesh, tending to their organic farms with the same care their ancestors showed to the land.' },
            { text: 'A story of women in Haryana villages, preparing pure desi ghee using the ancient bilona method, handed down through generations.' }
          ],
          expanded: [
            { text: 'From rich, aromatic ghee to unprocessed honey and handpicked dry fruits, every item reflects quality, freshness, and the true taste of the mountains.' },
            { text: 'Our mission is to deliver health, purity, and tradition straight from the hills to your home — food that is wholesome, natural, and crafted with care, just the way nature intended.' }
          ]
        },
        image: {
          src: '/Capture.PNG',
          alt: 'Direct from source',
          badge: { text: '100% Organic', icon: 'Leaf' },
          banner: { text: 'Perfect for all occasions' }
        },
        icons: [
          { text: 'Organic', icon: 'Leaf' },
          { text: 'Hill Fresh', icon: 'Mountain' },
          { text: 'Farmer-first', icon: 'Heart' }
        ],
        stats: [
          { value: '500+', label: 'Partner Farmers' },
          { value: '100%', label: 'Organic Certified' },
          { value: '50+', label: 'Hill Products' },
          { value: '10K+', label: 'Happy Homes' }
        ]
      });
    }
    res.json(aboutUs);
  } catch (error) {
    console.error('Error fetching About Us data:', error);
    res.status(500).json({ error: 'Failed to fetch About Us data' });
  }
});

// Get all About Us entries (admin)
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const aboutUsEntries = await AboutUs.find().sort({ createdAt: -1 });
    res.json(aboutUsEntries);
  } catch (error) {
    console.error('Error fetching all About Us entries:', error);
    res.status(500).json({ error: 'Failed to fetch About Us entries' });
  }
});

// Create or update About Us content (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      eyebrow,
      title,
      content,
      image,
      icons,
      stats,
      isActive
    } = req.body;

    // Deactivate all existing entries if this is set as active
    if (isActive) {
      await AboutUs.updateMany({}, { isActive: false });
    }

    const aboutUs = new AboutUs({
      eyebrow,
      title,
      content,
      image,
      icons,
      stats,
      isActive: isActive !== undefined ? isActive : true
    });

    const savedAboutUs = await aboutUs.save();
    res.status(201).json(savedAboutUs);
  } catch (error) {
    console.error('Error creating About Us content:', error);
    res.status(500).json({ error: 'Failed to create About Us content' });
  }
});

// Update About Us content (admin)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      eyebrow,
      title,
      content,
      image,
      icons,
      stats,
      isActive
    } = req.body;

    // Deactivate all other entries if this is set as active
    if (isActive) {
      await AboutUs.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    const updatedAboutUs = await AboutUs.findByIdAndUpdate(
      req.params.id,
      {
        eyebrow,
        title,
        content,
        image,
        icons,
        stats,
        isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedAboutUs) {
      return res.status(404).json({ error: 'About Us content not found' });
    }

    res.json(updatedAboutUs);
  } catch (error) {
    console.error('Error updating About Us content:', error);
    
    // Handle validation errors gracefully
    if (error.name === 'ValidationError') {
      const missingFields = [];
      Object.keys(error.errors).forEach(field => {
        if (error.errors[field].kind === 'required') {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          missingFields,
          message: `Please fill in the following required fields: ${missingFields.join(', ')}`
        });
      }
    }
    
    res.status(500).json({ error: 'Failed to update About Us content' });
  }
});

// Delete About Us content (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const deletedAboutUs = await AboutUs.findByIdAndDelete(req.params.id);
    
    if (!deletedAboutUs) {
      return res.status(404).json({ error: 'About Us content not found' });
    }

    res.json({ message: 'About Us content deleted successfully' });
  } catch (error) {
    console.error('Error deleting About Us content:', error);
    res.status(500).json({ error: 'Failed to delete About Us content' });
  }
});

module.exports = router;
