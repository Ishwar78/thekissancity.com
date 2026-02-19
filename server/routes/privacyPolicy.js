
const express = require('express');
const router = express.Router();
const PrivacyPolicy = require('../models/PrivacyPolicy');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/privacy-policy - Get the privacy policy
router.get('/', async (req, res) => {
  try {
    const policy = await PrivacyPolicy.findOne();
    return res.json({ ok: true, data: policy });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// POST /api/privacy-policy - Create or update the privacy policy
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const {
      mainHeading,
      mainParagraph,
      section2,
      section3,
      section4,
      section5,
      section6,
      inputFields,
    } = req.body;

    // Basic validation (you might want more detailed validation based on your schema)
    if (!mainHeading || !mainParagraph) {
      return res.status(400).json({ ok: false, message: 'Main heading and paragraph are required' });
    }

    let policy = await PrivacyPolicy.findOne();

    if (policy) {
      // Update existing policy
      policy.mainHeading = mainHeading;
      policy.mainParagraph = mainParagraph;
      policy.section2 = section2;
      policy.section3 = section3;
      policy.section4 = section4;
      policy.section5 = section5;
      policy.section6 = section6;
      policy.inputFields = inputFields;
      policy.lastUpdatedBy = req.user.id;
      await policy.save();
      return res.json({ ok: true, message: 'Privacy policy updated successfully', data: policy });
    } else {
      // Create new policy
      policy = new PrivacyPolicy({
        mainHeading,
        mainParagraph,
        section2,
        section3,
        section4,
        section5,
        section6,
        inputFields,
        lastUpdatedBy: req.user.id,
      });
      await policy.save();
      return res.status(201).json({ ok: true, message: 'Privacy policy created successfully', data: policy });
    }
  } catch (error) {
    console.error('Error creating/updating privacy policy:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
