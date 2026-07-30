const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['main', 'side'],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  link: {
    type: String,
    default: '#products'
  }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
