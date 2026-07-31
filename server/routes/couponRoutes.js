const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const BulkCoupon = require('../models/BulkCoupon');

// GET all regular public coupons (Admin & Frontend display - excludes bulk private coupons)
router.get('/', async (req, res) => {
  try {
    const coupons = await Coupon.find({ isBulk: { $ne: true } }).sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST create single coupon (Admin)
router.post('/', async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, perUserLimit, isActive } = req.body;
    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Code, discount type, and value are required' });
    }

    const existingReg = await Coupon.findOne({ code: code.toUpperCase() });
    const existingBulk = await BulkCoupon.findOne({ code: code.toUpperCase() });
    if (existingReg || existingBulk) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      isBulk: false,
      isPrivate: false,
      isActive: isActive !== undefined ? isActive : true
    });

    await coupon.save();
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

// PUT update coupon (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, expiryDate, perUserLimit, isActive } = req.body;
    
    let updateFields = {};
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (code) updateFields.code = code.toUpperCase();
    if (discountType) updateFields.discountType = discountType;
    if (discountValue !== undefined) updateFields.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) updateFields.minOrderAmount = Number(minOrderAmount);
    if (expiryDate !== undefined) updateFields.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (perUserLimit !== undefined) updateFields.perUserLimit = Number(perUserLimit);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, coupon });
  } catch (error) {
    console.error('Error updating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE single coupon (Admin)
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

// POST validate coupon (Public - Checkout / Cart)
// Validates both regular Coupons AND Bulk/Influencer Coupons!
router.post('/validate', async (req, res) => {
  try {
    const { code, orderTotal, userId, userIdentifier } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const uppercaseCode = code.trim().toUpperCase();

    // Check in Regular Coupons first, then in Bulk/Influencer Coupons collection
    let coupon = await Coupon.findOne({ code: uppercaseCode });
    let isBulkModel = false;

    if (!coupon) {
      coupon = await BulkCoupon.findOne({ code: uppercaseCode });
      if (coupon) isBulkModel = true;
    }

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon code is currently inactive' });
    }

    // 1. Expiry Date Check
    if (coupon.expiryDate) {
      const expDate = new Date(coupon.expiryDate);
      expDate.setHours(23, 59, 59, 999);
      if (new Date() > expDate) {
        const formattedExp = expDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
        return res.status(400).json({
          success: false,
          message: `This coupon code expired on ${formattedExp}`
        });
      }
    }

    // 2. Minimum Order Amount Check
    const minAmt = Number(coupon.minOrderAmount || 0);
    const cartAmt = Number(orderTotal || 0);
    if (minAmt > 0 && cartAmt < minAmt) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart order amount of ₹${minAmt} required to use coupon "${coupon.code}"`
      });
    }

    // 3. One-Time Usage Per User Check
    const cleanUserIdent = (userIdentifier || userId || '').toString().toLowerCase().trim();
    if (cleanUserIdent && coupon.usedByUsers && coupon.usedByUsers.length > 0) {
      const timesUsed = coupon.usedByUsers.filter(u => {
        const uId = u.userId ? u.userId.toString() : '';
        const uIdent = u.userIdentifier ? u.userIdentifier.toLowerCase().trim() : '';
        return (userId && uId === userId.toString()) || (cleanUserIdent && (uIdent === cleanUserIdent || uId === cleanUserIdent));
      }).length;

      const limit = coupon.perUserLimit || 1;
      if (timesUsed >= limit) {
        return res.status(400).json({
          success: false,
          message: `You have already used coupon code "${coupon.code}". This coupon is limited to 1 use per user.`
        });
      }
    }

    // Calculate discount
    let discountAmt = 0;
    if (coupon.discountType === 'percentage') {
      discountAmt = Math.round((cartAmt * coupon.discountValue) / 100);
    } else {
      discountAmt = coupon.discountValue;
    }

    // Discount cannot exceed order total
    discountAmt = Math.min(discountAmt, cartAmt);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount: discountAmt,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        expiryDate: coupon.expiryDate,
        isBulk: isBulkModel
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
});

module.exports = router;
