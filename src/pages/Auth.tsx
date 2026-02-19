import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const { user, signIn, signUp } = useAuth();
  const cart = (() => { try { return useCart(); } catch { return null as any; } })();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const added = handleIntent();
      navigate(added ? '/cart' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);


  const handleIntent = () => {
    try {
      const raw = localStorage.getItem('uni_add_intent');
      if (!raw) return false;
      const { item, qty } = JSON.parse(raw);
      if (item && cart?.addToCart) {
        cart.addToCart(item, qty || 1);
        localStorage.removeItem('uni_add_intent');
        toast.success('Added to cart');
        return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset OTP state when switching between login/signup
  useEffect(() => {
    if (isLogin) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setResendTimer(0);
    }
  }, [isLogin]);

  const handleSendOTP = async () => {
    if (!phone || !/^\d{10}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(true);
    try {
      const { ok, json } = await api('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });

      if (ok) {
        setOtpSent(true);
        setOtpVerified(false);
        setOtp('');
        setResendTimer(60); // 60 seconds cooldown
        toast.success('OTP sent to your phone number');
      } else {
        toast.error(json?.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const { ok, json } = await api('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone, otp }),
      });

      if (ok) {
        setOtpVerified(true);
        toast.success('OTP verified successfully');
      } else {
        toast.error(json?.message || 'Invalid OTP');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error, user: signedInUser } = await signIn(email, password);
        if (error) throw new Error(error?.message ?? JSON.stringify(error));
        toast.success('Welcome back!');
      } else {
        if (!name) {
          toast.error('Please enter your name');
          setLoading(false);
          return;
        }
        if (!phone || !/^\d{10}$/.test(phone)) {
          toast.error('Phone number must be exactly 10 digits');
          setLoading(false);
          return;
        }
        if (!otpSent || !otpVerified) {
          toast.error('Please verify your phone number with OTP first');
          setLoading(false);
          return;
        }
        if (!otp || otp.length !== 6) {
          toast.error('Please enter the OTP');
          setLoading(false);
          return;
        }
        const { error, user: signedUpUser } = await signUp(email, password, name, phone, otp);
        if (error) throw new Error(error?.message ?? JSON.stringify(error));
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex justify-center items-center px-4 pt-32 pb-12 md:pb-16">
        <Card className="max-w-sm w-full mx-auto">
          <CardHeader>
            <CardTitle>{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLogin ? 'Welcome back to UNI10' : 'Join UNI10 today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (10 digits required)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setPhone(value.slice(0, 10));
                          // Reset OTP state when phone changes
                          if (value !== phone) {
                            setOtpSent(false);
                            setOtpVerified(false);
                            setOtp('');
                          }
                        }}
                        maxLength={10}
                        required
                        disabled={otpVerified}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={!phone || phone.length !== 10 || sendingOtp || resendTimer > 0 || otpVerified}
                        variant="outline"
                      >
                        {sendingOtp ? 'Sending...' : resendTimer > 0 ? `${resendTimer}s` : otpVerified ? 'Verified' : 'Send OTP'}
                      </Button>
                    </div>
                    {otpSent && !otpVerified && (
                      <p className="text-xs text-muted-foreground">OTP sent! Please check your phone.</p>
                    )}
                    {otpVerified && (
                      <p className="text-xs text-green-600">✓ Phone number verified</p>
                    )}
                  </div>
                  {otpSent && !otpVerified && (
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="flex gap-2">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="6-digit OTP"
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setOtp(value.slice(0, 6));
                          }}
                          maxLength={6}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          onClick={handleVerifyOTP}
                          disabled={!otp || otp.length !== 6 || loading}
                          variant="outline"
                        >
                          Verify
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* 👇 Password with show/hide toggle */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10" // space for icon
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-4 space-y-3">
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
              {isLogin && (
                <div className="text-center">
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
