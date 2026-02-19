const express = require('express');
const router = express.Router();
const TermsOfService = require('../models/TermsOfService');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/terms-of-service - Get the terms of service
router.get('/', async (req, res) => {
  try {
    const policy = await TermsOfService.findOne();
    return res.json({ ok: true, data: policy });
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// POST /api/terms-of-service - Create or update the terms of service
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { mainHeading, sections } = req.body;

    if (!mainHeading) {
      return res.status(400).json({ ok: false, message: 'Main heading is required' });
    }

    let tos = await TermsOfService.findOne();

    if (tos) {
      // Update existing policy
      tos.mainHeading = mainHeading;
      tos.sections = sections;
      tos.lastUpdatedBy = req.user.id;
      await tos.save();
      return res.json({ ok: true, message: 'Terms of service updated successfully', data: tos });
    } else {
      // Create new policy
      tos = new TermsOfService({
        mainHeading,
        sections,
        lastUpdatedBy: req.user.id,
      });
      await tos.save();
      return res.status(201).json({ ok: true, message: 'Terms of service created successfully', data: tos });
    }
  } catch (error) {
    console.error('Error creating/updating terms of service:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;

