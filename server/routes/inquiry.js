const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Inquiry = require('../models/Inquiry');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// GET /api/inquiry/list - Admin only
router.get('/list', requireAuth, requireAdmin, async (req, res) => {
  try {
    const list = await Inquiry.find().sort({ createdAt: -1 }).lean();
    return res.json({ ok: true, data: list });
  } catch (err) {
    console.error('Failed to list inquiries:', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { name, email, phone, subject, message, contact_method, city, state, address, loadCapacity, commodity, dryerType, source, submitted_at, hp } = req.body || {};

    if (hp) {
      return res.status(400).json({ ok: false, message: 'Spam detected' });
    }

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({ ok: false, message: 'Required fields are missing' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ ok: false, message: 'Invalid email address' });
    }

    // Save to database
    const inquiry = new Inquiry({
      name,
      email,
      phone,
      subject,
      message,
      contact_method,
      city,
      state,
      address,
      loadCapacity,
      commodity,
      dryerType,
      source: source || 'website-contact',
      submittedAt: submitted_at ? new Date(submitted_at) : new Date()
    });
    await inquiry.save();

    const adminEmail = process.env.GMAIL_USER;
    const htmlContent = `
      <h2>New Inquiry Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr>
      ${city ? `<p><strong>City:</strong> ${city}</p>` : ''}
      ${state ? `<p><strong>State:</strong> ${state}</p>` : ''}
      ${address ? `<p><strong>Address:</strong> ${address}</p>` : ''}
      <hr>
      ${loadCapacity ? `<p><strong>Load Capacity:</strong> ${loadCapacity}</p>` : ''}
      ${commodity ? `<p><strong>Commodity to Dry:</strong> ${commodity}</p>` : ''}
      ${dryerType ? `<p><strong>Dryer Type:</strong> ${dryerType}</p>` : ''}
      <hr>
      ${contact_method ? `<p><strong>Preferred Contact Method:</strong> ${contact_method}</p>` : ''}
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Submitted at: ${submitted_at || new Date().toISOString()}</small></p>
      <p><small>Source: ${source || 'website-contact'}</small></p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: adminEmail,
      replyTo: email,
      subject: `New Inquiry: ${subject}`,
      text: `New Inquiry\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: htmlContent,
    });

    return res.json({ ok: true, data: inquiry, message: 'Inquiry submitted successfully' });
  } catch (e) {
    console.error('Inquiry submission error:', e);
    return res.status(500).json({ ok: false, message: 'Failed to submit inquiry' });
  }
});

// Admin: Delete inquiry
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await Inquiry.findByIdAndDelete(req.params.id);
    return res.json({ ok: true, message: 'Inquiry deleted' });
  } catch (err) {
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
