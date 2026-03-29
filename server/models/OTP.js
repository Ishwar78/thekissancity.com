const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: false, // Made optional for 2Factor session verification
    },
    sessionId: {
      type: String,
      required: false, // For 2Factor session verification
      index: true,
    },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset'],
      default: 'signup',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired OTPs
    },
  },
  { timestamps: true }
);

// Index for faster lookups
OTPSchema.index({ phone: 1, purpose: 1, verified: 0 });
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ sessionId: 1 }); // For 2Factor session lookups

module.exports = mongoose.model('OTP', OTPSchema);
