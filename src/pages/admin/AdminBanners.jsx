import React, { useEffect, useRef, useState } from "react";
import {
  Edit2,
  ImageIcon,
  LayoutTemplate,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "../../utils/api";
import "./AdminBanners.css";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [type, setType] = useState("main");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const fileInputRef = useRef(null);

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

  const fetchBanners = async () => {
    try {
      setFetching(true);

      const data = await api("/api/banners");

      setBanners(Array.isArray(data?.banners) ? data.banners : []);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBanners();
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

    if (file.size > 8 * 1024 * 1024) {
      alert("Banner image size should be less than 8 MB.");
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

    setEditingId(null);
    setType("main");
    setLink("");
    setImage(null);
    setPreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (banner) => {
    setEditingId(banner._id);
    setType(banner.type || "main");
    setLink(banner.link || "");
    setImage(null);
    setPreview(getImageUrl(banner.imageUrl));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!type) {
      alert("Banner type is required.");
      return;
    }

    if (!editingId && !image) {
      alert("Banner image is required.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("type", type);
      formData.append("link", link.trim());
      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("adminToken");
      const url = editingId
        ? `${baseUrl}/api/banners/${editingId}`
        : `${baseUrl}/api/banners`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to save banner");
      }

      resetForm();
      await fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
      alert(error.message || "An error occurred while saving the banner.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${baseUrl}/api/banners/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to delete banner");
      }

      await fetchBanners();
    } catch (error) {
      console.error("Error deleting banner:", error);
      alert(error.message || "An error occurred while deleting the banner.");
    }
  };

  const mainBanners = banners.filter((banner) => banner.type === "main");
  const sideBanners = banners.filter((banner) => banner.type === "side");

  const renderBannerSection = (list, title, description, sectionType) => (
    <section className="admin-banner-group">
      <div className="admin-banner-group-header">
        <div>
          <span>{description}</span>
          <h3>{title}</h3>
        </div>

        <span className="admin-banner-group-count">{list.length}</span>
      </div>

      {list.length === 0 ? (
        <div className="admin-banner-empty-group">
          <ImageIcon size={24} />
          <span>No banners found in this section.</span>
        </div>
      ) : (
        <div
          className={`admin-banner-grid admin-banner-grid--${sectionType}`}
        >
          {list.map((banner) => (
            <article className="admin-banner-card" key={banner._id}>
              <div className="admin-banner-card-image">
                <img
                  src={getImageUrl(banner.imageUrl)}
                  alt={`${title} banner`}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                    event.currentTarget.nextElementSibling?.classList.add(
                      "is-visible"
                    );
                  }}
                />

                <span className="admin-banner-image-fallback">
                  <ImageIcon size={30} />
                  Image unavailable
                </span>

                <span
                  className={`admin-banner-type-badge admin-banner-type-badge--${sectionType}`}
                >
                  {sectionType === "main" ? "Main Slider" : "Side Promo"}
                </span>

                <div
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    display: "flex",
                    gap: "6px",
                    zIndex: 4,
                  }}
                >
                  <button
                    type="button"
                    style={{
                      backgroundColor: "rgba(59, 130, 246, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "30px",
                      height: "30px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    }}
                    onClick={() => handleEdit(banner)}
                    aria-label="Edit banner"
                    title="Edit banner"
                  >
                    <Edit2 size={15} />
                  </button>

                  <button
                    type="button"
                    className="admin-banner-delete-btn"
                    style={{ position: "relative", top: 0, right: 0 }}
                    onClick={() => handleDelete(banner._id)}
                    aria-label="Delete banner"
                    title="Delete banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="admin-banner-card-footer">
                <Link2 size={15} />

                <span title={banner.link || "#products"}>
                  {banner.link || "#products"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="admin-banners-page">
      <div className="admin-banners-heading">
        <div>
          <span className="admin-banners-eyebrow">
            <LayoutTemplate size={15} />
            Banner Management
          </span>

          <h1>Manage Product Banners & Slider</h1>

          <p>
            Upload and edit main slider and side promotional banners for your storefront.
          </p>
        </div>

        <div className="admin-banners-summary">
          <div>
            <strong>{banners.length}</strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{mainBanners.length}</strong>
            <span>Main</span>
          </div>

          <div>
            <strong>{sideBanners.length}</strong>
            <span>Side</span>
          </div>
        </div>
      </div>

      <div className="admin-banners-layout">
        <section className="admin-banner-form-card">
          <div className="admin-banner-card-header">
            <div>
              <span>{editingId ? "Update media" : "Create banner"}</span>
              <h2>{editingId ? "Edit Banner / Slider" : "Add New Banner"}</h2>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <X size={14} /> Cancel Edit
              </button>
            )}
          </div>

          <form className="admin-banner-form" onSubmit={handleSubmit}>
            <div className="admin-banner-field">
              <label htmlFor="banner-type">
                Banner Type <span>*</span>
              </label>

              <select
                id="banner-type"
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option value="main">Main Slider Banner</option>
                <option value="side">Side Promo Banner</option>
              </select>
            </div>

            <div className="admin-banner-field">
              <label htmlFor="banner-link">
                Target Link <small>Optional</small>
              </label>

              <input
                id="banner-link"
                type="text"
                value={link}
                onChange={(event) => setLink(event.target.value)}
                placeholder="e.g. /category/food or #products"
              />
            </div>

            <div className="admin-banner-field">
              <label>
                Banner Image <span>{editingId ? "(Optional if unchanged)" : "*"}</span>
              </label>

              <button
                type="button"
                className={`admin-banner-upload ${
                  preview ? "has-preview" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Banner preview" />

                    <span className="admin-banner-upload-overlay">
                      <Upload size={19} />
                      Change Banner Image
                    </span>
                  </>
                ) : (
                  <span className="admin-banner-upload-placeholder">
                    <span className="admin-banner-upload-icon">
                      <Upload size={27} />
                    </span>

                    <strong>Upload banner image</strong>
                    <small>PNG, JPG or WEBP up to 8 MB</small>
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

              <p className="admin-banner-image-help">
                Recommended: wide landscape image for better storefront display.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                className="admin-banner-submit-btn"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="admin-banner-spin" />
                    {editingId ? "Updating Banner..." : "Adding Banner..."}
                  </>
                ) : (
                  <>
                    {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                    {editingId ? "Update Banner" : "Add Banner"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-banner-list-card">
          <div className="admin-banner-card-header admin-banner-list-header">
            <div>
              <span>Storefront media</span>
              <h2>Existing Banners</h2>
            </div>

            <span className="admin-banner-total-count">
              {banners.length} banners
            </span>
          </div>

          {fetching ? (
            <div className="admin-banner-state">
              <span className="admin-banner-state-icon">
                <Loader2 size={30} className="admin-banner-spin" />
              </span>

              <h3>Loading banners</h3>
              <p>Please wait while the banner list is being fetched.</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="admin-banner-state">
              <span className="admin-banner-state-icon">
                <ImageIcon size={31} />
              </span>

              <h3>No banners found</h3>
              <p>Upload your first banner using the form.</p>
            </div>
          ) : (
            <div className="admin-banner-sections">
              {renderBannerSection(
                mainBanners,
                "Main Slider Banners",
                "Homepage primary carousel",
                "main"
              )}

              {renderBannerSection(
                sideBanners,
                "Side Promo Banners",
                "Supporting promotional media",
                "side"
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}