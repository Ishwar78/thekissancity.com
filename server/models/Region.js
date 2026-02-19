const mongoose = require('mongoose');

const RegionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

RegionSchema.pre('save', function (next) {
  if (!this.slug && this.name) {
    this.slug = String(this.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Region', RegionSchema);
