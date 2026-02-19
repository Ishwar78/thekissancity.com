const mongoose = require('mongoose');

const InfluencerDataSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InfluencerData', InfluencerDataSchema);

