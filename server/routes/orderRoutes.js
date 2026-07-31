const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const BulkCoupon = require('../models/BulkCoupon');
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const { pushOrderToShiprocket } = require('../utils/shiprocket');

// Middleware to authenticate user if token is present
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // invalid token, treat as guest
    }
  }
  next();
};

// Create new order & auto-sync to Shiprocket
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      orderId,
      shippingAddress,
      items,
      paymentMethod,
      totalAmount,
      deliveryCharge,
      discountAmount,
      couponCode,
    } = req.body;

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    const userId = req.user ? (req.user.userId || req.user.id || req.user._id) : undefined;
    const userIdent = shippingAddress?.email || shippingAddress?.phone || (req.user ? req.user.email || req.user.phone : 'guest');

    const newOrder = new Order({
      orderId: orderId || `KC${String(Date.now()).slice(-8)}`,
      user: userId,
      shippingAddress,
      items,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Completed',
      totalAmount,
      deliveryCharge,
      discountAmount,
      expectedDelivery,
      shiprocketStatus: 'Pending'
    });

    await newOrder.save();

    // Record coupon usage if couponCode was provided
    if (couponCode && typeof couponCode === 'string') {
      try {
        const cleanCode = couponCode.trim().toUpperCase();
        let foundCoupon = await Coupon.findOne({ code: cleanCode });
        if (!foundCoupon) {
          foundCoupon = await BulkCoupon.findOne({ code: cleanCode });
        }
        if (foundCoupon) {
          foundCoupon.usedByUsers.push({
            userId: userId || undefined,
            userIdentifier: userIdent,
            usedAt: new Date()
          });
          await foundCoupon.save();
        }
      } catch (cpErr) {
        console.error('Error recording coupon usage:', cpErr);
      }
    }

    // Auto-sync order to Shiprocket
    try {
      const shiprocketResult = await pushOrderToShiprocket(newOrder);
      if (shiprocketResult.success) {
        newOrder.shiprocketStatus = 'Synced';
        newOrder.shiprocketOrderId = shiprocketResult.shiprocketOrderId;
        newOrder.shiprocketShipmentId = shiprocketResult.shipmentId;
        newOrder.shiprocketSyncError = null;
      } else {
        newOrder.shiprocketStatus = 'Failed';
        newOrder.shiprocketSyncError = shiprocketResult.error || 'Failed to sync with Shiprocket';
      }
      await newOrder.save();
    } catch (srErr) {
      console.error('[SHIPROCKET SYNC CATCH ERROR]', srErr.message);
      newOrder.shiprocketStatus = 'Failed';
      newOrder.shiprocketSyncError = srErr.message;
      await newOrder.save();
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Admin Manual Sync to Shiprocket
router.post('/:id/sync-shiprocket', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const result = await pushOrderToShiprocket(order);

    if (result.success) {
      order.shiprocketStatus = 'Synced';
      order.shiprocketOrderId = result.shiprocketOrderId;
      order.shiprocketShipmentId = result.shipmentId;
      order.shiprocketSyncError = null;
      await order.save();

      return res.json({
        success: true,
        message: 'Order synced to Shiprocket successfully!',
        shiprocketOrderId: result.shiprocketOrderId,
        shipmentId: result.shipmentId,
        order
      });
    } else {
      order.shiprocketStatus = 'Failed';
      order.shiprocketSyncError = result.error || 'Sync failed';
      await order.save();

      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to sync with Shiprocket',
        order
      });
    }
  } catch (error) {
    console.error('Error syncing order to Shiprocket:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error syncing to Shiprocket' });
  }
});

// Get logged-in user's orders
router.get('/myorders', authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const orders = await Order.find({ user: (req.user.userId || req.user.id || req.user._id) }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all orders (Admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email mobile');
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Update order status (Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, statusText } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, statusText },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get order by Order ID (Tracking / Invoice)
router.get('/track/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
