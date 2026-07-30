const mongoose = require('mongoose');

const tickerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Ticker', tickerSchema);
