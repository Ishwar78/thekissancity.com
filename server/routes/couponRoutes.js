const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET all coupons (Admin)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create coupon (Admin)
router.post('/', async (req, res) => {
  try {
    const { code, discountType, discountValue, isActive } = req.body;
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      isActive: isActive !== undefined ? isActive : true
    });

    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT update coupon status (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { isActive } = req.body;
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE coupon (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST validate coupon (Public - Checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
    }

    let discountAmt = 0;
    if (coupon.discountType === 'percentage') {
      discountAmt = Math.round((orderTotal * coupon.discountValue) / 100);
    } else {
      discountAmt = coupon.discountValue;
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount: discountAmt,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
});

module.exports = router;
