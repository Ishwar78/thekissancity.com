import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { api } from "../../utils/api";
import "./AdminSolarInquiries.css";

const STATUS_OPTIONS = ["New", "Contacted", "In Progress", "Completed"];

const STATUS_META = {
  New: {
    className: "new",
    icon: Clock3,
  },
  Contacted: {
    className: "contacted",
    icon: Phone,
  },
  "In Progress": {
    className: "in-progress",
    icon: Loader2,
  },
  Completed: {
    className: "completed",
    icon: CheckCircle2,
  },
};

export default function AdminSolarInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");

  const baseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:5005"
  ).replace(/\/$/, "");

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api("/api/solar-inquiries");

      if (!data?.success) {
        throw new Error(data?.message || "Unable to fetch solar inquiries");
      }

      setInquiries(Array.isArray(data.inquiries) ? data.inquiries : []);
    } catch (err) {
      console.error("Failed to fetch solar inquiries:", err);
      setError(err.message || "Unable to load solar inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${baseUrl}/api/solar-inquiries/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Unable to update inquiry status");
      }

      setInquiries((previous) =>
        previous.map((item) => (item._id === id ? data.inquiry : item))
      );
    } catch (err) {
      console.error("Error updating inquiry status:", err);
      alert(err.message || "Unable to update inquiry status.");
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this solar inquiry?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${baseUrl}/api/solar-inquiries/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Unable to delete inquiry");
      }

      setInquiries((previous) =>
        previous.filter((item) => item._id !== id)
      );
    } catch (err) {
      console.error("Error deleting inquiry:", err);
      alert(err.message || "Unable to delete inquiry.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const filteredInquiries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return inquiries.filter((item) => {
      const searchableValues = [
        item?.name,
        item?.email,
        item?.mobile,
        item?.city,
        item?.state,
        item?.dryerSize,
        item?.agricultureType,
        item?.companyName,
        item?.purpose,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      const matchesSearch =
        !normalizedSearch ||
        searchableValues.some((value) => value.includes(normalizedSearch));

      const matchesStatus =
        statusFilter === "ALL" || item?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inquiries, searchTerm, statusFilter]);

  const stats = useMemo(
    () => ({
      total: inquiries.length,
      new: inquiries.filter((item) => item.status === "New").length,
      active: inquiries.filter((item) =>
        ["Contacted", "In Progress"].includes(item.status)
      ).length,
      completed: inquiries.filter((item) => item.status === "Completed").length,
    }),
    [inquiries]
  );

  const renderStatusControl = (item) => {
    const currentStatus = item?.status || "New";
    const statusMeta = STATUS_META[currentStatus] || STATUS_META.New;
    const StatusIcon = statusMeta.icon;
    const isUpdating = updatingId === item._id;

    return (
      <div
        className={`admin-solar-status-select status-${statusMeta.className}`}
      >
        {isUpdating ? (
          <Loader2 size={15} className="admin-solar-spin" />
        ) : (
          <StatusIcon size={15} />
        )}

        <select
          value={currentStatus}
          disabled={isUpdating}
          onChange={(event) =>
            handleStatusChange(item._id, event.target.value)
          }
        >
          {STATUS_OPTIONS.map((status) => (
            <option value={status} key={status}>
              {status}
            </option>
          ))}
        </select>

        <ChevronDown size={15} />
      </div>
    );
  };

  const renderMobileCard = (item) => (
    <article className="admin-solar-mobile-card" key={item._id}>
      <div className="admin-solar-mobile-card-header">
        <div className="admin-solar-mobile-customer">
          <span className="admin-solar-avatar">
            {item?.name?.charAt(0)?.toUpperCase() || "S"}
          </span>

          <div>
            <h3>{item?.name || "Unknown Customer"}</h3>
            <span>{formatDate(item?.createdAt)}</span>
          </div>
        </div>

        {renderStatusControl(item)}
      </div>

      <div className="admin-solar-mobile-details">
        <a href={`tel:${item?.mobile || ""}`}>
          <Phone size={15} />
          <span>{item?.mobile || "N/A"}</span>
        </a>

        <a href={`mailto:${item?.email || ""}`}>
          <Mail size={15} />
          <span>{item?.email || "N/A"}</span>
        </a>

        <div>
          <MapPin size={15} />
          <span>
            {[item?.city, item?.state].filter(Boolean).join(", ") || "N/A"}
          </span>
        </div>

        {item?.companyName && (
          <div>
            <Building2 size={15} />
            <span>{item.companyName}</span>
          </div>
        )}
      </div>

      <div className="admin-solar-mobile-tags">
        <span className="admin-solar-size-badge">
          {item?.dryerSize || "Size not provided"}
        </span>

        {item?.agricultureType && (
          <span className="admin-solar-type-badge">
            {item.agricultureType}
          </span>
        )}
      </div>

      <div className="admin-solar-mobile-purpose">
        <span>Purpose</span>
        <p>{item?.purpose || "No purpose provided"}</p>

        {item?.remarks && (
          <blockquote>{item.remarks}</blockquote>
        )}
      </div>

      <button
        type="button"
        className="admin-solar-delete-btn admin-solar-delete-btn--mobile"
        onClick={() => handleDelete(item._id)}
      >
        <Trash2 size={15} />
        Delete Inquiry
      </button>
    </article>
  );

  return (
    <div className="admin-solar-container">
      <section className="admin-solar-hero">
        <div>
          <span className="admin-solar-eyebrow">
            <Sun size={15} />
            Solar Lead Management
          </span>

          <h1>Solar Dryer Inquiries</h1>

          <p>
            Manage inquiries submitted by farmers and business owners from the
            Solar Dryer page.
          </p>
        </div>

        <div className="admin-solar-stats">
          <div>
            <strong>{stats.total}</strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{stats.new}</strong>
            <span>New</span>
          </div>

          <div>
            <strong>{stats.active}</strong>
            <span>Active</span>
          </div>

          <div>
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </div>
        </div>
      </section>

      <section className="admin-solar-content-card">
        <div className="admin-solar-toolbar">
          <div className="admin-solar-search-wrap">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search name, mobile, city, dryer size..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="admin-solar-filter-wrap">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All Statuses ({inquiries.length})</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>

            <ChevronDown size={17} />
          </div>
        </div>

        <div className="admin-solar-results-bar">
          <div>
            <Users size={16} />
            <span>
              <strong>{filteredInquiries.length}</strong>{" "}
              {filteredInquiries.length === 1 ? "inquiry" : "inquiries"} found
            </span>
          </div>

          {(searchTerm || statusFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="admin-solar-state">
            <span className="admin-solar-state-icon">
              <Loader2 size={31} className="admin-solar-spin" />
            </span>

            <h3>Loading inquiries</h3>
            <p>Please wait while solar inquiries are being fetched.</p>
          </div>
        ) : error ? (
          <div className="admin-solar-state admin-solar-state--error">
            <span className="admin-solar-state-icon">
              <Sun size={31} />
            </span>

            <h3>Unable to load inquiries</h3>
            <p>{error}</p>

            <button type="button" onClick={fetchInquiries}>
              Try Again
            </button>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="admin-solar-state">
            <span className="admin-solar-state-icon">
              <Sun size={31} />
            </span>

            <h3>No solar inquiries found</h3>
            <p>Try changing your search keyword or selected status.</p>
          </div>
        ) : (
          <>
            <div className="admin-solar-table-card">
              <div className="admin-solar-table-scroll">
                <table className="admin-solar-table">
                  <thead>
                    <tr>
                      <th>Contact Info</th>
                      <th>Location & Type</th>
                      <th>Dryer Requirement</th>
                      <th>Purpose / Remarks</th>
                      <th>Date & Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInquiries.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="admin-solar-contact">
                            <span className="admin-solar-avatar">
                              {item?.name?.charAt(0)?.toUpperCase() || "S"}
                            </span>

                            <div>
                              <strong>{item?.name || "Unknown"}</strong>

                              <a href={`tel:${item?.mobile || ""}`}>
                                <Phone size={13} />
                                {item?.mobile || "N/A"}
                              </a>

                              <a href={`mailto:${item?.email || ""}`}>
                                <Mail size={13} />
                                {item?.email || "N/A"}
                              </a>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="admin-solar-location">
                            <strong>
                              <MapPin size={14} />
                              {[item?.city, item?.state]
                                .filter(Boolean)
                                .join(", ") || "N/A"}
                            </strong>

                            {item?.agricultureType && (
                              <span>Type: {item.agricultureType}</span>
                            )}

                            {item?.companyName && (
                              <span>Company: {item.companyName}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="admin-solar-size-badge">
                            {item?.dryerSize || "Not specified"}
                          </span>
                        </td>

                        <td>
                          <div className="admin-solar-purpose">
                            <strong>{item?.purpose || "N/A"}</strong>

                            {item?.remarks && (
                              <span title={item.remarks}>{item.remarks}</span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="admin-solar-date-status">
                            <span>
                              <CalendarDays size={13} />
                              {formatDate(item?.createdAt)}
                            </span>

                            {renderStatusControl(item)}
                          </div>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-solar-delete-btn"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-solar-mobile-list">
              {filteredInquiries.map(renderMobileCard)}
            </div>
          </>
        )}
      </section>
    </div>
  );
}