import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Edit2,
  IndianRupee,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Tag,
  Tags,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import "./AdminCoupons.css";

const initialForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  expiryDate: "",
  perUserLimit: 1,
  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");

  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const getBaseUrl = () => {
    return (
      import.meta.env.VITE_API_URL || "http://localhost:5005"
    ).replace(/\/$/, "");
  };

  const fetchCoupons = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError("");

      const response = await fetch(`${getBaseUrl()}/api/coupons`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch coupons.");
      }

      setCoupons(Array.isArray(data.coupons) ? data.coupons : []);
    } catch (error) {
      console.error("Error fetching coupons:", error);

      setPageError(
        error.message ||
          "Something went wrong while loading the coupon records."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const code = coupon.code?.toLowerCase() || "";
      const type = coupon.discountType?.toLowerCase() || "";

      const matchesSearch =
        !query || code.includes(query) || type.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && coupon.isActive) ||
        (statusFilter === "inactive" && !coupon.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  const couponStats = useMemo(() => {
    const activeCoupons = coupons.filter(
      (coupon) => coupon.isActive
    ).length;

    const inactiveCoupons = coupons.length - activeCoupons;

    const percentageCoupons = coupons.filter(
      (coupon) => coupon.discountType === "percentage"
    ).length;

    return {
      total: coupons.length,
      active: activeCoupons,
      inactive: inactiveCoupons,
      percentage: percentageCoupons,
    };
  }, [coupons]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingId(coupon._id);
    let expFormatted = "";
    if (coupon.expiryDate) {
      const d = new Date(coupon.expiryDate);
      if (!Number.isNaN(d.getTime())) {
        expFormatted = d.toISOString().split("T")[0];
      }
    }
    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue || "",
      minOrderAmount: coupon.minOrderAmount || "",
      expiryDate: expFormatted,
      perUserLimit: coupon.perUserLimit || 1,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingId(null);
    setForm(initialForm);
    setFormError("");
  };

  const validateForm = () => {
    const discountValue = Number(form.discountValue);

    if (!form.code.trim()) {
      return "Please enter a coupon code.";
    }

    if (!form.discountValue || discountValue <= 0) {
      return "Please enter a valid discount value.";
    }

    if (
      form.discountType === "percentage" &&
      discountValue > 100
    ) {
      return "Percentage discount cannot be greater than 100%.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        expiryDate: form.expiryDate ? form.expiryDate : null,
        perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : 1,
        isActive: form.isActive,
      };

      const url = editingId
        ? `${getBaseUrl()}/api/coupons/${editingId}`
        : `${getBaseUrl()}/api/coupons`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save coupon.");
      }

      if (editingId) {
        setCoupons((previousCoupons) =>
          previousCoupons.map((c) => (c._id === editingId ? data.coupon : c))
        );
      } else {
        setCoupons((previousCoupons) => [
          data.coupon,
          ...previousCoupons,
        ]);
      }

      closeModal();
    } catch (error) {
      console.error("Error saving coupon:", error);

      setFormError(
        error.message || "Server error. Please try again later."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (couponId, currentStatus) => {
    try {
      setUpdatingId(couponId);

      const response = await fetch(
        `${getBaseUrl()}/api/coupons/${couponId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update coupon status."
        );
      }

      setCoupons((previousCoupons) =>
        previousCoupons.map((coupon) =>
          coupon._id === couponId ? data.coupon : coupon
        )
      );
    } catch (error) {
      console.error("Error updating coupon:", error);
      window.alert(error.message || "Unable to update coupon status.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (couponId, couponCode) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the coupon "${couponCode}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(couponId);

      const response = await fetch(
        `${getBaseUrl()}/api/coupons/${couponId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete coupon.");
      }

      setCoupons((previousCoupons) =>
        previousCoupons.filter(
          (coupon) => coupon._id !== couponId
        )
      );
    } catch (error) {
      console.error("Error deleting coupon:", error);
      window.alert(error.message || "Unable to delete coupon.");
    } finally {
      setDeletingId("");
    }
  };

  const copyCouponCode = async (couponId, couponCode) => {
    try {
      await navigator.clipboard.writeText(couponCode);

      setCopiedId(couponId);

      window.setTimeout(() => {
        setCopiedId("");
      }, 1500);
    } catch (error) {
      console.error("Unable to copy coupon code:", error);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDiscount = (coupon) => {
    const value = Number(coupon.discountValue || 0);

    if (coupon.discountType === "percentage") {
      return `${value}% OFF`;
    }

    return `₹${value.toLocaleString("en-IN")} OFF`;
  };

  return (
    <main className="admin-coupons-page">
      <section className="admin-coupons-header">
        <div className="admin-coupons-header__content">
          <div className="admin-coupons-header__icon">
            <Tags size={27} />
          </div>

          <div>
            <span className="admin-coupons-header__eyebrow">
              Offers & Promotions
            </span>

            <h1>Coupon Management</h1>

            <p>
              Create and manage discount coupons for your customers.
            </p>
          </div>
        </div>

        <div className="admin-coupons-header__actions">
          <button
            type="button"
            className="admin-coupons-refresh-button"
            onClick={() => fetchCoupons(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "is-spinning" : ""}
            />

            <span>
              {refreshing ? "Refreshing..." : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            className="admin-coupons-add-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Add Coupon
          </button>
        </div>
      </section>

      <section className="admin-coupons-stats">
        <article className="admin-coupons-stat-card">
          <div className="admin-coupons-stat-card__icon">
            <Tags size={22} />
          </div>

          <div>
            <span>Total Coupons</span>
            <strong>{couponStats.total}</strong>
            <p>All created coupons</p>
          </div>
        </article>

        <article className="admin-coupons-stat-card">
          <div className="admin-coupons-stat-card__icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Active Coupons</span>
            <strong>{couponStats.active}</strong>
            <p>Available for customers</p>
          </div>
        </article>

        <article className="admin-coupons-stat-card">
          <div className="admin-coupons-stat-card__icon">
            <XCircle size={22} />
          </div>

          <div>
            <span>Inactive Coupons</span>
            <strong>{couponStats.inactive}</strong>
            <p>Currently disabled</p>
          </div>
        </article>

        <article className="admin-coupons-stat-card">
          <div className="admin-coupons-stat-card__icon">
            <Percent size={22} />
          </div>

          <div>
            <span>Percentage Offers</span>
            <strong>{couponStats.percentage}</strong>
            <p>Percentage-based coupons</p>
          </div>
        </article>
      </section>

      <section className="admin-coupons-panel">
        <div className="admin-coupons-panel__header">
          <div>
            <div className="admin-coupons-panel__title">
              <Tag size={20} />
              <h2>Discount Coupons</h2>
            </div>

            <p>
              {filteredCoupons.length} coupon
              {filteredCoupons.length === 1 ? "" : "s"} displayed
            </p>
          </div>

          <div className="admin-coupons-filters">
            <div className="admin-coupons-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search coupon code..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="admin-coupons-select">
              <CheckCircle2 size={16} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter coupons by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>
        </div>

        {pageError && !loading && (
          <div className="admin-coupons-error">
            <div className="admin-coupons-error__icon">
              <AlertCircle size={23} />
            </div>

            <div>
              <h3>Unable to load coupons</h3>
              <p>{pageError}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchCoupons()}
            >
              Try Again
            </button>
          </div>
        )}

        {!pageError && (
          <div className="admin-coupons-table-wrapper">
            {loading ? (
              <div className="admin-coupons-loading">
                <div className="admin-coupons-loader" />

                <h3>Loading coupons</h3>

                <p>
                  Please wait while we fetch your discount coupons.
                </p>
              </div>
            ) : filteredCoupons.length > 0 ? (
              <table className="admin-coupons-table">
                <thead>
                  <tr>
                    <th>Coupon Details</th>
                    <th>Discount</th>
                    <th>Min Order Criteria</th>
                    <th>Valid Till (Expiry)</th>
                    <th>Status</th>
                    <th className="admin-coupons-table__actions-heading">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCoupons.map((coupon) => {
                    const isExpired =
                      coupon.expiryDate &&
                      new Date() > new Date(new Date(coupon.expiryDate).setHours(23, 59, 59, 999));
                    const usedCount = Array.isArray(coupon.usedByUsers) ? coupon.usedByUsers.length : 0;

                    return (
                      <tr key={coupon._id}>
                        <td data-label="Coupon Details">
                          <div className="admin-coupons-code-cell">
                            <div className="admin-coupons-code-icon">
                              {coupon.discountType === "percentage" ? (
                                <Percent size={19} />
                              ) : (
                                <IndianRupee size={19} />
                              )}
                            </div>

                            <div className="admin-coupons-code-info">
                              <strong>
                                {coupon.code || "NO CODE"}
                              </strong>

                              <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "3px", flexWrap: "wrap" }}>
                                <span style={{ fontSize: "0.72rem", background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                                  1-Use per user
                                </span>
                                {usedCount > 0 && (
                                  <span style={{ fontSize: "0.72rem", background: "#f1f5f9", color: "#475569", padding: "2px 6px", borderRadius: "4px" }}>
                                    Used by {usedCount} user{usedCount === 1 ? "" : "s"}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`admin-coupons-copy-button ${
                                copiedId === coupon._id ? "is-copied" : ""
                              }`}
                              onClick={() =>
                                copyCouponCode(coupon._id, coupon.code)
                              }
                              aria-label={`Copy ${coupon.code}`}
                            >
                              {copiedId === coupon._id ? (
                                <Check size={15} />
                              ) : (
                                <Copy size={15} />
                              )}
                            </button>
                          </div>
                        </td>

                        <td data-label="Discount">
                          <span
                            className={`admin-coupons-discount-badge ${
                              coupon.discountType === "flat"
                                ? "is-flat"
                                : "is-percentage"
                            }`}
                          >
                            {coupon.discountType === "percentage" ? (
                              <Percent size={14} />
                            ) : (
                              <IndianRupee size={14} />
                            )}

                            {formatDiscount(coupon)}
                          </span>
                        </td>

                        <td data-label="Min Order Criteria">
                          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: coupon.minOrderAmount > 0 ? "#1e293b" : "#64748b" }}>
                            {coupon.minOrderAmount > 0 ? (
                              <span>₹{coupon.minOrderAmount.toLocaleString("en-IN")}</span>
                            ) : (
                              <span style={{ fontWeight: 500, fontStyle: "italic", color: "#94a3b8" }}>No Minimum</span>
                            )}
                          </div>
                        </td>

                        <td data-label="Valid Till (Expiry)">
                          <div className="admin-coupons-date-cell">
                            <span>
                              <CalendarDays size={16} />
                            </span>

                            <div>
                              <strong style={{ color: isExpired ? "#dc2626" : "#1e293b" }}>
                                {coupon.expiryDate ? formatDate(coupon.expiryDate) : "No Expiry"}
                              </strong>

                              <small style={{ color: isExpired ? "#dc2626" : "#64748b", fontWeight: isExpired ? 700 : 500 }}>
                                {isExpired ? "⚠️ EXPIRED" : coupon.expiryDate ? "Valid Till Date" : "Lifetime valid"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td data-label="Status">
                          <button
                            type="button"
                            className={`admin-coupons-status-button ${
                              isExpired
                                ? "is-inactive"
                                : coupon.isActive
                                ? "is-active"
                                : "is-inactive"
                            }`}
                            onClick={() =>
                              toggleStatus(coupon._id, coupon.isActive)
                            }
                            disabled={updatingId === coupon._id}
                          >
                            {updatingId === coupon._id ? (
                              <span className="admin-coupons-small-loader" />
                            ) : isExpired ? (
                              <XCircle size={14} />
                            ) : coupon.isActive ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <XCircle size={14} />
                            )}

                            {updatingId === coupon._id
                              ? "Updating"
                              : isExpired
                              ? "Expired"
                              : coupon.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>
                        </td>

                      <td
                        data-label="Actions"
                        className="admin-coupons-actions-cell"
                        style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
                      >
                        <button
                          type="button"
                          className="admin-coupons-edit-button"
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid #bfdbfe",
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            fontWeight: 600,
                            fontSize: "0.82rem",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          onClick={() => openEditModal(coupon)}
                          aria-label={`Edit ${coupon.code}`}
                        >
                          <Edit2 size={15} />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          className="admin-coupons-delete-button"
                          onClick={() =>
                            handleDelete(
                              coupon._id,
                              coupon.code
                            )
                          }
                          disabled={deletingId === coupon._id}
                          aria-label={`Delete ${coupon.code}`}
                        >
                          {deletingId === coupon._id ? (
                            <span className="admin-coupons-small-loader" />
                          ) : (
                            <Trash2 size={16} />
                          )}

                          <span>
                            {deletingId === coupon._id
                              ? "Deleting"
                              : "Delete"}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            ) : (
              <div className="admin-coupons-empty">
                <div className="admin-coupons-empty__icon">
                  <Tags size={42} />
                </div>

                <h3>
                  {searchTerm || statusFilter !== "all"
                    ? "No matching coupons found"
                    : "No coupons created yet"}
                </h3>

                <p>
                  {searchTerm || statusFilter !== "all"
                    ? "Try changing your search term or status filter."
                    : "Create your first discount coupon to start offering special deals to customers."}
                </p>

                {searchTerm || statusFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openCreateModal}
                  >
                    <Plus size={17} />
                    Create First Coupon
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="admin-coupons-modal-overlay"
          onMouseDown={closeModal}
        >
          <div
            className="admin-coupons-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-coupons-modal__header">
              <div className="admin-coupons-modal__heading">
                <div>
                  {editingId ? <Edit2 size={21} /> : <Plus size={21} />}
                </div>

                <div>
                  <span>{editingId ? "Update Promotion" : "New Promotion"}</span>
                  <h2>{editingId ? "Edit Coupon" : "Create New Coupon"}</h2>
                  <p>
                    {editingId ? "Update coupon details and rules." : "Add a discount coupon for your customers."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="admin-coupons-modal__close"
                onClick={closeModal}
                disabled={submitting}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-coupons-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-coupons-form__group">
                <label htmlFor="coupon-code">
                  Coupon Code <span>*</span>
                </label>

                <div className="admin-coupons-form__input">
                  <Tag size={18} />

                  <input
                    id="coupon-code"
                    type="text"
                    value={form.code}
                    onChange={(event) => {
                      setForm((previousForm) => ({
                        ...previousForm,
                        code: event.target.value
                          .toUpperCase()
                          .replace(/\s+/g, ""),
                      }));

                      setFormError("");
                    }}
                    placeholder="Example: KISSAN10"
                    maxLength={30}
                    autoFocus
                  />
                </div>

                <small>
                  Use a simple code without spaces.
                </small>
              </div>

              <div className="admin-coupons-form__row">
                <div className="admin-coupons-form__group">
                  <label htmlFor="discount-type">
                    Discount Type <span>*</span>
                  </label>

                  <div className="admin-coupons-form__select">
                    {form.discountType === "percentage" ? (
                      <Percent size={18} />
                    ) : (
                      <IndianRupee size={18} />
                    )}

                    <select
                      id="discount-type"
                      value={form.discountType}
                      onChange={(event) => {
                        setForm((previousForm) => ({
                          ...previousForm,
                          discountType: event.target.value,
                          discountValue: "",
                        }));

                        setFormError("");
                      }}
                    >
                      <option value="percentage">
                        Percentage (%)
                      </option>

                      <option value="flat">
                        Flat Amount (₹)
                      </option>
                    </select>

                    <ChevronDown size={16} />
                  </div>
                </div>

                <div className="admin-coupons-form__group">
                  <label htmlFor="discount-value">
                    Discount Value <span>*</span>
                  </label>

                  <div className="admin-coupons-form__input">
                    {form.discountType === "percentage" ? (
                      <Percent size={18} />
                    ) : (
                      <IndianRupee size={18} />
                    )}

                    <input
                      id="discount-value"
                      type="number"
                      value={form.discountValue}
                      onChange={(event) => {
                        setForm((previousForm) => ({
                          ...previousForm,
                          discountValue: event.target.value,
                        }));

                        setFormError("");
                      }}
                      placeholder={
                        form.discountType === "percentage"
                          ? "Example: 10"
                          : "Example: 100"
                      }
                      min="1"
                      max={
                        form.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Minimum Order Amount & Expiry Date */}
              <div className="admin-coupons-form__row">
                <div className="admin-coupons-form__group">
                  <label htmlFor="min-order-amount">
                    Min Order Criteria (₹)
                  </label>

                  <div className="admin-coupons-form__input">
                    <IndianRupee size={18} />

                    <input
                      id="min-order-amount"
                      type="number"
                      value={form.minOrderAmount}
                      onChange={(event) => {
                        setForm((previousForm) => ({
                          ...previousForm,
                          minOrderAmount: event.target.value,
                        }));
                        setFormError("");
                      }}
                      placeholder="e.g. 500 (0 for no limit)"
                      min="0"
                    />
                  </div>
                  <small>Minimum cart total required to apply coupon</small>
                </div>

                <div className="admin-coupons-form__group">
                  <label htmlFor="expiry-date">
                    Valid Till (End Date)
                  </label>

                  <div className="admin-coupons-form__input">
                    <CalendarDays size={18} />

                    <input
                      id="expiry-date"
                      type="date"
                      value={form.expiryDate}
                      onChange={(event) => {
                        setForm((previousForm) => ({
                          ...previousForm,
                          expiryDate: event.target.value,
                        }));
                        setFormError("");
                      }}
                    />
                  </div>
                  <small>Leave blank for lifetime validity</small>
                </div>
              </div>

              {/* Row 3: Per User Usage Limit */}
              <div className="admin-coupons-form__row">
                <div className="admin-coupons-form__group" style={{ gridColumn: "span 2" }}>
                  <label htmlFor="per-user-limit">
                    Usage Limit Per User
                  </label>

                  <div className="admin-coupons-form__input">
                    <Tag size={18} />

                    <input
                      id="per-user-limit"
                      type="number"
                      value={form.perUserLimit}
                      onChange={(event) => {
                        setForm((previousForm) => ({
                          ...previousForm,
                          perUserLimit: event.target.value,
                        }));
                        setFormError("");
                      }}
                      placeholder="Default 1 use per user"
                      min="1"
                    />
                  </div>
                  <small>1 user can only use this coupon code 1 time</small>
                </div>
              </div>

              <div className="admin-coupons-active-option">
                <div>
                  <div className="admin-coupons-active-option__icon">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <strong>Activate coupon immediately</strong>

                    <span>
                      Customers can use it after creation.
                    </span>
                  </div>
                </div>

                <label className="admin-coupons-switch">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((previousForm) => ({
                        ...previousForm,
                        isActive: event.target.checked,
                      }))
                    }
                  />

                  <span />
                </label>
              </div>

              <div className="admin-coupons-preview">
                <div className="admin-coupons-preview__icon">
                  <Tag size={21} />
                </div>

                <div>
                  <span>Coupon preview</span>

                  <strong>
                    {form.code || "YOURCODE"}
                  </strong>

                  <p>
                    {form.discountValue
                      ? form.discountType === "percentage"
                        ? `${form.discountValue}% discount`
                        : `₹${form.discountValue} flat discount`
                      : "Enter a discount value"}
                  </p>
                </div>

                <div
                  className={`admin-coupons-preview__status ${
                    form.isActive ? "is-active" : ""
                  }`}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              {formError && (
                <div className="admin-coupons-form__error">
                  <AlertCircle size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-coupons-modal__actions">
                <button
                  type="button"
                  className="admin-coupons-cancel-button"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-coupons-create-button"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="admin-coupons-submit-loader" />
                      {editingId ? "Saving..." : "Creating Coupon..."}
                    </>
                  ) : (
                    <>
                      {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                      {editingId ? "Update Coupon" : "Create Coupon"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}