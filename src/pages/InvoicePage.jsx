import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  LoaderCircle,
  MapPin,
  Package,
  Phone,
  Printer,
  ReceiptText,
  ShieldCheck,
  Truck,
} from "lucide-react";
import "./InvoicePage.css";

const LOGO_PATH = "/kissancitylogo.jpg";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5005"
).replace(/\/$/, "");

export default function InvoicePage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "The Kissan City",
    companyAddressLine1: "Rohtak Road, Near Bus Stand",
    companyAddressLine2: "Rohtak, Haryana - 124001",
    companyGstin: "06AAAAA0000A1Z5",
    companyInvoiceEmail: "connect@thekissancity.com",
    companyInvoicePhone: "+91 8295780500",
    companyInvoiceFooterNote: "Fresh products. Honest sourcing. Trusted delivery."
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/contact-info`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.contactInfo) {
          setCompanyInfo((prev) => ({
            ...prev,
            companyName: data.contactInfo.companyName || prev.companyName,
            companyAddressLine1: data.contactInfo.companyAddressLine1 || prev.companyAddressLine1,
            companyAddressLine2: data.contactInfo.companyAddressLine2 || prev.companyAddressLine2,
            companyGstin: data.contactInfo.companyGstin || prev.companyGstin,
            companyInvoiceEmail: data.contactInfo.companyInvoiceEmail || prev.companyInvoiceEmail,
            companyInvoicePhone: data.contactInfo.companyInvoicePhone || prev.companyInvoicePhone,
            companyInvoiceFooterNote: data.contactInfo.companyInvoiceFooterNote || prev.companyInvoiceFooterNote,
          }));
        }
      } catch (err) {
        console.error("Error fetching company info for invoice:", err);
      }
    };

    fetchCompanyInfo();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/track/${encodeURIComponent(orderId)}`,
          { signal: controller.signal },
        );

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.order) {
          throw new Error(data?.message || "Order not found");
        }

        setOrder(data.order);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Failed to fetch invoice details");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrder();

    return () => controller.abort();
  }, [orderId]);

  const subtotal = useMemo(() => {
    if (!order?.items?.length) return 0;

    return order.items.reduce(
      (total, item) =>
        total + Number(item.price || 0) * Number(item.qty || 1),
      0,
    );
  }, [order]);

  const deliveryCharge = Number(order?.deliveryCharge || 0);
  const discountAmount = Number(order?.discountAmount || 0);
  const grandTotal = Number(
    order?.totalAmount ?? subtotal + deliveryCharge - discountAmount,
  );

  const shippingAddress = order?.shippingAddress || {};
  const items = Array.isArray(order?.items) ? order.items : [];

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (value) => {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const formatPaymentMethod = (method) => {
    const normalized = String(method || "").toLowerCase();

    if (normalized === "cod") return "Cash on Delivery";
    if (normalized === "online") return "Online Payment";
    if (normalized === "razorpay") return "Razorpay";

    return method ? String(method) : "Not available";
  };

  const isPaid =
    String(order?.paymentStatus || "").toLowerCase() === "paid" ||
    String(order?.paymentMethod || "").toLowerCase() === "online";

  if (loading) {
    return (
      <div className="invoice-state-screen">
        <span className="invoice-state-screen__icon">
          <LoaderCircle className="invoice-spinner" size={31} />
        </span>
        <h2>Generating your invoice</h2>
        <p>Please wait while we prepare the complete order details.</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="invoice-state-screen invoice-state-screen--error">
        <span className="invoice-state-screen__icon">
          <AlertCircle size={32} />
        </span>
        <h2>Unable to open invoice</h2>
        <p>{error || "The requested invoice could not be found."}</p>
        <button type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <main className="invoice-page">
      <div className="invoice-actions no-print">
        <button
          type="button"
          className="invoice-action-btn invoice-action-btn--back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <div className="invoice-actions__copy">
          <span>Invoice #{order.orderId || orderId}</span>
          <small>Review or print your order invoice</small>
        </div>

        <button
          type="button"
          className="invoice-action-btn invoice-action-btn--print"
          onClick={handlePrint}
        >
          <Printer size={17} />
          Print Invoice
        </button>
      </div>

      <article className="invoice-paper">
        <div className="invoice-top-accent" />

        <header className="invoice-header">
          <div className="invoice-brand">
            <div className="invoice-brand__logo">
              <img
                src={LOGO_PATH}
                alt="The Kissan City"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  event.currentTarget.parentElement.classList.add(
                    "invoice-brand__logo--missing",
                  );
                }}
              />
            </div>

            <div className="invoice-brand__details">
              <strong style={{ fontSize: '1rem', color: '#16a34a', display: 'block', marginBottom: '2px' }}>{companyInfo.companyName}</strong>
              <p>{companyInfo.companyAddressLine1}</p>
              <p>{companyInfo.companyAddressLine2}</p>
              {companyInfo.companyGstin && <p style={{ fontWeight: 700, color: '#334155' }}>GSTIN: {companyInfo.companyGstin}</p>}
              <p>{companyInfo.companyInvoiceEmail}</p>
            </div>
          </div>

          <div className="invoice-heading">
            <span className="invoice-heading__eyebrow">
              <ReceiptText size={15} />
              Official order document
            </span>

            <h1>TAX INVOICE</h1>

            <span
              className={`invoice-payment-status ${
                isPaid ? "is-paid" : "is-pending"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 size={14} />
              ) : (
                <CreditCard size={14} />
              )}
              {isPaid ? "Payment Completed" : "Payment Pending"}
            </span>
          </div>
        </header>

        <section className="invoice-information-grid">
          <InfoCard
            icon={FileText}
            label="Invoice / Order ID"
            value={order.orderId || orderId}
          />

          <InfoCard
            icon={CalendarDays}
            label="Order Date"
            value={formatDate(order.createdAt)}
          />

          <InfoCard
            icon={CreditCard}
            label="Payment Method"
            value={formatPaymentMethod(order.paymentMethod)}
          />

          <InfoCard
            icon={Package}
            label="Order Status"
            value={order.status || "Order Confirmed"}
          />
        </section>

        <section className="invoice-address-section">
          <div className="invoice-section-title">
            <span>
              <MapPin size={18} />
            </span>
            <div>
              <h2>Billing & Shipping Details</h2>
              <p>The order will be delivered to the address below.</p>
            </div>
          </div>

          <div className="invoice-address-card">
            <div className="invoice-address-card__badge">
              <Truck size={15} />
              Deliver To
            </div>

            <h3>{shippingAddress.name || "Customer"}</h3>

            <p>
              {shippingAddress.address || "Address not available"}
              {shippingAddress.landmark
                ? `, ${shippingAddress.landmark}`
                : ""}
            </p>

            <p>
              {[shippingAddress.city, shippingAddress.state]
                .filter(Boolean)
                .join(", ")}
              {shippingAddress.pincode ? ` - ${shippingAddress.pincode}` : ""}
            </p>

            <div className="invoice-address-card__contact">
              {shippingAddress.phone && (
                <span>
                  <Phone size={14} />
                  +91 {shippingAddress.phone}
                </span>
              )}

              {shippingAddress.email && (
                <span>{shippingAddress.email}</span>
              )}
            </div>
          </div>
        </section>

        <section className="invoice-items-section">
          <div className="invoice-section-title">
            <span>
              <Package size={18} />
            </span>
            <div>
              <h2>Order Items</h2>
              <p>
                {items.length} item{items.length === 1 ? "" : "s"} included in
                this invoice.
              </p>
            </div>
          </div>

          <div className="invoice-table-wrap">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th className="invoice-col-number">S.No</th>
                  <th>Item Description</th>
                  <th className="invoice-align-center">Qty</th>
                  <th className="invoice-align-right">Unit Price</th>
                  <th className="invoice-align-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => {
                  const quantity = Number(item.qty || 1);
                  const unitPrice = Number(item.price || 0);
                  const lineTotal = quantity * unitPrice;

                  return (
                    <tr key={item._id || item.product || `${item.name}-${index}`}>
                      <td className="invoice-col-number">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td>
                        <div className="invoice-product-cell">
                          {item.image && (
                            <span className="invoice-product-cell__image">
                              <img
                                src={
                                  /^https?:\/\//i.test(item.image)
                                    ? item.image
                                    : `${API_BASE_URL}${
                                        String(item.image).startsWith("/")
                                          ? ""
                                          : "/"
                                      }${item.image}`
                                }
                                alt={item.name || "Product"}
                                onError={(event) => {
                                  event.currentTarget.parentElement.style.display =
                                    "none";
                                }}
                              />
                            </span>
                          )}

                          <div>
                            <strong>{item.name || "Product"}</strong>

                            {item.size && (
                              <span className="invoice-product-size">
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td
                        className="invoice-align-center"
                        data-label="Quantity"
                      >
                        {quantity}
                      </td>

                      <td
                        className="invoice-align-right"
                        data-label="Unit Price"
                      >
                        {formatCurrency(unitPrice)}
                      </td>

                      <td
                        className="invoice-align-right invoice-line-total"
                        data-label="Amount"
                      >
                        {formatCurrency(lineTotal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="invoice-bottom-grid">
          <div className="invoice-note-card">
            <span className="invoice-note-card__icon">
              <ShieldCheck size={22} />
            </span>

            <div>
              <h3>Thank you for shopping with us</h3>
              <p>
                Your order has been carefully recorded. For any support related
                to this invoice, contact support@kissancity.com.
              </p>
            </div>
          </div>

          <div className="invoice-summary">
            <SummaryRow
              label="Subtotal"
              value={formatCurrency(subtotal)}
            />

            <SummaryRow
              label="Delivery Charges"
              value={
                deliveryCharge === 0
                  ? "FREE"
                  : formatCurrency(deliveryCharge)
              }
              positive={deliveryCharge === 0}
            />

            {discountAmount > 0 && (
              <SummaryRow
                label="Discount"
                value={`− ${formatCurrency(discountAmount)}`}
                discount
              />
            )}

            <div className="invoice-summary__total">
              <div>
                <span>Grand Total</span>
                <small>Inclusive of all applicable taxes</small>
              </div>

              <strong>{formatCurrency(grandTotal)}</strong>
            </div>
          </div>
        </section>

        <footer className="invoice-footer">
          <div>
            <strong>{companyInfo.companyName}</strong>
            <span>{companyInfo.companyInvoiceFooterNote}</span>
          </div>

          <p>
            This is a computer-generated invoice and does not require a
            signature.
          </p>
        </footer>
      </article>
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <article className="invoice-info-card">
      <span className="invoice-info-card__icon">
        <Icon size={18} />
      </span>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function SummaryRow({
  label,
  value,
  positive = false,
  discount = false,
}) {
  return (
    <div className="invoice-summary__row">
      <span>{label}</span>
      <strong
        className={`${positive ? "is-positive" : ""} ${
          discount ? "is-discount" : ""
        }`}
      >
        {value}
      </strong>
    </div>
  );
}