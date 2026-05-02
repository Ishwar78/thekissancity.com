const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  address: { type: String },
  loadCapacity: { type: String },
  commodity: { type: String },
  dryerType: { type: String },
  contact_method: { type: String },
  source: { type: String, default: 'website-contact' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
