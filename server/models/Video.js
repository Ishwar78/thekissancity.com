const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    type: { type: String, enum: ['video', 'image'], default: 'video' },
    videoUrl: { type: String },
    thumbnailUrl: { type: String },
    imageUrl: { type: String },
    linkUrl: { type: String },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Video', VideoSchema);
