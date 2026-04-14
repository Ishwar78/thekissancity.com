import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { api } from '@/lib/api';

const ForgotPassword = () => {
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if token is in URL
  const tokenFromUrl = searchParams.get('token');
  if (tokenFromUrl && step === 'email') {
    setResetToken(tokenFromUrl);
    setStep('reset');
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email) {
        toast.error('Please enter your email');
        setLoading(false);
        return;
      }

      const res = await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success('If an account exists with this email, you will receive a reset link via email.');
        // Optionally clear the email field
        setEmail('');
      } else {
        toast.error(res.json?.message || 'Failed to request password reset');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!newPassword || !confirmPassword) {
        toast.error('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (!resetToken) {
        toast.error('Reset token is missing');
        setLoading(false);
        return;
      }

      const res = await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: resetToken, newPassword }),
      });

      if (res.ok) {
        toast.success('Password reset successfully! You can now sign in with your new password.');
        // Clear the state or switch to a success message, without force redirecting
        setStep('email');
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res.json?.message || 'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              {step === 'email'
                ? 'Enter your email to receive a password reset link'
                : 'Enter your new password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#6B4E3B] text-white px-4 py-2 rounded-md font-medium hover:bg-[#5A4131] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-[#6B4E3B] text-white px-4 py-2 rounded-md font-medium hover:bg-[#5A4131] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-[#6B4E3B] hover:underline hover:text-[#5A4131] font-medium transition-colors"
                onClick={() => navigate('/auth')}
              >
                Back to sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
