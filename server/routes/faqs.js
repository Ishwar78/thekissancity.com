const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Get all active FAQs (public endpoint)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ ok: true, data: faqs });
  } catch (e) {
    console.error('Fetch FAQs error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get all FAQs including inactive (admin only)
router.get('/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const faqs = await FAQ.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return res.json({ ok: true, data: faqs });
  } catch (e) {
    console.error('Fetch all FAQs error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Get single FAQ by ID
router.get('/:id', async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id).lean();
    if (!faq) {
      return res.status(404).json({ ok: false, message: 'FAQ not found' });
    }
    return res.json({ ok: true, data: faq });
  } catch (e) {
    console.error('Fetch FAQ error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Create FAQ (admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { question, answer, category = 'general', order = 0, isActive = true } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ ok: false, message: 'Question and answer are required' });
    }

    const faq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      category,
      order: Number(order) || 0,
      isActive: Boolean(isActive),
    });

    await faq.save();
    return res.json({ ok: true, data: faq });
  } catch (e) {
    console.error('Create FAQ error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Update FAQ (admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    const updateData = {};

    if (question !== undefined) updateData.question = question.trim();
    if (answer !== undefined) updateData.answer = answer.trim();
    if (category !== undefined) updateData.category = category;
    if (order !== undefined) updateData.order = Number(order) || 0;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!faq) {
      return res.status(404).json({ ok: false, message: 'FAQ not found' });
    }

    return res.json({ ok: true, data: faq });
  } catch (e) {
    console.error('Update FAQ error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// Delete FAQ (admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ ok: false, message: 'FAQ not found' });
    }
    return res.json({ ok: true, message: 'FAQ deleted successfully' });
  } catch (e) {
    console.error('Delete FAQ error:', e);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
