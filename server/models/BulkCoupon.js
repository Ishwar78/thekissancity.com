const mongoose = require('mongoose');

const bulkCouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'flat'],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      min: 0,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usageLimitPerUser: {
      type: Number,
      default: 1,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        email: {
          type: String,
          required: true,
        },
        usedAt: { 
          type: Date, 
          default: Date.now 
        },
        orderAmount: {
          type: Number,
          required: true,
        },
        discountAmount: {
          type: Number,
          required: true,
        },
      },
    ],
    sentTo: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        email: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
        isUsed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    offerText: {
      type: String,
    },
    description: {
      type: String,
    },
    termsAndConditions: {
      type: String,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublic: {
      type: Boolean,
      default: false, // Private by default for bulk coupons
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for better performance
bulkCouponSchema.index({ code: 1, isActive: 1 });
bulkCouponSchema.index({ 'sentTo.email': 1 });
bulkCouponSchema.index({ 'usedBy.userId': 1 });
bulkCouponSchema.index({ expiryDate: 1, isActive: 1 });

// Virtual for remaining usage
bulkCouponSchema.virtual('remainingUsage').get(function() {
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for checking if coupon is expired
bulkCouponSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiryDate;
});

// Virtual for checking if coupon is fully used
bulkCouponSchema.virtual('isFullyUsed').get(function() {
  return this.usedCount >= this.usageLimit;
});

// Method to check if user can use this coupon
bulkCouponSchema.methods.canUserUse = function(userId, email) {
  // Check if coupon is active, not expired, and not fully used
  if (!this.isActive || this.isExpired || this.isFullyUsed) {
    return false;
  }

  // Check usage limit per user
  const userUsageCount = this.usedBy.filter(
    usage => usage.userId.toString() === userId.toString()
  ).length;

  return userUsageCount < this.usageLimitPerUser;
};

// Method to calculate discount
bulkCouponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minOrderAmount) {
    return 0;
  }

  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    discountAmount = (orderAmount * this.discountValue) / 100;
    // Apply max discount limit if set
    if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
      discountAmount = this.maxDiscountAmount;
    }
  } else {
    // Flat discount
    discountAmount = this.discountValue;
  }

  return Math.min(discountAmount, orderAmount);
};

// Method to mark coupon as used by user
bulkCouponSchema.methods.markAsUsed = function(userId, email, orderAmount, discountAmount) {
  this.usedBy.push({
    userId,
    email,
    orderAmount,
    discountAmount,
    usedAt: new Date(),
  });
  
  this.usedCount += 1;
  
  // Mark as used in sentTo array if exists
  const sentEntry = this.sentTo.find(
    sent => sent.userId?.toString() === userId.toString() || sent.email === email
  );
  if (sentEntry) {
    sentEntry.isUsed = true;
  }
  
  return this.save();
};

// Pre-save middleware to update updatedAt
bulkCouponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('BulkCoupon', bulkCouponSchema);
