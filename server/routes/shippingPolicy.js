const express = require('express');
const router = express.Router();
const ShippingPolicy = require('../models/ShippingPolicy');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/shipping-policy - Get the shipping policy
router.get('/', async (req, res) => {
  try {
    const policy = await ShippingPolicy.findOne();
    return res.json({ ok: true, data: policy });
  } catch (error) {
    console.error('Error fetching shipping policy:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// POST /api/shipping-policy - Create or update the shipping policy
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;

    if (!sections || !Array.isArray(sections)) {
      return res.status(400).json({ ok: false, message: 'Sections are required and must be an array' });
    }

    let policy = await ShippingPolicy.findOne();

    if (policy) {
      // Update existing policy
      policy.sections = sections;
      policy.lastUpdatedBy = req.user.id; // Assuming req.user.id is available from auth middleware
      await policy.save();
      return res.json({ ok: true, message: 'Shipping policy updated successfully', data: policy });
    } else {
      // Create new policy
      policy = new ShippingPolicy({
        sections,
        lastUpdatedBy: req.user.id, // Assuming req.user.id is available from auth middleware
      });
      await policy.save();
      return res.status(201).json({ ok: true, message: 'Shipping policy created successfully', data: policy });
    }
  } catch (error) {
    console.error('Error creating/updating shipping policy:', error);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;

