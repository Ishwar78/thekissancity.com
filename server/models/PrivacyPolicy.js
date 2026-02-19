
const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  point: { type: String, required: true },
});

const Section2Schema = new mongoose.Schema({
  subHeading: { type: String, required: true },
  paragraph: { type: String, required: true },
});

const Section3Schema = new mongoose.Schema({
  subHeading: { type: String, required: true },
  description: { type: String, required: true },
  points: [PointSchema], // 5 points
});

const Section4Schema = new mongoose.Schema({
  subHeading: { type: String, required: true },
  description: { type: String, required: true },
  points: [PointSchema], // 3 points
});

const Section5Schema = new mongoose.Schema({
  subHeading: { type: String, required: true },
  paragraphs: [{ type: String, required: true }], // 3 paragraphs
});

const Section6Schema = new mongoose.Schema({
  subHeading: { type: String, required: true },
  description: { type: String, required: true },
});

const InputFieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  placeholder: { type: String, required: true }, // Assuming an input field needs a placeholder
  name: { type: String, required: true, unique: true }, // For identifying the input field
});

const PrivacyPolicySchema = new mongoose.Schema(
  {
    mainHeading: { type: String, required: true },
    mainParagraph: { type: String, required: true },
    section2: [Section2Schema],
    section3: [Section3Schema],
    section4: [Section4Schema],
    section5: [Section5Schema],
    section6: [Section6Schema],
    inputFields: [InputFieldSchema], // For the 3 labels and inputs
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const PrivacyPolicy = mongoose.model('PrivacyPolicy', PrivacyPolicySchema);

module.exports = PrivacyPolicy;
