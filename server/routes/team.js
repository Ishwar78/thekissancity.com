const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get all active team members (public) - optionally filter by type
router.get('/', async (req, res) => {
  try {
    const { type, all } = req.query;
    const filter = {};
    
    if (all !== 'true') {
      filter.isActive = true;
    }
    
    if (type) {
      filter.type = type;
    }

    const members = await Team.find(filter).sort({ createdAt: -1 });
    res.json({ ok: true, data: members });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Admin: Create new team member
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const member = new Team(req.body);
    const savedMember = await member.save();
    res.status(201).json({ ok: true, data: savedMember });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Admin: Update team member
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const member = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) {
      return res.status(404).json({ ok: false, message: 'Team member not found' });
    }
    res.json({ ok: true, data: member });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

// Admin: Delete team member
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ ok: false, message: 'Team member not found' });
    }
    res.json({ ok: true, message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

module.exports = router;
