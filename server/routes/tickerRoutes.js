const express = require('express');
const router = express.Router();
const Ticker = require('../models/Ticker');

// @route   GET /api/tickers
// @desc    Get all active tickers (Public) or all tickers (Admin)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const tickers = await Ticker.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, tickers });
  } catch (error) {
    console.error('Error fetching tickers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/tickers
// @desc    Create a new ticker
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const { text, isActive, order } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const ticker = new Ticker({
      text,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    await ticker.save();
    res.status(201).json({ success: true, ticker, message: 'Ticker created successfully' });
  } catch (error) {
    console.error('Error creating ticker:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/tickers/:id
// @desc    Update a ticker
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const ticker = await Ticker.findById(req.params.id);
    if (!ticker) {
      return res.status(404).json({ success: false, message: 'Ticker not found' });
    }

    ticker.text = req.body.text || ticker.text;
    if (req.body.isActive !== undefined) {
      ticker.isActive = req.body.isActive;
    }
    if (req.body.order !== undefined) {
      ticker.order = req.body.order;
    }

    await ticker.save();
    res.json({ success: true, ticker, message: 'Ticker updated successfully' });
  } catch (error) {
    console.error('Error updating ticker:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/tickers/:id
// @desc    Delete a ticker
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const ticker = await Ticker.findById(req.params.id);
    if (!ticker) {
      return res.status(404).json({ success: false, message: 'Ticker not found' });
    }
    await ticker.deleteOne();
    res.json({ success: true, message: 'Ticker deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticker:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
