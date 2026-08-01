import React, { useEffect, useState } from "react";
import {
  Mail,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  X,
  User,
  Phone,
  Calendar,
  MessageSquare,
  Sparkles,
  AlertCircle
} from "lucide-react";
import "./AdminInquiries.css";

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/$/, "");
  };

  const fetchInquiries = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${getBaseUrl()}/api/inquiries`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && Array.isArray(data.inquiries)) {
        setInquiries(data.inquiries);
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${getBaseUrl()}/api/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setInquiries((prev) =>
          prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item))
        );
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact inquiry?")) return;

    try {
      const res = await fetch(`${getBaseUrl()}/api/inquiries/${id}`, {
        method: "DELETE"
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setInquiries((prev) => prev.filter((item) => item._id !== id));
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(null);
        }
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const filteredInquiries = inquiries.filter((item) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && item.status === "Pending") ||
      (statusFilter === "replied" && item.status === "Replied");

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="admin-inquiries-shell">
      {/* Header Banner */}
      <div className="admin-inquiries-header">
        <div className="admin-inquiries-header-content">
          <span className="admin-inquiries-badge">
            <Sparkles size={14} /> Customer Messages & Feedback
          </span>
          <h1>Contact Form Inquiries</h1>
          <p>Review messages submitted by customers through website contact form.</p>
        </div>

        <button
          type="button"
          className="admin-inquiries-refresh-btn"
          onClick={() => fetchInquiries(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Messages"}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="admin-inquiries-filters">
        <div className="inquiries-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search name, phone, email or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" onClick={() => setSearchTerm("")}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="inquiries-status-filter">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses ({inquiries.length})</option>
            <option value="pending">Pending ({inquiries.filter((i) => i.status === "Pending").length})</option>
            <option value="replied">Replied ({inquiries.filter((i) => i.status === "Replied").length})</option>
          </select>
        </div>
      </div>

      {/* Main Content Table */}
      {loading ? (
        <div className="admin-inquiries-loading">
          <div className="inquiries-spinner" />
          <p>Loading inquiries...</p>
        </div>
      ) : filteredInquiries.length > 0 ? (
        <div className="admin-inquiries-table-wrapper">
          <table className="admin-inquiries-table">
            <thead>
              <tr>
                <th>Customer Info</th>
                <th>Subject</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => {
                const isPending = inquiry.status === "Pending";

                return (
                  <tr key={inquiry._id} className={isPending ? "row-pending" : ""}>
                    <td>
                      <div className="inquiry-customer-cell">
                        <strong>{inquiry.name}</strong>
                        <div className="customer-meta">
                          <span><Phone size={12} /> +91 {inquiry.phone}</span>
                          <span><Mail size={12} /> {inquiry.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="inquiry-subject-cell">
                        <span className="subject-tag">{inquiry.subject || "General"}</span>
                        <p className="message-snippet">{inquiry.message}</p>
                      </div>
                    </td>

                    <td>
                      <span className="inquiry-date">
                        <Calendar size={13} /> {formatDate(inquiry.createdAt)}
                      </span>
                    </td>

                    <td>
                      <span className={`inquiry-status-pill status-${inquiry.status?.toLowerCase() || 'pending'}`}>
                        {isPending ? <Clock size={12} /> : <CheckCircle size={12} />}
                        {inquiry.status || "Pending"}
                      </span>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <div className="inquiry-action-btns">
                        <button
                          type="button"
                          className="view-btn"
                          onClick={() => setSelectedInquiry(inquiry)}
                          title="View Full Message"
                        >
                          <Eye size={15} /> View
                        </button>

                        {isPending ? (
                          <button
                            type="button"
                            className="reply-btn"
                            onClick={() => handleUpdateStatus(inquiry._id, "Replied")}
                            title="Mark as Replied"
                          >
                            <CheckCircle size={15} /> Mark Replied
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pending-btn"
                            onClick={() => handleUpdateStatus(inquiry._id, "Pending")}
                            title="Mark Pending"
                          >
                            <Clock size={15} /> Mark Pending
                          </button>
                        )}

                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => handleDelete(inquiry._id)}
                          title="Delete Inquiry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-inquiries-empty">
          <AlertCircle size={36} color="#94a3b8" />
          <h3>No inquiries found</h3>
          <p>No customer contact form submissions match your filter.</p>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="inquiry-modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="inquiry-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="inquiry-modal-header">
              <div className="modal-title">
                <MessageSquare size={20} className="modal-icon" />
                <div>
                  <h3>Contact Inquiry Details</h3>
                  <small>Submitted on {formatDate(selectedInquiry.createdAt)}</small>
                </div>
              </div>

              <button type="button" className="close-btn" onClick={() => setSelectedInquiry(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="inquiry-modal-body">
              {/* Customer Box */}
              <div className="modal-info-box">
                <h4>Customer Contact Information</h4>
                <div className="info-grid">
                  <div>
                    <label>Full Name</label>
                    <strong>{selectedInquiry.name}</strong>
                  </div>
                  <div>
                    <label>Phone Number</label>
                    <strong>+91 {selectedInquiry.phone}</strong>
                  </div>
                  <div className="info-full">
                    <label>Email Address</label>
                    <strong>{selectedInquiry.email}</strong>
                  </div>
                </div>
              </div>

              {/* Subject & Message Box */}
              <div className="modal-message-box">
                <div className="subject-line">
                  <label>Subject:</label>
                  <span className="subject-pill">{selectedInquiry.subject || "General Enquiry"}</span>
                </div>
                <div className="message-content">
                  <label>Customer Message:</label>
                  <p>{selectedInquiry.message}</p>
                </div>
              </div>
            </div>

            <div className="inquiry-modal-footer">
              {selectedInquiry.status === "Pending" ? (
                <button
                  type="button"
                  className="modal-reply-btn"
                  onClick={() => handleUpdateStatus(selectedInquiry._id, "Replied")}
                >
                  <CheckCircle size={16} /> Mark as Replied
                </button>
              ) : (
                <button
                  type="button"
                  className="modal-pending-btn"
                  onClick={() => handleUpdateStatus(selectedInquiry._id, "Pending")}
                >
                  <Clock size={16} /> Mark as Pending
                </button>
              )}

              <button
                type="button"
                className="modal-delete-btn"
                onClick={() => handleDelete(selectedInquiry._id)}
              >
                <Trash2 size={16} /> Delete
              </button>

              <button type="button" className="modal-close-btn" onClick={() => setSelectedInquiry(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
