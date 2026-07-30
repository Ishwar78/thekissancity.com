const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  unit: {
    type: String,
    enum: ['gram', 'kg', 'ml', 'litre', 'pcs', 'pack', 'other'],
    default: 'gram'
  },
  quantityValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountType: {
    type: String,
    enum: ['flat', 'percentage'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: 0
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    default: ''
  }
});

const nutritionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  per100g: {
    type: String,
    required: true
  }
});

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  healthRegions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Health'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isNewArrival: {
    type: Boolean,
    default: false
  },
  shortDescription: {
    type: String,
    default: ''
  },
  fullDescription: {
    type: String,
    default: ''
  },
  nutritionFacts: [nutritionSchema],
  images: [{
    type: String
  }],
  hasVariants: {
    type: Boolean,
    default: false
  },
  variants: [variantSchema],
  simplePrice: {
    unit: {
      type: String,
      default: 'pcs'
    },
    quantityValue: {
      type: String,
      default: ''
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    discountType: {
      type: String,
      enum: ['flat', 'percentage'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      default: 0
    },
    salePrice: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    },
    sku: {
      type: String,
      default: ''
    }
  },
  faqs: [faqSchema],
  seo: {
    metaTitle: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    metaDescription: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
