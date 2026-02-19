const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { requireAuth } = require('../middleware/auth');

// Normalize productId so string from client is stored consistently (one doc per product)
function toProductId(value) {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (mongoose.Types.ObjectId.isValid(s) && String(new mongoose.Types.ObjectId(s)) === s) {
    return new mongoose.Types.ObjectId(s);
  }
  return s;
}

// List current user's wishlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const docs = await Wishlist.find({ userId: req.user._id }).lean();
    return res.json({ ok: true, data: docs });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Add (one document per userId+productId; GET returns all)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId: raw } = req.body || {};
    const productId = toProductId(raw);
    if (!productId) return res.status(400).json({ ok: false, message: 'Missing productId' });
    const doc = await Wishlist.findOneAndUpdate(
      { userId: req.user._id, productId },
      { userId: req.user._id, productId },
      { upsert: true, new: true },
    ).lean();
    return res.json({ ok: true, data: doc });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Remove
router.delete('/:productId', requireAuth, async (req, res) => {
  try {
    const productId = toProductId(req.params.productId);
    if (!productId) return res.status(400).json({ ok: false, message: 'Invalid productId' });
    await Wishlist.findOneAndDelete({ userId: req.user._id, productId });
    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
