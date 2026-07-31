import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Copy,
  Download,
  IndianRupee,
  Layers,
  Lock,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
} from "lucide-react";
import "./AdminBulkCoupons.css";

export default function AdminBulkCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [prefix, setPrefix] = useState("KISSAN");
  const [quantity, setQuantity] = useState(10);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(0);
  const [expiryDate, setExpiryDate] = useState("");
  const [perUserLimit, setPerUserLimit] = useState(1);

  const getBaseUrl = () => {
    if (
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1")
    ) {
      return "https://thekissancity.com";
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
    let csvContent = "data:text/csv;charset=utf-8,Coupon Code,Discount Type,Discount Value,Min Order,Expiry Date,Per User Limit\n";
    coupons.forEach((c) => {
      const exp = c.expiryDate ? new Date(c.expiryDate).toLocaleDateString("en-IN") : "Lifetime";
      csvContent += `${c.code},${c.discountType},${c.discountValue},${c.minOrderAmount || 0},${exp},${c.perUserLimit || 1}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bulk_coupons_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="admin-bulk-coupons-page">
      <div className="admin-bulk-header">
        <div>
          <span className="admin-bulk-eyebrow">
            <Layers size={16} /> Bulk Promotion Generator
          </span>
          <h1>Bulk Coupon Management</h1>
          <p>
            Generate multiple unique discount coupons in bulk for marketing campaigns & offline users.
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
                      placeholder="e.g. KISSAN"
                      required
                    />
                  </div>
                  <span className="admin-bulk-help">e.g. KISSAN-XXXXX</span>
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
                  <span className="admin-bulk-help">1 to 500 coupons</span>
                </div>
              </div>

              <div className="admin-bulk-form-row">
                <div className="admin-bulk-form-group">
                  <label>
                    Discount Type <span>*</span>
                  </label>
                  <div className="admin-bulk-input-wrap">
                    {discountType === "percentage" ? (
                      <Percent size={16} />
                    ) : (
                      <IndianRupee size={16} />
                    )}
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="admin-bulk-form-group">
                  <label>
                    Discount Value <span>*</span>
                  </label>
                  <div className="admin-bulk-input-wrap">
                    {discountType === "percentage" ? (
                      <Percent size={16} />
                    ) : (
                      <IndianRupee size={16} />
                    )}
                    <input
                      type="number"
                      min="1"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      placeholder="e.g. 10 or 100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-bulk-form-row">
                <div className="admin-bulk-form-group">
                  <label>Min Order Criteria (₹)</label>
                  <div className="admin-bulk-input-wrap">
                    <IndianRupee size={16} />
                    <input
                      type="number"
                      min="0"
                      value={minOrderAmount}
                      onChange={(e) => setMinOrderAmount(e.target.value)}
                      placeholder="0 for no limit"
                    />
                  </div>
                </div>

                <div className="admin-bulk-form-group">
                  <label>Valid Till (End Date)</label>
                  <div className="admin-bulk-input-wrap">
                    <CalendarDays size={16} />
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-bulk-form-group">
                <label>Usage Limit Per User</label>
                <div className="admin-bulk-input-wrap">
                  <Tag size={16} />
                  <input
                    type="number"
                    min="1"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    placeholder="1 use per user"
                  />
                </div>
                <span className="admin-bulk-help">1 user can only use this coupon 1 time</span>
              </div>

              <button
                type="submit"
                className="admin-bulk-submit-btn"
                disabled={generating}
              >
                {generating ? (
                  <>Generating Bulk Coupons...</>
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
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoupons.map((coupon) => {
                      const isExpired =
                        coupon.expiryDate &&
                        new Date() > new Date(new Date(coupon.expiryDate).setHours(23, 59, 59, 999));
                      return (
                        <tr key={coupon._id}>
                          <td>
                            <span className="admin-bulk-code-badge">
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
                            <div style={{ display: "flex", gap: "6px" }}>
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
    </div>
  );
}
