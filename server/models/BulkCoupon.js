const mongoose = require('mongoose');

const usedByUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userIdentifier: {
    type: String,
    trim: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
});

const bulkCouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  prefix: {
    type: String,
    default: 'INFLUENCER',
    uppercase: true,
    trim: true
  },
  batchId: {
    type: String,
    required: true,
    index: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  expiryDate: {
    type: Date,
    default: null
  },
  perUserLimit: {
    type: Number,
    default: 1
  },
  usedByUsers: [usedByUserSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isInfluencerCoupon: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('BulkCoupon', bulkCouponSchema);
