const mongoose = require('mongoose');

const policiesSchema = new mongoose.Schema({
  shippingPolicy: {
    type: String,
    default: ''
  },
  returnPolicy: {
    type: String,
    default: ''
  },
  privacyPolicy: {
    type: String,
    default: ''
  },
  termsAndConditions: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Policies', policiesSchema);
