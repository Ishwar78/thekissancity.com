
const mongoose = require('mongoose');

const ShippingPolicySectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const ShippingPolicySchema = new mongoose.Schema(
  {
    sections: [ShippingPolicySectionSchema],
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const ShippingPolicy = mongoose.model('ShippingPolicy', ShippingPolicySchema);

module.exports = ShippingPolicy;

