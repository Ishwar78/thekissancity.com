const mongoose = require('mongoose');

const ProductSliderSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 500
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    buttonText: {
      type: String,
      trim: true,
      maxlength: 50
    },
    buttonLink: {
      type: String,
      trim: true,
      maxlength: 500
    },
    order: {
      type: Number,
      default: 0,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    stats: {
      products: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "200+"
      },
      customers: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "50K+"
      },
      quality: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "100%"
      },
      rating: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "4.8★"
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
ProductSliderSchema.index({ order: 1, isActive: 1 });
ProductSliderSchema.index({ isActive: 1 });

// Virtual for formatted stats
ProductSliderSchema.virtual('formattedStats').get(function() {
  return {
    products: this.stats?.products || "200+",
    customers: this.stats?.customers || "50K+",
    quality: this.stats?.quality || "100%",
    rating: this.stats?.rating || "4.8★"
  };
});

// Pre-save middleware to ensure unique order within active items
ProductSliderSchema.pre('save', async function(next) {
  if (this.isModified('order') || this.isModified('isActive')) {
    if (this.isActive) {
      // Find any existing slider with the same order
      const existing = await this.constructor.findOne({
        _id: { $ne: this._id },
        order: this.order,
        isActive: true
      });
      
      if (existing) {
        // Increment order of existing items
        await this.constructor.updateMany(
          { 
            _id: { $ne: this._id },
            order: { $gte: this.order },
            isActive: true
          },
          { $inc: { order: 1 } }
        );
      }
    }
  }
  next();
});

// Static method to get active sliders
ProductSliderSchema.statics.getActiveSliders = function() {
  return this.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .lean();
};

// Static method to reorder sliders
ProductSliderSchema.statics.reorderSliders = function(sliders) {
  const bulkOps = sliders.map(({ id, order }) => ({
    updateOne: {
      filter: { _id: id },
      update: { order }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

module.exports = mongoose.model('ProductSlider', ProductSliderSchema);
