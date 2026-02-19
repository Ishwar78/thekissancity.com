const express = require('express');
const router = express.Router();
const Region = require('../models/Region');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Helper to normalize updates from body
function buildRegionPayload(body = {}) {
  const payload = {};
  if (typeof body.name !== 'undefined') payload.name = String(body.name).trim();
  if (typeof body.description !== 'undefined') payload.description = String(body.description || '').trim();
  if (typeof body.active !== 'undefined') payload.active = !!body.active;
  if (typeof body.slug !== 'undefined') payload.slug = String(body.slug || '').trim();
  if (typeof body.imageUrl !== 'undefined') payload.imageUrl = String(body.imageUrl || '').trim();
  return payload;
}

// List regions
router.get('/', async (req, res) => {
  try {
    const filter = { active: true };
    const docs = await Region.find(filter).sort({ name: 1 }).lean();
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Create region (admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body || {};
    console.log('[Region POST] req.body:', req.body);
    if (!name) return res.status(400).json({ ok: false, message: 'Missing name' });
    if (!String(name).trim()) return res.status(400).json({ ok: false, message: 'Name cannot be empty' });

    const trimmedName = String(name).trim();
    const existingRegion = await Region.findOne({ name: { $regex: `^${trimmedName}$`, $options: 'i' } });
    if (existingRegion) {
      return res.status(409).json({ ok: false, message: 'Region with this name already exists' });
    }

    const payload = buildRegionPayload(req.body || {});
    if (!payload.name) payload.name = trimmedName;

    const doc = await Region.create(payload);
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error('Region create error:', { message: e.message, code: e.code, errorString: String(e) });
    if (e.code === 11000) {
      return res.status(409).json({ ok: false, message: 'Region with this name or slug already exists' });
    }
    return res.status(500).json({ ok: false, message: e.message || 'Failed to create region' });
  }
});

// Update region (admin)
async function updateRegion(req, res) {
  try {
    console.log('[Region PUT/PATCH] req.body:', req.body);
    const { id } = req.params;
    const updates = buildRegionPayload(req.body || {});
    console.log('[Region PUT/PATCH] updates payload:', updates);
    const doc = await Region.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
}

router.put('/:id', requireAuth, requireAdmin, updateRegion);
router.patch('/:id', requireAuth, requireAdmin, updateRegion);

// Delete/Deactivate (admin)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Region.findByIdAndDelete(id).lean();
    if (!doc) return res.status(404).json({ ok: false, message: 'Not found' });
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
