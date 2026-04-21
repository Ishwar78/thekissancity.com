const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  specialty: { type: String },
  quote: { type: String },
  experience: { type: String },
  image: { type: String },
  type: { type: String, enum: ['farmer', 'expert'], required: true, default: 'farmer' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);
