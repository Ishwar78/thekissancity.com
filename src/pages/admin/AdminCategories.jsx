import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Edit2,
  FolderTree,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api } from "../../utils/api";
import "./AdminCategories.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fileInputRef = useRef(null);
  const formCardRef = useRef(null);

  const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(
    /\/$/,
    ""
  );

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith("blob:")) {
      return imageUrl;
    }
    return `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  const fetchCategories = async () => {
    try {
      setFetching(true);
      const data = await api("/api/categories");
      setCategories(Array.isArray(data?.categories) ? data.categories : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCategories();
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
    setParentCategory("");
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEdit = (category) => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setEditingId(category._id);
    setName(category.name || "");
    setParentCategory(category.parentCategory?._id || "");
    setPreview(getImageUrl(category.imageUrl));
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
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${baseUrl}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to delete category");
      }

      if (editingId === id) {
        resetForm();
      }

      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.message || "Unable to delete category.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      alert("Category name is required.");
      return;
    }

    if (!editingId && !image) {
      alert("Image is required for a new category.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", trimmedName);

      if (parentCategory) {
        formData.append("parentCategory", parentCategory);
      }

      if (image) {
        formData.append("image", image);
      }

      const token = localStorage.getItem("adminToken");
      const endpoint = editingId
        ? `${baseUrl}/api/categories/${editingId}`
        : `${baseUrl}/api/categories`;

      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to save category");
      }

      resetForm();
      await fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert(error.message || "An error occurred while saving the category.");
    } finally {
      setSaving(false);
    }
  };

  const topLevelCategories = categories.filter(
    (category) => !category.parentCategory && category._id !== editingId
  );

  const parentCount = categories.filter(
    (category) => !category.parentCategory
  ).length;

  const subCategoryCount = categories.length - parentCount;

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-heading">
        <div>
          <span className="admin-categories-eyebrow">
            <FolderTree size={15} />
            Category Management
          </span>
          <h1>Manage Categories</h1>
          <p>
            Create, organize and update product categories for your store.
          </p>
        </div>

        <div className="admin-categories-summary">
          <div>
            <strong>{categories.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{parentCount}</strong>
            <span>Parent</span>
          </div>
          <div>
            <strong>{subCategoryCount}</strong>
            <span>Subcategory</span>
          </div>
        </div>
      </div>

      <div className="admin-categories-layout">
        <section
          ref={formCardRef}
          className={`admin-category-form-card ${
            editingId ? "is-editing" : ""
          }`}
        >
          <div className="admin-category-card-header">
            <div>
              <span>{editingId ? "Update category" : "Create category"}</span>
              <h2>{editingId ? "Edit Category" : "Add New Category"}</h2>
            </div>

            {editingId && (
              <button
                type="button"
                className="admin-category-close-edit"
                onClick={resetForm}
                aria-label="Cancel editing"
              >
                <X size={19} />
              </button>
            )}
          </div>

          <form className="admin-category-form" onSubmit={handleSubmit}>
            <div className="admin-category-field">
              <label htmlFor="category-name">
                Category Name <span>*</span>
              </label>
              <input
                id="category-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Desi Ghee"
                required
              />
            </div>

            <div className="admin-category-field">
              <label htmlFor="parent-category">
                Parent Category <small>Optional</small>
              </label>

              <select
                id="parent-category"
                value={parentCategory}
                onChange={(event) => setParentCategory(event.target.value)}
              >
                <option value="">None (Top Level Category)</option>
                {topLevelCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-category-field">
              <label>
                Category Image
                {editingId && <small>Leave unchanged to keep existing</small>}
              </label>

              <button
                type="button"
                className={`admin-category-upload ${
                  preview ? "has-preview" : ""
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Category preview" />
                    <span className="admin-category-upload-overlay">
                      <Upload size={19} />
                      Change Image
                    </span>
                  </>
                ) : (
                  <span className="admin-category-upload-placeholder">
                    <span className="admin-category-upload-icon">
                      <Upload size={26} />
                    </span>
                    <strong>Upload category image</strong>
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

            <div className="admin-category-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="admin-category-cancel-btn"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="admin-category-submit-btn"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="admin-category-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {editingId ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    {editingId ? "Update Category" : "Add Category"}
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <section className="admin-category-list-card">
          <div className="admin-category-card-header admin-category-list-header">
            <div>
              <span>Store catalog</span>
              <h2>Existing Categories</h2>
            </div>

            <span className="admin-category-count">
              {categories.length} categories
            </span>
          </div>

          {fetching ? (
            <div className="admin-category-state">
              <span className="admin-category-state-icon">
                <Loader2 size={29} className="admin-category-spin" />
              </span>
              <h3>Loading categories</h3>
              <p>Please wait while categories are being fetched.</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="admin-category-state">
              <span className="admin-category-state-icon">
                <ImageIcon size={30} />
              </span>
              <h3>No categories found</h3>
              <p>Add your first category using the form.</p>
            </div>
          ) : (
            <div className="admin-category-grid">
              {categories.map((category) => (
                <article
                  key={category._id}
                  className={`admin-category-item ${
                    editingId === category._id ? "is-selected" : ""
                  }`}
                >
                  <div className="admin-category-actions">
                    <button
                      type="button"
                      className="admin-category-edit-btn"
                      onClick={() => handleEdit(category)}
                      aria-label={`Edit ${category.name}`}
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      className="admin-category-delete-btn"
                      onClick={() => handleDelete(category._id)}
                      aria-label={`Delete ${category.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="admin-category-image">
                    {category.imageUrl ? (
                      <img
                        src={getImageUrl(category.imageUrl)}
                        alt={category.name}
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
                      className={`admin-category-image-fallback ${
                        !category.imageUrl ? "is-visible" : ""
                      }`}
                    >
                      <ImageIcon size={25} />
                    </span>
                  </div>

                  <div className="admin-category-item-content">
                    <h3>{category.name}</h3>

                    {category.parentCategory ? (
                      <span className="admin-category-parent-tag">
                        Sub of: {category.parentCategory.name}
                      </span>
                    ) : (
                      <span className="admin-category-top-tag">
                        Top-level category
                      </span>
                    )}
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