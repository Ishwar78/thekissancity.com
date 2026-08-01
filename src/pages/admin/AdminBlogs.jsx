import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { api } from "../../utils/api";
import "./AdminBlogs.css";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "indent",
  "align",
  "blockquote",
  "code-block",
  "link",
];

const getContentText = (html = "") =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

const EMPTY_FORM = {
  title: "",
  category: "",
  author: "The Kissan City",
  metaDescription: "",
  content: "",
  readTime: "5 min read",
  isActive: true,
};

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [statusUpdatingId, setStatusUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const fileInputRef = useRef(null);

  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/$/, "");

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchBlogs = async () => {
    setLoading(true);
    setPageError("");
    try {
      const data = await api("/api/blogs?all=true");
      if (data?.success) {
        setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      } else {
        setPageError(data?.message || "Unable to load blogs.");
      }
    } catch (error) {
      setPageError(error?.message || "Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return "";
    if (/^https?:\/\//i.test(image) || image.startsWith("blob:")) return image;
    return `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const stats = useMemo(() => {
    const published = blogs.filter((blog) => blog.isActive).length;
    const drafts = blogs.length - published;
    const categories = new Set(
      blogs.map((blog) => blog.category?.trim()).filter(Boolean).map((category) => category.toLowerCase()),
    ).size;
    return { total: blogs.length, published, drafts, categories };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return blogs.filter((blog) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && blog.isActive) ||
        (statusFilter === "draft" && !blog.isActive);
      const searchableText = [blog.title, blog.category, blog.author, blog.slug, blog.metaDescription]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!search || searchableText.includes(search));
    });
  }, [blogs, searchTerm, statusFilter]);

  const openModal = (blog = null) => {
    setFormError("");
    setImageFile(null);
    if (blog) {
      setEditingId(blog._id);
      setFormData({
        title: blog.title || "",
        category: blog.category || "",
        author: blog.author || "The Kissan City",
        metaDescription: blog.metaDescription || "",
        content: blog.content || "",
        readTime: blog.readTime || "5 min read",
        isActive: Boolean(blog.isActive),
      });
      setImagePreview(getImageUrl(blog.image));
    } else {
      setEditingId(null);
      setFormData(EMPTY_FORM);
      setImagePreview("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    if (saving) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setShowModal(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    document.body.style.overflow = "";
  };

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
    if (formError) setFormError("");
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image size should be less than 5 MB.");
      event.target.value = "";
      return;
    }
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!formData.title.trim()) return setFormError("Please enter the blog title.");
    if (!formData.category.trim()) return setFormError("Please enter a blog category.");
    if (!formData.metaDescription.trim()) return setFormError("Please enter the SEO meta description.");
    if (!getContentText(formData.content)) return setFormError("Please enter the blog content.");
    if (!editingId && !imageFile) return setFormError("Please upload a blog cover image.");

    setSaving(true);
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => form.append(key, value));
      if (imageFile) form.append("image", imageFile);

      const token = localStorage.getItem("adminToken");
      const url = editingId ? `${baseUrl}/api/blogs/${editingId}` : `${baseUrl}/api/blogs`;
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to save blog.");
      await fetchBlogs();
      closeModal();
    } catch (error) {
      setFormError(error?.message || "Error saving blog.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"? This action cannot be undone.`)) return;
    setDeletingId(blog._id);
    try {
      await api(`/api/blogs/${blog._id}`, { method: "DELETE" });
      setBlogs((current) => current.filter((item) => item._id !== blog._id));
    } catch (error) {
      window.alert(error?.message || "Error deleting blog.");
    } finally {
      setDeletingId("");
    }
  };

  const toggleStatus = async (blog) => {
    setStatusUpdatingId(blog._id);
    try {
      await api(`/api/blogs/${blog._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !blog.isActive }),
      });
      setBlogs((current) =>
        current.map((item) => (item._id === blog._id ? { ...item, isActive: !item.isActive } : item)),
      );
    } catch (error) {
      window.alert(error?.message || "Failed to update blog status.");
    } finally {
      setStatusUpdatingId("");
    }
  };

  if (loading) {
    return (
      <div className="admin-blogs-state">
        <span className="admin-blogs-state__icon">
          <LoaderCircle className="admin-blog-spinner" size={28} />
        </span>
        <h3>Loading blog library</h3>
        <p>Please wait while the latest blogs are being fetched.</p>
      </div>
    );
  }

  return (
    <div className="admin-blogs">
      <section className="admin-blogs-hero">
        <div className="admin-blogs-hero__copy">
          <span className="admin-blogs-eyebrow"><BookOpen size={15} /> Content management</span>
          <h1>Blog Management</h1>
          <p>Create, organize and publish helpful content for The Kissan City website.</p>
        </div>
        <button type="button" className="admin-blog-primary-btn" onClick={() => openModal()}>
          <Plus size={19} /> Add New Blog
        </button>
      </section>

      <section className="admin-blog-stats">
        <StatCard icon={FileText} label="Total blogs" value={stats.total} helper="All blog entries" />
        <StatCard icon={Eye} label="Published" value={stats.published} helper="Visible to users" type="success" />
        <StatCard icon={EyeOff} label="Drafts" value={stats.drafts} helper="Currently hidden" type="warning" />
        <StatCard icon={BookOpen} label="Categories" value={stats.categories} helper="Unique topics" type="info" />
      </section>

      <section className="admin-blog-panel">
        <div className="admin-blog-toolbar">
          <div className="admin-blog-search">
            <Search size={18} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by title, category or author..."
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm("")} aria-label="Clear search"><X size={16} /></button>
            )}
          </div>

          <div className="admin-blog-filter">
            {[
              { id: "all", label: "All", count: stats.total },
              { id: "published", label: "Published", count: stats.published },
              { id: "draft", label: "Drafts", count: stats.drafts },
            ].map((filter) => (
              <button
                type="button"
                key={filter.id}
                className={statusFilter === filter.id ? "is-active" : ""}
                onClick={() => setStatusFilter(filter.id)}
              >
                {filter.label}<span>{filter.count}</span>
              </button>
            ))}
          </div>
        </div>

        {pageError && (
          <div className="admin-blog-alert">
            <span>{pageError}</span>
            <button type="button" onClick={fetchBlogs}>Try again</button>
          </div>
        )}

        <div className="admin-blog-list-header">
          <div>
            <h2>Blog Library</h2>
            <p>Showing {filteredBlogs.length} of {blogs.length} blog{blogs.length === 1 ? "" : "s"}</p>
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="admin-blog-empty">
            <span><BookOpen size={34} /></span>
            <h3>{blogs.length === 0 ? "No blogs created yet" : "No matching blogs found"}</h3>
            <p>
              {blogs.length === 0
                ? "Create your first blog post to start sharing useful content."
                : "Try changing your search text or selected status filter."}
            </p>
            {blogs.length === 0 && (
              <button type="button" className="admin-blog-primary-btn" onClick={() => openModal()}>
                <Plus size={18} /> Create First Blog
              </button>
            )}
          </div>
        ) : (
          <div className="admin-blog-list">
            {filteredBlogs.map((blog) => {
              const statusLoading = statusUpdatingId === blog._id;
              const deleteLoading = deletingId === blog._id;
              return (
                <article key={blog._id} className={`admin-blog-card ${!blog.isActive ? "is-inactive" : ""}`}>
                  <div className="admin-blog-card__image">
                    {blog.image ? (
                      <img src={getImageUrl(blog.image)} alt={blog.title} loading="lazy" />
                    ) : (
                      <div className="admin-blog-card__placeholder"><ImageIcon size={28} /><span>No cover</span></div>
                    )}
                    <span className={`admin-blog-status ${blog.isActive ? "is-published" : "is-draft"}`}>
                      {blog.isActive ? <CheckCircle2 size={13} /> : <EyeOff size={13} />}
                      {blog.isActive ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="admin-blog-card__content">
                    <div className="admin-blog-card__top">
                      <span className="admin-blog-category">{blog.category || "Uncategorized"}</span>
                      <span className="admin-blog-read-time"><Clock3 size={13} /> {blog.readTime || "5 min read"}</span>
                    </div>
                    <h3>{blog.title || "Untitled Blog"}</h3>
                    <p className="admin-blog-description">{blog.metaDescription || "No meta description has been added for this blog."}</p>
                    <div className="admin-blog-card__meta">
                      <span><UserRound size={14} /> {blog.author || "The Kissan City"}</span>
                      <span><CalendarDays size={14} /> {formatDate(blog.createdAt)}</span>
                    </div>
                    <div className="admin-blog-card__slug"><span>URL</span><code>/{blog.slug || "blog-slug"}</code></div>
                  </div>

                  <div className="admin-blog-card__actions">
                    <button
                      type="button"
                      className={`admin-blog-action-btn status ${blog.isActive ? "published" : "draft"}`}
                      onClick={() => toggleStatus(blog)}
                      disabled={statusLoading || deleteLoading}
                    >
                      {statusLoading ? <LoaderCircle className="admin-blog-spinner" size={17} /> : blog.isActive ? <EyeOff size={17} /> : <Eye size={17} />}
                      <span>{blog.isActive ? "Unpublish" : "Publish"}</span>
                    </button>
                    <button type="button" className="admin-blog-action-btn edit" onClick={() => openModal(blog)} disabled={statusLoading || deleteLoading}>
                      <Edit3 size={17} /><span>Edit</span>
                    </button>
                    <button type="button" className="admin-blog-action-btn delete" onClick={() => handleDelete(blog)} disabled={statusLoading || deleteLoading}>
                      {deleteLoading ? <LoaderCircle className="admin-blog-spinner" size={17} /> : <Trash2 size={17} />}
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
        <div className="admin-blog-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="admin-blog-modal" role="dialog" aria-modal="true">
            <div className="admin-blog-modal__header">
              <div>
                <span className="admin-blogs-eyebrow">{editingId ? <Edit3 size={14} /> : <Plus size={14} />} {editingId ? "Update content" : "Create content"}</span>
                <h2>{editingId ? "Edit Blog" : "Add New Blog"}</h2>
                <p>Complete the details below and choose whether the post should be visible to website visitors.</p>
              </div>
              <button type="button" className="admin-blog-modal__close" onClick={closeModal} disabled={saving}><X size={21} /></button>
            </div>

            <form className="admin-blog-form" onSubmit={handleSubmit}>
              {formError && <div className="admin-blog-form-error">{formError}</div>}

              <div className="admin-blog-form-section">
                <div className="admin-blog-form-section__title"><span>01</span><div><h3>Basic Information</h3><p>Add the main details displayed on the blog page.</p></div></div>
                <div className="admin-blog-form-grid">
                  <FormField label="Blog Title" required wide hint={`${formData.title.length}/120`}>
                    <input type="text" value={formData.title} onChange={(e) => updateField("title", e.target.value.slice(0, 120))} placeholder="Enter an engaging blog title" required />
                  </FormField>
                  <FormField label="Category" required>
                    <input type="text" value={formData.category} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g. Farm Stories" required />
                  </FormField>
                  <FormField label="Author" required>
                    <input type="text" value={formData.author} onChange={(e) => updateField("author", e.target.value)} placeholder="Author name" required />
                  </FormField>
                  <FormField label="Read Time">
                    <input type="text" value={formData.readTime} onChange={(e) => updateField("readTime", e.target.value)} placeholder="e.g. 5 min read" />
                  </FormField>
                  <div className="admin-blog-publish-field">
                    <span className="admin-blog-publish-field__label">Publishing Status</span>
                    <label className="admin-blog-switch-card">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => updateField("isActive", e.target.checked)} />
                      <span className="admin-blog-switch"><span /></span>
                      <span className="admin-blog-switch-copy"><strong>{formData.isActive ? "Published" : "Save as draft"}</strong><small>{formData.isActive ? "Visible to website users" : "Hidden from website users"}</small></span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="admin-blog-form-section">
                <div className="admin-blog-form-section__title"><span>02</span><div><h3>SEO & Cover Image</h3><p>Improve search visibility and upload a clear thumbnail.</p></div></div>
                <div className="admin-blog-form-grid">
                  <FormField label="Meta Description" required wide hint={`${formData.metaDescription.length}/170`}>
                    <textarea value={formData.metaDescription} onChange={(e) => updateField("metaDescription", e.target.value.slice(0, 170))} placeholder="Write a short SEO description for this blog..." rows={3} required />
                  </FormField>
                  <div className="admin-blog-upload-field">
                    <div className="admin-blog-upload-copy"><span className="admin-blog-upload-icon"><UploadCloud size={22} /></span><div><strong>Blog Cover Image</strong><small>JPG, PNG or WEBP · Maximum 5 MB</small></div></div>
                    <input ref={fileInputRef} id="admin-blog-cover" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} required={!editingId} />
                    <label htmlFor="admin-blog-cover" className="admin-blog-upload-btn"><ImageIcon size={16} /> {imagePreview ? "Change Image" : "Choose Image"}</label>
                    {imagePreview && (
                      <div className="admin-blog-image-preview"><img src={imagePreview} alt="Blog cover preview" /><div><strong>Cover preview</strong><span>{imageFile?.name || "Existing uploaded image"}</span></div></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-blog-form-section">
                <div className="admin-blog-form-section__title">
                  <span>03</span>
                  <div>
                    <h3>Blog Content</h3>
                    <p>Format headings, lists, links, quotes and text directly from the toolbar.</p>
                  </div>
                </div>

                <div className="admin-blog-form-field admin-blog-form-field--wide">
                  <div className="admin-blog-form-field__label">
                    <span>Content<em>*</em></span>
                    <small>{getContentText(formData.content).length} characters</small>
                  </div>

                  <div className="admin-blog-quill-editor">
                    <ReactQuill
                      theme="snow"
                      value={formData.content}
                      onChange={(value) => updateField("content", value)}
                      modules={QUILL_MODULES}
                      formats={QUILL_FORMATS}
                      placeholder="Write your complete blog content here..."
                      readOnly={saving}
                      preserveWhitespace
                    />
                  </div>

                  <p className="admin-blog-editor-help">
                    The editor saves formatted HTML automatically. Use the clean button to remove unwanted formatting.
                  </p>
                </div>
              </div>

              <div className="admin-blog-form-actions">
                <button type="button" className="admin-blog-secondary-btn" onClick={closeModal} disabled={saving}>Cancel</button>
                <button type="submit" className="admin-blog-primary-btn" disabled={saving}>
                  {saving ? <><LoaderCircle className="admin-blog-spinner" size={18} /> {editingId ? "Updating..." : "Publishing..."}</> : editingId ? <><CheckCircle2 size={18} /> Update Blog</> : <><Plus size={18} /> Save Blog</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper, type = "" }) {
  return (
    <article className={`admin-blog-stat-card ${type}`}>
      <span className="admin-blog-stat-card__icon"><Icon size={21} /></span>
      <div><span>{label}</span><strong>{value}</strong><small>{helper}</small></div>
    </article>
  );
}

function FormField({ label, required = false, hint = "", wide = false, children }) {
  return (
    <label className={`admin-blog-form-field ${wide ? "admin-blog-form-field--wide" : ""}`}>
      <span className="admin-blog-form-field__label"><span>{label}{required && <em>*</em>}</span>{hint && <small>{hint}</small>}</span>
      {children}
    </label>
  );
}