import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  Leaf,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Truck,
  Warehouse,
} from "lucide-react";
import "./TrackOrderPage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const getStatusStep = (status = "") => {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus.includes("delivered") ||
    normalizedStatus.includes("complete")
  ) {
    return 4;
  }

  if (
    normalizedStatus.includes("out for delivery") ||
    normalizedStatus.includes("out_for_delivery")
  ) {
    return 3;
  }

  if (
    normalizedStatus.includes("shipped") ||
    normalizedStatus.includes("transit") ||
    normalizedStatus.includes("dispatch")
  ) {
    return 2;
  }

  if (
    normalizedStatus.includes("packed") ||
    normalizedStatus.includes("processing")
  ) {
    return 1;
  }

  return 0;
};

const formatCurrency = (value) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return value || "Not available";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const TrackOrderPage = () => {
  const [formData, setFormData] = useState({
    orderId: "",
    phone: "",
  });

  const [trackingResult, setTrackingResult] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const handleTrackOrder = async (event) => {
    event.preventDefault();

    if (!formData.orderId.trim() || !formData.phone.trim()) {
      setErrorMessage("Please enter your order ID and phone number.");
      return;
    }

    try {
      setTracking(true);
      setErrorMessage("");
      setTrackingResult(null);

      const baseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5005"
      ).replace(/\/$/, "");

      const query = new URLSearchParams({
        orderId: formData.orderId.trim(),
        phone: formData.phone.trim(),
      });

      const response = await fetch(
        `${baseUrl}/api/orders/track?${query.toString()}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Order not found. Please check your order ID and phone number."
        );
      }

      const order = data.order || data.data || data;

      setTrackingResult({
        orderId:
          order.orderId ||
          order.orderNumber ||
          order._id ||
          formData.orderId.trim(),
        status: order.status || "Order Confirmed",
        customerName:
          order.customerName ||
          order.user?.name ||
          order.shippingAddress?.name ||
          "Customer",
        phone:
          order.phone ||
          order.user?.phone ||
          order.shippingAddress?.phone ||
          formData.phone.trim(),
        amount:
          order.totalAmount ||
          order.total ||
          order.grandTotal ||
          order.amount ||
          "",
        paymentMethod:
          order.paymentMethod ||
          order.payment?.method ||
          order.paymentType ||
          "Not available",
        estimatedDelivery:
          order.estimatedDelivery ||
          order.expectedDelivery ||
          order.deliveryDate ||
          "Will be updated soon",
        address:
          order.shippingAddress?.fullAddress ||
          order.shippingAddress?.address ||
          order.deliveryAddress ||
          "Delivery address available with the order",
        createdAt: order.createdAt || order.orderDate || "",
      });
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Unable to track this order right now. Please try again."
      );
    } finally {
      setTracking(false);
    }
  };

  const currentStep = trackingResult
    ? getStatusStep(trackingResult.status)
    : 0;

  const trackingSteps = [
    {
      title: "Order Confirmed",
      description: "Your order has been successfully placed.",
      icon: CheckCircle2,
    },
    {
      title: "Packed",
      description: "Your order is being prepared for dispatch.",
      icon: Warehouse,
    },
    {
      title: "Shipped",
      description: "Your package is moving through the courier network.",
      icon: Truck,
    },
    {
      title: "Out for Delivery",
      description: "The delivery partner is bringing your order.",
      icon: MapPin,
    },
    {
      title: "Delivered",
      description: "Your order has been delivered successfully.",
      icon: PackageCheck,
    },
  ];

  return (
    <>
    <Navbar />
    <main className="track-page">
      <section className="track-hero">
        <div className="track-hero__shape track-hero__shape--one" />
        <div className="track-hero__shape track-hero__shape--two" />

        <div className="track-container">
          <div className="track-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Track Order</strong>
          </div>

          <div className="track-hero__grid">
            <div className="track-hero__content">
              <div className="track-eyebrow">
                <Leaf size={17} />
                Real-time order updates
              </div>

              <h1>
                Track Your <span>Order</span>
              </h1>

              <p>
                Enter your order ID and registered phone number to check your
                current order and delivery status.
              </p>

              <div className="track-hero__features">
                <div>
                  <CheckCircle2 size={18} />
                  Quick status check
                </div>

                <div>
                  <Truck size={18} />
                  Delivery updates
                </div>

                <div>
                  <Headphones size={18} />
                  Support assistance
                </div>
              </div>
            </div>

            <div className="track-hero__visual">
              <div className="track-package-card">
                <div className="track-package-card__icon">
                  <Package size={44} />
                </div>

                <span>Order Tracking</span>
                <h2>Know where your order is</h2>

                <p>
                  Check every important stage, from order confirmation to final
                  delivery.
                </p>

                <div className="track-package-card__route">
                  <div>
                    <CheckCircle2 size={15} />
                  </div>

                  <span />

                  <div>
                    <Truck size={15} />
                  </div>

                  <span />

                  <div>
                    <MapPin size={15} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="track-content-section">
        <div className="track-container">
          <div className="track-search-layout">
            <form className="track-search-card" onSubmit={handleTrackOrder}>
              <div className="track-search-card__header">
                <div className="track-search-card__header-icon">
                  <Search size={23} />
                </div>

                <div>
                  <span>Find your order</span>
                  <h2>Enter Tracking Details</h2>
                  <p>
                    Use the same phone number provided while placing the order.
                  </p>
                </div>
              </div>

              <div className="track-form-field">
                <label htmlFor="track-order-id">
                  Order ID <span>*</span>
                </label>

                <div className="track-input-wrapper">
                  <Package size={19} />

                  <input
                    id="track-order-id"
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    placeholder="Example: KC123456"
                  />
                </div>
              </div>

              <div className="track-form-field">
                <label htmlFor="track-phone">
                  Registered phone number <span>*</span>
                </label>

                <div className="track-input-wrapper">
                  <Headphones size={19} />

                  <input
                    id="track-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter registered phone number"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="track-error-message">
                  <AlertCircle size={18} />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="track-submit-button"
                disabled={tracking}
              >
                {tracking ? (
                  <>
                    <span className="track-button-loader" />
                    Finding your order...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Track My Order
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="track-search-card__help">
                <Clock3 size={17} />
                Tracking information may take a few hours to update after
                dispatch.
              </div>
            </form>

            <div className="track-result-area">
              {!trackingResult ? (
                <div className="track-empty-card">
                  <div className="track-empty-card__illustration">
                    <Package size={54} />
                  </div>

                  <h2>Your tracking information will appear here</h2>

                  <p>
                    Enter your order ID and registered phone number to view your
                    order status and delivery progress.
                  </p>

                  <div className="track-empty-features">
                    <div>
                      <CheckCircle2 size={18} />
                      Order confirmation
                    </div>

                    <div>
                      <Truck size={18} />
                      Shipping progress
                    </div>

                    <div>
                      <MapPin size={18} />
                      Delivery status
                    </div>
                  </div>
                </div>
              ) : (
                <div className="track-result-card">
                  <div className="track-result-card__top">
                    <div>
                      <span>Tracking order</span>
                      <h2>#{trackingResult.orderId}</h2>
                    </div>

                    <div className="track-status-badge">
                      <span />
                      {trackingResult.status}
                    </div>
                  </div>

                  <div className="track-order-information">
                    <div>
                      <span>Customer</span>
                      <strong>{trackingResult.customerName}</strong>
                    </div>

                    <div>
                      <span>Order amount</span>
                      <strong>{formatCurrency(trackingResult.amount)}</strong>
                    </div>

                    <div>
                      <span>Payment method</span>
                      <strong>{trackingResult.paymentMethod}</strong>
                    </div>

                    <div>
                      <span>Estimated delivery</span>
                      <strong>{trackingResult.estimatedDelivery}</strong>
                    </div>
                  </div>

                  <div className="track-timeline">
                    {trackingSteps.map((step, index) => {
                      const StepIcon = step.icon;
                      const isCompleted = index <= currentStep;
                      const isCurrent = index === currentStep;

                      return (
                        <div
                          className={`track-timeline__item ${
                            isCompleted ? "is-completed" : ""
                          } ${isCurrent ? "is-current" : ""}`}
                          key={step.title}
                        >
                          <div className="track-timeline__indicator">
                            <div className="track-timeline__icon">
                              <StepIcon size={18} />
                            </div>

                            {index < trackingSteps.length - 1 && (
                              <div className="track-timeline__line" />
                            )}
                          </div>

                          <div className="track-timeline__content">
                            <span>
                              {isCurrent
                                ? "Current status"
                                : isCompleted
                                  ? "Completed"
                                  : "Upcoming"}
                            </span>

                            <h3>{step.title}</h3>
                            <p>{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="track-address-card">
                    <div className="track-address-card__icon">
                      <MapPin size={22} />
                    </div>

                    <div>
                      <span>Delivery address</span>
                      <p>{trackingResult.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="track-help-banner">
            <div className="track-help-banner__icon">
              <Headphones size={29} />
            </div>

            <div>
              <span>Unable to find your order?</span>
              <h3>Contact our customer support team.</h3>
              <p>
                Keep your registered phone number and payment details ready.
              </p>
            </div>

            <Link to="/contact" className="track-help-button">
              Contact Support
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
};

export default TrackOrderPage;