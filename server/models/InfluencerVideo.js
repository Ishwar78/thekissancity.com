const mongoose = require('mongoose');

const influencerVideoSchema = new mongoose.Schema({
  videoUrl: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String,
    default: ''
  },
  productName: {
    type: String,
    required: true
  },
  productSlug: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InfluencerVideo', influencerVideoSchema);
