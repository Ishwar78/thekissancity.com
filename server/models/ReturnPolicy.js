
const mongoose = require('mongoose');

const ReturnPolicySectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const ReturnPolicySchema = new mongoose.Schema(
  {
    sections: [ReturnPolicySectionSchema],
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const ReturnPolicy = mongoose.model('ReturnPolicy', ReturnPolicySchema);

module.exports = ReturnPolicy;

