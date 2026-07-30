import React, { useMemo } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Leaf,
  ListChecks,
  MapPin,
  PackageCheck,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import Navbar from "../components/Navbar";
import "./ThankYouPage.css";

const OrderDetail = ({ icon: Icon, label, value, variant }) => {
  return (
    <div
      className={`thankyou-order-detail ${
        variant ? `thankyou-order-detail--${variant}` : ""
      }`}
    >
      <div className="thankyou-order-detail__icon">
        <Icon size={19} />
      </div>

      <div className="thankyou-order-detail__content">
        <span>{label}</span>
        <strong title={value}>{value}</strong>
      </div>
    </div>
  );
};

export default function ThankYouPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const orderData = location.state?.orderData;

  const confettiPieces = useMemo(() => {
    const confettiColors = [
      "#0b8f3f",
      "#19ad54",
      "#39c96c",
      "#77d98c",
      "#b8df66",
      "#d8eb8c",
      "#145c32",
    ];

    return Array.from({ length: 75 }, (_, index) => ({
      id: index,
      left: `${(index * 41) % 100}%`,
      delay: `${-((index * 13) % 90) / 10}s`,
      duration: `${5.2 + (index % 7) * 0.55}s`,
      size: `${6 + (index % 4) * 2}px`,
      rotation: `${(index * 57) % 360}deg`,
      drift: `${-45 + ((index * 29) % 90)}px`,
      color: confettiColors[index % confettiColors.length],
      shape:
        index % 4 === 0
          ? "circle"
          : index % 3 === 0
            ? "strip"
            : "square",
    }));
  }, []);

  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const {
    orderId,
    finalTotal,
    paymentMethodLabel,
    activeAddress,
  } = orderData;

  const customerName =
    activeAddress?.name?.trim() || "Kisaan Friend";

  const customerPhone =
    activeAddress?.phone || "your registered number";

  const formattedTotal = Number(finalTotal || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

  const addressParts = [
    activeAddress?.address,
    activeAddress?.landmark,
    activeAddress?.city,
    activeAddress?.state,
    activeAddress?.pincode,
  ].filter(Boolean);

  const completeAddress =
    addressParts.length > 0
      ? addressParts.join(", ")
      : "Your selected delivery address";

  const handleViewOrders = () => {
    if (orderId) {
      localStorage.setItem("trackOrderId", orderId);
    }

    navigate("/user/dashboard", {
      state: {
        activeTab: "shipment",
      },
    });
  };

  return (
    <div className="thankyou-page">
      <Navbar />

      <main className="thankyou-main">
        <div
          className="thankyou-confetti"
          aria-hidden="true"
        >
          {confettiPieces.map((piece) => (
            <span
              key={piece.id}
              className={`thankyou-confetti__piece thankyou-confetti__piece--${piece.shape}`}
              style={{
                "--confetti-left": piece.left,
                "--confetti-delay": piece.delay,
                "--confetti-duration": piece.duration,
                "--confetti-size": piece.size,
                "--confetti-rotation": piece.rotation,
                "--confetti-drift": piece.drift,
                "--confetti-color": piece.color,
              }}
            />
          ))}
        </div>

        <div className="thankyou-background-decoration">
          <span className="thankyou-background-decoration__circle thankyou-background-decoration__circle--one" />
          <span className="thankyou-background-decoration__circle thankyou-background-decoration__circle--two" />
          <span className="thankyou-background-decoration__circle thankyou-background-decoration__circle--three" />

          <Leaf
            size={55}
            className="thankyou-background-decoration__leaf thankyou-background-decoration__leaf--one"
          />

          <Leaf
            size={43}
            className="thankyou-background-decoration__leaf thankyou-background-decoration__leaf--two"
          />
        </div>

        <div className="thankyou-container">
          <section className="thankyou-hero">
            <div className="thankyou-success-animation">
              <div className="thankyou-success-animation__ring thankyou-success-animation__ring--outer" />

              <div className="thankyou-success-animation__ring thankyou-success-animation__ring--middle" />

              <div className="thankyou-success-animation__circle">
                <Check size={55} strokeWidth={2.5} />
              </div>

              <span className="thankyou-success-animation__spark thankyou-success-animation__spark--one">
                <Sparkles size={15} />
              </span>

              <span className="thankyou-success-animation__spark thankyou-success-animation__spark--two">
                <Sparkles size={13} />
              </span>
            </div>

            <div className="thankyou-confirmed-badge">
              <CheckCircle2 size={16} />
              Order confirmed
            </div>

            <h1>
              Thank <span>You!</span>
            </h1>

            <p className="thankyou-hero__subtitle">
              Your order has been successfully placed.
            </p>

            <p className="thankyou-hero__description">
              Thank you, <strong>{customerName}</strong>. We have
              received your order and our team will start preparing
              your fresh products with care.
            </p>

            <div className="thankyou-reference">
              <div className="thankyou-reference__icon">
                <ReceiptText size={20} />
              </div>

              <div className="thankyou-reference__content">
                <span>Your order reference</span>
                <strong>#{orderId || "Processing"}</strong>
              </div>

              <div className="thankyou-reference__status">
                <span />
                Confirmed
              </div>
            </div>
          </section>

          <section className="thankyou-next-card">
            <div className="thankyou-next-card__decoration">
              <Leaf size={100} />
            </div>

            <div className="thankyou-next-card__heading">
              <span>Order information</span>
              <h2>What’s next?</h2>

              <p>
                We have received your order and will begin processing
                it immediately. Delivery updates will be sent to{" "}
                <strong>{customerPhone}</strong>.
              </p>
            </div>

            <div className="thankyou-order-grid">
              <OrderDetail
                icon={ReceiptText}
                label="Order ID"
                value={`#${orderId || "Processing"}`}
                variant="green"
              />

              <OrderDetail
                icon={CreditCard}
                label="Order Total"
                value={`₹${formattedTotal}`}
                variant="gold"
              />

              <OrderDetail
                icon={ShieldCheck}
                label="Payment"
                value={
                  paymentMethodLabel || "Online Payment"
                }
                variant="blue"
              />

              <OrderDetail
                icon={CalendarClock}
                label="Estimated Delivery"
                value="3–5 business days"
                variant="purple"
              />
            </div>

            <div className="thankyou-delivery-card">
              <div className="thankyou-delivery-card__icon">
                <MapPin size={23} />
              </div>

              <div className="thankyou-delivery-card__content">
                <div className="thankyou-delivery-card__heading">
                  <div>
                    <span>Delivery address</span>
                    <h3>Delivering to {customerName}</h3>
                  </div>

                  <div className="thankyou-delivery-card__badge">
                    <Truck size={14} />
                    Home delivery
                  </div>
                </div>

                <p>{completeAddress}</p>
              </div>
            </div>

            <div className="thankyou-process">
              <div className="thankyou-process__item is-active">
                <div className="thankyou-process__icon">
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <strong>Order received</strong>
                  <span>Successfully confirmed</span>
                </div>
              </div>

              <div className="thankyou-process__line is-active" />

              <div className="thankyou-process__item">
                <div className="thankyou-process__icon">
                  <PackageCheck size={18} />
                </div>

                <div>
                  <strong>Freshly packed</strong>
                  <span>Careful quality checking</span>
                </div>
              </div>

              <div className="thankyou-process__line" />

              <div className="thankyou-process__item">
                <div className="thankyou-process__icon">
                  <Truck size={18} />
                </div>

                <div>
                  <strong>Delivered</strong>
                  <span>At your doorstep</span>
                </div>
              </div>
            </div>

            <div className="thankyou-actions">
              <button
                type="button"
                className="thankyou-secondary-button"
                onClick={handleViewOrders}
              >
                <ListChecks size={18} />
                View My Orders
                <ChevronRight size={17} />
              </button>

              <Link
                to="/"
                className="thankyou-primary-button"
              >
                <ShoppingBag size={18} />
                Continue Shopping
                <ChevronRight size={17} />
              </Link>
            </div>

            <div className="thankyou-security-note">
              <ShieldCheck size={17} />

              <span>
                Your order and payment details are completely secure.
              </span>
            </div>
          </section>

          <section className="thankyou-farm-note">
            <div className="thankyou-farm-note__icon">
              <Leaf size={24} />
            </div>

            <div>
              <span>From farm to your home</span>
              <h3>Fresh goodness is being prepared for you</h3>

              <p>
                Each product is carefully checked and packed before
                leaving The Kissan City.
              </p>
            </div>

            <div className="thankyou-farm-note__status">
              <span />
              Preparation starting soon
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}