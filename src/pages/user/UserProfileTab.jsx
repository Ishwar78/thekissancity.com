import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { User, Phone, Mail, MapPin, CheckCircle, Save, Lock, AlertCircle, LoaderCircle } from 'lucide-react';
import './UserProfileTab.css';

export default function UserProfileTab() {
  const { user, loginUser, token } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      const userAddr = typeof user.address === 'object' ? user.address : {};
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: userAddr.address || (typeof user.address === 'string' ? user.address : ''),
        city: userAddr.city || user.city || '',
        state: userAddr.state || user.state || '',
        pincode: userAddr.pincode || user.pincode || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaved(false);
    setError('');
    setLoading(true);

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        })
      });

      const data = await res.json();
      if (data.success && data.user) {
        loginUser(data.user, token);
        setSaved(true);
        setTimeout(() => setSaved(false), 4000);
      } else {
        setError(data.message || 'Failed to update profile details');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      // Fallback local update if offline
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        address: {
          ...(typeof user?.address === 'object' ? user.address : {}),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };
      loginUser(updatedUser, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-tab-container">
      <div>
        <h3 className="profile-tab-title">My Personal Profile</h3>
        <p className="profile-tab-desc">View and update your personal details and default shipping address</p>
      </div>

      {saved && (
        <div style={{
          backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
          padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 600, fontSize: '0.9rem'
        }}>
          <CheckCircle size={18} /> Profile details updated successfully!
        </div>
      )}

      {error && (
        <div style={{
          backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          padding: '12px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
          fontWeight: 600, fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Info Overview Cards */}
      <div className="profile-details-grid">
        <div className="profile-info-box">
          <div className="profile-info-label">Full Name</div>
          <div className="profile-info-value">{user?.name || 'Kissan Customer'}</div>
        </div>
        <div className="profile-info-box">
          <div className="profile-info-label">Mobile Number</div>
          <div className="profile-info-value">+91 {user?.mobile || 'Not set'}</div>
        </div>
        <div className="profile-info-box">
          <div className="profile-info-label">Email Address</div>
          <div className="profile-info-value">{user?.email || 'Not provided'}</div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="profile-form-grid">
          <div className="profile-form-group">
            <label className="profile-form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="profile-form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="profile-form-group">
            <label className="profile-form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="profile-form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. name@example.com"
            />
          </div>
        </div>

        {/* Read-Only Mobile Number Field */}
        <div className="profile-form-group">
          <label className="profile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Registered Mobile Number <Lock size={14} style={{ color: '#16a34a' }} />
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="profile-form-input"
              value={`+91 ${user?.mobile || ''}`}
              disabled
              readOnly
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                cursor: 'not-allowed',
                fontWeight: 700,
                border: '1.5px solid #e5e7eb'
              }}
            />
            <span style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={12} style={{ color: '#16a34a' }} /> Mobile number is verified via OTP and cannot be modified.
            </span>
          </div>
        </div>

        <div className="profile-form-group">
          <label className="profile-form-label">Street Address</label>
          <input
            type="text"
            name="address"
            className="profile-form-input"
            value={formData.address}
            onChange={handleChange}
            placeholder="House no, Street name, Area"
          />
        </div>

        <div className="profile-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="profile-form-group">
            <label className="profile-form-label">City</label>
            <input
              type="text"
              name="city"
              className="profile-form-input"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-form-label">State</label>
            <input
              type="text"
              name="state"
              className="profile-form-input"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
            />
          </div>
          <div className="profile-form-group">
            <label className="profile-form-label">Pincode</label>
            <input
              type="text"
              name="pincode"
              className="profile-form-input"
              value={formData.pincode}
              onChange={handleChange}
              placeholder="Pincode"
            />
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <button
            type="submit"
            className="profile-save-btn"
            disabled={loading}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="user-dashboard-spinner" /> Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
