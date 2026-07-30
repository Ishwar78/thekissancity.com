const mongoose = require('mongoose');

const solarInquirySchema = new mongoose.Schema({
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
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  agricultureType: {
    type: String,
    default: ''
  },
  companyName: {
    type: String,
    default: ''
  },
  dryerSize: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true
  },
  remarks: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'In Progress', 'Completed'],
    default: 'New'
  }
}, { timestamps: true });

module.exports = mongoose.model('SolarInquiry', solarInquirySchema);
