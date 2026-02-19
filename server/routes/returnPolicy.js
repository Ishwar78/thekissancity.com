const express = require('express');
const router = express.Router();
const ReturnPolicy = require('../models/ReturnPolicy');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/return-policy - Get the return policy
router.get('/', async (req, res) => {
  try {
    const policy = await ReturnPolicy.findOne();
    return res.json({ ok: true, data: policy });
  } catch (error) {
    console.error('Error fetching return policy:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// POST /api/return-policy - Create or update the return policy
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ ok: false, message: 'Sections are required and must be an array' });
    }

    let policy = await ReturnPolicy.findOne();

    if (policy) {
      // Update existing policy
      policy.sections = sections;
      policy.lastUpdatedBy = req.user.id;
      await policy.save();
      return res.json({ ok: true, message: 'Return policy updated successfully', data: policy });
    } else {
      // Create new policy
      policy = new ReturnPolicy({
        sections,
        lastUpdatedBy: req.user.id,
      });
      await policy.save();
      return res.status(201).json({ ok: true, message: 'Return policy created successfully', data: policy });
    }
  } catch (error) {
    console.error('Error creating/updating return policy:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;

