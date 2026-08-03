import React, { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Edit2,
  HeartPulse,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "../../utils/api";
import "./AdminHealth.css";

export default function AdminHealth() {
  const [healthCategories, setHealthCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);
  const formCardRef = useRef(null);

  const baseUrl = (
    import.meta.env.VITE_API_URL || "https://thekissancity.com"
  ).replace(/\/$/, "");

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";

    if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("blob:")) {
      return imageUrl;
    }

    return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  const fetchHealthCategories = async () => {
    try {
      setFetching(true);

      const data = await api("/api/health");

      setHealthCategories(
        Array.isArray(data?.healthCategories) ? data.healthCategories : []
      );
    } catch (error) {
      console.error("Failed to fetch health categories:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchHealthCategories();
  }, []);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5 MB.");
      event.target.value = "";
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setName("");
    setImage(null);
    setPreview("");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (health) => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setEditingId(health._id);
    setName(health.name || "");
    setPreview(getImageUrl(health.imageUrl));
    setImage(null);

    window.setTimeout(() => {
      formCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this health need?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${baseUrl}/api/health/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to delete health need");
      }

      if (editingId === id) {
        resetForm();
      }

      await fetchHealthCategories();
    } catch (error) {
      console.error("Error deleting health category:", error);
      alert(error.message || "Unable to delete health need.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Health need name is required.");
      return;
    }

    if (!editingId && !image) {
      alert("Image is required for a new health need.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", trimmedName);

      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("adminToken");

      const endpoint = editingId
        ? `${baseUrl}/api/health/${editingId}`
        : `${baseUrl}/api/health`;

      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to save health need");
      }

      resetForm();
      await fetchHealthCategories();
    } catch (error) {
      console.error("Error saving health category:", error);
      alert(error.message || "An error occurred while saving the health need.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-health-page">
      <div className="admin-health-heading">
        <div>
          <span className="admin-health-eyebrow">
            <HeartPulse size={15} />
            Health Management
          </span>

          <h1>Manage Health Needs</h1>

          <p>
            Create and update health-focused categories shown across the store.
          </p>
        </div>

        <div className="admin-health-summary">
          <div className="admin-health-summary-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>Total Health Needs</span>
            <strong>{healthCategories.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-health-layout">
        <section
          ref={formCardRef}
          className={`admin-health-form-card ${
            editingId ? "is-editing" : ""
          }`}
        >
          <div className="admin-health-card-header">
            <div>
              <span>{editingId ? "Update item" : "Create item"}</span>
              <h2>{editingId ? "Edit Health Need" : "Add Health Need"}</h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-health-close-edit"
                onClick={resetForm}
                aria-label="Cancel editing"
              >
                <X size={19} />
              </button>
            )}
          </div>

          <form className="admin-health-form" onSubmit={handleSubmit}>
            <div className="admin-health-field">
              <label htmlFor="health-name">
                Health Need Name <span>*</span>
              </label>

              <input
                id="health-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Immunity"
                required
              />
            </div>

            <div className="admin-health-field">
              <label>
                Icon / Image
                {editingId && <small>Leave unchanged to keep existing</small>}
              </label>

              <button
                type="button"
                className={`admin-health-upload ${
                  preview ? "has-preview" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Health need preview" />

                    <span className="admin-health-upload-overlay">
                      <Upload size={19} />
                      Change Image
                    </span>
                  </>
                ) : (
                  <span className="admin-health-upload-placeholder">
                    <span className="admin-health-upload-icon">
                      <Upload size={26} />
                    </span>

                    <strong>Upload health image</strong>
                    <small>PNG, JPG or WEBP up to 5 MB</small>
                  </span>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageChange}
                hidden
              />
            </div>

            <div className="admin-health-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="admin-health-cancel-btn"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="admin-health-submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="admin-health-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Plus size={18} />
                    )}

                    {editingId ? "Update Health Need" : "Add Health Need"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-health-list-card">
          <div className="admin-health-card-header admin-health-list-header">
            <div>
              <span>Website health section</span>
              <h2>Existing Health Needs</h2>
            </div>

            <span className="admin-health-count">
              {healthCategories.length} items
            </span>
          </div>

          {fetching ? (
            <div className="admin-health-state">
              <span className="admin-health-state-icon">
                <Loader2 size={29} className="admin-health-spin" />
              </span>

              <h3>Loading health needs</h3>
              <p>Please wait while the data is being fetched.</p>
            </div>
          ) : healthCategories.length === 0 ? (
            <div className="admin-health-state">
              <span className="admin-health-state-icon">
                <ImageIcon size={30} />
              </span>

              <h3>No health needs found</h3>
              <p>Add your first health need using the form.</p>
            </div>
          ) : (
            <div className="admin-health-grid">
              {healthCategories.map((health) => (
                <article
                  key={health._id}
                  className={`admin-health-item ${
                    editingId === health._id ? "is-selected" : ""
                  }`}
                >
                  <div className="admin-health-actions">
                    <button
                      type="button"
                      className="admin-health-edit-btn"
                      onClick={() => handleEdit(health)}
                      aria-label={`Edit ${health.name}`}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      className="admin-health-delete-btn"
                      onClick={() => handleDelete(health._id)}
                      aria-label={`Delete ${health.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="admin-health-image">
                    {health.imageUrl ? (
                      <img
                        src={getImageUrl(health.imageUrl)}
                        alt={health.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.nextElementSibling?.classList.add(
                            "is-visible"
                          );
                        }}
                      />
                    ) : null}

                    <span
                      className={`admin-health-image-fallback ${
                        !health.imageUrl ? "is-visible" : ""
                      }`}
                    >
                      <HeartPulse size={27} />
                    </span>
                  </div>

                  <div className="admin-health-item-content">
                    <h3>{health.name}</h3>
                    <span>Health need</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}