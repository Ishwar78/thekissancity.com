import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Home,
  KeyRound,
  Leaf,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  User,
  WalletCards,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import "./CheckoutPage.css";

const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const PAYMENT_METHODS = [
  {
    id: "online",
    label: "Pay Online",
    icon: CreditCard,
    desc: "UPI, Cards, NetBanking, Wallets via Razorpay",
    badge: "Recommended",
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    icon: Banknote,
    desc: "Pay when your order reaches you",
  },
];

const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  email: "",
  pincode: "",
  state: "",
  city: "",
  address: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  addressType: "Home",
};

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function getSavedAddress() {
  try {
    const raw = localStorage.getItem("kissanDefaultAddress");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.name && parsed.phone ? parsed : null;
  } catch {
    return null;
  }
}

export default function CheckoutPage() {
  const { items: cartItems, totalPrice: cartTotal, clearCart } = useCart();
  const { user, loginUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const addressSectionRef = useRef(null);
  const otpInputRefs = useRef([]);

  const buyNowItem = location.state?.buyNowItem;
  const items = buyNowItem
    ? [{ ...buyNowItem, qty: buyNowItem.qty || 1 }]
    : cartItems;
  const totalPrice = Math.round(
    buyNowItem
      ? (Number(buyNowItem.price) || 0) * (Number(buyNowItem.qty) || 1)
      : (Number(cartTotal) || 0)
  );

  const [savedAddress, setSavedAddress] = useState(null);
  const [addressMode, setAddressMode] = useState("new");
  const [form, setForm] = useState(EMPTY_ADDRESS);
  const [saveAsDefault, setSaveAsDefault] = useState(true);
  
  // Auth state for guests
  const [authMode, setAuthMode] = useState('login'); // login | otp | address
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    // If user is already logged in
    if (user) {
      setAuthMode('address');
      
      let addressData = null;
      if (user.address && Object.keys(user.address).length > 0) {
        addressData = user.address;
      }
      
      if (addressData) {
        setSavedAddress(addressData);
        setForm({ ...addressData, name: user.name || addressData.name, phone: user.mobile || addressData.phone });
        setAddressMode('saved');
      } else {
        setForm({ ...EMPTY_ADDRESS, name: user.name || '', phone: user.mobile || '', email: user.email || '' });
        setAddressMode('new');
      }
    } else {
      setAuthMode('login');
    }
  }, [user]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);
  const [errors, setErrors] = useState({});

  const [paymentMethod, setPaymentMethod] = useState("online");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderId] = useState(() => `KC${String(Date.now()).slice(-8)}`);

  const [discountAmt, setDiscountAmt] = useState(0);
  const deliveryCharge = 0; // Free delivery for all orders
  const finalTotal = Math.max(0, Math.round(totalPrice - Math.round(discountAmt) + deliveryCharge));

  // Fetch admin created coupons for checkout
  useEffect(() => {
    const fetchAdminCoupons = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/coupons`);
        const data = await res.json().catch(() => ({}));
        if (data.success && Array.isArray(data.coupons)) {
          setAvailableCoupons(data.coupons.filter(c => c.isActive !== false));
        }
      } catch (err) {
        console.error("Error fetching coupons for checkout:", err);
      }
    };
    fetchAdminCoupons();
  }, []);

  const activeAddress =
    addressMode === "saved" && savedAddress ? savedAddress : form;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!mobile.match(/^[6-9]\d{9}$/)) {
      setAuthError('Please enter a valid 10-digit mobile number');
      return;
    }
    setAuthLoading(true);
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, isCheckout: true })
      });
      const data = await res.json();
      if (data.success) {
        setOtp(['', '', '', '', '', '']);
        setAuthMode('otp');
        setResendTimer(30);
      } else {
        setAuthError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setAuthError('Error connecting to server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setAuthError('Please enter complete 6-digit OTP');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp: enteredOtp })
      });
      const data = await res.json();
      if (data.success) {
        loginUser(data.user, data.token);
      } else {
        setAuthError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setAuthError('Error verifying OTP');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (authMode !== "otp") return;

    const focusTimer = window.setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 120);

    return () => window.clearTimeout(focusTimer);
  }, [authMode]);

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");

    if (cleanValue.length > 1) {
      const pastedDigits = cleanValue.slice(0, 6).split("");
      const nextOtp = ["", "", "", "", "", ""];
      pastedDigits.forEach((digit, digitIndex) => {
        nextOtp[digitIndex] = digit;
      });
      setOtp(nextOtp);
      setAuthError("");
      otpInputRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = cleanValue.slice(-1);
    setOtp(nextOtp);
    setAuthError("");

    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      otpInputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (!pastedDigits.length) return;

    const nextOtp = ["", "", "", "", "", ""];
    pastedDigits.forEach((digit, index) => {
      nextOtp[index] = digit;
    });

    setOtp(nextOtp);
    setAuthError("");
    otpInputRefs.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  };

  const handleChangeMobile = () => {
    setAuthMode("login");
    setOtp(["", "", "", "", "", ""]);
    setAuthError("");
    setResendTimer(0);
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "phone") nextValue = value.replace(/\D/g, "").slice(0, 10);
    if (name === "pincode") nextValue = value.replace(/\D/g, "").slice(0, 6);

    setForm((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateAddress = (address) => {
    const nextErrors = {};

    if (!address.name?.trim()) nextErrors.name = "Please enter your full name";
    if (!/^[6-9]\d{9}$/.test(address.phone || "")) {
      nextErrors.phone = "Enter a valid 10-digit mobile number";
    }
    if (
      address.email?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email)
    ) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!/^\d{6}$/.test(address.pincode || "")) {
      nextErrors.pincode = "Enter a valid 6-digit pincode";
    }
    if (!address.address?.trim()) {
      nextErrors.address = "House number and street address are required";
    }
    if (!address.city?.trim()) nextErrors.city = "Please enter your city";
    if (!address.state) nextErrors.state = "Please select your state";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleApplyCoupon = async (overrideCode) => {
    const codeToValidate = typeof overrideCode === 'string' ? overrideCode : coupon;
    if (!codeToValidate || !codeToValidate.trim()) return;

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const baseUrl = (
        import.meta.env.VITE_API_URL || "https://thekissancity.com"
      ).replace(/\/$/, "");

      const res = await fetch(`${baseUrl}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToValidate.trim(), orderTotal: totalPrice })
      });
      const data = await res.json();

      if (data.success) {
        setCouponApplied(true);
        const codeUsed = data.coupon?.code || codeToValidate.trim().toUpperCase();
        setAppliedCouponCode(codeUsed);
        setCoupon(codeUsed);
        setCouponError("");
        setDiscountAmt(data.discountAmount);
      } else {
        setCouponApplied(false);
        setAppliedCouponCode("");
        setCouponError(data.message || "Invalid coupon code");
        setDiscountAmt(0);
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Error checking coupon. Please try again.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setAppliedCouponCode("");
    setCoupon("");
    setDiscountAmt(0);
    setCouponError("");
  };

  const handleEditSavedAddress = () => {
    setForm(savedAddress ? { ...savedAddress } : EMPTY_ADDRESS);
    setAddressMode("new");
    setErrors({});
  };

  const handlePlaceOrder = async () => {
    const addressToValidate =
      addressMode === "saved" && savedAddress ? savedAddress : form;

    if (!validateAddress(addressToValidate)) {
      setAddressMode("new");
      requestAnimationFrame(() => {
        addressSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      return;
    }

    if (!paymentMethod) return;

    setPlacingOrder(true);

    try {
      if (addressMode === "new" && saveAsDefault) {
        localStorage.setItem(
          "kissanDefaultAddress",
          JSON.stringify(addressToValidate),
        );
        setSavedAddress(addressToValidate);
      }

      const baseUrl = (
        import.meta.env.VITE_API_URL || "https://thekissancity.com"
      ).replace(/\/$/, "");

      // Save address to user profile in backend if user is logged in
      if (user) {
        const token = localStorage.getItem('kissanUserToken');
        if (token) {
          try {
            await fetch(`${baseUrl}/api/user/address`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(addressToValidate)
            });
          } catch (e) {
            console.error('Failed to save address to profile', e);
          }
        }
      }

      const orderPayload = {
        orderId,
        shippingAddress: addressToValidate,
        items: items.map(item => ({
          product: item.id || item._id, // depending on how id is stored
          name: item.name,
          price: item.price,
          qty: item.qty,
          size: item.selectedSize || item.size || item.packSize || item.pack,
          image: item.img || (item.imgs && item.imgs[0]) || item.image || '/product_ghee.png'
        })),
        paymentMethod,
        totalAmount: finalTotal,
        deliveryCharge,
        discountAmount: discountAmt
      };

      const token = localStorage.getItem('kissanUserToken');
      
      const finalizeOrder = async (paymentDetails = null) => {
        const finalPayload = { ...orderPayload };
        if (paymentDetails) {
          finalPayload.paymentDetails = paymentDetails;
          finalPayload.paymentStatus = 'Paid';
        }

        const orderRes = await fetch(`${baseUrl}/api/orders`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          body: JSON.stringify(finalPayload),
        });

        if (!orderRes.ok) {
          throw new Error('Failed to place order');
        }

        await fetch(`${baseUrl}/api/products/decrement-stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items }),
        });

        clearCart();
        setPlacingOrder(false);
        
        const paymentMethodLabel = PAYMENT_METHODS.find(method => method.id === paymentMethod)?.label || "Online Payment";
        
        navigate("/thank-you", {
          replace: true,
          state: {
            orderData: {
              orderId,
              finalTotal,
              paymentMethodLabel,
              activeAddress: addressToValidate
            }
          }
        });
      };

      if (paymentMethod === 'online') {
        const res = await loadRazorpayScript();
        if (!res) {
          alert('Razorpay SDK failed to load. Are you online?');
          setPlacingOrder(false);
          return;
        }

        const rpOrderRes = await fetch(`${baseUrl}/api/payment/razorpay/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalTotal })
        });
        const rpOrderData = await rpOrderRes.json();

        if (!rpOrderData.success) {
          alert('Server error. Unable to initiate payment.');
          setPlacingOrder(false);
          return;
        }

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: rpOrderData.order.amount,
          currency: rpOrderData.order.currency,
          name: "The Kissan City",
          description: "Organic Product Purchase",
          order_id: rpOrderData.order.id,
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${baseUrl}/api/payment/razorpay/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response)
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                await finalizeOrder(response);
              } else {
                alert('Payment verification failed. Please contact support.');
                setPlacingOrder(false);
              }
            } catch (err) {
              console.error(err);
              alert('Verification error.');
              setPlacingOrder(false);
            }
          },
          prefill: {
            name: addressToValidate.name,
            email: addressToValidate.email || 'customer@kissancity.com',
            contact: addressToValidate.phone
          },
          theme: {
            color: "#16a34a"
          }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response){
          alert(`Payment Failed: ${response.error.description}`);
          setPlacingOrder(false);
        });
        paymentObject.open();

      } else {
        await finalizeOrder();
      }

    } catch (error) {
      console.error("Error placing order:", error);
      alert("Unable to place the order right now. Please try again.");
      setPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="one-checkout-page one-checkout-empty">
        <Navbar />

        <main className="empty-checkout-card">
          <div className="empty-checkout-card__icon">
            <ShoppingCartVisual />
          </div>

          <span className="empty-checkout-card__eyebrow">
            Your cart is empty
          </span>

          <h1>Your cart is waiting for fresh products</h1>

          <p>
            Add your favourite farm-fresh products and return here to securely
            complete your order.
          </p>

          <Link to="/" className="checkout-primary-btn">
            <Leaf size={17} />
            Continue Shopping
          </Link>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="one-checkout-page">
      <Navbar />

      <main className="one-checkout-shell">
        <section className="checkout-intro-strip">
          <div>
            <span className="checkout-intro-strip__eyebrow">
              <Sparkles size={14} /> Fast one-page checkout
            </span>
            <h1>Almost there — complete your order in under 2 minutes</h1>
          </div>
          <div className="checkout-intro-strip__trust">
            <ShieldCheck size={18} />
            <span>
              <strong>Secure checkout</strong>
              <small>Your information stays protected</small>
            </span>
          </div>
        </section>

        <div className="one-checkout-grid">
          <div className="checkout-main-column">
            {authMode !== "address" ? (
              <section className="checkout-section-card checkout-auth-section">
                <SectionHeading
                  number="1"
                  icon={User}
                  title="Secure login"
                  subtitle="Verify your mobile number to continue checkout"
                />

                <div
                  className={`checkout-auth-card ${
                    authMode === "otp" ? "is-otp-mode" : ""
                  }`}
                >
                  <div className="checkout-auth-visual">
                    <span className="checkout-auth-visual__glow" />

                    <div className="checkout-auth-visual__icon">
                      {authMode === "login" ? (
                        <Smartphone size={34} />
                      ) : (
                        <KeyRound size={34} />
                      )}
                    </div>

                    <span className="checkout-auth-visual__eyebrow">
                      <ShieldCheck size={14} /> Secure verification
                    </span>

                    <h3>
                      {authMode === "login"
                        ? "Login without a password"
                        : "Check your messages"}
                    </h3>

                    <p>
                      {authMode === "login"
                        ? "We will send a one-time password to your mobile number for a quick and secure login."
                        : `A 6-digit OTP has been sent to +91 ${mobile}. Enter it to unlock delivery and payment options.`}
                    </p>

                    <div className="checkout-auth-benefits">
                      <span>
                        <CheckCircle2 size={15} /> No password required
                      </span>
                      <span>
                        <CheckCircle2 size={15} /> Secure order updates
                      </span>
                      <span>
                        <CheckCircle2 size={15} /> Takes less than a minute
                      </span>
                    </div>
                  </div>

                  <div className="checkout-auth-form-panel">
                    <div className="checkout-auth-progress">
                      <span className="is-active">1</span>
                      <i className={authMode === "otp" ? "is-complete" : ""} />
                      <span className={authMode === "otp" ? "is-active" : ""}>
                        2
                      </span>
                      <small>Mobile verification</small>
                    </div>

                    {authMode === "login" ? (
                      <form
                        className="checkout-auth-form"
                        onSubmit={handleSendOtp}
                      >
                        <div className="checkout-auth-form__heading">
                          <span className="checkout-auth-form__mini-icon">
                            <Phone size={18} />
                          </span>
                          <div>
                            <h3>Enter your mobile number</h3>
                            <p>We will use this number for login and delivery updates.</p>
                          </div>
                        </div>

                        <label
                          className={`checkout-auth-field ${
                            authError ? "has-error" : ""
                          }`}
                        >
                          <span className="checkout-auth-field__label">
                            Mobile number <em>*</em>
                          </span>
                          <span className="checkout-auth-phone-control">
                            <span className="checkout-auth-country-code">
                              <span>🇮🇳</span> +91
                            </span>
                            <input
                              type="tel"
                              inputMode="numeric"
                              autoComplete="tel"
                              aria-label="Mobile number"
                              placeholder="Enter 10-digit number"
                              value={mobile}
                              onChange={(event) => {
                                setMobile(
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 10),
                                );
                                setAuthError("");
                              }}
                            />
                            {mobile.length === 10 && (
                              <CheckCircle2
                                className="checkout-auth-valid-icon"
                                size={18}
                              />
                            )}
                          </span>
                        </label>

                        {authError && (
                          <div className="checkout-auth-error" role="alert">
                            <span>!</span>
                            {authError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="checkout-auth-submit"
                          disabled={authLoading || mobile.length !== 10}
                        >
                          {authLoading ? (
                            <>
                              <LoaderCircle className="spin" size={20} />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              Continue with OTP
                              <ChevronRight size={19} />
                            </>
                          )}
                        </button>

                        <p className="checkout-auth-privacy">
                          <LockKeyhole size={13} /> Your number is encrypted and
                          never shared with sellers.
                        </p>
                      </form>
                    ) : (
                      <form
                        className="checkout-auth-form checkout-otp-form"
                        onSubmit={handleVerifyOtp}
                      >
                        <button
                          type="button"
                          className="checkout-auth-back-btn"
                          onClick={handleChangeMobile}
                        >
                          <ArrowLeft size={16} /> Change mobile number
                        </button>

                        <div className="checkout-auth-form__heading">
                          <span className="checkout-auth-form__mini-icon">
                            <KeyRound size={18} />
                          </span>
                          <div>
                            <h3>Enter verification code</h3>
                            <p>Use the 6-digit code sent to your mobile.</p>
                          </div>
                        </div>

                        <div className="checkout-otp-number-pill">
                          <Phone size={14} /> +91 {mobile}
                          <button type="button" onClick={handleChangeMobile}>
                            Edit
                          </button>
                        </div>

                        <div
                          className={`checkout-otp-inputs ${
                            authError ? "has-error" : ""
                          }`}
                          onPaste={handleOtpPaste}
                        >
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(element) => {
                                otpInputRefs.current[index] = element;
                              }}
                              type="text"
                              className={digit ? "is-filled" : ""}
                              inputMode="numeric"
                              autoComplete={index === 0 ? "one-time-code" : "off"}
                              aria-label={`OTP digit ${index + 1}`}
                              maxLength={1}
                              value={digit}
                              onChange={(event) =>
                                handleOtpChange(index, event.target.value)
                              }
                              onKeyDown={(event) =>
                                handleOtpKeyDown(event, index)
                              }
                            />
                          ))}
                        </div>

                        <span className="checkout-otp-helper">
                          You can paste the complete 6-digit OTP
                        </span>

                        {authError && (
                          <div className="checkout-auth-error" role="alert">
                            <span>!</span>
                            {authError}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="checkout-auth-submit"
                          disabled={authLoading || otp.join("").length !== 6}
                        >
                          {authLoading ? (
                            <>
                              <LoaderCircle className="spin" size={20} />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <ShieldCheck size={19} />
                              Verify & Continue
                            </>
                          )}
                        </button>

                        <div className="checkout-otp-resend">
                          <span>Didn&apos;t receive the code?</span>
                          {resendTimer > 0 ? (
                            <strong>Resend in 00:{String(resendTimer).padStart(2, "0")}</strong>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={authLoading}
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </section>
            ) : (
              <>
                <section className="checkout-section-card" ref={addressSectionRef}>
                  <SectionHeading
                    number={user ? "1" : "2"}
                    icon={MapPin}
                    title="Delivery details"
                    subtitle="Choose your saved address or add a new one"
                  />

                  {savedAddress && (
                <div className="saved-address-options">
                  <button
                    type="button"
                    className={`saved-address-card ${
                      addressMode === "saved" ? "is-selected" : ""
                    }`}
                    onClick={() => {
                      setAddressMode("saved");
                      setErrors({});
                    }}
                  >
                    <span className="saved-address-card__radio">
                      {addressMode === "saved" && <Check size={13} />}
                    </span>
                    <span className="saved-address-card__body">
                      <span className="saved-address-card__topline">
                        <strong>{savedAddress.name}</strong>
                        <span className="address-type-badge">
                          {savedAddress.addressType || "Home"}
                        </span>
                        <span className="default-address-badge">
                          <BadgeCheck size={13} /> Default
                        </span>
                      </span>
                      <span className="saved-address-card__address">
                        {savedAddress.address}
                        {savedAddress.landmark
                          ? `, ${savedAddress.landmark}`
                          : ""}
                        , {savedAddress.city}, {savedAddress.state} –{" "}
                        {savedAddress.pincode}
                      </span>
                      <span className="saved-address-card__contact">
                        <Phone size={13} /> {savedAddress.phone}
                        {savedAddress.email && (
                          <>
                            <Mail size={13} /> {savedAddress.email}
                          </>
                        )}
                      </span>
                    </span>
                    <span
                      className="saved-address-card__edit"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleEditSavedAddress();
                      }}
                    >
                      <Pencil size={15} /> Edit
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`different-address-btn ${
                      addressMode === "new" ? "is-selected" : ""
                    }`}
                    onClick={() => {
                      setForm(EMPTY_ADDRESS);
                      setAddressMode("new");
                      setErrors({});
                    }}
                  >
                    <Plus size={17} /> Use a different address
                  </button>
                </div>
              )}

              {(!savedAddress || addressMode === "new") && (
                <div className="checkout-address-form">
                  <div className="checkout-form-grid">
                    <CheckoutField
                      label="Full name"
                      required
                      error={errors.name}
                      icon={User}
                    >
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="Name of the receiver"
                        autoComplete="name"
                      />
                    </CheckoutField>

                    <CheckoutField
                      label="Mobile number"
                      required
                      error={errors.phone}
                      icon={Phone}
                    >
                      <div className="phone-field-wrap">
                        <span>+91</span>
                        <input
                          name="phone"
                          value={form.phone}
                          onChange={handleInput}
                          placeholder="10-digit mobile number"
                          inputMode="numeric"
                          autoComplete="tel"
                        />
                      </div>
                    </CheckoutField>

                    <CheckoutField
                      label="Email"
                      hint="Optional — for order updates"
                      error={errors.email}
                      icon={Mail}
                      wide
                    >
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleInput}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                      />
                    </CheckoutField>

                    <CheckoutField
                      label="Pincode"
                      required
                      error={errors.pincode}
                      icon={MapPin}
                    >
                      <input
                        name="pincode"
                        value={form.pincode}
                        onChange={handleInput}
                        placeholder="6-digit pincode"
                        inputMode="numeric"
                        autoComplete="postal-code"
                      />
                    </CheckoutField>

                    <CheckoutField
                      label="City"
                      required
                      error={errors.city}
                      icon={Building2}
                    >
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleInput}
                        placeholder="Your city"
                        autoComplete="address-level2"
                      />
                    </CheckoutField>

                    <CheckoutField
                      label="House / Flat / Street"
                      required
                      error={errors.address}
                      icon={Home}
                      wide
                    >
                      <input
                        name="address"
                        value={form.address}
                        onChange={handleInput}
                        placeholder="House no., building, street or area"
                        autoComplete="street-address"
                      />
                    </CheckoutField>

                    <CheckoutField
                      label="Landmark"
                      hint="Optional"
                      icon={MapPin}
                    >
                      <input
                        name="landmark"
                        value={form.landmark}
                        onChange={handleInput}
                        placeholder="Nearby landmark"
                      />
                    </CheckoutField>

                    <CheckoutField
                      label="State"
                      required
                      error={errors.state}
                      icon={Building2}
                    >
                      <select
                        name="state"
                        value={form.state}
                        onChange={handleInput}
                        autoComplete="address-level1"
                      >
                        <option value="">Select state</option>
                        {STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </CheckoutField>
                  </div>

                  <div className="address-form-footer">
                    <div className="address-type-picker">
                      <span>Address type</span>
                      {[
                        { value: "Home", icon: Home },
                        { value: "Work", icon: Building2 },
                      ].map(({ value, icon: Icon }) => (
                        <button
                          type="button"
                          key={value}
                          className={
                            form.addressType === value ? "is-active" : ""
                          }
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              addressType: value,
                            }))
                          }
                        >
                          <Icon size={15} /> {value}
                        </button>
                      ))}
                    </div>

                    <label className="save-default-checkbox">
                      <input
                        type="checkbox"
                        checked={saveAsDefault}
                        onChange={(event) =>
                          setSaveAsDefault(event.target.checked)
                        }
                      />
                      <span>
                        <Check size={13} />
                      </span>
                      Save as my default address
                    </label>
                  </div>
                </div>
              )}

              {addressMode === "saved" && savedAddress && (
                <div className="delivery-assurance-strip">
                  <Truck size={18} />
                  <div>
                    <strong>Delivery to this address</strong>
                    <span>Estimated arrival in 3–5 business days</span>
                  </div>
                  <span className="delivery-assurance-strip__free">
                    {deliveryCharge === 0
                      ? "FREE delivery"
                      : `₹${deliveryCharge}`}
                  </span>
                </div>
              )}
            </section>

            <section className="checkout-section-card">
              <SectionHeading
                number="2"
                icon={WalletCards}
                title="Choose payment method"
                subtitle="Select one option — no unnecessary forms"
              />

              <div className="payment-method-grid">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const selected = paymentMethod === method.id;

                  return (
                    <button
                      type="button"
                      key={method.id}
                      className={`payment-method-card ${
                        selected ? "is-selected" : ""
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <span className="payment-method-card__radio">
                        {selected && <Check size={13} />}
                      </span>
                      <span className="payment-method-card__icon">
                        <Icon size={21} />
                      </span>
                      <span className="payment-method-card__copy">
                        <span>
                          <strong>{method.label}</strong>
                          {method.badge && <em>{method.badge}</em>}
                        </span>
                        <small>{method.desc}</small>
                      </span>
                    </button>
                  );
                })}
                <div className={`selected-payment-note ${paymentMethod}`}>
                  {paymentMethod === "online" && (
                    <>
                      <CreditCard size={19} />
                      <div>
                        <strong>Secure Online Payment</strong>
                        <span>
                          Pay securely using UPI, Card, or NetBanking via Razorpay.
                        </span>
                      </div>
                    </>
                  )}
                  {paymentMethod === "cod" && (
                    <>
                      <Banknote size={19} />
                      <div>
                        <strong>Cash on delivery</strong>
                        <span>
                          Pay in cash to our delivery partner when you receive
                          your order.
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="checkout-place-order-wrap">
                {user ? (
                  <button
                    type="button"
                    className="checkout-place-order-btn"
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                  >
                    {placingOrder ? (
                      <>
                        <LoaderCircle className="spin" size={20} /> Processing...
                      </>
                    ) : paymentMethod === "cod" ? (
                      <>
                        <Package size={20} /> Place COD Order
                      </>
                    ) : (
                      <>
                        <LockKeyhole size={20} /> Pay ₹
                        {finalTotal.toLocaleString()} Securely
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="checkout-place-order-btn"
                    disabled
                  >
                    Login to Place Order
                  </button>
                )}
                <p>
                  <ShieldCheck size={14} /> By placing this order, you agree to
                  our delivery and return policy.
                </p>
              </div>
            </section>

            <section className="checkout-confidence-card">
              {[
                {
                  icon: ShieldCheck,
                  title: "Secure payment",
                  text: "Protected checkout experience",
                },
                {
                  icon: Truck,
                  title: "Fast delivery",
                  text: "Carefully packed farm products",
                },
                {
                  icon: RotateCcw,
                  title: "Easy support",
                  text: "7-day return assistance",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <span>
                    <Icon size={20} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <small>{text}</small>
                  </div>
                </div>
              ))}
            </section>
          </>
          )}
          </div>

          <aside className="checkout-summary-column">
            <div className="checkout-summary-card">
              <div className="checkout-summary-card__header">
                <div>
                  <span>Order summary</span>
                  <small>
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </small>
                </div>
                <strong>₹{finalTotal.toLocaleString()}</strong>
              </div>

              <div className="checkout-items-list">
                {items.map((item, index) => {
                  const itemImage =
                    item.img ||
                    item.imgs?.[0] ||
                    item.image ||
                    "/product_ghee.png";
                  const quantity = Number(item.qty || 1);
                  const lineTotal = Math.round((Number(item.price) || 0) * quantity);

                  return (
                    <div
                      className="checkout-summary-item"
                      key={item.id || item._id || `${item.name}-${index}`}
                    >
                      <div className="checkout-summary-item__image">
                        <img src={itemImage} alt={item.name} />
                        <span>{quantity}</span>
                      </div>
                      <div className="checkout-summary-item__copy">
                        <strong>{item.name}</strong>
                        {item.selectedSize && <span>{item.selectedSize}</span>}
                      </div>
                      <strong className="checkout-summary-item__price">
                        ₹{lineTotal.toLocaleString()}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-coupon-box">
                <button
                  type="button"
                  className="checkout-coupon-toggle"
                  onClick={() => setShowCoupon((current) => !current)}
                >
                  <span>
                    <Tag size={16} /> Have a coupon? {availableCoupons.length > 0 && <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', marginLeft: '6px' }}>{availableCoupons.length} AVAILABLE</span>}
                  </span>
                  <ChevronDown
                    size={17}
                    className={showCoupon ? "is-open" : ""}
                  />
                </button>

                {showCoupon && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="checkout-coupon-form">
                      <div>
                        <Tag size={15} />
                        <input
                          value={coupon}
                          onChange={(event) => {
                            setCoupon(event.target.value);
                            setCouponError("");
                          }}
                          placeholder="Enter coupon code"
                          style={{ textTransform: 'uppercase' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        disabled={validatingCoupon || !coupon.trim()}
                      >
                        {validatingCoupon ? "..." : "Apply"}
                      </button>
                    </div>

                    {availableCoupons.length > 0 && !couponApplied && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <small style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Available Store Coupons:
                        </small>
                        {availableCoupons.map((c) => {
                          const offerText = c.discountType === 'percentage'
                            ? `${c.discountValue}% OFF`
                            : `₹${c.discountValue} Flat OFF`;

                          return (
                            <div
                              key={c._id || c.code}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: '#f0fdf4',
                                border: '1.5px dashed #bbf7d0',
                                borderRadius: '10px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ background: '#16a34a', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                                  {c.code}
                                </span>
                                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#15803d' }}>
                                  {offerText}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(c.code)}
                                disabled={validatingCoupon}
                                style={{
                                  background: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                Apply
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {couponApplied && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '10px', marginTop: '12px' }}>
                    <p className="coupon-success" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d', fontWeight: 700, fontSize: '0.88rem' }}>
                      <CheckCircle2 size={16} /> <strong>{appliedCouponCode}</strong> applied — saved ₹{discountAmt}!
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="coupon-error" style={{ color: '#dc2626', fontSize: '0.82rem', marginTop: '8px', fontWeight: 600 }}>{couponError}</p>}
              </div>

              <div className="checkout-price-breakdown">
                <PriceRow
                  label="Subtotal"
                  value={`₹${totalPrice.toLocaleString()}`}
                />
                {couponApplied && (
                  <PriceRow
                    label="Coupon discount"
                    value={`− ₹${discountAmt.toLocaleString()}`}
                    positive
                  />
                )}
                <PriceRow
                  label="Delivery"
                  value={
                    deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge.toLocaleString()}`
                  }
                  positive={deliveryCharge === 0}
                />
              </div>

              <div className="checkout-total-row">
                <div>
                  <strong>Total payable</strong>
                  <span>Inclusive of all taxes</span>
                </div>
                <strong>₹{finalTotal.toLocaleString()}</strong>
              </div>

              {discountAmt > 0 && (
                <div className="checkout-savings-note">
                  <CircleDollarSign size={17} /> You are saving ₹
                  {discountAmt.toLocaleString()} on this order
                </div>
              )}

              <div className="checkout-summary-trust">
                <ShieldCheck size={16} />
                <span>
                  <strong>Safe and secure checkout</strong>
                  <small>No hidden charges at the final step</small>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />

      <div className="checkout-mobile-paybar">
        <div>
          <span>Total payable</span>
          <strong>₹{finalTotal.toLocaleString()}</strong>
        </div>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placingOrder || !user}
        >
          {placingOrder ? (
            <>
              <LoaderCircle className="spin" size={17} />
              Processing...
            </>
          ) : !user ? (
            <>
              Login to Continue
              <LockKeyhole size={17} />
            </>
          ) : (
            <>
              Place Order
              <ChevronRight size={17} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ShoppingCartVisual() {
  return (
    <div className="empty-checkout-visual">
      <Package size={42} />
      <span>
        <Leaf size={17} />
      </span>
    </div>
  );
}

function SectionHeading({ number, icon: Icon, title, subtitle }) {
  return (
    <div className="checkout-section-heading">
      <span className="checkout-section-heading__number">{number}</span>
      <span className="checkout-section-heading__icon">
        <Icon size={20} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function CheckoutField({
  label,
  required = false,
  hint,
  error,
  icon: Icon,
  wide = false,
  children,
}) {
  return (
    <label
      className={`checkout-field ${wide ? "checkout-field--wide" : ""} ${
        error ? "has-error" : ""
      }`}
    >
      <span className="checkout-field__label">
        {label} {required && <em>*</em>}
        {hint && <small>{hint}</small>}
      </span>
      <span className="checkout-field__control">
        {Icon && <Icon size={16} />}
        {children}
      </span>
      {error && <span className="checkout-field__error">{error}</span>}
    </label>
  );
}

function PriceRow({ label, value, positive = false }) {
  return (
    <div className="checkout-price-row">
      <span>{label}</span>
      <strong className={positive ? "is-positive" : ""}>{value}</strong>
    </div>
  );
}