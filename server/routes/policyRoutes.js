const express = require('express');
const router = express.Router();
const Policies = require('../models/Policies');

// GET Policies
router.get('/', async (req, res) => {
  try {
    let policies = await Policies.findOne();
    if (!policies) {
      policies = await Policies.create({});
    }
    res.json({ success: true, policies });
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ success: false, message: 'Server error fetching policies' });
  }
});

// PUT Update Policies (Admin)
router.put('/', async (req, res) => {
  try {
    const {
      shippingPolicy,
      returnPolicy,
      privacyPolicy,
      termsAndConditions
    } = req.body;

    let policies = await Policies.findOne();
    if (!policies) {
      policies = new Policies({});
    }

    if (shippingPolicy !== undefined) policies.shippingPolicy = shippingPolicy;
    if (returnPolicy !== undefined) policies.returnPolicy = returnPolicy;
    if (privacyPolicy !== undefined) policies.privacyPolicy = privacyPolicy;
    if (termsAndConditions !== undefined) policies.termsAndConditions = termsAndConditions;

    await policies.save();

    res.json({ success: true, message: 'Policies updated successfully', policies });
  } catch (error) {
    console.error('Error updating policies:', error);
    res.status(500).json({ success: false, message: 'Server error updating policies' });
  }
});

module.exports = router;
