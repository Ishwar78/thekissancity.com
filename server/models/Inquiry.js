const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    default: 'General Enquiry'
  },
  message: {
    type: String,
    required: true
  },
  source: {
    type: String,
    default: 'contact-page'
  },
  status: {
    type: String,
    enum: ['Pending', 'Replied', 'Closed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
