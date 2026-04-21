const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true }, // Should contain HTML from the rich text editor
  image: { type: String },
  author: { type: String, default: 'KissanCity Admin' },
  date: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
