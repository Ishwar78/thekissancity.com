const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: 'The Kissan City'
  },
  image: {
    type: String,
    required: true
  },
  metaDescription: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
