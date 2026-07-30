import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  MapPin,
  Award,
  Clock
} from "lucide-react";
import "./AdminFarmersExperts.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "link"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["clean"],
  ],
};

export default function AdminFarmersExperts() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    type: "Farmer",
    location: "",
    specialty: "",
    experience: "",
    quote: "",
    isVisible: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const BASE_URL = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/farmers-experts`);
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
      }
    } catch (err) {
      console.error("Error fetching profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      type: "Farmer",
      location: "",
      specialty: "",
      experience: "",
      quote: "",
      isVisible: true,
    });
    setImageFile(null);
    setImagePreview("");
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (profile) => {
    setEditingId(profile._id);
    setFormData({
      name: profile.name || "",
      type: profile.type || "Farmer",
      location: profile.location || "",
      specialty: profile.specialty || "",
      experience: profile.experience || "",
      quote: profile.quote || "",
      isVisible: profile.isVisible !== undefined ? profile.isVisible : true,
    });
    setImageFile(null);

    let imgPath = profile.image || "";
    if (imgPath && !imgPath.startsWith("http")) {
      imgPath = `${BASE_URL}${imgPath.startsWith("/") ? "" : "/"}${imgPath}`;
    }
    setImagePreview(imgPath);
    setMessage({ type: "", text: "" });
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Please enter full name" });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("type", formData.type);
      data.append("location", formData.location.trim());
      data.append("specialty", formData.specialty.trim());
      data.append("experience", formData.experience.trim());
      data.append("quote", formData.quote);
      data.append("isVisible", formData.isVisible);

      if (imageFile) {
        data.append("image", imageFile);
      } else if (imagePreview && editingId) {
        data.append("image", imagePreview);
      }

      const url = editingId
        ? `${BASE_URL}/api/farmers-experts/${editingId}`
        : `${BASE_URL}/api/farmers-experts`;

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: data,
      });

      const result = await res.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: editingId ? "Profile updated successfully!" : "Profile added successfully!",
        });
        setTimeout(() => {
          setIsModalOpen(false);
          fetchProfiles();
        }, 1000);
      } else {
        setMessage({ type: "error", text: result.message || "Failed to save profile" });
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setMessage({ type: "error", text: "Server connection failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete profile "${name}"?`)) return;

    try {
      const res = await fetch(`${BASE_URL}/api/farmers-experts/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchProfiles();
      } else {
        alert(data.message || "Failed to delete profile");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleToggleVisibility = async (profile) => {
    try {
      const res = await fetch(`${BASE_URL}/api/farmers-experts/${profile._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !profile.isVisible }),
      });
      const data = await res.json();
      if (data.success) {
        fetchProfiles();
      }
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const filteredProfiles = profiles.filter((p) => {
    const matchesType = filterType === "all" || p.type.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.specialty && p.specialty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getImageUrl = (path) => {
    if (!path) return "/hero_banner.png";
    if (path.startsWith("http")) return path;
    return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  return (
    <div className="fe-admin">
      {/* Header */}
      <div className="fe-admin__header">
        <div>
          <h2 className="fe-admin__title">
            <Users size={24} className="fe-title-icon" />
            Farmers & Experts Management
          </h2>
          <p className="fe-admin__subtitle">
            Add and manage agricultural farmers & expert profiles shown on the About Us page.
          </p>
        </div>
        <button className="fe-btn-add" onClick={openAddModal}>
          <Plus size={18} /> Add Profile
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="fe-admin__controls">
        <div className="fe-tabs">
          <button
            className={`fe-tab ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            All ({profiles.length})
          </button>
          <button
            className={`fe-tab ${filterType === "farmer" ? "active" : ""}`}
            onClick={() => setFilterType("farmer")}
          >
            Farmers ({profiles.filter((p) => p.type === "Farmer").length})
          </button>
          <button
            className={`fe-tab ${filterType === "expert" ? "active" : ""}`}
            onClick={() => setFilterType("expert")}
          >
            Experts ({profiles.filter((p) => p.type === "Expert").length})
          </button>
        </div>

        <div className="fe-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, location, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Profiles Grid / List */}
      {loading ? (
        <div className="fe-loading">
          <div className="fe-spinner" />
          <p>Loading profiles...</p>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="fe-empty">
          <Users size={48} />
          <h3>No profiles found</h3>
          <p>Click "Add Profile" to create a new farmer or expert profile.</p>
        </div>
      ) : (
        <div className="fe-grid">
          {filteredProfiles.map((profile) => (
            <div key={profile._id} className={`fe-card ${!profile.isVisible ? "hidden-card" : ""}`}>
              <div className="fe-card__header">
                <img
                  src={getImageUrl(profile.image)}
                  alt={profile.name}
                  className="fe-card__avatar"
                  onError={(e) => {
                    e.currentTarget.src = "/hero_banner.png";
                  }}
                />
                <div className="fe-card__meta">
                  <span className={`fe-badge fe-badge--${profile.type.toLowerCase()}`}>
                    {profile.type}
                  </span>
                  <h4 className="fe-card__name">{profile.name}</h4>
                  {profile.location && (
                    <span className="fe-card__sub">
                      <MapPin size={13} /> {profile.location}
                    </span>
                  )}
                </div>
              </div>

              <div className="fe-card__body">
                {profile.specialty && (
                  <div className="fe-card__info-row">
                    <Award size={14} /> <strong>Specialty:</strong> {profile.specialty}
                  </div>
                )}
                {profile.experience && (
                  <div className="fe-card__info-row">
                    <Clock size={14} /> <strong>Experience:</strong> {profile.experience}
                  </div>
                )}
                {profile.quote && (
                  <div
                    className="fe-card__quote"
                    dangerouslySetInnerHTML={{ __html: profile.quote }}
                  />
                )}
              </div>

              <div className="fe-card__footer">
                <button
                  className={`fe-action-btn ${profile.isVisible ? "visible" : "invisible"}`}
                  onClick={() => handleToggleVisibility(profile)}
                  title={profile.isVisible ? "Visible on website" : "Hidden from website"}
                >
                  {profile.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                  <span>{profile.isVisible ? "Visible" : "Hidden"}</span>
                </button>

                <div className="fe-card__actions">
                  <button
                    className="fe-icon-btn edit"
                    onClick={() => openEditModal(profile)}
                    title="Edit profile"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="fe-icon-btn delete"
                    onClick={() => handleDelete(profile._id, profile.name)}
                    title="Delete profile"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL - MATCHING EXACT USER SCREENSHOT */}
      {isModalOpen && (
        <div className="fe-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="fe-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="fe-modal-header">
              <h3>{editingId ? "Edit Profile" : "Add Profile"}</h3>
              <button className="fe-modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="fe-modal-form">
              {message.text && (
                <div className={`fe-alert fe-alert--${message.type}`}>
                  {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              {/* Row 1: Name & Type */}
              <div className="fe-form-row">
                <div className="fe-form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="fe-form-group">
                  <label>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Farmer">Farmer</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Location & Specialty */}
              <div className="fe-form-row">
                <div className="fe-form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div className="fe-form-group">
                  <label>Specialty</label>
                  <input
                    type="text"
                    placeholder="Specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Experience */}
              <div className="fe-form-row">
                <div className="fe-form-group fe-form-group--half">
                  <label>Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 15+ years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </div>
              </div>

              {/* Profile Image upload box */}
              <div className="fe-form-group">
                <label>Profile Image *</label>

                <div className="fe-upload-button-wrap">
                  <label htmlFor="profile-img-input" className="fe-select-img-btn">
                    <Upload size={16} /> Select Images ({imagePreview ? "1/1" : "0/1"})
                  </label>
                  <input
                    id="profile-img-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </div>

                <div className="fe-dropzone">
                  {imagePreview ? (
                    <div className="fe-preview-box">
                      <img src={imagePreview} alt="Preview" />
                      <button
                        type="button"
                        className="fe-remove-img"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="fe-dropzone-placeholder">
                      <Upload size={28} className="fe-drop-icon" />
                      <p>No images selected. Click "Select Images" to add them.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quote - Rich Text Editor */}
              <div className="fe-form-group">
                <label>Quote</label>
                <div className="fe-quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    modules={modules}
                    value={formData.quote}
                    onChange={(val) => setFormData({ ...formData, quote: val })}
                    placeholder="Enter quote or bio details..."
                  />
                </div>
              </div>

              {/* Visible on website Toggle Switch */}
              <div className="fe-form-group fe-toggle-group">
                <label className="fe-switch">
                  <input
                    type="checkbox"
                    checked={formData.isVisible}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                  />
                  <span className="fe-slider round" />
                </label>
                <span className="fe-toggle-label">Visible on website</span>
              </div>

              {/* Footer Buttons */}
              <div className="fe-modal-footer">
                <button
                  type="button"
                  className="fe-btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="fe-btn-save" disabled={saving}>
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
