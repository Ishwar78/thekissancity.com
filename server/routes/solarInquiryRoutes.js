const express = require('express');
const SolarInquiry = require('../models/SolarInquiry');
const router = express.Router();

// POST Submit Solar Inquiry (Public)
router.post('/', async (req, res) => {
  try {
    const { name, email, mobile, city, state, agricultureType, companyName, dryerSize, purpose, remarks } = req.body;

    if (!name || !email || !mobile || !city || !state || !dryerSize || !purpose) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const inquiry = new SolarInquiry({
      name,
      email,
      mobile,
      city,
      state,
      agricultureType: agricultureType || '',
      companyName: companyName || '',
      dryerSize,
      purpose,
      remarks: remarks || '',
      status: 'New'
    });

    await inquiry.save();
    res.status(201).json({ success: true, message: 'Inquiry submitted successfully', inquiry });
  } catch (error) {
    console.error('Error submitting solar inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error submitting inquiry' });
  }
});

// GET All Solar Inquiries (Admin)
router.get('/', async (req, res) => {
  try {
    const inquiries = await SolarInquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
  } catch (error) {
    console.error('Error fetching solar inquiries:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inquiries' });
  }
});

// PATCH Update Inquiry Status (Admin)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['New', 'Contacted', 'In Progress', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const updated = await SolarInquiry.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, inquiry: updated });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status' });
  }
});

// DELETE Solar Inquiry (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await SolarInquiry.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting solar inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error deleting inquiry' });
  }
});

module.exports = router;
