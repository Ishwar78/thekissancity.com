import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import "./AdminProducts.css";
import { api } from "../../utils/api";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  AlertCircle,
  Sparkles,
  Package,
  Search,
  Eye,
  Tag,
  HeartPulse,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [healthRegions, setHealthRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  // Form State
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [selectedHealthRegions, setSelectedHealthRegions] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");

  // Nutrition Facts: [{ name: '', per100g: '' }]
  const [nutritionFacts, setNutritionFacts] = useState([
    { name: "", per100g: "" },
  ]);

  // Images & Cover Image ordering
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesOrder, setImagesOrder] = useState([]);

  // Variants vs Simple
  const [hasVariants, setHasVariants] = useState(false);
  const [simplePrice, setSimplePrice] = useState({
    unit: "gram",
    quantityValue: "500",
    originalPrice: 0,
    discountType: "percentage",
    discountValue: 0,
    salePrice: 0,
    stock: 100,
    sku: "",
  });
  const [variants, setVariants] = useState([
    {
      unit: "gram",
      quantityValue: "250",
      label: "250 gram",
      originalPrice: 200,
      discountType: "percentage",
      discountValue: 10,
      salePrice: 180,
      stock: 50,
      sku: "",
    },
  ]);

  // FAQs: [{ question: '', answer: '' }]
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  // SEO
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaKeywords: "",
    metaDescription: "",
  });

  // Active form section tab in modal
  const [formTab, setFormTab] = useState("basic"); // 'basic', 'pricing', 'description', 'images', 'nutrition', 'faqs', 'seo'

  const imageInputRef = useRef(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes, healthRes] = await Promise.all([
        api("/api/products"),
        api("/api/categories"),
        api("/api/health"),
      ]);

      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
      setHealthRegions(healthRes.healthCategories || []);
    } catch (err) {
      console.error("Failed to load initial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Calculate sale price automatically whenever price or discount changes
  const calcSalePrice = (originalPrice, discountType, discountValue) => {
    const orig = parseFloat(originalPrice) || 0;
    const disc = parseFloat(discountValue) || 0;
    if (orig <= 0) return 0;

    let sale = orig;
    if (discountType === "percentage") {
      sale = orig - (orig * Math.min(100, disc)) / 100;
    } else {
      sale = orig - disc;
    }
    return Math.max(0, Math.round(sale));
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory(categories[0]?._id || "");
    setSelectedHealthRegions([]);
    setIsActive(true);
    setIsBestSeller(false);
    setIsNewArrival(false);
    setShortDescription("");
    setFullDescription("");
    setNutritionFacts([{ name: "", per100g: "" }]);
    setExistingImages([]);
    setNewImageFiles([]);
    setImagePreviews([]);
    setImagesOrder([]);
    setHasVariants(false);
    setSimplePrice({
      unit: "gram",
      quantityValue: "500",
      originalPrice: 0,
      discountType: "percentage",
      discountValue: 0,
      salePrice: 0,
      stock: 100,
      sku: "",
    });
    setVariants([
      {
        unit: "gram",
        quantityValue: "250",
        label: "250 gram",
        originalPrice: 200,
        discountType: "percentage",
        discountValue: 10,
        salePrice: 180,
        stock: 50,
        sku: "",
      },
    ]);
    setFaqs([{ question: "", answer: "" }]);
    setSeo({ metaTitle: "", metaKeywords: "", metaDescription: "" });
    setFormTab("basic");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const openAddModal = () => {
    resetForm();
    if (categories.length > 0) setCategory(categories[0]._id);
    setShowModal(true);
  };

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setName(prod.name || "");
    setCategory(prod.category?._id || prod.category || "");
    setSelectedHealthRegions(
      Array.isArray(prod.healthRegions)
        ? prod.healthRegions.map((h) => (typeof h === "object" ? h._id : h))
        : [],
    );
    setIsActive(prod.isActive !== undefined ? prod.isActive : true);
    setIsBestSeller(Boolean(prod.isBestSeller));
    setIsNewArrival(Boolean(prod.isNewArrival));
    setShortDescription(prod.shortDescription || "");
    setFullDescription(prod.fullDescription || "");
    setNutritionFacts(
      prod.nutritionFacts && prod.nutritionFacts.length > 0
        ? prod.nutritionFacts
        : [{ name: "", per100g: "" }],
    );
    setExistingImages(prod.images || []);
    setNewImageFiles([]);
    setImagePreviews([]);
    setImagesOrder(
      Array.isArray(prod.images)
        ? prod.images.map((imgUrl, i) => ({
            id: `exist-${i}-${Date.now()}`,
            type: "existing",
            url: imgUrl,
          }))
        : [],
    );
    setHasVariants(Boolean(prod.hasVariants));
    if (prod.simplePrice) {
      setSimplePrice({
        unit: prod.simplePrice.unit || "gram",
        quantityValue: prod.simplePrice.quantityValue || "500",
        originalPrice: prod.simplePrice.originalPrice || 0,
        discountType: prod.simplePrice.discountType || "percentage",
        discountValue: prod.simplePrice.discountValue || 0,
        salePrice: prod.simplePrice.salePrice || 0,
        stock: prod.simplePrice.stock || 0,
        sku: prod.simplePrice.sku || "",
      });
    }
    if (prod.variants && prod.variants.length > 0) {
      setVariants(prod.variants);
    } else {
      setVariants([
        {
          unit: "gram",
          quantityValue: "250",
          label: "250 gram",
          originalPrice: 200,
          discountType: "percentage",
          discountValue: 10,
          salePrice: 180,
          stock: 50,
          sku: "",
        },
      ]);
    }
    setFaqs(
      prod.faqs && prod.faqs.length > 0
        ? prod.faqs
        : [{ question: "", answer: "" }],
    );
    setSeo({
      metaTitle: prod.seo?.metaTitle || "",
      metaKeywords: prod.seo?.metaKeywords || "",
      metaDescription: prod.seo?.metaDescription || "",
    });
    setFormTab("basic");
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      const data = await api(`/api/products/${id}`, { method: "DELETE" });
      if (data.success) {
        fetchInitialData();
      }
    } catch (err) {
      alert(err.message || "Failed to delete product");
    }
  };

  const handleToggle = async (id, field, currentValue) => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "https://thekissancity.com"}/api/products/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ field, value: !currentValue }),
        },
      );
      const data = await response.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? data.product : p)),
        );
      }
    } catch (err) {
      console.error("Error toggling field:", err);
    }
  };

  // Image Selection Handler (Up to 10 images)
  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const totalCurrentCount = imagesOrder.length;
    const allowedNewCount = 10 - totalCurrentCount;

    if (allowedNewCount <= 0) {
      alert("Maximum 10 images allowed per product");
      return;
    }

    const selectedFiles = files.slice(0, allowedNewCount);
    const newItems = selectedFiles.map((file) => ({
      id: `new-${Math.random()}-${Date.now()}`,
      type: "new",
      file,
      preview: URL.createObjectURL(file),
    }));

    setImagesOrder((prev) => [...prev, ...newItems]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const setAsCoverImage = (index) => {
    if (index <= 0 || index >= imagesOrder.length) return;
    setImagesOrder((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  const removeImageItem = (index) => {
    setImagesOrder((prev) => prev.filter((_, i) => i !== index));
  };

  // Health Region Checkbox Toggle
  const toggleHealthRegion = (healthId) => {
    if (selectedHealthRegions.includes(healthId)) {
      setSelectedHealthRegions(
        selectedHealthRegions.filter((id) => id !== healthId),
      );
    } else {
      setSelectedHealthRegions([...selectedHealthRegions, healthId]);
    }
  };

  // Simple Price Handler
  const handleSimplePriceChange = (field, val) => {
    setSimplePrice((prev) => {
      const updated = { ...prev, [field]: val };
      if (["originalPrice", "discountType", "discountValue"].includes(field)) {
        updated.salePrice = calcSalePrice(
          field === "originalPrice" ? val : updated.originalPrice,
          field === "discountType" ? val : updated.discountType,
          field === "discountValue" ? val : updated.discountValue,
        );
      }
      return updated;
    });
  };

  // Variant Handlers
  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        unit: "gram",
        quantityValue: "500",
        label: "500 gram",
        originalPrice: 300,
        discountType: "percentage",
        discountValue: 10,
        salePrice: 270,
        stock: 50,
        sku: "",
      },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      alert("At least 1 variant is required when variants option is selected.");
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, val) => {
    setVariants((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: val };

      // Auto update label if unit/quantityValue updated
      if (field === "unit" || field === "quantityValue") {
        const u = field === "unit" ? val : target.unit;
        const q = field === "quantityValue" ? val : target.quantityValue;
        target.label = `${q} ${u}`.trim();
      }

      // Auto update salePrice
      if (["originalPrice", "discountType", "discountValue"].includes(field)) {
        target.salePrice = calcSalePrice(
          field === "originalPrice" ? val : target.originalPrice,
          field === "discountType" ? val : target.discountType,
          field === "discountValue" ? val : target.discountValue,
        );
      }

      copy[index] = target;
      return copy;
    });
  };

  // Nutrition Facts Handlers
  const addNutritionRow = () =>
    setNutritionFacts([...nutritionFacts, { name: "", per100g: "" }]);
  const removeNutritionRow = (index) =>
    setNutritionFacts(nutritionFacts.filter((_, i) => i !== index));
  const updateNutritionRow = (index, field, val) => {
    const updated = [...nutritionFacts];
    updated[index][field] = val;
    setNutritionFacts(updated);
  };

  // FAQ Handlers
  const addFaqRow = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaqRow = (index) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaqRow = (index, field, val) => {
    const updated = [...faqs];
    updated[index][field] = val;
    setFaqs(updated);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert("Product Name is required");
    if (!category) return alert("Category is required");

    // Filter valid nutrition & FAQs
    const validNutrition = nutritionFacts.filter(
      (n) => n.name.trim() && n.per100g.trim(),
    );
    const validFaqs = faqs.filter((f) => f.question.trim() && f.answer.trim());

    const existingImagesPayload = imagesOrder
      .filter((item) => item.type === "existing")
      .map((item) => item.url);

    const newFilesPayload = imagesOrder
      .filter((item) => item.type === "new")
      .map((item) => item.file);

    const imagesOrderPayload = imagesOrder.map((item) => ({
      type: item.type,
      url: item.url,
    }));

    const productPayload = {
      name,
      category,
      healthRegions: selectedHealthRegions,
      isActive,
      isBestSeller,
      isNewArrival,
      shortDescription,
      fullDescription,
      nutritionFacts: validNutrition,
      hasVariants,
      simplePrice,
      variants,
      faqs: validFaqs,
      seo,
      existingImages: existingImagesPayload,
      imagesOrder: imagesOrderPayload,
    };

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("productData", JSON.stringify(productPayload));

      newFilesPayload.forEach((file) => {
        formData.append("images", file);
      });

      const token = localStorage.getItem("adminToken");
      const baseUrl = import.meta.env.VITE_API_URL || "https://thekissancity.com";
      const url = editingId
        ? `${baseUrl}/api/products/${editingId}`
        : `${baseUrl}/api/products`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchInitialData();
      } else {
        alert(data.message || "Failed to save product");
      }
    } catch (err) {
      console.error("Error submitting product form:", err);
      alert("Server error saving product");
    } finally {
      setLoading(false);
    }
  };

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const productName = String(product?.name || "").toLowerCase();
    const categoryName = String(product?.category?.name || "").toLowerCase();
    const slug = String(product?.slug || "").toLowerCase();

    return (
      productName.includes(normalizedSearch) ||
      categoryName.includes(normalizedSearch) ||
      slug.includes(normalizedSearch)
    );
  });

  const getProductStock = (product) => {
    if (product?.hasVariants) {
      return (product?.variants || []).reduce(
        (total, item) => total + (Number(item?.stock) || 0),
        0,
      );
    }

    return Number(product?.simplePrice?.stock) || 0;
  };

  const activeProductCount = filteredProducts.filter(
    (product) => product.isActive,
  ).length;
  const variantProductCount = filteredProducts.filter(
    (product) => product.hasVariants,
  ).length;
  const lowStockProductCount = filteredProducts.filter(
    (product) => getProductStock(product) <= 10,
  ).length;

  return (
    <div className="admin-products-page">
      <section className="products-toolbar-card">
        <div className="products-search-area">
          <div className="products-search-box">
            <Search size={19} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search by product, category or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
            {searchTerm && (
              <button
                type="button"
                className="products-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <p className="products-result-count">
            Showing <strong>{filteredProducts.length}</strong> of{" "}
            <strong>{products.length}</strong> product
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="products-add-button"
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </section>

      <section className="products-stats-grid" aria-label="Product statistics">
        <article className="product-stat-card">
          <div className="product-stat-icon product-stat-icon--green">
            <Package size={21} />
          </div>
          <div>
            <span>Total Products</span>
            <strong>{filteredProducts.length}</strong>
          </div>
        </article>

        <article className="product-stat-card">
          <div className="product-stat-icon product-stat-icon--blue">
            <CheckSquare size={21} />
          </div>
          <div>
            <span>Active Products</span>
            <strong>{activeProductCount}</strong>
          </div>
        </article>

        <article className="product-stat-card">
          <div className="product-stat-icon product-stat-icon--purple">
            <Layers size={21} />
          </div>
          <div>
            <span>With Variants</span>
            <strong>{variantProductCount}</strong>
          </div>
        </article>

        <article className="product-stat-card">
          <div className="product-stat-icon product-stat-icon--orange">
            <AlertCircle size={21} />
          </div>
          <div>
            <span>Low Stock</span>
            <strong>{lowStockProductCount}</strong>
          </div>
        </article>
      </section>

      <section className="products-list-card">
        <div className="products-list-heading">
          <div>
            <h3>Product Inventory</h3>
            <p>Manage product information, stock, status and visibility.</p>
          </div>
          <span className="products-list-badge">
            {filteredProducts.length} item
            {filteredProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="products-table-scroll">
          <table className="products-table">
            <colgroup>
              <col className="products-col-product" />
              <col className="products-col-category" />
              <col className="products-col-health" />
              <col className="products-col-price" />
              <col className="products-col-status" />
              <col className="products-col-actions" />
            </colgroup>

            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Health Regions</th>
                <th>Pricing &amp; Stock</th>
                <th>Status</th>
                <th className="products-actions-heading">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="products-empty-state">
                      <div className="products-loader" />
                      <h4>Loading products...</h4>
                      <p>Please wait while product data is being fetched.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="products-empty-state">
                      <div className="products-empty-icon">
                        <Package size={30} />
                      </div>
                      <h4>No products found</h4>
                      <p>
                        {searchTerm
                          ? "Try another search term or clear the current search."
                          : "Click “Add New Product” to create your first product."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const imgUrl = prod.images?.length
                    ? `${import.meta.env.VITE_API_URL || "https://thekissancity.com"}${prod.images[0]}`
                    : null;

                  const visibleHealthRegions = (prod.healthRegions || []).slice(
                    0,
                    4,
                  );
                  const hiddenHealthCount = Math.max(
                    0,
                    (prod.healthRegions?.length || 0) -
                      visibleHealthRegions.length,
                  );

                  const variantSalePrices = (prod.variants || [])
                    .map((variant) => Number(variant?.salePrice))
                    .filter((price) => Number.isFinite(price));

                  const totalStock = getProductStock(prod);
                  const isLowStock = totalStock <= 10;

                  return (
                    <tr key={prod._id}>
                      <td>
                        <div className="products-product-cell">
                          <div className="products-thumbnail">
                            {imgUrl ? (
                              <img src={imgUrl} alt={prod.name || "Product"} />
                            ) : (
                              <Package size={25} />
                            )}
                          </div>

                          <div className="products-product-copy">
                            <h4 title={prod.name}>
                              {prod.name || "Untitled Product"}
                            </h4>
                            <div className="products-meta-row">
                              <span>
                                {prod.images?.length || 0} image
                                {prod.images?.length === 1 ? "" : "s"}
                              </span>
                              <span aria-hidden="true">•</span>
                              <span title={prod.slug || ""}>
                                {prod.slug || "No slug"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="products-category-badge">
                          <Tag size={13} />
                          {prod.category?.name || "Uncategorized"}
                        </span>
                      </td>

                      <td>
                        {visibleHealthRegions.length > 0 ? (
                          <div className="products-health-list">
                            {visibleHealthRegions.map((healthItem) => (
                              <span
                                key={healthItem?._id || healthItem}
                                className="products-health-chip"
                              >
                                <HeartPulse size={12} />
                                {healthItem?.name || "Health"}
                              </span>
                            ))}

                            {hiddenHealthCount > 0 && (
                              <span
                                className="products-health-more"
                                title={(prod.healthRegions || [])
                                  .slice(4)
                                  .map((item) => item?.name || "Health")
                                  .join(", ")}
                              >
                                +{hiddenHealthCount} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="products-muted-value">
                            No health region
                          </span>
                        )}
                      </td>

                      <td>
                        <div className="products-price-cell">
                          {prod.hasVariants ? (
                            <>
                              <strong>
                                {variantSalePrices.length > 0
                                  ? `₹${Math.round(Math.min(...variantSalePrices))} – ₹${Math.round(Math.max(...variantSalePrices))}`
                                  : "Variants configured"}
                              </strong>
                              <span>
                                {prod.variants?.length || 0} variant(s)
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="products-price-row">
                                <strong>
                                  ₹{Math.round(Number(prod.simplePrice?.salePrice) || 0)}
                                </strong>
                                {Number(prod.simplePrice?.originalPrice) >
                                  Number(prod.simplePrice?.salePrice) && (
                                  <del>₹{Math.round(Number(prod.simplePrice.originalPrice))}</del>
                                )}
                              </div>
                              <span>
                                {prod.simplePrice?.quantityValue || ""}{" "}
                                {prod.simplePrice?.unit || ""}
                              </span>
                            </>
                          )}

                          <span
                            className={
                              isLowStock
                                ? "products-stock-low"
                                : "products-stock-ok"
                            }
                          >
                            Stock: {totalStock}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="products-status-list">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(prod._id, "isActive", prod.isActive)
                            }
                            className={`products-status-toggle ${
                              prod.isActive ? "is-active" : "is-inactive"
                            }`}
                            aria-label={`Mark ${prod.name} as ${prod.isActive ? "inactive" : "active"}`}
                          >
                            <span
                              className="products-switch"
                              aria-hidden="true"
                            >
                              <span />
                            </span>
                            {prod.isActive ? "Active" : "Inactive"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                prod._id,
                                "isBestSeller",
                                prod.isBestSeller,
                              )
                            }
                            className={`products-check-toggle products-check-toggle--seller ${
                              prod.isBestSeller ? "is-selected" : ""
                            }`}
                          >
                            {prod.isBestSeller ? (
                              <CheckSquare size={15} />
                            ) : (
                              <Square size={15} />
                            )}
                            Best Seller
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggle(
                                prod._id,
                                "isNewArrival",
                                prod.isNewArrival,
                              )
                            }
                            className={`products-check-toggle products-check-toggle--arrival ${
                              prod.isNewArrival ? "is-selected" : ""
                            }`}
                          >
                            {prod.isNewArrival ? (
                              <CheckSquare size={15} />
                            ) : (
                              <Square size={15} />
                            )}
                            New Arrival
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="products-actions">
                          <button
                            type="button"
                            onClick={() => setViewProduct(prod)}
                            className="products-action-button"
                            style={{
                              backgroundColor: "#e0f2fe",
                              color: "#0369a1",
                              borderColor: "#bae6fd",
                            }}
                            title="View Product Details"
                          >
                            <Eye size={15} />
                            <span>View</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(prod)}
                            className="products-action-button products-action-button--edit"
                          >
                            <Edit2 size={15} />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(prod._id)}
                            className="products-action-button products-action-button--delete"
                          >
                            <Trash2 size={15} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── ADD / EDIT PRODUCT MODAL ── */}
      {showModal && (
        <div
          className="product-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="product-modal-dialog"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "1000px",
              maxWidth: "95vw",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Modal Header */}
            <div
              className="product-modal-header"
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#111827" }}>
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "0.85rem",
                    color: "#6b7280",
                  }}
                >
                  Fill in product details, variants, images, nutrition & SEO
                  information
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "4px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div
              className="product-modal-tabs"
              style={{
                display: "flex",
                borderBottom: "1px solid #e5e7eb",
                backgroundColor: "#f3f4f6",
                padding: "0 28px",
                overflowX: "auto",
                gap: "4px",
              }}
            >
              {[
                { id: "basic", label: "1. Basic Info" },
                { id: "pricing", label: "2. Price & Variants" },
                { id: "description", label: "3. Descriptions" },
                {
                  id: "images",
                  label: `4. Images (${existingImages.length + newImageFiles.length}/10)`,
                },
                { id: "nutrition", label: "5. Nutrition Facts" },
                { id: "faqs", label: "6. Product FAQs" },
                { id: "seo", label: "7. SEO Meta" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormTab(t.id)}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    background: "none",
                    borderBottom:
                      formTab === t.id
                        ? "3px solid var(--green-600, #2f6f3e)"
                        : "3px solid transparent",
                    color:
                      formTab === t.id
                        ? "var(--green-700, #2f6f3e)"
                        : "#4b5563",
                    fontWeight: formTab === t.id ? 600 : 500,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body / Form Content */}
            <form
              className="product-modal-form"
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                overflow: "hidden",
              }}
            >
              <div
                className="product-modal-body"
                style={{ flex: 1, overflowY: "auto", padding: "28px" }}
              >
                {/* TAB 1: BASIC INFO */}
                {formTab === "basic" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. A2 Desi Cow Ghee – Bilona Method"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.95rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      {/* Category Select */}
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontWeight: 600,
                            marginBottom: "6px",
                            color: "#374151",
                          }}
                        >
                          Category *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          required
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: "1px solid #d1d5db",
                            backgroundColor: "white",
                            fontSize: "0.95rem",
                            boxSizing: "border-box",
                          }}
                        >
                          <option value="">Select Category</option>
                          {categories.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Status Toggles Card */}
                      <div
                        style={{
                          backgroundColor: "#f9fafb",
                          padding: "14px 18px",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          justifyContent: "space-around",
                          alignItems: "center",
                        }}
                      >
                        {/* Active toggle */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#16a34a",
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "#1f2937",
                            }}
                          >
                            Active Product
                          </span>
                        </label>

                        {/* Best Seller toggle */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isBestSeller}
                            onChange={(e) => setIsBestSeller(e.target.checked)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#d97706",
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "#1f2937",
                            }}
                          >
                            Best Seller
                          </span>
                        </label>

                        {/* New Arrival toggle */}
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isNewArrival}
                            onChange={(e) => setIsNewArrival(e.target.checked)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#2563eb",
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "0.9rem",
                              color: "#1f2937",
                            }}
                          >
                            New Arrival
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Health Regions Multiple Select */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "8px",
                          color: "#374151",
                        }}
                      >
                        Select Health Regions / Health Concerns (Multiple
                        Selection Allowed)
                      </label>
                      {healthRegions.length === 0 ? (
                        <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                          No health regions added yet. Create them from Health
                          section.
                        </p>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          {healthRegions.map((h) => {
                            const isSelected = selectedHealthRegions.includes(
                              h._id,
                            );
                            return (
                              <button
                                key={h._id}
                                type="button"
                                onClick={() => toggleHealthRegion(h._id)}
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "20px",
                                  border: "1px solid",
                                  borderColor: isSelected
                                    ? "#16a34a"
                                    : "#d1d5db",
                                  backgroundColor: isSelected
                                    ? "#f0fdf4"
                                    : "white",
                                  color: isSelected ? "#15803d" : "#4b5563",
                                  fontWeight: isSelected ? 600 : 400,
                                  fontSize: "0.85rem",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                {isSelected ? <Check size={14} /> : null}
                                {h.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PRICING & VARIANTS */}
                {formTab === "pricing" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "24px",
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "#1f2937",
                          marginBottom: "10px",
                          display: "block",
                        }}
                      >
                        Product Pricing Structure
                      </label>
                      <div style={{ display: "flex", gap: "24px" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          <input
                            type="radio"
                            name="hasVariantsRadio"
                            checked={!hasVariants}
                            onChange={() => setHasVariants(false)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#16a34a",
                            }}
                          />
                          Simple Product (Single Price)
                        </label>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                            fontWeight: 500,
                          }}
                        >
                          <input
                            type="radio"
                            name="hasVariantsRadio"
                            checked={hasVariants}
                            onChange={() => setHasVariants(true)}
                            style={{
                              width: "18px",
                              height: "18px",
                              accentColor: "#16a34a",
                            }}
                          />
                          Product with Multiple Variants (e.g. 250g, 500g, 1kg /
                          1L)
                        </label>
                      </div>
                    </div>

                    {/* SIMPLE PRODUCT FORM */}
                    {!hasVariants && (
                      <div
                        style={{
                          backgroundColor: "white",
                          padding: "20px",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Unit
                          </label>
                          <select
                            value={simplePrice.unit}
                            onChange={(e) =>
                              handleSimplePriceChange("unit", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          >
                            <option value="gram">gram (g)</option>
                            <option value="kg">kg</option>
                            <option value="ml">ml</option>
                            <option value="litre">litre (L)</option>
                            <option value="pcs">pcs</option>
                            <option value="pack">pack</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Quantity / Size
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 500"
                            value={simplePrice.quantityValue}
                            onChange={(e) =>
                              handleSimplePriceChange(
                                "quantityValue",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Original Price (MRP ₹)
                          </label>
                          <input
                            type="number"
                            value={simplePrice.originalPrice}
                            onChange={(e) =>
                              handleSimplePriceChange(
                                "originalPrice",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Discount Type
                          </label>
                          <select
                            value={simplePrice.discountType}
                            onChange={(e) =>
                              handleSimplePriceChange(
                                "discountType",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="flat">Flat (₹)</option>
                          </select>
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Discount Value
                          </label>
                          <input
                            type="number"
                            value={simplePrice.discountValue}
                            onChange={(e) =>
                              handleSimplePriceChange(
                                "discountValue",
                                e.target.value,
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                              color: "#15803d",
                            }}
                          >
                            Calculated Sale Price (₹)
                          </label>
                          <input
                            type="number"
                            readOnly
                            value={simplePrice.salePrice}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #bbf7d0",
                              backgroundColor: "#f0fdf4",
                              fontWeight: 700,
                              color: "#15803d",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            Stock Quantity
                          </label>
                          <input
                            type="number"
                            value={simplePrice.stock}
                            onChange={(e) =>
                              handleSimplePriceChange("stock", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              marginBottom: "6px",
                            }}
                          >
                            SKU Code
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. KSN-GHEE-500"
                            value={simplePrice.sku}
                            onChange={(e) =>
                              handleSimplePriceChange("sku", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* MULTIPLE VARIANTS FORM */}
                    {hasVariants && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#374151" }}>
                            Product Variants List ({variants.length})
                          </span>
                          <button
                            type="button"
                            onClick={addVariant}
                            style={{
                              backgroundColor: "#e0f2fe",
                              color: "#0284c7",
                              border: "1px solid #bae6fd",
                              padding: "8px 14px",
                              borderRadius: "6px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.85rem",
                            }}
                          >
                            <Plus size={16} /> Add Variant
                          </button>
                        </div>

                        {variants.map((varItem, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: "#f9fafb",
                              padding: "16px",
                              borderRadius: "10px",
                              border: "1px solid #e5e7eb",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "12px",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: "0.9rem",
                                  color: "#2f6f3e",
                                }}
                              >
                                Variant #{idx + 1}:{" "}
                                {varItem.label ||
                                  `${varItem.quantityValue} ${varItem.unit}`}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeVariant(idx)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#ef4444",
                                  cursor: "pointer",
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(4, 1fr)",
                                gap: "12px",
                              }}
                            >
                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Unit
                                </label>
                                <select
                                  value={varItem.unit}
                                  onChange={(e) =>
                                    updateVariant(idx, "unit", e.target.value)
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  <option value="gram">gram (g)</option>
                                  <option value="kg">kg</option>
                                  <option value="ml">ml</option>
                                  <option value="litre">litre (L)</option>
                                  <option value="pcs">pcs</option>
                                  <option value="pack">pack</option>
                                </select>
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Qty Value
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. 250"
                                  value={varItem.quantityValue}
                                  onChange={(e) =>
                                    updateVariant(
                                      idx,
                                      "quantityValue",
                                      e.target.value,
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Label
                                </label>
                                <input
                                  type="text"
                                  value={varItem.label}
                                  onChange={(e) =>
                                    updateVariant(idx, "label", e.target.value)
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  MRP (₹)
                                </label>
                                <input
                                  type="number"
                                  value={varItem.originalPrice}
                                  onChange={(e) =>
                                    updateVariant(
                                      idx,
                                      "originalPrice",
                                      e.target.value,
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Discount Type
                                </label>
                                <select
                                  value={varItem.discountType}
                                  onChange={(e) =>
                                    updateVariant(
                                      idx,
                                      "discountType",
                                      e.target.value,
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  <option value="percentage">
                                    Percentage (%)
                                  </option>
                                  <option value="flat">Flat (₹)</option>
                                </select>
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Discount Value
                                </label>
                                <input
                                  type="number"
                                  value={varItem.discountValue}
                                  onChange={(e) =>
                                    updateVariant(
                                      idx,
                                      "discountValue",
                                      e.target.value,
                                    )
                                  }
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #d1d5db",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#15803d",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Sale Price (₹)
                                </label>
                                <input
                                  type="number"
                                  readOnly
                                  value={varItem.salePrice}
                                  style={{
                                    width: "100%",
                                    padding: "6px 8px",
                                    borderRadius: "6px",
                                    border: "1px solid #bbf7d0",
                                    backgroundColor: "#f0fdf4",
                                    fontWeight: 700,
                                    color: "#15803d",
                                    fontSize: "0.85rem",
                                  }}
                                />
                              </div>

                              <div>
                                <label
                                  style={{
                                    display: "block",
                                    fontSize: "0.78rem",
                                    fontWeight: 600,
                                    color: "#4b5563",
                                    marginBottom: "4px",
                                  }}
                                >
                                  Stock & SKU
                                </label>
                                <div style={{ display: "flex", gap: "4px" }}>
                                  <input
                                    type="number"
                                    placeholder="Stock"
                                    value={varItem.stock}
                                    onChange={(e) =>
                                      updateVariant(
                                        idx,
                                        "stock",
                                        e.target.value,
                                      )
                                    }
                                    style={{
                                      width: "50%",
                                      padding: "6px 6px",
                                      borderRadius: "6px",
                                      border: "1px solid #d1d5db",
                                      fontSize: "0.8rem",
                                    }}
                                  />
                                  <input
                                    type="text"
                                    placeholder="SKU"
                                    value={varItem.sku}
                                    onChange={(e) =>
                                      updateVariant(idx, "sku", e.target.value)
                                    }
                                    style={{
                                      width: "50%",
                                      padding: "6px 6px",
                                      borderRadius: "6px",
                                      border: "1px solid #d1d5db",
                                      fontSize: "0.8rem",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: DESCRIPTIONS */}
                {formTab === "description" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Short Description (Key Highlights / Quick Summary)
                      </label>
                      <textarea
                        rows={3}
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Short summary displayed near price tag..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Full Description (React Quill Rich-Text Editor)
                      </label>
                      <div
                        style={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          overflow: "hidden",
                        }}
                      >
                        <ReactQuill
                          theme="snow"
                          value={fullDescription}
                          onChange={setFullDescription}
                          placeholder="Write detailed product description, benefits, ingredients, and storage instructions..."
                          style={{ height: "220px", marginBottom: "50px" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: IMAGES */}
                {formTab === "images" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            fontWeight: 700,
                            fontSize: "1rem",
                            color: "#1f2937",
                          }}
                        >
                          Product Images (Up to 10 Images)
                        </label>
                        <p
                          style={{
                            margin: "2px 0 0 0",
                            fontSize: "0.85rem",
                            color: "#6b7280",
                          }}
                        >
                          The <strong>Cover Image (Index 0)</strong> is shown as the primary thumbnail across the website. Click <strong>"Set as Cover"</strong> on any image to make it Cover.
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color:
                            imagesOrder.length >= 10
                              ? "#dc2626"
                              : "#16a34a",
                        }}
                      >
                        {imagesOrder.length} / 10 Images Uploaded
                      </span>
                    </div>

                    {/* Upload Drop Zone */}
                    {imagesOrder.length < 10 && (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        style={{
                          border: "2px dashed #3b82f6",
                          borderRadius: "12px",
                          padding: "32px",
                          textAlign: "center",
                          cursor: "pointer",
                          backgroundColor: "#eff6ff",
                          marginBottom: "24px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Upload size={36} color="#3b82f6" />
                        <span
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 600,
                            color: "#1d4ed8",
                          }}
                        >
                          Click or Drag images to upload (Supports JPEG, PNG, WEBP)
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          You can select multiple files at once. Max 10MB per file.
                        </span>
                        <input
                          type="file"
                          ref={imageInputRef}
                          onChange={handleImageFilesChange}
                          accept="image/*"
                          multiple
                          style={{ display: "none" }}
                        />
                      </div>
                    )}

                    {/* Images Grid Preview */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                        gap: "16px",
                      }}
                    >
                      {imagesOrder.map((item, i) => {
                        const isCover = i === 0;
                        const imgSrc =
                          item.type === "existing"
                            ? item.url?.startsWith("http")
                              ? item.url
                              : `${import.meta.env.VITE_API_URL || "https://thekissancity.com"}${item.url}`
                            : item.preview;

                        return (
                          <div
                            key={item.id || `img-${i}`}
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "175px",
                              borderRadius: "12px",
                              overflow: "hidden",
                              border: isCover
                                ? "2.5px solid #16a34a"
                                : "1.5px solid #e5e7eb",
                              backgroundColor: "#ffffff",
                              boxShadow: isCover
                                ? "0 4px 14px rgba(22, 163, 74, 0.25)"
                                : "0 2px 6px rgba(0, 0, 0, 0.04)",
                              transition: "all 0.2s ease",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            {/* Top Controls Bar */}
                            <div
                              style={{
                                position: "absolute",
                                top: 6,
                                left: 6,
                                right: 6,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                zIndex: 3,
                              }}
                            >
                              {isCover ? (
                                <span
                                  style={{
                                    backgroundColor: "#16a34a",
                                    color: "white",
                                    fontSize: "0.68rem",
                                    fontWeight: 800,
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <Sparkles size={12} /> COVER IMAGE
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setAsCoverImage(i)}
                                  style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    color: "#15803d",
                                    border: "1px solid #bbf7d0",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    transition: "all 0.2s",
                                  }}
                                  title="Set this image as primary cover"
                                >
                                  ★ Set as Cover
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => removeImageItem(i)}
                                style={{
                                  backgroundColor: "rgba(239, 68, 68, 0.9)",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                                  marginLeft: "auto",
                                }}
                                title="Remove image"
                              >
                                <X size={14} />
                              </button>
                            </div>

                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                padding: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: "#fafafa",
                              }}
                            >
                              <img
                                src={imgSrc}
                                alt={`Product ${i}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 5: NUTRITION FACTS */}
                {formTab === "nutrition" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        Nutrition Table (Per 100g serving)
                      </span>
                      <button
                        type="button"
                        onClick={addNutritionRow}
                        style={{
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #bbf7d0",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Plus size={16} /> Add Row
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {nutritionFacts.map((row, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="text"
                            placeholder="Nutrient Name (e.g. Energy, Protein, Fat)"
                            value={row.name}
                            onChange={(e) =>
                              updateNutritionRow(idx, "name", e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                              fontSize: "0.9rem",
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Value per 100g (e.g. 897 kcal, 99.5 g)"
                            value={row.per100g}
                            onChange={(e) =>
                              updateNutritionRow(idx, "per100g", e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                              fontSize: "0.9rem",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeNutritionRow(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "6px",
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 6: FAQS */}
                {formTab === "faqs" && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "16px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#374151" }}>
                        Frequently Asked Questions (FAQs)
                      </span>
                      <button
                        type="button"
                        onClick={addFaqRow}
                        style={{
                          backgroundColor: "#f0fdf4",
                          color: "#16a34a",
                          border: "1px solid #bbf7d0",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                        }}
                      >
                        <Plus size={16} /> Add FAQ Pair
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {faqs.map((faq, idx) => (
                        <div
                          key={idx}
                          style={{
                            backgroundColor: "#f9fafb",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: "0.85rem",
                                color: "#4b5563",
                              }}
                            >
                              FAQ #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFaqRow(idx)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#ef4444",
                                cursor: "pointer",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Question (e.g. Is this ghee 100% pure A2 Gir Cow ghee?)"
                            value={faq.question}
                            onChange={(e) =>
                              updateFaqRow(idx, "question", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                              fontSize: "0.9rem",
                              marginBottom: "8px",
                              boxSizing: "border-box",
                            }}
                          />
                          <textarea
                            rows={2}
                            placeholder="Answer (e.g. Yes, made with traditional Vedic bilona method from Gir cows...)"
                            value={faq.answer}
                            onChange={(e) =>
                              updateFaqRow(idx, "answer", e.target.value)
                            }
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              borderRadius: "6px",
                              border: "1px solid #d1d5db",
                              fontSize: "0.9rem",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 7: SEO META */}
                {formTab === "seo" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Meta Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pure A2 Desi Cow Ghee Bilona Method | The Kissan City"
                        value={seo.metaTitle}
                        onChange={(e) =>
                          setSeo({ ...seo, metaTitle: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Meta Keywords (comma separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. a2 ghee, bilona ghee, organic ghee, gir cow ghee"
                        value={seo.metaKeywords}
                        onChange={(e) =>
                          setSeo({ ...seo, metaKeywords: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontWeight: 600,
                          marginBottom: "6px",
                          color: "#374151",
                        }}
                      >
                        Meta Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Buy pure A2 Desi Cow Ghee made using traditional Vedic bilona method. Sourced from Gir cows."
                        value={seo.metaDescription}
                        onChange={(e) =>
                          setSeo({ ...seo, metaDescription: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontSize: "0.9rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer / Save Buttons */}
              <div
                className="product-modal-footer"
                style={{
                  padding: "16px 28px",
                  borderTop: "1px solid #e5e7eb",
                  backgroundColor: "#fafafa",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    backgroundColor: "white",
                    color: "#374151",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <div style={{ display: "flex", gap: "12px" }}>
                  {formTab !== "seo" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs = [
                          "basic",
                          "pricing",
                          "description",
                          "images",
                          "nutrition",
                          "faqs",
                          "seo",
                        ];
                        const nextIdx = tabs.indexOf(formTab) + 1;
                        if (nextIdx < tabs.length) setFormTab(tabs[nextIdx]);
                      }}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        backgroundColor: "#f3f4f6",
                        color: "#1f2937",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Next Step →
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: "var(--green-600, #2f6f3e)",
                      color: "white",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Check size={18} />{" "}
                    {loading
                      ? "Saving..."
                      : editingId
                        ? "Update Product"
                        : "Save Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW PRODUCT DETAILS MODAL ── */}
      {viewProduct && (
        <div
          className="product-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.55)",
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="product-modal-dialog"
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              maxWidth: "750px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              padding: "24px",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Eye color="var(--green-600, #16a34a)" size={22} /> Product Details
                </h2>
                <span style={{ fontSize: "0.82rem", color: "#6b7280" }}>ID: {viewProduct._id}</span>
              </div>
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                  padding: "4px",
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Product Header & Images */}
              <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "160px" }}>
                  <img
                    src={
                      viewProduct.images && viewProduct.images.length > 0
                        ? viewProduct.images[0].startsWith("http")
                          ? viewProduct.images[0]
                          : `https://thekissancity.com${viewProduct.images[0].startsWith("/") ? "" : "/"}${viewProduct.images[0]}`
                        : "/product_ghee.png"
                    }
                    alt={viewProduct.name}
                    style={{ width: "160px", height: "160px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e5e7eb" }}
                  />
                  {viewProduct.images && viewProduct.images.length > 1 && (
                    <div style={{ display: "flex", gap: "6px", overflowX: "auto" }}>
                      {viewProduct.images.slice(1).map((img, i) => (
                        <img
                          key={i}
                          src={img.startsWith("http") ? img : `https://thekissancity.com${img.startsWith("/") ? "" : "/"}${img}`}
                          alt="thumbnail"
                          style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px", border: "1px solid #e5e7eb" }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: "240px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>{viewProduct.name}</h3>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ background: "#e0e7ff", color: "#4338ca", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>
                      Category: {viewProduct.category?.name || viewProduct.category || "Uncategorized"}
                    </span>
                    <span style={{ background: viewProduct.isActive ? "#dcfce7" : "#fee2e2", color: viewProduct.isActive ? "#15803d" : "#b91c1c", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {viewProduct.isActive ? "Active" : "Inactive"}
                    </span>
                    {viewProduct.isBestSeller && (
                      <span style={{ background: "#fef3c7", color: "#b45309", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>
                        🏆 Best Seller
                      </span>
                    )}
                    {viewProduct.isNewArrival && (
                      <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "3px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>
                        ✨ New Arrival
                      </span>
                    )}
                  </div>
                  {viewProduct.slug && (
                    <div style={{ fontSize: "0.83rem", color: "#6b7280" }}>
                      <strong>URL Slug:</strong> <code>{viewProduct.slug}</code>
                    </div>
                  )}
                  {viewProduct.healthRegions && viewProduct.healthRegions.length > 0 && (
                    <div style={{ fontSize: "0.83rem", color: "#374151" }}>
                      <strong>Health Regions:</strong>{" "}
                      {viewProduct.healthRegions.map(h => h?.name || h).join(", ")}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Stock Details */}
              <div style={{ background: "#f9fafb", padding: "16px", borderRadius: "12px", border: "1px solid #f3f4f6" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "0.95rem", color: "#374151" }}>Pricing & Stock Configuration</h4>
                {viewProduct.hasVariants && viewProduct.variants && viewProduct.variants.length > 0 ? (
                  <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#e5e7eb", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Variant</th>
                        <th style={{ padding: "8px" }}>MRP</th>
                        <th style={{ padding: "8px" }}>Discount</th>
                        <th style={{ padding: "8px" }}>Sale Price</th>
                        <th style={{ padding: "8px" }}>Stock</th>
                        <th style={{ padding: "8px" }}>SKU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewProduct.variants.map((v, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #e5e7eb" }}>
                          <td style={{ padding: "8px", fontWeight: 600 }}>{v.label || `${v.quantityValue} ${v.unit}`}</td>
                          <td style={{ padding: "8px" }}>₹{Math.round(Number(v.originalPrice) || 0)}</td>
                          <td style={{ padding: "8px" }}>{v.discountValue ? `${v.discountValue}${v.discountType === 'percentage' ? '%' : '₹'}` : '-'}</td>
                          <td style={{ padding: "8px", fontWeight: 700, color: "#16a34a" }}>₹{Math.round(Number(v.salePrice) || 0)}</td>
                          <td style={{ padding: "8px" }}>{v.stock || 0}</td>
                          <td style={{ padding: "8px", fontFamily: "monospace" }}>{v.sku || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", fontSize: "0.85rem" }}>
                    <div><span style={{ color: "#6b7280" }}>Quantity:</span> <strong>{viewProduct.simplePrice?.quantityValue} {viewProduct.simplePrice?.unit}</strong></div>
                    <div><span style={{ color: "#6b7280" }}>Original MRP:</span> <strong>₹{Math.round(Number(viewProduct.simplePrice?.originalPrice) || 0)}</strong></div>
                    <div><span style={{ color: "#6b7280" }}>Sale Price:</span> <strong style={{ color: "#16a34a" }}>₹{Math.round(Number(viewProduct.simplePrice?.salePrice) || 0)}</strong></div>
                    <div><span style={{ color: "#6b7280" }}>Stock:</span> <strong>{viewProduct.simplePrice?.stock || 0}</strong></div>
                    <div><span style={{ color: "#6b7280" }}>SKU:</span> <code>{viewProduct.simplePrice?.sku || "-"}</code></div>
                  </div>
                )}
              </div>

              {/* Short & Full Description */}
              {viewProduct.shortDescription && (
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#374151" }}>Short Description:</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#4b5563", background: "#fff", padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    {viewProduct.shortDescription}
                  </p>
                </div>
              )}

              {viewProduct.fullDescription && (
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#374151" }}>Full Description:</strong>
                  <div
                    style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "#4b5563", background: "#fff", padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", maxHeight: "150px", overflowY: "auto" }}
                    dangerouslySetInnerHTML={{ __html: viewProduct.fullDescription }}
                  />
                </div>
              )}

              {/* Nutrition Facts */}
              {viewProduct.nutritionFacts && viewProduct.nutritionFacts.length > 0 && viewProduct.nutritionFacts.some(n => n.name) && (
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#374151" }}>Nutrition Facts (per 100g):</strong>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                    {viewProduct.nutritionFacts.filter(n => n.name).map((n, i) => (
                      <span key={i} style={{ background: "#f3f4f6", padding: "4px 10px", borderRadius: "6px", fontSize: "0.8rem", color: "#374151" }}>
                        <strong>{n.name}:</strong> {n.per100g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {viewProduct.slug ? (
                <a
                  href={`/product/${viewProduct.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#2563eb", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}
                >
                  Preview on Website ↗
                </a>
              ) : <div />}
              <button
                type="button"
                onClick={() => setViewProduct(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}