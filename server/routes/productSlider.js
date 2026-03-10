const express = require('express');
const router = express.Router();
const ProductSlider = require('../models/ProductSlider');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authOptional, requireAuth, requireAdmin } = require('../middleware/auth');

// Configure Cloudinary for slider images
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'kissanCity_product_slider',
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'webp', 'jpeg'],
      transformation: [
        { width: 1920, height: 800, crop: 'fill', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp'
    ];
    if (allowedMimes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// Middleware for logging
router.use((req, res, next) => {
  console.log(`[PRODUCT SLIDER API] ${req.method} ${req.path}`, {
    user: req.user?.email || 'anonymous',
    body: req.body,
    query: req.query
  });
  next();
});

// GET /api/product-slider/active - Get all active sliders (public)
router.get('/active', authOptional, async (req, res) => {
  try {
    // Prevent caching
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const sliders = await ProductSlider.getActiveSliders();
    
    res.json({
      ok: true,
      data: sliders,
      message: `Found ${sliders.length} active sliders`
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error fetching active sliders:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch sliders',
      error: error.message
    });
  }
});

// GET /api/product-slider - Get all sliders (admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const sliders = await ProductSlider.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await ProductSlider.countDocuments(filter);

    res.json({
      ok: true,
      data: sliders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error fetching sliders:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch sliders',
      error: error.message
    });
  }
});

// GET /api/product-slider/:id - Get single slider (admin only)
router.get('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const slider = await ProductSlider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found'
      });
    }

    res.json({
      ok: true,
      data: slider
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error fetching slider:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch slider',
      error: error.message
    });
  }
});

// POST /api/product-slider - Create new slider (admin only)
router.post('/', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, subtitle, description, buttonText, buttonLink, order, isActive, stats } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        ok: false,
        message: 'Title is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        ok: false,
        message: 'Image is required'
      });
    }

    // Parse stats if provided as string
    let parsedStats = {};
    if (stats) {
      try {
        parsedStats = typeof stats === 'string' ? JSON.parse(stats) : stats;
      } catch (e) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid stats format'
        });
      }
    }

    const sliderData = {
      title,
      subtitle,
      description,
      image: req.file.path,
      buttonText,
      buttonLink,
      order: order ? Number(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      stats: {
        products: parsedStats.products || "200+",
        customers: parsedStats.customers || "50K+",
        quality: parsedStats.quality || "100%",
        rating: parsedStats.rating || "4.8★"
      }
    };

    const slider = new ProductSlider(sliderData);
    await slider.save();

    console.log('[PRODUCT SLIDER] Created new slider:', slider._id);

    res.status(201).json({
      ok: true,
      data: slider,
      message: 'Slider created successfully'
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error creating slider:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to create slider',
      error: error.message
    });
  }
});

// PUT /api/product-slider/:id - Update slider (admin only)
router.put('/:id', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const slider = await ProductSlider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found'
      });
    }

    const { title, subtitle, description, buttonText, buttonLink, order, isActive, stats } = req.body;

    // Parse stats if provided as string
    let parsedStats = {};
    if (stats) {
      try {
        parsedStats = typeof stats === 'string' ? JSON.parse(stats) : stats;
      } catch (e) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid stats format'
        });
      }
    }

    // Update fields
    if (title) slider.title = title;
    if (subtitle !== undefined) slider.subtitle = subtitle;
    if (description !== undefined) slider.description = description;
    if (buttonText !== undefined) slider.buttonText = buttonText;
    if (buttonLink !== undefined) slider.buttonLink = buttonLink;
    if (order !== undefined) slider.order = Number(order);
    if (isActive !== undefined) slider.isActive = isActive === 'true';
    
    if (Object.keys(parsedStats).length > 0) {
      slider.stats = {
        products: parsedStats.products || slider.stats?.products || "200+",
        customers: parsedStats.customers || slider.stats?.customers || "50K+",
        quality: parsedStats.quality || slider.stats?.quality || "100%",
        rating: parsedStats.rating || slider.stats?.rating || "4.8★"
      };
    }

    // Update image if new one provided
    if (req.file) {
      slider.image = req.file.path;
    }

    await slider.save();

    console.log('[PRODUCT SLIDER] Updated slider:', slider._id);

    res.json({
      ok: true,
      data: slider,
      message: 'Slider updated successfully'
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error updating slider:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to update slider',
      error: error.message
    });
  }
});

// DELETE /api/product-slider/:id - Delete slider (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const slider = await ProductSlider.findById(req.params.id);
    
    if (!slider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found'
      });
    }

    // Optional: Delete image from Cloudinary
    if (slider.image && slider.image.includes('cloudinary')) {
      try {
        const publicId = slider.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`kissanCity_product_slider/${publicId}`);
        console.log('[PRODUCT SLIDER] Deleted image from Cloudinary:', publicId);
      } catch (imageError) {
        console.warn('[PRODUCT SLIDER] Failed to delete image from Cloudinary:', imageError.message);
      }
    }

    await ProductSlider.findByIdAndDelete(req.params.id);

    console.log('[PRODUCT SLIDER] Deleted slider:', req.params.id);

    res.json({
      ok: true,
      message: 'Slider deleted successfully'
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error deleting slider:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to delete slider',
      error: error.message
    });
  }
});

// PATCH /api/product-slider/:id/toggle - Toggle slider active status (admin only)
router.patch('/:id/toggle', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        ok: false,
        message: 'isActive must be a boolean'
      });
    }

    const slider = await ProductSlider.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!slider) {
      return res.status(404).json({
        ok: false,
        message: 'Slider not found'
      });
    }

    console.log('[PRODUCT SLIDER] Toggled slider status:', slider._id, 'to', isActive);

    res.json({
      ok: true,
      data: slider,
      message: `Slider ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error toggling slider:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to toggle slider',
      error: error.message
    });
  }
});

// POST /api/product-slider/reorder - Reorder sliders (admin only)
router.post('/reorder', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sliders } = req.body;

    if (!Array.isArray(sliders) || sliders.length === 0) {
      return res.status(400).json({
        ok: false,
        message: 'sliders must be a non-empty array'
      });
    }

    // Validate slider data
    for (const item of sliders) {
      if (!item.id || typeof item.order !== 'number') {
        return res.status(400).json({
          ok: false,
          message: 'Each slider must have id and order'
        });
      }
    }

    await ProductSlider.reorderSliders(sliders);

    console.log('[PRODUCT SLIDER] Reordered sliders:', sliders.length, 'items');

    res.json({
      ok: true,
      message: 'Sliders reordered successfully'
    });
  } catch (error) {
    console.error('[PRODUCT SLIDER] Error reordering sliders:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to reorder sliders',
      error: error.message
    });
  }
});

module.exports = router;
