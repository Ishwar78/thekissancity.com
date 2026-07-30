import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Navigation,
  Package,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import "./UserShipmentTab.css";

const trackingSteps = [
  {
    status: "pending",
    title: "Order Placed",
    description: "We have received your order",
    icon: CheckCircle2,
  },
  {
    status: "processing",
    title: "Processing",
    description: "Your order is being prepared",
    icon: Package,
  },
  {
    status: "shipped",
    title: "Shipped",
    description: "Your package is on the way",
    icon: Truck,
  },
  {
    status: "delivered",
    title: "Delivered",
    description: "Package delivered successfully",
    icon: CheckCircle2,
  },
];

const statusDetails = {
  pending: {
    label: "Order Placed",
    message: "Your order has been successfully received.",
    icon: Clock3,
  },
  processing: {
    label: "Processing",
    message: "Your order is currently being prepared.",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    message: "Your package is on the way to you.",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    message: "Your package has been delivered successfully.",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    message: "This order has been cancelled.",
    icon: AlertCircle,
  },
};

export default function UserShipmentTab() {
  const [searchInput, setSearchInput] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTrackId = localStorage.getItem("trackOrderId");

    if (savedTrackId) {
      setSearchInput(savedTrackId);
      trackOrder(savedTrackId);
      localStorage.removeItem("trackOrderId");
    }
  }, []);

  const trackOrder = async (orderIdToTrack) => {
    const trackingId =
      typeof orderIdToTrack === "string"
        ? orderIdToTrack.trim()
        : searchInput.trim();

    if (!trackingId) {
      setError("Please enter a valid Order ID.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const baseUrl = (
        import.meta.env.VITE_API_URL || "https://thekissancity.com"
      ).replace(/\/$/, "");

      const response = await fetch(
        `${baseUrl}/api/orders/track/${encodeURIComponent(trackingId)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.order) {
        throw new Error(
          data?.message || "Order not found. Please check your Order ID."
        );
      }

      setOrder(data.order);
    } catch (err) {
      console.error("Shipment tracking error:", err);

      setError(
        err.message ||
          "Unable to track shipment right now. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    trackOrder();
  };

  const resetTracking = () => {
    setOrder(null);
    setError("");
    setSearchInput("");
    setCopied(false);
  };

  const copyOrderId = async () => {
    if (!order?.orderId) return;

    try {
      await navigator.clipboard.writeText(order.orderId);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error("Unable to copy order ID:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) {
      return "Not available";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  const getAddress = () => {
    const address = order?.shippingAddress || {};

    return [
      address.address,
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getTotalItems = () => {
    if (!Array.isArray(order?.items)) return null;

    return order.items.reduce(
      (total, item) => total + Number(item?.qty || 0),
      0
    );
  };

  const currentStatus = order?.status || "pending";
  const currentStatusData =
    statusDetails[currentStatus] || statusDetails.pending;
  const CurrentStatusIcon = currentStatusData.icon;

  const currentStepIndex = Math.max(
    trackingSteps.findIndex((step) => step.status === currentStatus),
    0
  );

  const progressWidth =
    currentStatus === "delivered"
      ? 100
      : (currentStepIndex / (trackingSteps.length - 1)) * 100;

  return (
    <div className="user-shipment">
      <section className="shipment-hero">
        <div className="shipment-hero-decoration shipment-decoration-one" />
        <div className="shipment-hero-decoration shipment-decoration-two" />

        <div className="shipment-hero-content">
          <div className="shipment-hero-icon">
            <Navigation size={27} />
          </div>

          <div>
            <span className="shipment-eyebrow">Live Order Tracking</span>
            <h2>Track Your Shipment</h2>
            <p>
              Enter your Order ID to check the latest delivery status and
              shipment information.
            </p>
          </div>
        </div>
      </section>

      <form className="shipment-search-card" onSubmit={handleSubmit}>
        <div className="shipment-search-field">
          <Search size={20} />

          <input
            type="text"
            placeholder="Enter your Order ID, e.g. KC123456"
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              if (error) setError("");
            }}
            autoComplete="off"
          />

          {searchInput && !loading && (
            <button
              type="button"
              className="shipment-input-clear"
              onClick={() => setSearchInput("")}
              aria-label="Clear Order ID"
            >
              ×
            </button>
          )}
        </div>

        <button
          type="submit"
          className="shipment-track-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="shipment-spin" />
              Tracking...
            </>
          ) : (
            <>
              <Search size={18} />
              Track Order
            </>
          )}
        </button>
      </form>

      {loading && (
        <div className="shipment-state-card shipment-loading-state">
          <div className="shipment-state-icon">
            <Loader2 size={30} className="shipment-spin" />
          </div>

          <h3>Locating your shipment</h3>
          <p>Please wait while we fetch the latest order information.</p>
        </div>
      )}

      {error && !loading && (
        <div className="shipment-error-card">
          <div className="shipment-error-icon">
            <AlertCircle size={23} />
          </div>

          <div className="shipment-error-content">
            <strong>Unable to track this order</strong>
            <p>{error}</p>
          </div>

          <button type="button" onClick={() => trackOrder()}>
            <RotateCcw size={16} />
            Try Again
          </button>
        </div>
      )}

      {!order && !loading && !error && (
        <div className="shipment-help-card">
          <div className="shipment-help-icon">
            <Package size={25} />
          </div>

          <div>
            <h3>Where can I find my Order ID?</h3>
            <p>
              Your Order ID is available in your order confirmation message,
              invoice or My Orders section.
            </p>
          </div>

          <div className="shipment-secure-label">
            <ShieldCheck size={16} />
            Secure tracking
          </div>
        </div>
      )}

      {order && !loading && (
        <section className="shipment-result-card">
          <div className="shipment-result-accent" />

          <header className="shipment-order-header">
            <div className="shipment-order-heading">
              <div className="shipment-order-icon">
                <Package size={24} />
              </div>

              <div>
                <span className="shipment-order-label">Order Number</span>

                <div className="shipment-order-number">
                  <h3>{order.orderId || "Order ID unavailable"}</h3>

                  {order.orderId && (
                    <button
                      type="button"
                      onClick={copyOrderId}
                      className={copied ? "copied" : ""}
                      aria-label="Copy Order ID"
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  )}
                </div>

                <p>
                  Placed on {formatDate(order.createdAt)}
                  {getTotalItems() !== null
                    ? ` • ${getTotalItems()} ${
                        getTotalItems() === 1 ? "item" : "items"
                      }`
                    : ""}
                </p>
              </div>
            </div>

            <div className={`shipment-status-badge status-${currentStatus}`}>
              <CurrentStatusIcon size={17} />
              <span>{currentStatusData.label}</span>
            </div>
          </header>

          {currentStatus !== "cancelled" ? (
            <>
              <div className={`shipment-current-status status-${currentStatus}`}>
                <div className="shipment-current-icon">
                  <CurrentStatusIcon size={23} />
                </div>

                <div>
                  <span>Current shipment status</span>
                  <h4>{order.statusText || currentStatusData.label}</h4>
                  <p>{currentStatusData.message}</p>
                </div>
              </div>

              <div className="shipment-tracker">
                <div className="shipment-tracker-line">
                  <div
                    className="shipment-tracker-progress"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>

                {trackingSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isDelivered = currentStatus === "delivered";
                  const isCompleted = isDelivered || index < currentStepIndex;
                  const isActive =
                    index === currentStepIndex && !isDelivered;

                  return (
                    <div
                      key={step.status}
                      className={[
                        "shipment-tracker-step",
                        isCompleted ? "completed" : "",
                        isActive ? "active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="shipment-step-marker">
                        {isCompleted ? (
                          <Check size={19} />
                        ) : (
                          <StepIcon size={18} />
                        )}
                      </div>

                      <div className="shipment-step-content">
                        <strong>{step.title}</strong>
                        <span>{step.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="shipment-cancelled-panel">
              <div>
                <AlertCircle size={28} />
              </div>

              <section>
                <h4>Order Cancelled</h4>
                <p>
                  This order has been cancelled and will not be processed for
                  delivery.
                </p>
              </section>
            </div>
          )}

          <div className="shipment-details-section">
            <div className="shipment-section-heading">
              <div>
                <span>Order information</span>
                <h3>Shipment Details</h3>
              </div>

              <button type="button" onClick={resetTracking}>
                <RotateCcw size={15} />
                Track Another Order
              </button>
            </div>

            <div className="shipment-details-grid">
              <article className="shipment-detail-item">
                <div className="shipment-detail-icon detail-calendar">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <span>Order Date</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>
              </article>

              <article className="shipment-detail-item">
                <div className="shipment-detail-icon detail-user">
                  <UserRound size={20} />
                </div>

                <div>
                  <span>Customer Name</span>
                  <strong>
                    {order.shippingAddress?.name || "Not available"}
                  </strong>
                </div>
              </article>

              <article className="shipment-detail-item">
                <div className="shipment-detail-icon detail-phone">
                  <Phone size={20} />
                </div>

                <div>
                  <span>Mobile Number</span>
                  <strong>
                    {order.shippingAddress?.phone || "Not available"}
                  </strong>
                </div>
              </article>

              <article className="shipment-detail-item">
                <div className="shipment-detail-icon detail-payment">
                  <CreditCard size={20} />
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>
                    {order.paymentMethod?.toUpperCase() || "Not available"}
                  </strong>

                  {order.totalAmount !== undefined && (
                    <small>{formatCurrency(order.totalAmount)}</small>
                  )}
                </div>
              </article>

              <article className="shipment-detail-item shipment-address-item">
                <div className="shipment-detail-icon detail-location">
                  <MapPin size={20} />
                </div>

                <div>
                  <span>Delivery Address</span>
                  <strong>{getAddress() || "Address not available"}</strong>
                </div>
              </article>
            </div>
          </div>

          <footer className="shipment-result-footer">
            <ShieldCheck size={17} />
            <p>
              Shipment information is securely fetched using your Order ID.
            </p>
          </footer>
        </section>
      )}
    </div>
  );
}