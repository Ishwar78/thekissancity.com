import React, { useState, useEffect } from 'react';
import { X, Phone, ArrowRight, ShieldCheck, RefreshCw, UserCheck, Leaf, Lock } from 'lucide-react';
import { useUser } from '../context/UserContext';
import './UserAuthModal.css';

export default function UserAuthModal({ open, onClose, defaultTab = 'login' }) {
  const { loginUser } = useUser();
  const [tab, setTab] = useState(defaultTab); // 'login' | 'signup'
  const [step, setStep] = useState(1); // 1 = Mobile input, 2 = OTP input
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    setTab(defaultTab);
    setStep(1);
    setMobile('');
    setName('');
    setOtp(['', '', '', '', '', '']);
    setError('');
  }, [open, defaultTab]);

  // Resend OTP Countdown Timer
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (!open) return null;

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    if (!mobile.match(/^[6-9]\d{9}$/)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (tab === 'signup' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          name: tab === 'signup' ? name.trim() : '',
          isSignup: tab === 'signup'
        })
      });

      const data = await res.json();
      if (data.success) {
        setStep(2);
        setResendTimer(30);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp: enteredOtp,
          name: tab === 'signup' ? name.trim() : ''
        })
      });

      const data = await res.json();
      if (data.success) {
        loginUser(data.user, data.token);
        onClose();
      } else {
        setError(data.message || 'Invalid OTP. Try again.');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Change
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    // Auto focus next box
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-box-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-box-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Header */}
        <div className="auth-modal-header">
          <div className="auth-modal-badge">
            <Leaf size={14} /> WELCOME TO THE KISSAN CITY
          </div>
          <h2 className="auth-modal-title">
            {step === 1 ? (tab === 'login' ? 'Sign In' : 'Create Account') : 'Verify Mobile OTP'}
          </h2>
          <p className="auth-modal-subtitle">
            {step === 1
              ? 'Enter your mobile number to receive 6-digit OTP'
              : `Enter the OTP sent to +91 ${mobile}`}
          </p>
        </div>

        {/* Tabs for Step 1 */}
        {step === 1 && (
          <div className="auth-tabs">
            <button
              className={`auth-tab-btn${tab === 'login' ? ' active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn${tab === 'signup' ? ' active' : ''}`}
              onClick={() => { setTab('signup'); setError(''); }}
            >
              Register / Sign Up
            </button>
          </div>
        )}

        {/* Body */}
        <div className="auth-modal-body">
          {error && <div className="auth-error-alert">{error}</div>}

          {/* STEP 1: MOBILE & NAME INPUT */}
          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              {tab === 'signup' && (
                <div className="auth-input-group">
                  <label className="auth-input-label">Full Name</label>
                  <input
                    type="text"
                    className="auth-input auth-input--boxed"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-input-label">Mobile Number</label>
                <div className="auth-phone-wrapper">
                  <span className="auth-country-code">🇮🇳 +91</span>
                  <input
                    type="tel"
                    className="auth-input"
                    placeholder="Enter 10-digit mobile no."
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading || mobile.length !== 10 || (tab === 'signup' && !name.trim())}
              >
                {loading ? 'Sending OTP...' : <>Send OTP <ArrowRight size={18} /></>}
              </button>

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.78rem', color: '#6b7280' }}>
                <ShieldCheck size={14} style={{ display: 'inline', marginRight: 4, color: '#16a34a' }} />
                Your details are safe and 100% secure with us.
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>

              <div className="otp-inputs-row">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-box-${idx}`}
                    type="text"
                    maxLength={1}
                    className="otp-box"
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                className="auth-btn-primary"
                disabled={loading || otp.join('').length !== 6}
              >
                {loading ? 'Verifying...' : <>Verify & Continue <UserCheck size={18} /></>}
              </button>

              <div className="auth-resend-row">
                <button
                  type="button"
                  className="auth-resend-btn"
                  onClick={() => setStep(1)}
                >
                  Edit Mobile Number
                </button>

                <button
                  type="button"
                  className="auth-resend-btn"
                  disabled={resendTimer > 0}
                  onClick={() => {
                    setResendTimer(30);
                    handleSendOtp({ preventDefault: () => {} });
                  }}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
