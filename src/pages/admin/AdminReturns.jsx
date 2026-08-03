import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Mail,
  Package,
  Phone,
  Receipt,
  RefreshCcw,
  RefreshCw,
  Search,
  UserRound,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import "./AdminReturns.css";

export default function AdminReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [pageError, setPageError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, []);

  const getBaseUrl = () => {
    return (
      import.meta.env.VITE_API_URL || "https://thekissancity.com"
    ).replace(/\/$/, "");
  };

  const fetchReturns = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError("");

      const response = await fetch(`${getBaseUrl()}/api/returns`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load return requests."
        );
      }

      setReturns(Array.isArray(data.returns) ? data.returns : []);
    } catch (error) {
      console.error("Error fetching returns:", error);

      setPageError(
        error.message ||
          "Something went wrong while loading return requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async (returnId, status) => {
    const actionText =
      status.toLowerCase() === "approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this return request?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(returnId);

      const response = await fetch(
        `${getBaseUrl()}/api/returns/${returnId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update return request."
        );
      }

      setReturns((previousReturns) =>
        previousReturns.map((returnRequest) =>
          returnRequest._id === returnId
            ? data.returnRequest
            : returnRequest
        )
      );

      if (selectedReturn && selectedReturn._id === returnId) {
        setSelectedReturn(data.returnRequest);
      }
    } catch (error) {
      console.error("Error updating return status:", error);

      window.alert(
        error.message || "Unable to update the return request."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const normalizeStatus = (status) => {
    return String(status || "Pending").trim().toLowerCase();
  };

  const filteredReturns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return returns.filter((returnRequest) => {
      const orderId =
        returnRequest.order?.orderId?.toLowerCase() || "";

      const customerName =
        returnRequest.user?.name?.toLowerCase() || "";

      const customerMobile = String(
        returnRequest.user?.mobile || ""
      ).toLowerCase();

      const reason =
        returnRequest.reason?.toLowerCase() || "";

      const upiId = returnRequest.refundDetails?.upiId?.toLowerCase() || "";
      const accNo = returnRequest.refundDetails?.accountNumber?.toLowerCase() || "";

      const status = normalizeStatus(returnRequest.status);

      const matchesSearch =
        !query ||
        orderId.includes(query) ||
        customerName.includes(query) ||
        customerMobile.includes(query) ||
        reason.includes(query) ||
        upiId.includes(query) ||
        accNo.includes(query);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const pending = returns.filter(
      (returnRequest) =>
        normalizeStatus(returnRequest.status) === "pending"
    ).length;

    const approved = returns.filter(
      (returnRequest) =>
        normalizeStatus(returnRequest.status) === "approved"
    ).length;

    const rejected = returns.filter(
      (returnRequest) =>
        normalizeStatus(returnRequest.status) === "rejected"
    ).length;

    return {
      total: returns.length,
      pending,
      approved,
      rejected,
    };
  }, [returns]);

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
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusClass = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "approved") {
      return "is-approved";
    }

    if (normalizedStatus === "rejected") {
      return "is-rejected";
    }

    return "is-pending";
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "approved") {
      return <CheckCircle2 size={14} />;
    }

    if (normalizedStatus === "rejected") {
      return <XCircle size={14} />;
    }

    return <Clock3 size={14} />;
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:")
    ) {
      return imageUrl;
    }

    return `${getBaseUrl()}${
      imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
    }`;
  };

  return (
    <main className="admin-returns-page">
      <section className="admin-returns-header">
        <div className="admin-returns-header__content">
          <div className="admin-returns-header__icon">
            <RefreshCcw size={27} />
          </div>

          <div>
            <span className="admin-returns-header__eyebrow">
              Orders & Refunds
            </span>

            <h1>Return Requests</h1>

            <p>
              Review and manage customer product return requests & refund payout details.
            </p>
          </div>
        </div>

        <div className="admin-returns-header__actions">
          <button
            type="button"
            className="admin-returns-refresh-button"
            onClick={() => fetchReturns(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "is-spinning" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh Requests"}
          </button>
        </div>
      </section>

      <section className="admin-returns-stats">
        <article className="admin-returns-stat-card">
          <div className="admin-returns-stat-card__icon">
            <RefreshCcw size={22} />
          </div>

          <div>
            <span>Total Requests</span>
            <strong>{statistics.total}</strong>
            <p>All return requests</p>
          </div>
        </article>

        <article className="admin-returns-stat-card is-pending">
          <div className="admin-returns-stat-card__icon">
            <Clock3 size={22} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{statistics.pending}</strong>
            <p>Waiting for your review</p>
          </div>
        </article>

        <article className="admin-returns-stat-card is-approved">
          <div className="admin-returns-stat-card__icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Approved</span>
            <strong>{statistics.approved}</strong>
            <p>Accepted return requests</p>
          </div>
        </article>

        <article className="admin-returns-stat-card is-rejected">
          <div className="admin-returns-stat-card__icon">
            <XCircle size={22} />
          </div>

          <div>
            <span>Rejected</span>
            <strong>{statistics.rejected}</strong>
            <p>Declined return requests</p>
          </div>
        </article>
      </section>

      <section className="admin-returns-panel">
        <div className="admin-returns-panel__header">
          <div>
            <div className="admin-returns-panel__title">
              <Package size={20} />
              <h2>Customer Return Requests</h2>
            </div>

            <p>
              Showing {filteredReturns.length} of {returns.length} request
              {returns.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="admin-returns-filters">
            <div className="admin-returns-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search order, customer, UPI or Bank A/C..."
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

            <div className="admin-returns-status-filter">
              <CheckCircle2 size={16} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter return requests by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>
        </div>

        {pageError && !loading && (
          <div className="admin-returns-error">
            <div className="admin-returns-error__icon">
              <AlertCircle size={23} />
            </div>

            <div>
              <h3>Unable to load return requests</h3>
              <p>{pageError}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchReturns()}
            >
              Try Again
            </button>
          </div>
        )}

        {!pageError && (
          <div className="admin-returns-table-wrapper">
            {loading ? (
              <div className="admin-returns-loading">
                <div className="admin-returns-loading__spinner" />

                <h3>Loading return requests</h3>

                <p>
                  Please wait while we fetch the latest customer
                  return requests.
                </p>
              </div>
            ) : filteredReturns.length > 0 ? (
              <table className="admin-returns-table">
                <thead>
                  <tr>
                    <th>Order Details</th>
                    <th>Customer</th>
                    <th>Refund Payout</th>
                    <th>Reason</th>
                    <th>Details & Evidence</th>
                    <th>Status</th>
                    <th className="admin-returns-actions-heading">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReturns.map((returnRequest) => {
                    const currentStatus = normalizeStatus(
                      returnRequest.status
                    );

                    const isUpdating =
                      updatingId === returnRequest._id;

                    const refund = returnRequest.refundDetails || {};
                    const isUpi = returnRequest.refundMethod === "upi";

                    return (
                      <tr key={returnRequest._id}>
                        <td data-label="Order Details">
                          <div className="admin-returns-order-cell">
                            <div className="admin-returns-order-icon">
                              <Package size={19} />
                            </div>

                            <div>
                              <strong>
                                {returnRequest.order?.orderId ||
                                  "Order unavailable"}
                              </strong>

                              <span>
                                <CalendarDays size={13} />
                                {formatDate(returnRequest.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td data-label="Customer">
                          <div className="admin-returns-customer-cell">
                            <div className="admin-returns-customer-avatar">
                              <UserRound size={18} />
                            </div>

                            <div>
                              <strong>
                                {returnRequest.user?.name ||
                                  "Unknown User"}
                              </strong>

                              <span>
                                <Phone size={13} />
                                {returnRequest.user?.mobile ||
                                  "Phone not available"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td data-label="Refund Payout">
                          <div style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                            {isUpi ? (
                              <div>
                                <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Wallet size={13} /> UPI ID:
                                </span>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{refund.upiId || 'Not provided'}</div>
                              </div>
                            ) : (
                              <div>
                                <span style={{ color: '#2563eb', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  <Building2 size={13} /> Bank A/C:
                                </span>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{refund.accountNumber || 'Not provided'}</div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b' }}>IFSC: {refund.ifscCode || 'N/A'}</div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td data-label="Reason">
                          <div className="admin-returns-reason">
                            <p>
                              {returnRequest.reason ||
                                "No return reason provided."}
                            </p>
                          </div>
                        </td>

                        <td data-label="Details & Evidence">
                          <button
                            type="button"
                            className="admin-returns-view-image"
                            onClick={() => setSelectedReturn(returnRequest)}
                            style={{ gap: 6, padding: '6px 12px' }}
                          >
                            <Eye size={15} />
                            View Full Request
                          </button>
                        </td>

                        <td data-label="Status">
                          <span
                            className={`admin-returns-status-badge ${getStatusClass(
                              returnRequest.status
                            )}`}
                          >
                            {getStatusIcon(returnRequest.status)}

                            {returnRequest.status || "Pending"}
                          </span>
                        </td>

                        <td
                          data-label="Actions"
                          className="admin-returns-actions-cell"
                        >
                          {currentStatus === "pending" ? (
                            <div className="admin-returns-action-buttons">
                              <button
                                type="button"
                                className="admin-returns-approve-button"
                                onClick={() =>
                                  handleUpdateStatus(
                                    returnRequest._id,
                                    "Approved"
                                  )
                                }
                                disabled={isUpdating}
                                title="Approve return request"
                              >
                                {isUpdating ? (
                                  <span className="admin-returns-small-loader" />
                                ) : (
                                  <Check size={16} />
                                )}

                                <span>Approve</span>
                              </button>

                              <button
                                type="button"
                                className="admin-returns-reject-button"
                                onClick={() =>
                                  handleUpdateStatus(
                                    returnRequest._id,
                                    "Rejected"
                                  )
                                }
                                disabled={isUpdating}
                                title="Reject return request"
                              >
                                {isUpdating ? (
                                  <span className="admin-returns-small-loader" />
                                ) : (
                                  <X size={16} />
                                )}

                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <div className="admin-returns-completed-action">
                              {currentStatus === "approved" ? (
                                <CheckCircle2 size={16} />
                              ) : (
                                <XCircle size={16} />
                              )}

                              Request reviewed
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="admin-returns-empty">
                <div className="admin-returns-empty__icon">
                  <RefreshCcw size={41} />
                </div>

                <h3>
                  {searchTerm || statusFilter !== "all"
                    ? "No matching return requests"
                    : "No return requests found"}
                </h3>

                <p>
                  {searchTerm || statusFilter !== "all"
                    ? "Try changing your search term or status filter."
                    : "Customer return requests will appear here when submitted."}
                </p>

                {(searchTerm || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* FULL RETURN REQUEST & REFUND PAYOUT DETAILS MODAL */}
      {selectedReturn && (
        <div
          className="admin-returns-preview-overlay"
          onMouseDown={() => setSelectedReturn(null)}
          style={{ zIndex: 3000 }}
        >
          <div
            className="admin-returns-preview-modal"
            style={{ maxWidth: '650px', width: '92%', maxHeight: '90vh', overflowY: 'auto' }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="admin-returns-preview-header" style={{ background: '#f8fafc' }}>
              <div>
                <RefreshCcw size={22} style={{ color: '#16a34a' }} />
                <div>
                  <span style={{ color: '#16a34a' }}>Return Request Details</span>
                  <h2 style={{ fontSize: '1.1rem', margin: 0 }}>
                    RET #{selectedReturn._id.slice(-6).toUpperCase()}
                  </h2>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`admin-returns-status-badge ${getStatusClass(selectedReturn.status)}`}>
                  {getStatusIcon(selectedReturn.status)} {selectedReturn.status || "Pending"}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedReturn(null)}
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Customer Details */}
              <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  👤 Customer Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Name</div>
                    <strong style={{ color: '#0f172a' }}>{selectedReturn.user?.name || 'N/A'}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Mobile Number</div>
                    <strong style={{ color: '#0f172a' }}>+91 {selectedReturn.user?.mobile || 'N/A'}</strong>
                  </div>
                  {selectedReturn.user?.email && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Email</div>
                      <strong style={{ color: '#0f172a' }}>{selectedReturn.user?.email}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details */}
              <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📦 Order Information
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Order ID</div>
                    <strong style={{ color: '#0f172a' }}>{selectedReturn.order?.orderId || 'N/A'}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Requested Date</div>
                    <strong style={{ color: '#0f172a' }}>{formatDate(selectedReturn.createdAt)}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Order Amount</div>
                    <strong style={{ color: '#16a34a' }}>₹{selectedReturn.order?.totalAmount || '0'}</strong>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Payment Method</div>
                    <strong style={{ color: '#0f172a', textTransform: 'uppercase' }}>{selectedReturn.order?.paymentMethod || 'COD'}</strong>
                  </div>
                </div>
              </div>

              {/* Refund Payout Account Details */}
              <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💳 Refund Payout Account Details
                </h4>

                {selectedReturn.refundMethod === 'upi' ? (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginBottom: 4 }}>
                      Payout Method: 📱 UPI Transfer
                    </div>
                    <div style={{ fontSize: '1rem', background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bbf7d0', fontWeight: 700, color: '#0f172a' }}>
                      UPI ID: <span style={{ color: '#15803d' }}>{selectedReturn.refundDetails?.upiId || 'Not provided'}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginBottom: 8 }}>
                      Payout Method: 🏦 Direct Bank Account Transfer
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Holder Name</div>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedReturn.refundDetails?.accountName || 'N/A'}</strong>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Account Number</div>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{selectedReturn.refundDetails?.accountNumber || 'N/A'}</strong>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>IFSC Code</div>
                        <strong style={{ fontSize: '0.95rem', color: '#15803d' }}>{selectedReturn.refundDetails?.ifscCode || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Return Reason */}
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📝 Reason for Return
                </h4>
                <div style={{ background: '#fff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                  {selectedReturn.reason}
                </div>
              </div>

              {/* Evidence Image */}
              {selectedReturn.image ? (
                <div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    📷 Uploaded Evidence Photo
                  </h4>
                  <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <img
                      src={resolveImageUrl(selectedReturn.image)}
                      alt="Return Evidence"
                      style={{ maxHeight: '250px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <a
                        href={resolveImageUrl(selectedReturn.image)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <ExternalLink size={14} /> Open Original Image in New Tab
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  No evidence photo attached by customer.
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="admin-returns-preview-footer" style={{ background: '#f8fafc', gap: '12px' }}>
              {normalizeStatus(selectedReturn.status) === 'pending' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReturn._id, 'Approved')}
                    style={{ background: '#16a34a', color: '#fff', border: 'none' }}
                  >
                    <Check size={16} /> Approve Return
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedReturn._id, 'Rejected')}
                    style={{ background: '#dc2626', color: '#fff', border: 'none' }}
                  >
                    <X size={16} /> Reject Return
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setSelectedReturn(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}