const mongoose = require('mongoose');

const ParagraphSchema = new mongoose.Schema({
  content: { type: String, required: true },
});

const PointSchema = new mongoose.Schema({
  point: { type: String, required: true },
});

const InputFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }, // To store the actual data, not placeholder
});

const TermsOfServiceSectionSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  subHeading: { type: String }, // Optional, for sections that only have subheadings
  paragraphs: [ParagraphSchema],
  description: { type: String },
  points: [PointSchema],
  inputFields: [InputFieldSchema],
});

const TermsOfServiceSchema = new mongoose.Schema(
  {
    mainHeading: { type: String, required: true },
    sections: [TermsOfServiceSectionSchema],
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const TermsOfService = mongoose.model('TermsOfService', TermsOfServiceSchema);

module.exports = TermsOfService;

