const mongoose = require('mongoose');

const farmerExpertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Farmer', 'Expert'],
      default: 'Farmer',
      required: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    specialty: {
      type: String,
      default: '',
      trim: true,
    },
    experience: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    quote: {
      type: String,
      default: '',
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FarmerExpert', farmerExpertSchema);
