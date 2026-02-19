const mongoose = require('mongoose');

const InfluencerImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    influencerName: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InfluencerImage', InfluencerImageSchema);

