const express = require('express');
const InfluencerImage = require('../models/InfluencerImage');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../routes/uploads').upload; // Import the upload middleware

const router = express.Router();

// GET all influencer images (public)
router.get('/influencer-images/public', async (req, res) => {
  // Prevent caching of this endpoint
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  try {
    console.log('🔍 BACKEND: Fetching influencer images from database');
    const influencerImages = await InfluencerImage.find().populate('productId', 'title images');
    console.log('📊 BACKEND: Influencer images found:', {
      count: influencerImages.length,
      items: influencerImages.map(item => ({
        id: item._id,
        influencerName: item.influencerName,
        imageUrl: item.imageUrl,
        updatedAt: item.updatedAt
      }))
    });
    res.status(200).json({ ok: true, data: influencerImages });
  } catch (error) {
    console.error('❌ BACKEND: Error fetching influencer images:', error);
    res.status(500).json({ ok: false, message: error.message });
  }
});

// GET all influencer images (admin)
router.get('/admin/influencer-images', requireAuth, requireAdmin, async (req, res) => {
  // Prevent caching of this endpoint
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  
  try {
    const influencerImages = await InfluencerImage.find().populate('productId', 'title images');
    res.status(200).json({ ok: true, data: influencerImages });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// GET a single influencer image by ID (admin)
router.get('/admin/influencer-images/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const influencerImage = await InfluencerImage.findById(req.params.id).populate('productId', 'title images');
    if (!influencerImage) {
      return res.status(404).json({ ok: false, message: 'Influencer image not found' });
    }
    res.status(200).json({ ok: true, data: influencerImage });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// POST create new influencer image
router.post('/admin/influencer-images', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { influencerName, productId } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.path; // Cloudinary URL
    }

    if (!imageUrl) {
      return res.status(400).json({ ok: false, message: 'Image file is required' });
    }

    // Validate productId
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(400).json({ ok: false, message: 'Invalid productId' });
    }

    const newInfluencerImage = new InfluencerImage({ imageUrl, influencerName, productId });
    await newInfluencerImage.save();
    res.status(201).json({ ok: true, data: newInfluencerImage });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// PUT update influencer image
router.put('/admin/influencer-images/:id', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    // For FormData, extract fields from req.body
    const influencerName = req.body.influencerName;
    const productId = req.body.productId;
    
    console.log('🔧 BACKEND: Updating influencer image:', {
      id: req.params.id,
      influencerName,
      productId,
      imageUrl: req.body.imageUrl,
      hasFile: !!req.file
    });

    const updateFields = {};
    if (influencerName) updateFields.influencerName = influencerName;
    if (productId) {
      const productExists = await Product.findById(productId);
      if (!productExists) {
        return res.status(400).json({ ok: false, message: 'Invalid productId' });
      }
      updateFields.productId = productId;
    }
    
    // Handle file upload
    if (req.file) {
      updateFields.imageUrl = req.file.path; // Cloudinary URL
      console.log('📁 BACKEND: New image uploaded:', req.file.path);
    } else if (imageUrl) {
      updateFields.imageUrl = imageUrl;
      console.log('🔗 BACKEND: Using provided imageUrl:', imageUrl);
    }

    console.log('📝 BACKEND: Update fields:', updateFields);

    const updatedInfluencerImage = await InfluencerImage.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('productId', 'title images');

    if (!updatedInfluencerImage) {
      return res.status(404).json({ ok: false, message: 'Influencer image not found' });
    }

    console.log('✅ BACKEND: Influencer image updated successfully:', {
      id: updatedInfluencerImage._id,
      influencerName: updatedInfluencerImage.influencerName,
      imageUrl: updatedInfluencerImage.imageUrl,
      updatedAt: updatedInfluencerImage.updatedAt
    });

    res.status(200).json({ ok: true, data: updatedInfluencerImage });
  } catch (error) {
    console.error('❌ BACKEND: Error updating influencer image:', error);
    res.status(400).json({ ok: false, message: error.message });
  }
});

// DELETE influencer image
router.delete('/admin/influencer-images/:id', [requireAuth, requireAdmin], async (req, res) => {
  try {
    console.log('🗑️ BACKEND: Deleting influencer image:', {
      id: req.params.id,
      idType: typeof req.params.id
    });

    const deletedInfluencerImage = await InfluencerImage.findByIdAndDelete(req.params.id);
    
    if (!deletedInfluencerImage) {
      console.log('❌ BACKEND: Influencer image not found for deletion:', req.params.id);
      return res.status(404).json({ ok: false, message: 'Influencer image not found' });
    }

    console.log('✅ BACKEND: Influencer image deleted successfully:', {
      id: deletedInfluencerImage._id,
      influencerName: deletedInfluencerImage.influencerName,
      imageUrl: deletedInfluencerImage.imageUrl
    });

    res.status(200).json({ ok: true, message: 'Influencer image deleted successfully' });
  } catch (error) {
    console.error('❌ BACKEND: Error deleting influencer image:', error);
    console.error('❌ BACKEND: Error stack:', error.stack);
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;

