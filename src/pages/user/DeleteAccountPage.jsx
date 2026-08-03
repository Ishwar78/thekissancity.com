import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AlertTriangle, Trash2, ArrowLeft, CheckSquare, Square, ShieldAlert, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './DeleteAccountPage.css';

export default function DeleteAccountPage() {
  const { user, logoutUser, token } = useUser();
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (!agreed) {
      setError('Please check and accept the Terms & Conditions before deleting your account.');
      return;
    }

    const confirmed = window.confirm(
      'FINAL WARNING: Are you absolutely sure you want to permanently delete your account? This action cannot be undone!'
    );

    if (!confirmed) return;

    setLoading(true);
    setError('');

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');
      const userId = user?.id || user?._id || 'me';

      const res = await fetch(`${baseUrl}/api/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setDeleted(true);
        setTimeout(() => {
          logoutUser();
          navigate('/', { replace: true });
        }, 3000);
      } else {
        setError(data.message || 'Failed to delete account. Please try again.');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setError('Network or server error occurred while deleting account.');
    } finally {
      setLoading(false);
    }
  };

  if (deleted) {
    return (
      <div className="delete-page-shell">
        <Navbar />
        <div className="delete-page-container">
          <div className="delete-success-card">
            <CheckCircle2 size={54} color="#16a34a" />
            <h2>Account Deleted Permanently</h2>
            <p>Your account and associated data have been permanently removed from The Kissan City.</p>
            <p className="redirect-note">Redirecting to home page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="delete-page-shell">
      <Navbar />

      <main className="delete-page-main">
        <div className="delete-page-container">
          
          {/* Back link */}
          <Link to="/user/dashboard?tab=profile" className="delete-back-link">
            <ArrowLeft size={16} /> Back to My Dashboard
          </Link>

          <div className="delete-card">
            {/* Header Badge */}
            <div className="delete-card-header">
              <div className="delete-card-icon">
                <AlertTriangle size={32} />
              </div>
              <div>
                <span className="delete-eyebrow">DANGER ZONE</span>
                <h1 className="delete-title">Permanent Account Deletion</h1>
                <p className="delete-subtitle">
                  Account: <strong>{user?.name || 'Kissan Customer'}</strong> (+91 {user?.mobile || 'Registered Mobile'})
                </p>
              </div>
            </div>

            {/* Terms and Conditions Section */}
            <div className="delete-terms-box">
              <h3><ShieldAlert size={18} /> Terms & Conditions for Account Deletion</h3>
              <p className="terms-intro">
                Please read the following consequences carefully before proceeding with permanent account deletion:
              </p>
              
              <ul className="terms-list">
                <li>
                  <strong>Personal Profile Wipeout:</strong> Your name, email address, shipping addresses, and personal preferences will be permanently erased from our databases.
                </li>
                <li>
                  <strong>Wishlist & Cart Clearance:</strong> All items saved in your wishlist and shopping cart will be cleared permanently.
                </li>
                <li>
                  <strong>Disassociated Order History:</strong> Past order records will be detached from your personal profile and mobile number.
                </li>
                <li>
                  <strong>Irreversible Action:</strong> Once deleted, this account cannot be restored or recovered. You will need to create a new account to shop with us again.
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div className="delete-error-alert">
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            {/* Checkbox Agreement */}
            <div className="delete-checkbox-wrapper" onClick={() => setAgreed(!agreed)}>
              <div className="delete-checkbox-icon">
                {agreed ? <CheckSquare size={22} color="#dc2626" /> : <Square size={22} color="#9ca3af" />}
              </div>
              <label className="delete-checkbox-label">
                I have read, understood, and accept all the <strong>Terms & Conditions</strong> of permanent account deletion. I acknowledge that this action cannot be undone.
              </label>
            </div>

            {/* Action Buttons */}
            <div className="delete-actions">
              <button
                type="button"
                className="delete-submit-btn"
                disabled={!agreed || loading}
                onClick={handleDelete}
              >
                {loading ? (
                  <>
                    <LoaderCircle className="spinner-icon" size={18} />
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Permanently Delete My Account
                  </>
                )}
              </button>

              <Link to="/user/dashboard?tab=profile" className="delete-cancel-btn">
                Cancel & Keep My Account
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
