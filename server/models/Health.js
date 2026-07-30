const mongoose = require('mongoose');

const healthSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Health', healthSchema);
