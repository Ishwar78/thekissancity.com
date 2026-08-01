import React, { useState, useEffect } from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle, Send, UploadCloud, Check, Building2, CreditCard, Wallet } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import './UserReturnsTab.css';

export default function UserReturnsTab() {
  const { user } = useUser();
  const [showForm, setShowForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    orderId: '',
    reason: '',
    image: null,
    refundMethod: 'bank', // 'bank' or 'upi'
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchReturns();
      fetchDeliveredOrders();
    }
  }, [user]);

  const fetchReturns = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      const res = await fetch(`${baseUrl}/api/returns/my-returns/${user.id || user._id}`);
      const data = await res.json();
      if (data.success) {
        setReturns(data.returns);
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveredOrders = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      const token = localStorage.getItem('kissanUserToken');
      const res = await fetch(`${baseUrl}/api/orders/myorders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const delivered = data.orders.filter(o => o.status === 'delivered');
        setOrders(delivered);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.orderId || !form.reason) {
      setFormError('Order ID and Reason are required');
      return;
    }

    if (form.refundMethod === 'bank') {
      if (!form.accountName.trim() || !form.accountNumber.trim() || !form.ifscCode.trim()) {
        setFormError('Please enter Account Holder Name, Account Number and IFSC Code for Bank Refund');
        return;
      }
    } else if (form.refundMethod === 'upi') {
      if (!form.upiId.trim()) {
        setFormError('Please enter your valid UPI ID (e.g. mobile@upi)');
        return;
      }
    }

    setSubmitting(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      const formData = new FormData();
      formData.append('orderId', form.orderId);
      formData.append('userId', user.id || user._id);
      formData.append('reason', form.reason);
      formData.append('refundMethod', form.refundMethod);
      formData.append('accountName', form.accountName.trim());
      formData.append('accountNumber', form.accountNumber.trim());
      formData.append('ifscCode', form.ifscCode.trim());
      formData.append('upiId', form.upiId.trim());

      if (form.image) {
        formData.append('image', form.image);
      }

      const res = await fetch(`${baseUrl}/api/returns`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setFormSuccess('Return request submitted successfully!');
        setForm({
          orderId: '',
          reason: '',
          image: null,
          refundMethod: 'bank',
          accountName: '',
          accountNumber: '',
          ifscCode: '',
          upiId: ''
        });
        fetchReturns();
        setTimeout(() => {
          setShowForm(false);
          setFormSuccess('');
        }, 3000);
      } else {
        setFormError(data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting return:', error);
      setFormError('Server error while submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="returns-tab-container">
      <div>
        <h3 className="returns-tab-title">My Returns & Replacements</h3>
        <p className="returns-tab-desc">Request returns or replacements within 7 days of delivery</p>
      </div>

      <div className="returns-policy-banner">
        <ShieldCheck size={28} color="#16a34a" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#15803d' }}>7-Day Easy Return Guarantee</div>
          <div style={{ fontSize: '0.82rem', color: '#4b5563' }}>
            If you received a damaged, wrong, or defective product, submit a return request below and our team will collect it free of cost.
          </div>
        </div>
      </div>

      {!showForm ? (
        <div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none',
              borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px'
            }}
          >
            <RotateCcw size={16} /> Raise New Return Request
          </button>

          {loading ? (
            <p>Loading return requests...</p>
          ) : returns.length > 0 ? (
            returns.map(ret => (
              <div key={ret._id} className="return-card" style={{ padding: '16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#111827' }}>Return Request ID: {ret._id.slice(-6).toUpperCase()}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Order #{ret.order ? ret.order.orderId : 'N/A'} • Submitted on {new Date(ret.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div style={{ 
                    padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                    background: ret.status === 'Approved' ? '#dcfce7' : ret.status === 'Rejected' ? '#fee2e2' : '#fef3c7',
                    color: ret.status === 'Approved' ? '#16a34a' : ret.status === 'Rejected' ? '#dc2626' : '#d97706'
                  }}>
                    {ret.status}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '10px' }}>
                  <strong>Reason:</strong> {ret.reason}
                </div>

                {/* Refund Account Info in User History */}
                {ret.refundDetails && (
                  <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: '8px', marginBottom: '10px', fontSize: '0.85rem', color: '#374151' }}>
                    <strong style={{ color: '#16a34a' }}>
                      {ret.refundMethod === 'upi' ? '📱 Refund Payout via UPI:' : '🏦 Refund Payout via Bank Account:'}
                    </strong>
                    {ret.refundMethod === 'upi' ? (
                      <div style={{ marginTop: 2 }}>UPI ID: <strong>{ret.refundDetails.upiId || 'N/A'}</strong></div>
                    ) : (
                      <div style={{ marginTop: 2 }}>
                        A/C Name: <strong>{ret.refundDetails.accountName}</strong> | A/C No: <strong>{ret.refundDetails.accountNumber}</strong> | IFSC: <strong>{ret.refundDetails.ifscCode}</strong>
                      </div>
                    )}
                  </div>
                )}

                {ret.image && (
                  <div>
                    <img src={ret.image} alt="Return Evidence" style={{ maxWidth: '100px', borderRadius: '8px' }} />
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f9fafb', borderRadius: '12px', marginTop: '20px' }}>
              <CheckCircle2 size={40} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ margin: '0 0 6px', color: '#374151' }}>No Returns Yet</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>You haven't raised any return requests.</p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h4 style={{ margin: '0 0 20px', fontSize: '1.1rem', color: '#111827' }}>Create Return Request</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Select Order *</label>
            <select
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
              required
            >
              <option value="">-- Choose a Delivered Order --</option>
              {orders.map(o => (
                <option key={o._id} value={o._id}>{o.orderId} (Delivered: {new Date(o.updatedAt).toLocaleDateString()})</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Reason for Return *</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Please explain why you are returning this item..."
              rows="3"
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.95rem', resize: 'vertical' }}
              required
            ></textarea>
          </div>

          {/* Refund Payout Details Section */}
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', padding: '18px', borderRadius: '12px', marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
              💳 Refund Payout Method *
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, refundMethod: 'bank' })}
                style={{
                  flex: 1, padding: '10px', border: `2px solid ${form.refundMethod === 'bank' ? '#16a34a' : '#cbd5e1'}`,
                  background: form.refundMethod === 'bank' ? '#f0fdf4' : '#fff', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.88rem', color: form.refundMethod === 'bank' ? '#16a34a' : '#64748b',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Building2 size={16} /> Bank Account
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, refundMethod: 'upi' })}
                style={{
                  flex: 1, padding: '10px', border: `2px solid ${form.refundMethod === 'upi' ? '#16a34a' : '#cbd5e1'}`,
                  background: form.refundMethod === 'upi' ? '#f0fdf4' : '#fff', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.88rem', color: form.refundMethod === 'upi' ? '#16a34a' : '#64748b',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                <Wallet size={16} /> UPI ID
              </button>
            </div>

            {/* Bank Fields */}
            {form.refundMethod === 'bank' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Account Holder Name"
                    value={form.accountName}
                    onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Account Number *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Bank Account Number"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={form.ifscCode}
                      onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase' }}
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* UPI Fields */
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  UPI ID (GPay / PhonePe / Paytm / BHIM) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210@paytm or name@okhdfcbank"
                  value={form.upiId}
                  onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 600, color: '#374151' }}>Upload Product Image / Evidence (Optional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#f3f4f6', border: '1px dashed #9ca3af', borderRadius: '8px', color: '#4b5563', fontSize: '0.9rem' }}>
                <UploadCloud size={18} />
                {form.image ? 'Change Image' : 'Select Image'}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              {form.image && <span style={{ fontSize: '0.85rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} /> Selected</span>}
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>Please upload an image of the damaged or wrong product if applicable.</p>
          </div>

          {formError && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{formError}</div>}
          {formSuccess && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>{formSuccess}</div>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 2, padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={submitting}
            >
              <Send size={18} />
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
