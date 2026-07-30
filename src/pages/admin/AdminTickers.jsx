import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Hash,
  ListOrdered,
  LoaderCircle,
  Megaphone,
  Plus,
  Radio,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../../utils/api";
import "./AdminTickers.css";

const EMPTY_FORM = {
  text: "",
  isActive: true,
  order: 0,
};

export default function AdminTickers() {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    fetchTickers();
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const fetchTickers = async () => {
    setLoading(true);
    setPageError("");

    try {
      const data = await api("/api/tickers");

      if (data?.success) {
        const incoming = Array.isArray(data.tickers) ? data.tickers : [];

        setTickers(
          [...incoming].sort(
            (first, second) =>
              Number(first.order || 0) - Number(second.order || 0),
          ),
        );
      } else {
        setPageError(data?.message || "Unable to load ticker messages.");
      }
    } catch (error) {
      setPageError(error?.message || "Failed to fetch tickers.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const active = tickers.filter((ticker) => ticker.isActive).length;

    return {
      total: tickers.length,
      active,
      inactive: tickers.length - active,
      nextOrder:
        tickers.length > 0
          ? Math.max(...tickers.map((ticker) => Number(ticker.order || 0))) + 1
          : 0,
    };
  }, [tickers]);

  const filteredTickers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return tickers.filter((ticker) => {
      const matchesSearch =
        !normalizedSearch ||
        String(ticker.text || "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && ticker.isActive) ||
        (statusFilter === "inactive" && !ticker.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [tickers, searchTerm, statusFilter]);

  const activePreviewTickers = useMemo(
    () =>
      [...tickers]
        .filter((ticker) => ticker.isActive)
        .sort(
          (first, second) =>
            Number(first.order || 0) - Number(second.order || 0),
        ),
    [tickers],
  );

  const openModal = (ticker = null) => {
    setFormError("");

    if (ticker) {
      setEditingId(ticker._id);
      setFormData({
        text: ticker.text || "",
        isActive: Boolean(ticker.isActive),
        order: Number(ticker.order || 0),
      });
    } else {
      setEditingId(null);
      setFormData({
        text: "",
        isActive: true,
        order: stats.nextOrder,
      });
    }

    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    document.body.style.overflow = "";
  };

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (formError) setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const cleanText = formData.text.trim();

    if (!cleanText) {
      setFormError("Please enter the ticker message.");
      return;
    }

    if (cleanText.length < 5) {
      setFormError("Ticker message should contain at least 5 characters.");
      return;
    }

    if (Number(formData.order) < 0) {
      setFormError("Display order cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        text: cleanText,
        isActive: Boolean(formData.isActive),
        order: Number(formData.order || 0),
      };

      if (editingId) {
        await api(`/api/tickers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/tickers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      await fetchTickers();
      closeModal();
    } catch (error) {
      setFormError(error?.message || "Error saving ticker.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ticker) => {
    const shouldDelete = window.confirm(
      `Delete this ticker?\n\n"${ticker.text}"`,
    );

    if (!shouldDelete) return;

    setDeletingId(ticker._id);

    try {
      await api(`/api/tickers/${ticker._id}`, {
        method: "DELETE",
      });

      setTickers((current) =>
        current.filter((item) => item._id !== ticker._id),
      );
    } catch (error) {
      window.alert(error?.message || "Error deleting ticker.");
    } finally {
      setDeletingId("");
    }
  };

  const toggleStatus = async (ticker) => {
    setStatusUpdatingId(ticker._id);

    try {
      await api(`/api/tickers/${ticker._id}`, {
        method: "PUT",
        body: JSON.stringify({
          isActive: !ticker.isActive,
        }),
      });

      setTickers((current) =>
        current.map((item) =>
          item._id === ticker._id
            ? { ...item, isActive: !item.isActive }
            : item,
        ),
      );
    } catch (error) {
      window.alert(error?.message || "Failed to update ticker status.");
    } finally {
      setStatusUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="admin-ticker-loading">
        <span>
          <LoaderCircle className="admin-ticker-spinner" size={28} />
        </span>
        <h3>Loading ticker messages</h3>
        <p>Please wait while the announcement bar is being prepared.</p>
      </div>
    );
  }

  return (
    <div className="admin-tickers">
      <section className="admin-ticker-hero">
        <div className="admin-ticker-hero__copy">
          <span className="admin-ticker-eyebrow">
            <Megaphone size={15} />
            Website announcement bar
          </span>

          <h1>Ticker Bar Management</h1>

          <p>
            Add offers, delivery updates and important announcements that appear
            in the moving ticker at the top of your website.
          </p>
        </div>

        <button
          type="button"
          className="admin-ticker-primary-btn"
          onClick={() => openModal()}
        >
          <Plus size={19} />
          Add New Ticker
        </button>
      </section>

      <section className="admin-ticker-stats">
        <TickerStatCard
          icon={Megaphone}
          title="Total Tickers"
          value={stats.total}
          description="All announcements"
        />

        <TickerStatCard
          icon={Radio}
          title="Active"
          value={stats.active}
          description="Visible on website"
          variant="success"
        />

        <TickerStatCard
          icon={EyeOff}
          title="Inactive"
          value={stats.inactive}
          description="Currently hidden"
          variant="warning"
        />

        <TickerStatCard
          icon={ListOrdered}
          title="Next Order"
          value={stats.nextOrder}
          description="Suggested sequence"
          variant="info"
        />
      </section>

      <section className="admin-ticker-preview-card">
        <div className="admin-ticker-preview-card__header">
          <div>
            <span className="admin-ticker-eyebrow">
              <Sparkles size={14} />
              Live website preview
            </span>
            <h2>Announcement Ticker Preview</h2>
            <p>Only active ticker messages are displayed in this preview.</p>
          </div>

          <span className="admin-ticker-preview-status">
            <Radio size={13} />
            {activePreviewTickers.length} active
          </span>
        </div>

        <div className="admin-ticker-live-preview">
          <span className="admin-ticker-live-preview__label">
            <Megaphone size={16} />
            Latest Updates
          </span>

          <div className="admin-ticker-live-preview__viewport">
            {activePreviewTickers.length > 0 ? (
              <div className="admin-ticker-live-preview__track">
                {[...activePreviewTickers, ...activePreviewTickers].map(
                  (ticker, index) => (
                    <span key={`${ticker._id}-${index}`}>
                      {ticker.text}
                      <i>•</i>
                    </span>
                  ),
                )}
              </div>
            ) : (
              <div className="admin-ticker-live-preview__empty">
                No active announcement is currently visible.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="admin-ticker-panel">
        <div className="admin-ticker-toolbar">
          <div className="admin-ticker-search">
            <Search size={18} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search ticker message..."
              aria-label="Search tickers"
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

          <div className="admin-ticker-filter">
            {[
              {
                id: "all",
                label: "All",
                count: stats.total,
              },
              {
                id: "active",
                label: "Active",
                count: stats.active,
              },
              {
                id: "inactive",
                label: "Inactive",
                count: stats.inactive,
              },
            ].map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={statusFilter === filter.id ? "is-active" : ""}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}
                <span>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        {pageError && (
          <div className="admin-ticker-alert">
            <AlertCircle size={17} />
            <span>{pageError}</span>
            <button type="button" onClick={fetchTickers}>
              Try again
            </button>
          </div>
        )}

        <div className="admin-ticker-list-heading">
          <div>
            <h2>Ticker Messages</h2>
            <p>
              Showing {filteredTickers.length} of {tickers.length} ticker
              {tickers.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {filteredTickers.length === 0 ? (
          <div className="admin-ticker-empty">
            <span>
              <Megaphone size={35} />
            </span>

            <h3>
              {tickers.length === 0
                ? "No ticker message added yet"
                : "No matching ticker found"}
            </h3>

            <p>
              {tickers.length === 0
                ? "Create your first announcement to display it at the top of the website."
                : "Try another search text or change the selected status filter."}
            </p>

            {tickers.length === 0 && (
              <button
                type="button"
                className="admin-ticker-primary-btn"
                onClick={() => openModal()}
              >
                <Plus size={18} />
                Create First Ticker
              </button>
            )}
          </div>
        ) : (
          <div className="admin-ticker-list">
            {filteredTickers.map((ticker, index) => {
              const statusLoading = statusUpdatingId === ticker._id;
              const deleteLoading = deletingId === ticker._id;

              return (
                <article
                  key={ticker._id}
                  className={`admin-ticker-card ${
                    !ticker.isActive ? "is-inactive" : ""
                  }`}
                >
                  <div className="admin-ticker-card__handle">
                    <GripVertical size={20} />
                  </div>

                  <div className="admin-ticker-card__order">
                    <span>Position</span>
                    <strong>
                      {String(Number(ticker.order || 0) + 1).padStart(2, "0")}
                    </strong>
                  </div>

                  <div className="admin-ticker-card__content">
                    <div className="admin-ticker-card__badges">
                      <span
                        className={`admin-ticker-status-badge ${
                          ticker.isActive ? "is-active" : "is-inactive"
                        }`}
                      >
                        {ticker.isActive ? (
                          <CheckCircle2 size={13} />
                        ) : (
                          <EyeOff size={13} />
                        )}
                        {ticker.isActive ? "Active" : "Inactive"}
                      </span>

                      <span className="admin-ticker-order-badge">
                        <Hash size={12} />
                        Order {ticker.order ?? index}
                      </span>
                    </div>

                    <p>{ticker.text}</p>

                    <small>
                      {ticker.isActive
                        ? "This message is currently visible on the website."
                        : "This message is saved but hidden from website users."}
                    </small>
                  </div>

                  <div className="admin-ticker-card__actions">
                    <button
                      type="button"
                      className={`admin-ticker-action-btn status ${
                        ticker.isActive ? "deactivate" : "activate"
                      }`}
                      onClick={() => toggleStatus(ticker)}
                      disabled={statusLoading || deleteLoading}
                      title={ticker.isActive ? "Deactivate" : "Activate"}
                    >
                      {statusLoading ? (
                        <LoaderCircle
                          className="admin-ticker-spinner"
                          size={17}
                        />
                      ) : ticker.isActive ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                      <span>{ticker.isActive ? "Hide" : "Show"}</span>
                    </button>

                    <button
                      type="button"
                      className="admin-ticker-action-btn edit"
                      onClick={() => openModal(ticker)}
                      disabled={statusLoading || deleteLoading}
                      title="Edit ticker"
                    >
                      <Edit3 size={17} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="admin-ticker-action-btn delete"
                      onClick={() => handleDelete(ticker)}
                      disabled={statusLoading || deleteLoading}
                      title="Delete ticker"
                    >
                      {deleteLoading ? (
                        <LoaderCircle
                          className="admin-ticker-spinner"
                          size={17}
                        />
                      ) : (
                        <Trash2 size={17} />
                      )}
                      <span>Delete</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {showModal && (
        <div
          className="admin-ticker-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="admin-ticker-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticker-modal-title"
          >
            <div className="admin-ticker-modal__header">
              <div>
                <span className="admin-ticker-eyebrow">
                  {editingId ? <Edit3 size={14} /> : <Plus size={14} />}
                  {editingId ? "Update announcement" : "Create announcement"}
                </span>

                <h2 id="ticker-modal-title">
                  {editingId ? "Edit Ticker" : "Add New Ticker"}
                </h2>

                <p>
                  Add a clear and short message for the announcement bar shown
                  at the top of the website.
                </p>
              </div>

              <button
                type="button"
                className="admin-ticker-modal__close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            <form className="admin-ticker-form" onSubmit={handleSubmit}>
              {formError && (
                <div className="admin-ticker-form-error">
                  <AlertCircle size={17} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="admin-ticker-form-section">
                <div className="admin-ticker-form-section__heading">
                  <span>01</span>
                  <div>
                    <h3>Ticker Message</h3>
                    <p>Emojis and offer information can be included.</p>
                  </div>
                </div>

                <label className="admin-ticker-form-field">
                  <span className="admin-ticker-form-field__label">
                    <span>
                      Announcement Text <em>*</em>
                    </span>
                    <small>{formData.text.length}/180</small>
                  </span>

                  <textarea
                    value={formData.text}
                    onChange={(event) =>
                      updateField("text", event.target.value.slice(0, 180))
                    }
                    required
                    rows={4}
                    placeholder="e.g. 🌾 Free Delivery on Orders Above ₹499"
                  />
                </label>

                <div className="admin-ticker-message-preview">
                  <span>
                    <Sparkles size={15} />
                    Message Preview
                  </span>

                  <div>
                    <Megaphone size={17} />
                    <p>
                      {formData.text.trim() ||
                        "Your announcement preview will appear here."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="admin-ticker-form-section">
                <div className="admin-ticker-form-section__heading">
                  <span>02</span>
                  <div>
                    <h3>Display Settings</h3>
                    <p>Control sequence and website visibility.</p>
                  </div>
                </div>

                <div className="admin-ticker-form-grid">
                  <label className="admin-ticker-form-field">
                    <span className="admin-ticker-form-field__label">
                      <span>Display Order</span>
                    </span>

                    <div className="admin-ticker-number-field">
                      <ListOrdered size={17} />
                      <input
                        type="number"
                        min="0"
                        value={formData.order}
                        onChange={(event) =>
                          updateField(
                            "order",
                            Math.max(0, Number(event.target.value)),
                          )
                        }
                      />
                    </div>

                    <small className="admin-ticker-field-help">
                      Lower numbers appear first in the ticker.
                    </small>
                  </label>

                  <div className="admin-ticker-visibility-field">
                    <span className="admin-ticker-form-field__label">
                      <span>Website Visibility</span>
                    </span>

                    <label className="admin-ticker-switch-card">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(event) =>
                          updateField("isActive", event.target.checked)
                        }
                      />

                      <span className="admin-ticker-switch">
                        <span />
                      </span>

                      <span className="admin-ticker-switch-copy">
                        <strong>
                          {formData.isActive ? "Active" : "Inactive"}
                        </strong>
                        <small>
                          {formData.isActive
                            ? "Ticker will be visible on the website"
                            : "Ticker will remain hidden"}
                        </small>
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-ticker-form-actions">
                <button
                  type="button"
                  className="admin-ticker-secondary-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-ticker-primary-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        className="admin-ticker-spinner"
                        size={18}
                      />
                      {editingId ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingId ? "Update Ticker" : "Save Ticker"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TickerStatCard({
  icon: Icon,
  title,
  value,
  description,
  variant = "",
}) {
  return (
    <article className={`admin-ticker-stat-card ${variant}`}>
      <span className="admin-ticker-stat-card__icon">
        <Icon size={21} />
      </span>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </article>
  );
}