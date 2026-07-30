const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ReturnRequest = require('../models/ReturnRequest');
const Order = require('../models/Order');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'return-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// POST user return request
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { orderId, userId, reason, refundMethod, accountName, accountNumber, ifscCode, upiId } = req.body;
    
    if (!orderId || !userId || !reason) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    }

    const returnReq = new ReturnRequest({
      order: orderId,
      user: userId,
      reason,
      image: imageUrl,
      refundMethod: refundMethod || 'bank',
      refundDetails: {
        accountName: accountName || '',
        accountNumber: accountNumber || '',
        ifscCode: ifscCode || '',
        upiId: upiId || ''
      }
    });

    await returnReq.save();

    // Optionally update order status
    order.status = 'returned';
    await order.save();

    res.status(201).json({ success: true, returnRequest: returnReq });
  } catch (error) {
    console.error('Error submitting return:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET user's return requests
router.get('/my-returns/:userId', async (req, res) => {
  try {
    const returns = await ReturnRequest.find({ user: req.params.userId })
      .populate('order')
      .sort({ createdAt: -1 });
    res.json({ success: true, returns });
  } catch (error) {
    console.error('Error fetching returns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET all return requests (Admin)
router.get('/', async (req, res) => {
  try {
    const returns = await ReturnRequest.find()
      .populate('order')
      .populate('user', 'name mobile email')
      .sort({ createdAt: -1 });
    res.json({ success: true, returns });
  } catch (error) {
    console.error('Error fetching admin returns:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update return status (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status required' });

    const returnReq = await ReturnRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!returnReq) return res.status(404).json({ success: false, message: 'Return request not found' });

    res.json({ success: true, returnRequest: returnReq });
  } catch (error) {
    console.error('Error updating return status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
