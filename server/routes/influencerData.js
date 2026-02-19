const express = require('express');
const InfluencerData = require('../models/InfluencerData');
const Product = require('../models/Product'); // Assuming Product model is available
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Public route to get all influencer data (no auth required)
router.get('/influencer-data/public', async (req, res) => {
  try {
    const influencerData = await InfluencerData.find().populate('productId', 'title images');
    res.status(200).json({ ok: true, data: influencerData });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// GET all influencer data
router.get('/admin/influencer-data', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('Attempting to fetch influencer data...');
    const influencerData = await InfluencerData.find().populate('productId', 'title images');
    console.log('Fetched Influencer Data:', influencerData.map(item => ({ videoUrl: item.videoUrl, productName: item.productId?.title, productId: item.productId?._id })));
    res.status(200).json({ ok: true, data: influencerData });
  } catch (error) {
    console.error('Error fetching influencer data:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// GET a single influencer data entry by ID
router.get('/admin/influencer-data/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const influencerDataItem = await InfluencerData.findById(req.params.id).populate('productId', 'name images');
    if (!influencerDataItem) {
      return res.status(404).json({ ok: false, message: 'Influencer data not found' });
    }
    res.status(200).json({ ok: true, data: influencerDataItem });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// POST create new influencer data
router.post('/admin/influencer-data', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { videoUrl, productId } = req.body;

    // Validate productId
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(400).json({ ok: false, message: 'Invalid productId' });
    }

    const newInfluencerData = new InfluencerData({ videoUrl, productId });
    await newInfluencerData.save();
    res.status(201).json({ ok: true, data: newInfluencerData });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// PUT update influencer data
router.put('/admin/influencer-data/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { videoUrl, productId } = req.body;

    // Validate productId if provided
    if (productId) {
      const productExists = await Product.findById(productId);
      if (!productExists) {
        return res.status(400).json({ ok: false, message: 'Invalid productId' });
      }
    }

    const updatedInfluencerData = await InfluencerData.findByIdAndUpdate(
      req.params.id,
      { videoUrl, productId },
      { new: true, runValidators: true }
    ).populate('productId', 'name images');
    
    if (!updatedInfluencerData) {
      return res.status(404).json({ ok: false, message: 'Influencer data not found' });
    }
    res.status(200).json({ ok: true, data: updatedInfluencerData });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// DELETE influencer data
router.delete('/admin/influencer-data/:id', [requireAuth, requireAdmin], async (req, res) => {
  try {
    const deletedInfluencerData = await InfluencerData.findByIdAndDelete(req.params.id);
    if (!deletedInfluencerData) {
      return res.status(404).json({ ok: false, message: 'Influencer data not found' });
    }
    res.status(200).json({ ok: true, message: 'Influencer data deleted successfully' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;

