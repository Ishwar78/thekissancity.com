const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: 'Kissan Customer'
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: true
  },
  address: {
    name: String,
    phone: String,
    email: String,
    pincode: String,
    state: String,
    city: String,
    address: String,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    addressType: String
  },
  wishlist: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
