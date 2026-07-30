const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');

// Create a new ticket (User)
router.post('/', async (req, res) => {
  try {
    const { userId, subject, category, message } = req.body;

    if (!userId || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const ticket = new Ticket({
      user: userId,
      subject,
      category: category || 'Order Query',
      message
    });

    await ticket.save();
    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's tickets (User)
router.get('/my-tickets/:userId', async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all tickets (Admin)
router.get('/', async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate('user', 'name email mobile')
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reply to a ticket (Admin or User)
router.post('/:id/reply', async (req, res) => {
  try {
    const { sender, text } = req.body;
    if (!sender || !text) {
      return res.status(400).json({ success: false, message: 'Sender and text are required' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    ticket.responses.push({ sender, text });
    
    // Automatically change status to In Progress if Admin replies to an Open ticket
    if (sender === 'admin' && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update ticket status (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
