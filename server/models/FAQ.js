const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema(
  {
    question: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 500
    },
    answer: { 
      type: String, 
      required: true,
      trim: true,
      maxlength: 2000
    },
    category: {
      type: String,
      enum: ['general', 'shipping', 'returns', 'products', 'orders', 'payment', 'other'],
      default: 'general'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
  },
  { timestamps: true }
);

FAQSchema.index({ category: 1, isActive: 1, order: 1 });
FAQSchema.index({ isActive: 1, order: 1 });

module.exports = mongoose.model('FAQ', FAQSchema);
