import React, { useEffect, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle,
  Copy,
  Download,
  Eye,
  Layers,
  Lock,
  Mail,
  Package,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import "./AdminBulkCoupons.css";

export default function AdminBulkCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);

  // Form State
  const [prefix, setPrefix] = useState("INFLUENCER");
  const [quantity, setQuantity] = useState(10);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [perUserLimit, setPerUserLimit] = useState(1);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");

  // Orders Modal State
  const [selectedCouponForOrders, setSelectedCouponForOrders] = useState(null);
  const [couponOrders, setCouponOrders] = useState([]);
  const [couponOrdersSummary, setCouponOrdersSummary] = useState({
    totalOrders: 0,
    totalDiscountGiven: 0,
    totalRevenueGenerated: 0,
  });
  const [loadingCouponOrders, setLoadingCouponOrders] = useState(false);
  const [ordersSearchTerm, setOrdersSearchTerm] = useState("");

  const getBaseUrl = () => {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      return "http://localhost:5005";
    }
    return (
      import.meta.env.VITE_API_URL || "https://thekissancity.com"
    ).replace(/\/$/, "");
  };

  const fetchBulkCoupons = async () => {
    try {
      setLoading(true);
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/bulk-coupons`);
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success) {
          setCoupons(data.coupons || []);
        }
      }
    } catch (error) {
      console.error("Error fetching bulk coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkCoupons();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!discountValue || Number(discountValue) <= 0) {
      alert("Please enter a valid discount value.");
      return;
    }

    try {
      setGenerating(true);
      const baseUrl = getBaseUrl();
      const payload = {
        prefix: prefix.trim().toUpperCase() || "INFLUENCER",
        quantity: Math.min(Math.max(Number(quantity) || 1, 1), 500),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        expiryDate: expiryDate ? expiryDate : null,
        perUserLimit: Number(perUserLimit) || 1,
      };

      const res = await fetch(`${baseUrl}/api/bulk-coupons/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          `Server returned HTML/non-JSON response (${res.status}). Please check backend API server running on ${baseUrl}.`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate bulk coupons");
      }

      alert(`Success! Generated ${data.coupons.length} unique influencer bulk coupons.`);
      await fetchBulkCoupons();
    } catch (error) {
      console.error("Error generating coupons:", error);
      alert(error.message || "Error generating bulk coupons.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bulk coupon?")) return;

    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/bulk-coupons/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert(data.message || "Failed to delete coupon.");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const handleCopyCode = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const handleCopyAll = () => {
    if (coupons.length === 0) return;
    const allCodes = coupons.map((c) => c.code).join("\n");
    navigator.clipboard.writeText(allCodes);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (coupons.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,Coupon Code,Discount Type,Discount Value,Min Order,Expiry Date,Per User Limit,Times Used\n";
    coupons.forEach((c) => {
      const exp = c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "Lifetime";
      const used = c.usedByUsers ? c.usedByUsers.length : 0;
      csvContent += `${c.code},${c.discountType},${c.discountValue},${c.minOrderAmount || 0},${exp},${c.perUserLimit || 1},${used}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bulk_coupons_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Orders Modal for Coupon
  const handleOpenOrdersModal = async (coupon) => {
    setSelectedCouponForOrders(coupon);
    setCouponOrders([]);
    setOrdersSearchTerm("");
    setCouponOrdersSummary({ totalOrders: 0, totalDiscountGiven: 0, totalRevenueGenerated: 0 });
    setLoadingCouponOrders(true);

    try {
      const baseUrl = getBaseUrl();
      const res = await fetch(`${baseUrl}/api/bulk-coupons/${coupon._id}/orders`);
      const data = await res.json();
      if (data.success) {
        setCouponOrders(data.orders || []);
        setCouponOrdersSummary(data.summary || { totalOrders: 0, totalDiscountGiven: 0, totalRevenueGenerated: 0 });
      }
    } catch (error) {
      console.error("Error loading coupon orders:", error);
    } finally {
      setLoadingCouponOrders(false);
    }
  };

  const handleDownloadCouponOrdersCSV = () => {
    if (couponOrders.length === 0 || !selectedCouponForOrders) return;
    let csvContent = "data:text/csv;charset=utf-8,Order ID,Customer Name,Phone,Email,Order Date,Total Amount,Discount Amount,Payment Method,Payment Status,Order Status\n";
    couponOrders.forEach((o) => {
      const name = o.shippingAddress?.name || o.user?.name || "Customer";
      const phone = o.shippingAddress?.phone || o.user?.mobile || o.user?.phone || "";
      const email = o.shippingAddress?.email || o.user?.email || "";
      const date = o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "";
      csvContent += `"${o.orderId}","${name}","${phone}","${email}","${date}",${o.totalAmount || 0},${o.discountAmount || 0},"${o.paymentMethod}","${o.paymentStatus}","${o.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `coupon_${selectedCouponForOrders.code}_orders_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const filteredCouponOrders = couponOrders.filter((o) => {
    const term = ordersSearchTerm.toLowerCase().trim();
    if (!term) return true;
    const orderId = (o.orderId || "").toLowerCase();
    const name = (o.shippingAddress?.name || o.user?.name || "").toLowerCase();
    const phone = (o.shippingAddress?.phone || o.user?.mobile || o.user?.phone || "").toLowerCase();
    return orderId.includes(term) || name.includes(term) || phone.includes(term);
  });

  return (
    <div className="admin-bulk-coupons-page">
      <div className="admin-bulk-header">
        <div>
          <span className="admin-bulk-eyebrow">
            <Layers size={16} /> Bulk Promotion Generator
          </span>
          <h1>Bulk Coupon Management</h1>
          <p>
            Generate unique influencer discount coupons & track orders placed with each coupon code.
          </p>
        </div>

        <button
          className="admin-bulk-btn-secondary"
          onClick={fetchBulkCoupons}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          Refresh List
        </button>
      </div>

      <div className="admin-bulk-notice-banner">
        <Lock size={20} />
        <div>
          <strong>🔒 Private Bulk Coupons (Hidden from Storefront):</strong> These bulk coupons will <strong>NOT</strong> appear on public website promotional banners or lists. However, when customers enter any of these codes at Checkout, they will receive the specified discount!
        </div>
      </div>

      <div className="admin-bulk-grid">
        {/* Left Column: Form */}
        <div className="admin-bulk-card">
          <div className="admin-bulk-card-header">
            <h2>Generate Coupons in Bulk</h2>
            <Sparkles size={18} style={{ color: "#10b981" }} />
          </div>

          <div className="admin-bulk-card-body">
            <form onSubmit={handleGenerate}>
              <div className="admin-bulk-form-row">
                <div className="admin-bulk-form-group">
                  <label>
                    Coupon Prefix <span>*</span>
                  </label>
                  <div className="admin-bulk-input-wrap">
                    <Tag size={16} />
                    <input
                      type="text"
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                      placeholder="e.g. INFLUENCER"
                      required
                    />
                  </div>
                  <span className="admin-bulk-help">e.g. INFLUENCER-XXXXX</span>
                </div>

                <div className="admin-bulk-form-group">
                  <label>
                    Quantity (Count) <span>*</span>
                  </label>
                  <div className="admin-bulk-input-wrap">
                    <Layers size={16} />
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-bulk-form-row">
                <div className="admin-bulk-form-group">
                  <label>
                    Discount Type <span>*</span>
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="flat">Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div className="admin-bulk-form-group">
                  <label>
                    Discount Value <span>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder={discountType === "percentage" ? "10" : "100"}
                    required
                  />
                </div>
              </div>

              <div className="admin-bulk-form-row">
                <div className="admin-bulk-form-group">
                  <label>Min Cart Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="0 for no minimum"
                  />
                  <span className="admin-bulk-help">Minimum cart total to apply</span>
                </div>

                <div className="admin-bulk-form-group">
                  <label>Usage Limit Per User</label>
                  <input
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                  />
                  <span className="admin-bulk-help">Default 1 time per user</span>
                </div>
              </div>

              <div className="admin-bulk-form-group" style={{ marginBottom: "20px" }}>
                <label>Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
                <span className="admin-bulk-help">Leave blank for lifetime validity</span>
              </div>

              <button
                type="submit"
                className="admin-bulk-btn-primary"
                disabled={generating}
              >
                {generating ? (
                  <>Generating Coupons...</>
                ) : (
                  <>
                    <Sparkles size={18} /> Generate {quantity} Bulk Coupons
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Coupon Table & Actions */}
        <div className="admin-bulk-card">
          <div className="admin-bulk-card-header">
            <div>
              <h2>Generated Bulk Coupons ({filteredCoupons.length})</h2>
            </div>

            <div className="admin-bulk-table-actions">
              <button
                type="button"
                className="admin-bulk-btn-secondary"
                onClick={handleCopyAll}
                disabled={coupons.length === 0}
              >
                {copiedAll ? <Check size={15} /> : <Copy size={15} />}
                {copiedAll ? "Copied All!" : "Copy All Codes"}
              </button>

              <button
                type="button"
                className="admin-bulk-btn-secondary"
                onClick={handleDownloadCSV}
                disabled={coupons.length === 0}
              >
                <Download size={15} />
                Download CSV
              </button>
            </div>
          </div>

          <div className="admin-bulk-card-body" style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div className="admin-bulk-input-wrap">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search bulk coupon code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="admin-bulk-empty">Loading bulk coupons...</div>
            ) : filteredCoupons.length === 0 ? (
              <div className="admin-bulk-empty">
                <Tag size={36} />
                <p>No bulk coupons generated yet. Use the form to create your first batch!</p>
              </div>
            ) : (
              <div className="admin-bulk-table-wrap">
                <table className="admin-bulk-table">
                  <thead>
                    <tr>
                      <th>Coupon Code</th>
                      <th>Discount</th>
                      <th>Min Order</th>
                      <th>Valid Till</th>
                      <th>Used Orders</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((coupon) => {
                      const isExpired =
                        coupon.expiryDate &&
                        new Date() > new Date(new Date(coupon.expiryDate).setHours(23, 59, 59, 999));
                      const usedCount = coupon.usedByUsers ? coupon.usedByUsers.length : 0;
                      return (
                        <tr key={coupon._id}>
                          <td>
                            <span
                              className="admin-bulk-code-badge clickable"
                              onClick={() => handleOpenOrdersModal(coupon)}
                              title="Click to view orders for this coupon"
                            >
                              {coupon.code}
                            </span>
                          </td>
                          <td>
                            <strong>
                              {coupon.discountType === "percentage"
                                ? `${coupon.discountValue}% OFF`
                                : `₹${coupon.discountValue} OFF`}
                            </strong>
                          </td>
                          <td>
                            {coupon.minOrderAmount > 0
                              ? `₹${coupon.minOrderAmount}`
                              : "No Min"}
                          </td>
                          <td>
                            {coupon.expiryDate ? (
                              <span style={{ color: isExpired ? "#dc2626" : "#1e293b" }}>
                                {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {isExpired && " (Expired)"}
                              </span>
                            ) : (
                              "Lifetime"
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`admin-bulk-orders-pill-btn ${usedCount > 0 ? "has-orders" : ""}`}
                              onClick={() => handleOpenOrdersModal(coupon)}
                              title="View orders placed using this coupon"
                            >
                              <ShoppingBag size={13} />
                              <strong>{usedCount}</strong> {usedCount === 1 ? "Order" : "Orders"}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button
                                type="button"
                                style={{
                                  border: "none",
                                  background: "#e0f2fe",
                                  color: "#0284c7",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleOpenOrdersModal(coupon)}
                                title="View Coupon Orders"
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                type="button"
                                style={{
                                  border: "none",
                                  background: "#f1f5f9",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleCopyCode(coupon._id, coupon.code)}
                                title="Copy Coupon Code"
                              >
                                {copiedId === coupon._id ? (
                                  <Check size={14} style={{ color: "#16a34a" }} />
                                ) : (
                                  <Copy size={14} />
                                )}
                              </button>

                              <button
                                type="button"
                                style={{
                                  border: "none",
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  padding: "6px",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                }}
                                onClick={() => handleDelete(coupon._id)}
                                title="Delete Coupon"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── COUPON ORDERS MODAL ── */}
      {selectedCouponForOrders && (
        <div className="admin-coupon-orders-backdrop" onClick={() => setSelectedCouponForOrders(null)}>
          <div className="admin-coupon-orders-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-coupon-orders-header">
              <div>
                <span className="admin-coupon-modal-badge">
                  <Tag size={14} /> Influencer Coupon
                </span>
                <h2>Orders for Coupon: <span>{selectedCouponForOrders.code}</span></h2>
                <p>
                  Discount:{" "}
                  <strong>
                    {selectedCouponForOrders.discountType === "percentage"
                      ? `${selectedCouponForOrders.discountValue}% OFF`
                      : `₹${selectedCouponForOrders.discountValue} OFF`}
                  </strong>
                  {selectedCouponForOrders.minOrderAmount > 0 &&
                    ` • Min Order: ₹${selectedCouponForOrders.minOrderAmount}`}
                </p>
              </div>

              <button
                type="button"
                className="admin-coupon-orders-close-btn"
                onClick={() => setSelectedCouponForOrders(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Stats Row */}
            <div className="admin-coupon-orders-stats">
              <div className="admin-coupon-stat-card">
                <ShoppingBag size={22} style={{ color: "#16a34a" }} />
                <div>
                  <span>Total Orders Placed</span>
                  <strong>{couponOrdersSummary.totalOrders || 0}</strong>
                </div>
              </div>

              <div className="admin-coupon-stat-card">
                <Package size={22} style={{ color: "#0284c7" }} />
                <div>
                  <span>Revenue Generated</span>
                  <strong>₹{(couponOrdersSummary.totalRevenueGenerated || 0).toLocaleString("en-IN")}</strong>
                </div>
              </div>

              <div className="admin-coupon-stat-card">
                <Sparkles size={22} style={{ color: "#d97706" }} />
                <div>
                  <span>Total Discount Given</span>
                  <strong>₹{(couponOrdersSummary.totalDiscountGiven || 0).toLocaleString("en-IN")}</strong>
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="admin-coupon-orders-controls">
              <div className="admin-bulk-input-wrap" style={{ maxWidth: "340px", flex: 1 }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by Order ID, Name, Phone..."
                  value={ordersSearchTerm}
                  onChange={(e) => setOrdersSearchTerm(e.target.value)}
                />
              </div>

              {couponOrders.length > 0 && (
                <button
                  type="button"
                  className="admin-bulk-btn-secondary"
                  onClick={handleDownloadCouponOrdersCSV}
                >
                  <Download size={14} /> Export CSV
                </button>
              )}
            </div>

            {/* Orders Table */}
            <div className="admin-coupon-orders-body">
              {loadingCouponOrders ? (
                <div className="admin-bulk-empty">Loading coupon orders...</div>
              ) : filteredCouponOrders.length === 0 ? (
                <div className="admin-bulk-empty">
                  <ShoppingBag size={38} />
                  <h3>No Orders Found</h3>
                  <p>
                    {couponOrders.length === 0
                      ? `No orders have been placed using coupon code "${selectedCouponForOrders.code}" yet.`
                      : `No orders matching "${ordersSearchTerm}".`}
                  </p>
                </div>
              ) : (
                <div className="admin-coupon-orders-table-wrap">
                  <table className="admin-coupon-orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Details</th>
                        <th>Purchased Items</th>
                        <th>Order Amount</th>
                        <th>Discount</th>
                        <th>Status</th>
                        <th>Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCouponOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <strong className="admin-coupon-order-id">{order.orderId}</strong>
                          </td>
                          <td>
                            <div className="admin-coupon-customer-info">
                              <span className="customer-name">
                                <User size={13} /> {order.shippingAddress?.name || order.user?.name || "Customer"}
                              </span>
                              {order.shippingAddress?.phone && (
                                <span className="customer-meta">
                                  <Phone size={12} /> {order.shippingAddress.phone}
                                </span>
                              )}
                              {order.shippingAddress?.email && (
                                <span className="customer-meta">
                                  <Mail size={12} /> {order.shippingAddress.email}
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="admin-coupon-order-items">
                              {order.items && order.items.length > 0 ? (
                                order.items.map((it, idx) => (
                                  <div key={idx} className="admin-coupon-item-row">
                                    <span className="item-name">{it.name}</span>
                                    <span className="item-qty">x{it.qty}</span>
                                    {it.size && <span className="item-size">({it.size})</span>}
                                  </div>
                                ))
                              ) : (
                                <span>No items details</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <strong>₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</strong>
                            <div className="payment-method-pill">{order.paymentMethod?.toUpperCase()}</div>
                          </td>
                          <td>
                            <span className="admin-coupon-discount-text">
                              -₹{Number(order.discountAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              <span className={`status-pill ${order.status?.toLowerCase()}`}>
                                {order.status?.toUpperCase()}
                              </span>
                              <span className={`payment-pill ${order.paymentStatus?.toLowerCase()}`}>
                                {order.paymentStatus}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="admin-coupon-date">
                              <Calendar size={12} />
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
