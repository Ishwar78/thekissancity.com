const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Review = require('../models/Review');
const Order = require('../models/Order');

// Multer setup for review images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'review-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Admin: Get all reviews
router.get('/all', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
});

// Admin: Create a review manually
router.post('/admin', upload.single('image'), async (req, res) => {
  try {
    const { productId, rating, title, comment, reviewerName, reviewerLocation } = req.body;

    if (!productId || !rating || !comment || !reviewerName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const review = new Review({
      product: productId,
      rating,
      title,
      comment,
      image: imageUrl,
      reviewerName,
      reviewerLocation,
      isVerifiedPurchase: true, // admin created usually means verified
      status: 'approved'
    });

    await review.save();
    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error admin creating review:', error);
    res.status(500).json({ success: false, message: 'Server error creating review' });
  }
});

// Admin: Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Server error deleting review' });
  }
});

// Create a review (User)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { productId, userId, rating, title, comment } = req.body;

    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verify if user purchased the product
    const userOrders = await Order.find({ 
      user: userId,
      status: { $in: ['shipped', 'delivered', 'pending', 'processing'] } 
    });

    const hasPurchased = userOrders.some(order => 
      order.items && order.items.some(item => 
        String(item.product || item.productId || item._id) === String(productId) ||
        String(item.name || '').toLowerCase() === String(productId).toLowerCase()
      )
    );

    if (!hasPurchased && userOrders.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only review products you have purchased.' 
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const review = new Review({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      image: imageUrl,
      isVerifiedPurchase: true
    });

    await review.save();

    // Populate user info for immediate display
    await review.populate('user', 'name');

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Server error creating review' });
  }
});

// Get recent reviews for homepage (combines both admin and user reviews)
router.get('/home', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .populate('user', 'name')
      .populate('product', 'name image slug')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching home reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
});

// Get reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    // Exclude /all and /home and /admin from being treated as productId
    if (['all', 'home', 'admin'].includes(req.params.productId)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }
    const reviews = await Review.find({ product: req.params.productId, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Server error fetching reviews' });
  }
});

module.exports = router;
