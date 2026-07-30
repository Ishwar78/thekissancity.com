import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { api } from '../../utils/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            backgroundColor: 'var(--green-50)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 16px' 
          }}>
            <Lock size={32} color="var(--green-600)" />
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#111827', margin: 0 }}>Admin Login</h2>
          <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '0.9rem' }}>
            Enter your credentials to access the dashboard
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2', border: '1px solid #f87171',
            color: '#b91c1c', padding: '12px 16px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 12px 12px 40px',
                  borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', padding: '12px 12px 12px 40px',
                  borderRadius: '8px', border: '1px solid #d1d5db',
                  fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: '8px',
              backgroundColor: 'var(--green-600)', color: 'white',
              border: 'none', fontSize: '1rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
