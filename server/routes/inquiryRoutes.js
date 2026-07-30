const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');

// POST Submit Contact Inquiry (Public User)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, source } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields (Name, Email, Phone, Message).' });
    }

    const newInquiry = await Inquiry.create({
      name,
      email,
      phone,
      subject: subject || 'General Enquiry',
      message,
      source: source || 'contact-page',
      status: 'Pending'
    });

    console.log(`[NEW CONTACT INQUIRY] From: ${name} (${phone}, ${email})`);

    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been submitted successfully.',
      inquiry: newInquiry
    });
  } catch (error) {
    console.error('Error submitting contact inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error submitting inquiry' });
  }
});

// GET All Contact Inquiries (Admin)
router.get('/', async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inquiries' });
  }
});

// PUT Update Inquiry Status (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    if (status) inquiry.status = status;
    await inquiry.save();

    res.json({ success: true, message: 'Inquiry status updated', inquiry });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error updating inquiry' });
  }
});

// DELETE Contact Inquiry (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error deleting inquiry' });
  }
});

module.exports = router;
