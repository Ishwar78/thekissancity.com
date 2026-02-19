const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/reviews/admin/reviews - Admin endpoint to get all reviews
router.get('/admin/reviews', async (req, res) => {
  try {
    const { limit = 200 } = req.query;
    
    const reviews = await Review.find({})
    .populate('userId', 'name email profileImage')
    .populate('productId', 'title slug images')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// GET /api/reviews/recent - Get recent reviews across all products
router.get('/recent', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const reviews = await Review.find({ 
      status: 'published',
      approved: true 
    })
    .populate('userId', 'name email profileImage')
    .populate('productId', 'title slug images')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    return res.json({ ok: true, data: reviews });
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ ok: false, message: 'Invalid product ID' });
    }

    const reviews = await Review.find({ 
      productId, 
      status: 'published' 
    })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 });

    return res.json({ ok: true, data: reviews });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// POST /api/reviews - Create a new review
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId, rating, text, images } = req.body;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ ok: false, message: 'Valid product ID is required' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ ok: false, message: 'Rating must be between 1 and 5' });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ ok: false, message: 'Review text must be at least 20 characters' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ ok: false, message: 'You have already reviewed this product' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ ok: false, message: 'Product not found' });
    }

    const review = new Review({
      productId,
      userId,
      username: req.user.name || 'Anonymous',
      email: req.user.email,
      rating,
      text: text.trim(),
      images: images || [],
      status: 'published',
      approved: true
    });

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate('userId', 'name email')
      .lean();

    return res.json({ ok: true, data: populatedReview });
  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// PUT /api/reviews/:id - Update a review
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, text, images } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ ok: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ ok: false, message: 'Not authorized to update this review' });
    }

    const updates = {};
    if (rating && rating >= 1 && rating <= 5) {
      updates.rating = rating;
    }
    if (text && text.trim().length >= 20) {
      updates.text = text.trim();
    }
    if (images) {
      updates.images = images;
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id, 
      updates, 
      { new: true }
    ).populate('userId', 'name email');

    return res.json({ ok: true, data: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// DELETE /api/reviews/:id - Delete a review (user can only delete their own)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid review ID' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ ok: false, message: 'Review not found' });
    }

    // Check if user owns this review
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ ok: false, message: 'Not authorized to delete this review' });
    }

    await Review.findByIdAndDelete(id);

    return res.json({ ok: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// GET /api/reviews/user/my-reviews - Get current user's reviews
router.get('/user/my-reviews', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    const reviews = await Review.find({ userId })
      .populate('productId', 'title slug images')
      .sort({ createdAt: -1 });

    return res.json({ ok: true, data: reviews });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
