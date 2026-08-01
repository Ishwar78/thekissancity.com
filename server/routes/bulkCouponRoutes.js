const express = require('express');
const router = express.Router();
const BulkCoupon = require('../models/BulkCoupon');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

// Helper to generate random coupon code suffix
const generateRandomSuffix = (length = 5) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// GET all bulk coupons (Admin)
router.get('/', async (req, res) => {
  try {
    const coupons = await BulkCoupon.find().sort({ createdAt: -1 });
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    console.error('Error fetching bulk coupons:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET orders for a specific bulk coupon (Admin)
router.get('/:id/orders', async (req, res) => {
  try {
    const coupon = await BulkCoupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Bulk coupon not found' });
    }

    const couponCode = coupon.code.trim().toUpperCase();

    // 1. Direct match by couponCode stored in Order schema
    const directCodeOrders = await Order.find({
      couponCode: { $regex: new RegExp(`^${couponCode}$`, 'i') }
    })
      .populate('user', 'name email mobile phone')
      .sort({ createdAt: -1 });

    const matchedOrderIds = new Set(directCodeOrders.map(o => o._id.toString()));
    const finalOrders = [...directCodeOrders];

    // 2. Legacy fallback for orders placed before couponCode was added to Order schema
    if (coupon.usedByUsers && coupon.usedByUsers.length > 0) {
      for (const usage of coupon.usedByUsers) {
        const uId = usage.userId;
        const uIdent = usage.userIdentifier;
        const usedAt = usage.usedAt ? new Date(usage.usedAt) : null;

        let legacyQuery = {
          discountAmount: { $gt: 0 },
          $or: [
            { couponCode: null },
            { couponCode: "" },
            { couponCode: { $exists: false } }
          ]
        };

        const userOrConditions = [];
        if (uId) userOrConditions.push({ user: uId });
        if (uIdent) {
          userOrConditions.push({ 'shippingAddress.email': uIdent });
          userOrConditions.push({ 'shippingAddress.phone': uIdent });
        }

        if (userOrConditions.length > 0) {
          legacyQuery.$and = [{ $or: userOrConditions }];
          if (usedAt) {
            const windowStart = new Date(usedAt.getTime() - 10 * 60 * 1000);
            const windowEnd = new Date(usedAt.getTime() + 10 * 60 * 1000);
            legacyQuery.createdAt = { $gte: windowStart, $lte: windowEnd };
          }

          const legacyOrders = await Order.find(legacyQuery).populate('user', 'name email mobile phone');
          for (const legOrd of legacyOrders) {
            if (!matchedOrderIds.has(legOrd._id.toString())) {
              matchedOrderIds.add(legOrd._id.toString());
              finalOrders.push(legOrd);
            }
          }
        }
      }
    }

    finalOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const totalOrders = finalOrders.length;
    const totalDiscountGiven = finalOrders.reduce((sum, ord) => sum + (Number(ord.discountAmount) || 0), 0);
    const totalRevenueGenerated = finalOrders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);

    res.json({
      success: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        expiryDate: coupon.expiryDate,
        perUserLimit: coupon.perUserLimit,
        usedCount: coupon.usedByUsers ? coupon.usedByUsers.length : 0,
        createdAt: coupon.createdAt
      },
      summary: {
        totalOrders,
        totalDiscountGiven,
        totalRevenueGenerated
      },
      orders: finalOrders
    });
  } catch (error) {
    console.error('Error fetching coupon orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching coupon orders' });
  }
});

// POST generate bulk influencer coupons (Admin)
router.post('/generate', async (req, res) => {
  try {
    const {
      prefix = 'INFLUENCER',
      quantity = 10,
      discountType = 'percentage',
      discountValue,
      minOrderAmount = 0,
      expiryDate = null,
      perUserLimit = 1
    } = req.body;

    if (!discountType || discountValue === undefined) {
      return res.status(400).json({ success: false, message: 'Discount type and discount value are required' });
    }

    const countToGenerate = Math.min(Math.max(parseInt(quantity, 10) || 1, 1), 500);
    const cleanPrefix = (prefix || 'INFLUENCER').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const batchId = `INF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newCoupons = [];
    const generatedCodes = new Set();

    for (let i = 0; i < countToGenerate; i++) {
      let uniqueCode = '';
      let attempts = 0;

      while (attempts < 50) {
        attempts++;
        const rand = generateRandomSuffix(5);
        const candidate = `${cleanPrefix}-${rand}`;
        if (!generatedCodes.has(candidate)) {
          const existingBulk = await BulkCoupon.findOne({ code: candidate });
          const existingRegular = await Coupon.findOne({ code: candidate });
          if (!existingBulk && !existingRegular) {
            uniqueCode = candidate;
            generatedCodes.add(candidate);
            break;
          }
        }
      }

      if (!uniqueCode) {
        uniqueCode = `${cleanPrefix}-${Date.now()}-${i}`;
      }

      newCoupons.push({
        code: uniqueCode,
        prefix: cleanPrefix,
        batchId,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        perUserLimit: Number(perUserLimit) || 1,
        isActive: true,
        isInfluencerCoupon: true
      });
    }

    const createdCoupons = await BulkCoupon.insertMany(newCoupons);
    res.status(201).json({
      success: true,
      message: `Successfully generated ${createdCoupons.length} bulk influencer coupons!`,
      batchId,
      coupons: createdCoupons
    });
  } catch (error) {
    console.error('Error generating bulk coupons:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error generating bulk coupons' });
  }
});

// DELETE single bulk coupon (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await BulkCoupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Bulk coupon not found' });
    }
    res.json({ success: true, message: 'Bulk coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting bulk coupon:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE batch of bulk coupons (Admin)
router.delete('/batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;
    const result = await BulkCoupon.deleteMany({ batchId });
    res.json({ success: true, message: `Deleted ${result.deletedCount} coupons from batch ${batchId}` });
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
