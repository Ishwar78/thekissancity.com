const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'kissan_city_secret_key_2026';

// In-memory OTP store (mobile -> { otp, expiresAt, sessionId })
const otpStore = new Map();

// Helper to generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST Send OTP (Public) - Via 2Factor.in SMS API
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile, name, isSignup, isCheckout, mode } = req.body;

    if (!mobile || !String(mobile).replace(/\D/g, '').match(/^[6-9]\d{9}$/)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    // Normalize mobile (10 digits)
    const normalizedMobile = String(mobile).replace(/\D/g, '').slice(-10);

    // Check if user exists in database
    let existingUser = await User.findOne({ 
      $or: [
        { mobile: normalizedMobile },
        { mobile: `+91${normalizedMobile}` },
        { mobile: `+91 ${normalizedMobile}` }
      ]
    });

    if (!existingUser) {
      existingUser = await User.findOne({ mobile: Number(normalizedMobile) }).catch(() => null);
    }

    const isCheckoutMode = Boolean(isCheckout || mode === 'checkout');
    const isSignupMode = Boolean(isSignup || mode === 'signup');
    const isSigninMode = !isCheckoutMode && !isSignupMode;

    // 1. Sign In mode: User MUST be registered
    if (isSigninMode && !existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not registered. Please register your account.' 
      });
    }

    // 2. Sign Up mode: User MUST NOT be registered already
    if (isSignupMode && existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Account already exists with this mobile number. Please Sign In.' 
      });
    }

    // Generate random 6 digit OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 2Factor API Key from .env
    const apiKey = process.env.TWOFACTOR_API_KEY;
    if (!apiKey) {
      console.error('[2FACTOR ERROR] TWOFACTOR_API_KEY is not defined in server/.env');
      return res.status(500).json({ success: false, message: 'SMS Gateway Key is missing in server environment.' });
    }

    // Call 2Factor SMS Send API
    const twoFactorUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${normalizedMobile}/${otp}`;
    console.log(`[2FACTOR] Sending real OTP via SMS to +91${normalizedMobile}...`);

    const smsRes = await fetch(twoFactorUrl);
    const smsData = await smsRes.json();

    console.log('[2FACTOR API RESPONSE]', smsData);

    if (!smsData || smsData.Status !== 'Success') {
      return res.status(500).json({
        success: false,
        message: smsData?.Details || 'Failed to send OTP via SMS. Please try again.'
      });
    }

    // Save OTP against mobile and normalizedMobile in store
    otpStore.set(normalizedMobile, { otp, expiresAt, sessionId: smsData.Details });
    otpStore.set(mobile, { otp, expiresAt, sessionId: smsData.Details });

    console.log(`[OTP SENT SUCCESS] Mobile: ${normalizedMobile} | 2Factor Session: ${smsData.Details}`);

    res.json({
      success: true,
      message: `OTP sent successfully to +91 ${normalizedMobile}`,
      userExists: Boolean(existingUser)
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    res.status(500).json({ success: false, message: 'Server error sending OTP' });
  }
});

// POST Verify OTP (Public)
router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp, name } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
    }

    const normalizedMobile = String(mobile).replace(/\D/g, '').slice(-10);
    const storedData = otpStore.get(normalizedMobile) || otpStore.get(mobile);

    // Verify actual sent OTP and expiry
    const isValidOtp = storedData && storedData.otp === String(otp).trim() && storedData.expiresAt > Date.now();

    if (!isValidOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please enter the OTP sent to your phone.' });
    }

    // Clear OTP after successful verification
    otpStore.delete(normalizedMobile);
    otpStore.delete(mobile);

    // Find or create user - check different possible formats
    let user = await User.findOne({ 
      $or: [
        { mobile: normalizedMobile },
        { mobile: `+91${normalizedMobile}` },
        { mobile: `+91 ${normalizedMobile}` }
      ]
    });

    if (!user) {
      user = await User.findOne({ mobile: Number(normalizedMobile) }).catch(() => null);
    }

    if (!user) {
      user = new User({
        mobile: normalizedMobile,
        name: name && name.trim() ? name.trim() : 'Kissan Customer',
        isVerified: true
      });
      await user.save();
      console.log(`[NEW USER CREATED] Mobile: ${normalizedMobile}, User ID: ${user._id}`);
    } else {
      if (name && name.trim() && (user.name === 'Kissan Customer' || !user.name)) {
        user.name = name.trim();
        await user.save();
      }
      console.log(`[EXISTING USER LOGGED IN] Mobile: ${normalizedMobile}, User ID: ${user._id}`);
    }

    // Create JWT Token
    const token = jwt.sign(
      { userId: user._id, mobile: user.mobile, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        address: user.address,
        wishlist: user.wishlist || []
      },
      token
    });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
});

// GET Current User Profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        address: user.address,
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// GET Wishlist
router.get('/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error fetching wishlist' });
  }
});

// POST Sync/Update Wishlist
router.post('/wishlist', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { wishlist } = req.body;
    if (Array.isArray(wishlist)) {
      user.wishlist = wishlist;
      await user.save();
    }

    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error updating wishlist' });
  }
});

// PUT Update User Profile (Name & Email - Mobile is non-editable)
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, email, address, city, state, pincode } = req.body;

    if (name !== undefined) user.name = String(name).trim();
    if (email !== undefined) user.email = String(email).trim();

    // Update address details if provided
    if (address !== undefined || city !== undefined || state !== undefined || pincode !== undefined) {
      const currentAddress = user.address || {};
      user.address = {
        ...currentAddress,
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pincode !== undefined && { pincode })
      };
    }

    // Mobile is intentionally NOT updated here (mobile is immutable)
    await user.save();

    console.log(`[PROFILE UPDATED] User ID: ${user._id}, Name: ${user.name}, Email: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
});

// PUT Update User Address
router.put('/address', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No auth token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.address = req.body;
    await user.save();

    res.json({ success: true, message: 'Address updated successfully', address: user.address });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET All Users (Admin)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
});

// DELETE User Account permanently
router.delete('/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userIdFromToken = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userIdFromToken = decoded.userId;
      } catch (err) {}
    }

    const targetId = req.params.id === 'me' ? userIdFromToken : req.params.id;
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const deletedUser = await User.findByIdAndDelete(targetId);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    console.log(`[USER PERMANENTLY DELETED] User ID: ${targetId}, Mobile: ${deletedUser.mobile}`);
    res.json({ success: true, message: 'Account permanently deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ success: false, message: 'Server error deleting user account' });
  }
});

module.exports = router;
