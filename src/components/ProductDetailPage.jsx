import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useUser } from "../context/UserContext";
import {
  Camera,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  HelpCircle,
  Leaf,
  MessageSquareText,
  Minus,
  Package,
  Plus,
  Share2,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  Upload,
  X,
  Zap,
} from "lucide-react";
import "./ProductDetail.css";

const FALLBACK_PRODUCT = {
  id: 1,
  slug: "a2-desi-cow-ghee",
  name: "A2 Desi Cow Ghee – Bilona Method",
  category: "Desi Ghee",
  categorySlug: "desi-ghee",
  healthRegions: [],
  imgs: [
    "/product_ghee.png",
    "/hero_promo_1.png",
    "/hero_banner.png",
    "/hero_promo_2.png",
  ],
  price: 799,
  originalPrice: 999,
  discount: 20,
  rating: 4.8,
  reviewsCount: 2,
  sold: 12400,
  badge: "bestseller",
  shortDesc:
    "Pure A2 Desi Cow Ghee made with the traditional bilona churning method. Sourced directly from Gir cows. Rich in CLA, Omega-3, and fat-soluble vitamins.",
  sizes: [
    { label: "250 ml", price: 399, originalPrice: 499, stock: 45 },
    { label: "500 ml", price: 799, originalPrice: 999, stock: 35 },
    { label: "1 Litre", price: 1499, originalPrice: 1799, stock: 24 },
    { label: "2 Litre", price: 2799, originalPrice: 3199, stock: 12 },
  ],
  highlights: [
    "100% pure A2 milk from Gir cows — no adulteration",
    "Traditional bilona hand-churned process — preserves nutrition",
    "No preservatives, additives or industrial shortcuts",
    "Rich in CLA, Omega-3 and fat-soluble vitamins",
    "Certified Natural and FSSAI approved",
  ],
  descFull: `
    <h2>Traditional purity in every spoon</h2>
    <p>Our A2 Desi Cow Ghee is crafted using the ancient Vedic bilona method. Fresh A2 milk is converted into curd, hand-churned to obtain butter and then slowly clarified to preserve its natural nutrition.</p>
    <p>Unlike commercially processed ghee, it retains a naturally golden colour, granular texture and rich nutty aroma — signs of authentic quality.</p>
    <h3>Why you will love it</h3>
    <ul>
      <li>Made from carefully sourced A2 cow milk</li>
      <li>Slow-cooked in small batches</li>
      <li>No artificial flavour, colour or preservative</li>
      <li>Suitable for daily cooking, sweets and traditional wellness use</li>
    </ul>
  `,
  nutrition: [
    { name: "Energy", per100g: "897 kcal" },
    { name: "Total Fat", per100g: "99.5 g" },
    { name: "Saturated Fat", per100g: "62 g" },
    { name: "Monounsaturated Fat", per100g: "29 g" },
    { name: "Polyunsaturated Fat", per100g: "4 g" },
    { name: "CLA (Conjugated Linoleic Acid)", per100g: "1.5–2 g" },
    { name: "Vitamin A", per100g: "3069 IU" },
  ],
  faqs: [
    {
      question: "Is this ghee 100% pure A2 Gir Cow Ghee?",
      answer:
        "Yes. It is made from carefully sourced A2 cow milk using the traditional bilona method.",
    },
    {
      question: "What is the shelf life of this ghee?",
      answer:
        "It has a shelf life of 12 months from the manufacturing date. Store it in a cool and dry place.",
    },
  ],
  reviews: [
    {
      id: "sample-1",
      name: "Priya Sharma",
      city: "Delhi",
      rating: 5,
      title: "Best ghee I have ever tasted!",
      text: "The aroma is rich and the texture feels genuinely homemade. Packaging was also very secure.",
      date: "June 15, 2025",
      verified: true,
      image: "",
    },
    {
      id: "sample-2",
      name: "Rahul Mehta",
      city: "Bengaluru",
      rating: 5,
      title: "Genuine quality and fresh taste",
      text: "I have tried many brands claiming A2 ghee, but this one tastes authentic and fresh.",
      date: "May 28, 2025",
      verified: true,
      image: "",
    },
  ],
};

const EMPTY_REVIEW = {
  name: "",
  city: "",
  rating: 0,
  title: "",
  text: "",
};

function resolveImageUrl(imagePath, baseUrl) {
  if (!imagePath) return "";
  if (/^(https?:|data:|blob:)/i.test(imagePath)) return imagePath;
  return `${baseUrl}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
}

function formatRelatedProduct(p, baseUrl) {
  const imgs = Array.isArray(p.images) && p.images.length > 0
    ? p.images.map(img => resolveImageUrl(img, baseUrl))
    : ["/product_ghee.png"];

  let price = 0;
  let originalPrice = 0;

  if (p.hasVariants && Array.isArray(p.variants) && p.variants.length > 0) {
    price = Number(p.variants[0].salePrice) || 0;
    originalPrice = Number(p.variants[0].originalPrice) || price;
  } else if (p.simplePrice) {
    price = Number(p.simplePrice.salePrice) || 0;
    originalPrice = Number(p.simplePrice.originalPrice) || price;
  }

  return {
    id: p._id,
    slug: p.slug,
    name: p.name,
    category: p.category?.name || p.category || "Farm Product",
    imgs,
    img: imgs[0],
    price,
    originalPrice,
    rating: Number(p.rating) || 4.8,
  };
}

function getReviewStorageKey(productId, productSlug) {
  return `kissan-product-reviews-${productId || productSlug || "default"}`;
}

function getInitials(name = "") {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "KC";
}

function StarRating({ rating, size = 16, className = "" }) {
  return (
    <span
      className={`pd-star-rating ${className}`.trim()}
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= Math.round(rating) ? "currentColor" : "none"}
          strokeWidth={1.8}
        />
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useUser();
  const reviewImageInputRef = useRef(null);
  const reviewSectionRef = useRef(null);
  const reviewListRef = useRef(null);

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [shareMessage, setShareMessage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState(EMPTY_REVIEW);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewImagePreview, setReviewImagePreview] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setActiveImg(0);
    setActiveVariantIndex(0);
    setQty(1);

    const fetchProduct = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
        const response = await fetch(`${baseUrl}/api/products/${slug}`);
        const data = await response.json();

        if (data.success && data.product && isMounted) {
          const prod = data.product;
          const formattedImgs =
            Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images.map((image) => resolveImageUrl(image, baseUrl))
              : ["/product_ghee.png"];

          let sizesList = [];
          if (
            prod.hasVariants &&
            Array.isArray(prod.variants) &&
            prod.variants.length > 0
          ) {
            sizesList = prod.variants.map((variant) => ({
              label:
                variant.label || `${variant.quantityValue} ${variant.unit}`,
              price: Number(variant.salePrice) || 0,
              originalPrice:
                Number(variant.originalPrice) || Number(variant.salePrice) || 0,
              discount: Number(variant.discountValue) || 0,
              sku: variant.sku || "",
              stock: Number(variant.stock) || 0,
            }));
          } else {
            const simplePrice = prod.simplePrice || {};
            sizesList = [
              {
                label: simplePrice.quantityValue
                  ? `${simplePrice.quantityValue} ${simplePrice.unit || ""}`.trim()
                  : "Standard",
                price: Number(simplePrice.salePrice) || 0,
                originalPrice:
                  Number(simplePrice.originalPrice) ||
                  Number(simplePrice.salePrice) ||
                  0,
                discount: Number(simplePrice.discountValue) || 0,
                sku: simplePrice.sku || "",
                stock: Number(simplePrice.stock) || 0,
              },
            ];
          }

          document.title =
            prod.seo?.metaTitle ||
            `${prod.name || "Farm Product"} | The Kissan City`;

          const normalizedReviews = Array.isArray(prod.reviews)
            ? prod.reviews.map((review, index) => ({
                id: review._id || review.id || `api-review-${index}`,
                name: review.name || "Kissan Customer",
                city: review.city || "",
                rating: Number(review.rating) || 5,
                title: review.title || "Customer Review",
                text: review.text || review.comment || review.content || "",
                date: review.date || review.createdAt || "",
                verified: Boolean(review.isVerifiedPurchase || review.verified),
                image: resolveImageUrl(review.image, baseUrl),
              }))
            : [];

          const formattedProduct = {
            id: prod._id,
            slug: prod.slug,
            name: prod.name,
            category: prod.category?.name || "Farm Product",
            healthRegions: Array.isArray(prod.healthRegions)
              ? prod.healthRegions
              : [],
            imgs: formattedImgs,
            price: sizesList[0]?.price || 0,
            originalPrice: sizesList[0]?.originalPrice || 0,
            discount: sizesList[0]?.discount || 0,
            rating: Number(prod.rating) || 4.8,
            reviewsCount: Number(prod.reviewsCount) || normalizedReviews.length,
            sold: Number(prod.sold) || 0,
            isBestSeller: Boolean(prod.isBestSeller),
            isNewArrival: Boolean(prod.isNewArrival),
            shortDesc: prod.shortDescription || "",
            descFull: prod.fullDescription || "",
            sizes: sizesList,
            highlights: prod.shortDescription
              ? prod.shortDescription
                  .split(/\n|•/)
                  .map((item) => item.trim())
                  .filter(Boolean)
              : [],
            nutrition:
              Array.isArray(prod.nutritionFacts) &&
              prod.nutritionFacts.length > 0
                ? prod.nutritionFacts
                : [],
            faqs:
              Array.isArray(prod.faqs) && prod.faqs.length > 0
                ? prod.faqs
                : [],
          };

          // Set product data first
          setProductData(formattedProduct);
          
          // Then fetch reviews for this product
          try {
            const reviewResponse = await fetch(`${baseUrl}/api/reviews/${prod._id}`);
            const reviewData = await reviewResponse.json();
            if (reviewData.success && isMounted) {
              setReviews(reviewData.reviews);
            }
          } catch (reviewErr) {
            console.error("Failed to fetch reviews:", reviewErr);
          }

          // Fetch related products
          try {
            const productsResponse = await fetch(`${baseUrl}/api/products`);
            const productsData = await productsResponse.json();
            if (productsData.success && isMounted && Array.isArray(productsData.products)) {
              const currentId = (prod._id || prod.id || "").toString();
              const categoryId = (prod.category?._id || prod.category || "").toString();
              const categoryName = (prod.category?.name || prod.category || "").toString().toLowerCase().trim();

              let categoryMatches = productsData.products.filter(p => {
                const pId = (p._id || p.id || "").toString();
                if (pId === currentId) return false;
                const pCatId = (p.category?._id || p.category || "").toString();
                const pCatName = (p.category?.name || p.category || "").toString().toLowerCase().trim();
                return (categoryId && pCatId === categoryId) || (categoryName && pCatName === categoryName);
              });

              // Fallback to top up if category has fewer than 4 products
              if (categoryMatches.length < 4) {
                const remaining = productsData.products.filter(p => {
                  const pId = (p._id || p.id || "").toString();
                  return pId !== currentId && !categoryMatches.some(cm => (cm._id || cm.id).toString() === pId);
                });
                categoryMatches = [...categoryMatches, ...remaining];
              }

              const formattedRelated = categoryMatches
                .slice(0, 4)
                .map(p => formatRelatedProduct(p, baseUrl));

              setRelatedProducts(formattedRelated);
            }
          } catch (relatedErr) {
            console.error("Failed to fetch related products:", relatedErr);
          }
        } else if (isMounted) {
          setProductData(FALLBACK_PRODUCT);
        }
      } catch (error) {
        console.error("Failed to fetch product detail:", error);
        if (isMounted) setProductData(FALLBACK_PRODUCT);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const product = productData || FALLBACK_PRODUCT;

  const getReviewScrollAmount = () => {
    const list = reviewListRef.current;

    if (!list) return 320;

    const firstCard = list.querySelector(".pd-review-card");
    const listStyles = window.getComputedStyle(list);
    const gap =
      Number.parseFloat(listStyles.columnGap || listStyles.gap || "0") || 0;

    return firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : Math.max(280, list.clientWidth * 0.85);
  };

  const scrollReviews = (direction) => {
    const list = reviewListRef.current;

    if (!list) return;

    const scrollAmount = getReviewScrollAmount();
    const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);

    if (direction > 0 && list.scrollLeft >= maxScrollLeft - 12) {
      list.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction < 0 && list.scrollLeft <= 12) {
      list.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    list.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (activeTab !== "reviews" || reviews.length < 2) return undefined;

    const autoScrollTimer = window.setInterval(() => {
      const list = reviewListRef.current;

      if (!list) return;

      const isHovered = list.matches(":hover");
      const isFocused =
        document.activeElement && list.contains(document.activeElement);

      if (isHovered || isFocused) return;

      const scrollAmount = getReviewScrollAmount();
      const maxScrollLeft = Math.max(0, list.scrollWidth - list.clientWidth);
      const hasReachedEnd = list.scrollLeft >= maxScrollLeft - 12;

      list.scrollTo({
        left: hasReachedEnd ? 0 : list.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }, 3200);

    return () => window.clearInterval(autoScrollTimer);
  }, [activeTab, reviews.length]);

  const currentSizeObj = product.sizes?.[activeVariantIndex] ||
    product.sizes?.[0] || {
      price: product.price || 0,
      label: "Standard",
      originalPrice: product.originalPrice || 0,
      stock: 0,
    };

  const currentPrice = Number(currentSizeObj.price) || 0;
  const originalPrice = Number(currentSizeObj.originalPrice) || currentPrice;
  const savedAmount = Math.max(0, originalPrice - currentPrice);
  const stockCount = Number(currentSizeObj.stock) || 0;

  const calculatedRating = useMemo(() => {
    if (!reviews.length) return Number(product.rating) || 0;
    const ratingTotal = reviews.reduce(
      (sum, review) => sum + (Number(review.rating) || 0),
      0,
    );
    return Math.round((ratingTotal / reviews.length) * 10) / 10;
  }, [reviews, product.rating]);

  const ratingBreakdown = useMemo(() => {
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter(
        (review) => Math.round(Number(review.rating)) === stars,
      ).length;
      return {
        stars,
        count,
        pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
      };
    });
  }, [reviews]);

  const itemImg = (product.imgs && product.imgs[0]) || product.img || '/product_ghee.png';

  const handleAddToCart = () => {
    if (stockCount <= 0) {
      alert('Sorry, this product is currently out of stock!');
      return;
    }
    if (qty > stockCount) {
      alert(`Only ${stockCount} units available in stock!`);
      return;
    }

    const cartItem = {
      ...product,
      img: itemImg,
      imgs: product.imgs || [itemImg],
      price: currentPrice,
      selectedSize: currentSizeObj.label,
      selectedSku: currentSizeObj.sku || "",
      qty,
    };

    addToCart(cartItem, qty);

    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2200);
  };

  const handleBuyNow = () => {
    if (stockCount <= 0) {
      alert('Sorry, this product is currently out of stock!');
      return;
    }
    if (qty > stockCount) {
      alert(`Only ${stockCount} units available in stock!`);
      return;
    }

    navigate("/checkout", {
      state: {
        buyNowItem: {
          ...product,
          img: itemImg,
          imgs: product.imgs || [itemImg],
          price: currentPrice,
          selectedSize: currentSizeObj.label,
          selectedSku: currentSizeObj.sku || "",
          qty,
        },
      },
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} at The Kissan City`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareMessage("Product link copied!");
        window.setTimeout(() => setShareMessage(""), 1800);
      }
    } catch (error) {
      if (error?.name !== "AbortError")
        console.error("Could not share product:", error);
    }
  };

  const openReviewForm = () => {
    setActiveTab("reviews");
    window.setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const handleReviewFieldChange = (field, value) => {
    setReviewForm((previous) => ({ ...previous, [field]: value }));
    setReviewError("");
    setReviewSuccess("");
  };

  const handleReviewImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setReviewError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setReviewError("Review image must be smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setReviewImagePreview(String(reader.result || ""));
      setReviewForm(prev => ({ ...prev, imageFile: file }));
      setReviewError("");
    };
    reader.onerror = () => setReviewError("Could not read the selected image.");
    reader.readAsDataURL(file);
  };

  const removeReviewImage = () => {
    setReviewImagePreview("");
    setReviewForm(prev => ({ ...prev, imageFile: null }));
    if (reviewImageInputRef.current) reviewImageInputRef.current.value = "";
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setReviewError("Please login to submit a review.");
      return;
    }

    if (!reviewForm.rating) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (!reviewForm.title.trim()) {
      setReviewError("Please add a short review title.");
      return;
    }
    if (reviewForm.text.trim().length < 10) {
      setReviewError("Please write at least 10 characters in your review.");
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5005";
      
      const formData = new FormData();
      formData.append('productId', product.id || product._id);
      formData.append('userId', user._id || user.id);
      formData.append('rating', reviewForm.rating);
      formData.append('title', reviewForm.title.trim());
      formData.append('comment', reviewForm.text.trim());
      
      if (reviewForm.imageFile) {
        formData.append('image', reviewForm.imageFile);
      }

      const response = await fetch(`${baseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token') || localStorage.getItem('kissanUserToken')}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setReviews((previous) => [data.review, ...previous]);
        setReviewForm(EMPTY_REVIEW);
        setHoveredRating(0);
        removeReviewImage();
        setReviewError("");
        setReviewSuccess("Thank you! Your review has been added successfully.");
        window.setTimeout(() => setReviewSuccess(""), 3500);
      } else {
        setReviewError(data.message || "Failed to submit review.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError("An error occurred. Please try again later.");
    }
  };

  const hasReviewPreview = Boolean(
    reviewForm.name ||
      reviewForm.city ||
      reviewForm.rating ||
      reviewForm.title ||
      reviewForm.text ||
      reviewImagePreview,
  );

  if (loading) {
    return (
      <div className="pd-loading-screen">
        <div className="pd-loading-screen__icon">
          <Package size={34} />
        </div>
        <strong>Loading farm-fresh product…</strong>
        <span>Please wait a moment.</span>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span className="breadcrumb__sep">›</span>
          <span>{product.category}</span>
          <span className="breadcrumb__sep">›</span>
          <span className="breadcrumb__current">{product.name}</span>
        </nav>

        <div className="product-detail__grid">
          <section className="pd-gallery" aria-label="Product gallery">
            <div className="pd-gallery__main">
              <img
                src={product.imgs[activeImg] || product.imgs[0]}
                alt={product.name}
              />

              <div className="pd-gallery__badge-wrap">
                <span className="pd-gallery__badge organic">
                  <Leaf size={13} /> Certified Natural
                </span>
              </div>

              <div className="pd-gallery__share">
                <button
                  type="button"
                  className={`pd-gallery__action-btn${isWishlisted(product.id || product._id || product.slug) ? " active" : ""}`}
                  onClick={() => toggleWishlist(product)}
                  aria-label={
                    isWishlisted(product.id || product._id || product.slug) ? "Remove from wishlist" : "Add to wishlist"
                  }
                  style={{ color: isWishlisted(product.id || product._id || product.slug) ? '#ef4444' : undefined }}
                >
                  <Heart
                    size={18}
                    fill={isWishlisted(product.id || product._id || product.slug) ? "#ef4444" : "none"}
                  />
                </button>
                <button
                  type="button"
                  className="pd-gallery__action-btn"
                  onClick={handleShare}
                  aria-label="Share product"
                >
                  <Share2 size={18} />
                </button>
              </div>

              {shareMessage && (
                <div className="pd-share-message">{shareMessage}</div>
              )}
            </div>

            <div className="pd-gallery__thumbs">
              {product.imgs.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`pd-gallery__thumb${index === activeImg ? " active" : ""}`}
                  onClick={() => setActiveImg(index)}
                  aria-label={`View product image ${index + 1}`}
                >
                  <img src={image} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>

            <div className="pd-gallery__assurance">
              <div>
                <span>100%</span>
                <small>Natural</small>
              </div>
              <div>
                <span>Farm</span>
                <small>Sourced</small>
              </div>
              <div>
                <span>Safe</span>
                <small>Packaging</small>
              </div>
            </div>
          </section>

          <section className="pd-info">
            <div className="pd-info__topline">
              <div className="pd-info__category">
                <Leaf size={14} /> {product.category}
              </div>
              <div
                className={`pd-stock-pill${stockCount > 0 ? "" : " out-of-stock"}`}
              >
                <span />
                {stockCount > 0 ? "In Stock" : "Out of Stock"}
              </div>
            </div>

            <h1 className="pd-info__title">{product.name}</h1>

            <div className="pd-info__rating-row">
              <div className="pd-info__rating-box">
                <span>{calculatedRating.toFixed(1)}</span>
                <Star size={14} fill="currentColor" />
              </div>
              <StarRating rating={calculatedRating} />
              <button
                type="button"
                className="pd-info__reviews-link"
                onClick={openReviewForm}
              >
                {reviews.length} customer review
                {reviews.length !== 1 ? "s" : ""}
              </button>
              {product.sold > 0 && (
                <span className="pd-info__sold-count">
                  <CheckCircle size={13} /> {(product.sold / 1000).toFixed(1)}k+
                  sold
                </span>
              )}
            </div>

            <div className="pd-info__price-section">
              <div className="pd-info__price-row">
                <span className="pd-info__price">
                  ₹{currentPrice.toLocaleString("en-IN")}
                </span>
                {originalPrice > currentPrice && (
                  <>
                    <span className="pd-info__price-original">
                      ₹{originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="pd-info__discount-pill">
                      {Math.round(
                        ((originalPrice - currentPrice) / originalPrice) * 100,
                      )}
                      % OFF
                    </span>
                  </>
                )}
              </div>
              <div className="pd-info__tax-note">
                Inclusive of all taxes
                {savedAmount > 0 && (
                  <span>
                    You save ₹{savedAmount.toLocaleString("en-IN")} on this pack
                  </span>
                )}
              </div>
            </div>

            {product.shortDesc && (
              <div className="pd-info__short-description">
                <Sparkles size={18} />
                <p>{product.shortDesc}</p>
              </div>
            )}



            {product.sizes?.length > 0 && (
              <div className="pd-info__size-section">
                <div className="pd-info__section-heading">
                  <span>Choose pack / size</span>
                  <strong>{currentSizeObj.label}</strong>
                </div>
                <div className="pd-info__sizes">
                  {product.sizes.map((size, index) => (
                    <button
                      type="button"
                      key={`${size.label}-${index}`}
                      className={`pd-size-btn${index === activeVariantIndex ? " active" : ""}`}
                      onClick={() => {
                        setActiveVariantIndex(index);
                        setQty(1);
                      }}
                    >
                      <span>{size.label}</span>
                      <small>
                        ₹{Number(size.price || 0).toLocaleString("en-IN")}
                      </small>
                      {index === activeVariantIndex && (
                        <CheckCircle size={15} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pd-info__purchase-row">
              <div>
                <span className="pd-info__purchase-label">Quantity</span>
                <div className="pd-qty">
                  <button
                    type="button"
                    className="pd-qty__btn"
                    onClick={() =>
                      setQty((previous) => Math.max(1, previous - 1))
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    className="pd-qty__num"
                    type="number"
                    value={qty}
                    min={1}
                    max={stockCount > 0 ? stockCount : 1}
                    onChange={(event) => {
                      const val = Math.max(1, Number.parseInt(event.target.value, 10) || 1);
                      if (stockCount > 0 && val > stockCount) {
                        alert(`Only ${stockCount} units available in stock!`);
                        setQty(stockCount);
                      } else {
                        setQty(val);
                      }
                    }}
                    aria-label="Product quantity"
                  />
                  <button
                    type="button"
                    className="pd-qty__btn"
                    onClick={() =>
                      setQty((previous) => {
                        const maxAllowed = stockCount > 0 ? stockCount : 1;
                        if (previous >= maxAllowed) {
                          alert(`Only ${stockCount} units available in stock!`);
                          return maxAllowed;
                        }
                        return previous + 1;
                      })
                    }
                    disabled={stockCount > 0 && qty >= stockCount}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="pd-info__total-box">
                <span>Order total</span>
                <strong>₹{(currentPrice * qty).toLocaleString("en-IN")}</strong>
              </div>
            </div>

            <div className="pd-info__cta">
              <button
                type="button"
                className={`btn-add-cart${addedToCart ? " added" : ""}`}
                onClick={handleAddToCart}
                disabled={stockCount <= 0}
                style={stockCount <= 0 ? { backgroundColor: '#9ca3af', cursor: 'not-allowed' } : {}}
              >
                {stockCount <= 0 ? (
                  'Out of Stock'
                ) : addedToCart ? (
                  <>
                    <CheckCircle size={20} /> Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Add to cart
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-buy-now"
                onClick={handleBuyNow}
                disabled={stockCount <= 0}
                style={stockCount <= 0 ? { backgroundColor: '#d1d5db', cursor: 'not-allowed' } : {}}
              >
                {stockCount <= 0 ? 'Unavailable' : <><Zap size={20} /> Buy now</>}
              </button>
            </div>

            <div className="pd-info__trust">
              <div className="pd-trust-item">
                <div className="icon">🚚</div>
                <div>
                  <strong>Fast Delivery</strong>
                  <span>Free above ₹499</span>
                </div>
              </div>
              <div className="pd-trust-item">
                <div className="icon">🔄</div>
                <div>
                  <strong>Easy Returns</strong>
                  <span>7-day support</span>
                </div>
              </div>
              <div className="pd-trust-item">
                <div className="icon">🌿</div>
                <div>
                  <strong>100% Natural</strong>
                  <span>Farm sourced</span>
                </div>
              </div>
              <div className="pd-trust-item">
                <div className="icon">🏆</div>
                <div>
                  <strong>Quality Checked</strong>
                  <span>FSSAI approved</span>
                </div>
              </div>
            </div>

            <div className="pd-delivery-card">
              <div className="pd-delivery-card__icon">
                <Truck size={22} />
              </div>
              <div>
                <strong>Estimated delivery: 2–4 business days</strong>
                <span>
                  Freshly packed and safely delivered to your doorstep.
                </span>
              </div>
            </div>
          </section>
        </div>

        <section className="pd-tabs-section">
          <div
            className="pd-tabs"
            role="tablist"
            aria-label="Product information tabs"
          >
            {[
              { key: "description", label: "Full Description" },
              { key: "nutrition", label: "Nutrition Facts" },
              { key: "faqs", label: `FAQs (${product.faqs?.length || 0})` },
              { key: "reviews", label: `Reviews (${reviews.length})` },
            ].map((tab) => (
              <button
                type="button"
                key={tab.key}
                className={`pd-tab${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="pd-tab-content pd-description-layout">
              <article className="pd-description-card">
                <div className="pd-content-heading">
                  <span className="pd-content-heading__icon">
                    <Leaf size={21} />
                  </span>
                  <div>
                    <span>Know your product</span>
                    <h2>Pure ingredients, traditional process</h2>
                  </div>
                </div>

                {product.descFull ? (
                  <div
                    className="pd-rich-description"
                    dangerouslySetInnerHTML={{ __html: product.descFull }}
                  />
                ) : (
                  <p className="pd-empty-text">
                    {product.shortDesc ||
                      "No detailed description is available for this product."}
                  </p>
                )}
              </article>

              {Array.isArray(product.highlights) && product.highlights.length > 0 && (
                <aside className="pd-highlights-card">
                  <div className="pd-highlights-card__header">
                    <Sparkles size={20} />
                    <div>
                      <span>Product highlights</span>
                      <strong>Why customers choose it</strong>
                    </div>
                  </div>
                  <div className="pd-highlights-list">
                    {product.highlights.map((highlight, index) => (
                      <div
                        className="pd-highlight-item"
                        key={`${highlight}-${index}`}
                      >
                        <CheckCircle size={18} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pd-description-note">
                    <Leaf size={18} />
                    <span>
                      Store in a cool and dry place. Always use a clean, dry
                      spoon.
                    </span>
                  </div>
                </aside>
              )}
            </div>
          )}

          {activeTab === "nutrition" && (
            <div className="pd-tab-content pd-nutrition-card">
              <div className="pd-content-heading">
                <span className="pd-content-heading__icon">🥗</span>
                <div>
                  <span>Nutrition information</span>
                  <h2>Approximate values per 100g serving</h2>
                </div>
              </div>

              {product.nutrition?.length > 0 ? (
                <div className="pd-nutrition-table-wrap">
                  <table className="pd-nutrition-table">
                    <thead>
                      <tr>
                        <th>Nutrient</th>
                        <th>Per 100g</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.nutrition.map((row, index) => (
                        <tr key={`${row.name}-${index}`}>
                          <td>{row.name}</td>
                          <td>{row.per100g}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="pd-empty-text">
                  Nutrition information is not available.
                </p>
              )}
            </div>
          )}

          {activeTab === "faqs" && (
            <div className="pd-tab-content pd-faq-section">
              <div className="pd-content-heading">
                <span className="pd-content-heading__icon">
                  <HelpCircle size={21} />
                </span>
                <div>
                  <span>Need help?</span>
                  <h2>Frequently asked questions</h2>
                </div>
              </div>

              {product.faqs?.length > 0 ? (
                <div className="pd-faq-list">
                  {product.faqs.map((faq, index) => (
                    <details
                      className="pd-faq-item"
                      key={`${faq.question}-${index}`}
                      open={index === 0}
                    >
                      <summary>
                        <span>{faq.question}</span>
                        <Plus size={18} />
                      </summary>
                      <div className="pd-faq-item__answer">{faq.answer}</div>
                    </details>
                  ))}
                </div>
              ) : (
                <p className="pd-empty-text">
                  No FAQs are available for this product.
                </p>
              )}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="pd-tab-content pd-reviews" ref={reviewSectionRef}>
              <div className="pd-reviews__top-grid">
                <div className="pd-reviews__summary-card">
                  <div className="pd-reviews__summary-head">
                    <div>
                      <span>Customer rating</span>
                      <div className="pd-reviews__score-row">
                        <strong>{calculatedRating.toFixed(1)}</strong>
                        <div>
                          <StarRating rating={calculatedRating} size={20} />
                          <small>
                            Based on {reviews.length} review
                            {reviews.length !== 1 ? "s" : ""}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="pd-reviews__recommend-badge">
                      <CheckCircle size={18} />
                      <span>Customer feedback</span>
                    </div>
                  </div>

                  <div className="pd-reviews__bars">
                    {ratingBreakdown.map((row) => (
                      <div key={row.stars} className="pd-reviews__bar-row">
                        <span>{row.stars} star</span>
                        <div className="pd-reviews__bar-track">
                          <div
                            className="pd-reviews__bar-fill"
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                        <strong>{row.count}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="pd-reviews__summary-note">
                    <MessageSquareText size={18} />
                    <span>
                      Share your real experience to help other Kissan City
                      customers.
                    </span>
                  </div>
                </div>

                <div className="pd-review-form-card">
                  <div className="pd-review-form-card__header">
                    <div>
                      <span>Purchased this product?</span>
                      <h2>Write a customer review</h2>
                    </div>
                    <div className="pd-review-form-card__icon">
                      <MessageSquareText size={24} />
                    </div>
                  </div>

                  <form
                    onSubmit={handleReviewSubmit}
                    className="pd-review-form"
                  >
                    <div className="pd-review-form__row">
                      <label className="pd-field">
                        <span>Your name *</span>
                        <input
                          type="text"
                          value={reviewForm.name}
                          onChange={(event) =>
                            handleReviewFieldChange("name", event.target.value)
                          }
                          placeholder="Enter your name"
                        />
                      </label>
                      <label className="pd-field">
                        <span>City</span>
                        <input
                          type="text"
                          value={reviewForm.city}
                          onChange={(event) =>
                            handleReviewFieldChange("city", event.target.value)
                          }
                          placeholder="e.g. Delhi"
                        />
                      </label>
                    </div>

                    <div className="pd-field">
                      <span>Your rating *</span>
                      <div
                        className="pd-review-rating-picker"
                        onMouseLeave={() => setHoveredRating(0)}
                      >
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled =
                            star <= (hoveredRating || reviewForm.rating);
                          return (
                            <button
                              type="button"
                              key={star}
                              className={isFilled ? "active" : ""}
                              onMouseEnter={() => setHoveredRating(star)}
                              onFocus={() => setHoveredRating(star)}
                              onBlur={() => setHoveredRating(0)}
                              onClick={() =>
                                handleReviewFieldChange("rating", star)
                              }
                              aria-label={`${star} star rating`}
                            >
                              <Star
                                size={29}
                                fill={isFilled ? "currentColor" : "none"}
                              />
                            </button>
                          );
                        })}
                        <strong>
                          {reviewForm.rating
                            ? `${reviewForm.rating} out of 5`
                            : "Tap a star to rate"}
                        </strong>
                      </div>
                    </div>

                    <label className="pd-field">
                      <span>Review title *</span>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(event) =>
                          handleReviewFieldChange("title", event.target.value)
                        }
                        placeholder="Summarise your experience"
                        maxLength={90}
                      />
                    </label>

                    <label className="pd-field">
                      <span>Your review *</span>
                      <textarea
                        rows={5}
                        value={reviewForm.text}
                        onChange={(event) =>
                          handleReviewFieldChange("text", event.target.value)
                        }
                        placeholder="Tell us about quality, taste, packaging and your overall experience…"
                        maxLength={1000}
                      />
                      <small>{reviewForm.text.length}/1000 characters</small>
                    </label>

                    <div className="pd-review-upload">
                      <input
                        ref={reviewImageInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleReviewImage}
                        hidden
                      />

                      {!reviewImagePreview ? (
                        <button
                          type="button"
                          className="pd-review-upload__button"
                          onClick={() => reviewImageInputRef.current?.click()}
                        >
                          <span>
                            <Camera size={22} />
                          </span>
                          <div>
                            <strong>Add a product photo</strong>
                            <small>JPG, PNG or WEBP · Max 2 MB</small>
                          </div>
                          <Upload size={18} />
                        </button>
                      ) : (
                        <div className="pd-review-upload__preview">
                          <img
                            src={reviewImagePreview}
                            alt="Review upload preview"
                          />
                          <div>
                            <strong>Photo attached</strong>
                            <span>It will appear with your review.</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeReviewImage}
                            aria-label="Remove review image"
                          >
                            <X size={17} />
                          </button>
                        </div>
                      )}
                    </div>

                    {reviewError && (
                      <div className="pd-review-message error">
                        {reviewError}
                      </div>
                    )}
                    {reviewSuccess && (
                      <div className="pd-review-message success">
                        {reviewSuccess}
                      </div>
                    )}

                    <button type="submit" className="pd-review-submit">
                      <Star size={18} fill="currentColor" /> Submit review
                    </button>
                  </form>
                </div>
              </div>

              {hasReviewPreview && (
                <div className="pd-live-preview">
                  <div className="pd-live-preview__heading">
                    <span>Live preview</span>
                    <small>
                      This is how your review will look after submission.
                    </small>
                  </div>
                  <article className="pd-review-card preview-card">
                    <div className="pd-review-card__top">
                      <div className="pd-review-card__avatar">
                        {getInitials(reviewForm.name || "Your Name")}
                      </div>
                      <div className="pd-review-card__identity">
                        <h3>{reviewForm.name || "Your Name"}</h3>
                        <span>{reviewForm.city || "Your City"}</span>
                      </div>
                      <div className="pd-review-card__rating">
                        <StarRating rating={reviewForm.rating || 0} size={15} />
                        <strong>
                          {reviewForm.rating
                            ? `${reviewForm.rating}.0`
                            : "Not rated"}
                        </strong>
                      </div>
                    </div>
                    <div
                      className={`pd-review-card__content${
                        reviewImagePreview ? " has-image" : " no-image"
                      }`}
                    >
                      {reviewImagePreview && (
                        <div className="pd-review-card__image-wrap">
                          <img
                            className="pd-review-card__image"
                            src={reviewImagePreview}
                            alt="Review draft"
                          />
                        </div>
                      )}

                      <div className="pd-review-card__copy">
                        <span className="pd-review-card__quote" aria-hidden="true">
                          “
                        </span>
                        <h4>
                          {reviewForm.title ||
                            "Your review title will appear here"}
                        </h4>
                        <p>
                          {reviewForm.text ||
                            "Write your experience above and it will be shown here as a live preview."}
                        </p>
                      </div>
                    </div>
                    <div className="pd-review-card__footer">
                      <span>Just now</span>
                      <span className="pd-review-card__pending">
                        Pending submission
                      </span>
                    </div>
                  </article>
                </div>
              )}

              <div className="pd-reviews__list-section">
                <div className="pd-reviews__list-heading">
                  <div>
                    <span>Real customer experiences</span>
                    <h2>What people are saying</h2>
                  </div>

                  <div className="pd-reviews__list-actions">
                    <strong>
                      {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </strong>

                    {reviews.length > 1 && (
                      <div className="pd-reviews__carousel-controls">
                        <button
                          type="button"
                          onClick={() => scrollReviews(-1)}
                          aria-label="Show previous reviews"
                        >
                          <ChevronLeft size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => scrollReviews(1)}
                          aria-label="Show next reviews"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {reviews.length > 0 ? (
                  <div
                    ref={reviewListRef}
                    className="pd-reviews__list"
                    aria-label="Customer reviews carousel"
                    tabIndex={0}
                  >
                    {reviews.map((review) => (
                      <article
                        className={`pd-review-card${review.image ? " has-image" : " no-image"}`}
                        key={review._id || review.id}
                      >
                        <div className="pd-review-card__top">
                          <div className="pd-review-card__avatar">
                            {getInitials(
                              review.reviewerName ||
                                review.user?.name ||
                                review.name ||
                                "User",
                            )}
                          </div>

                          <div className="pd-review-card__identity">
                            <h3>
                              {review.reviewerName ||
                                review.user?.name ||
                                review.name ||
                                "Customer"}
                            </h3>
                            <span>
                              {review.reviewerLocation ||
                                review.city ||
                                "Kissan City customer"}
                            </span>
                          </div>

                          <div className="pd-review-card__rating">
                            <StarRating rating={review.rating} size={15} />
                            <strong>{Number(review.rating).toFixed(1)}</strong>
                          </div>
                        </div>

                        <div
                          className={`pd-review-card__content${
                            review.image ? " has-image" : " no-image"
                          }`}
                        >
                          {review.image && (
                            <div className="pd-review-card__image-wrap">
                              <img
                                className="pd-review-card__image"
                                src={
                                  String(review.image).startsWith("http")
                                    ? String(review.image)
                                    : `${(
                                        import.meta.env.VITE_API_URL ||
                                        "http://localhost:5005"
                                      ).replace(/\/$/, "")}${
                                        String(review.image).startsWith("/")
                                          ? ""
                                          : "/"
                                      }${review.image}`
                                }
                                alt={`Review shared by ${
                                  review.reviewerName ||
                                  review.user?.name ||
                                  review.name ||
                                  "Customer"
                                }`}
                                loading="lazy"
                                onError={(event) => {
                                  const imageWrap = event.currentTarget.closest(
                                    ".pd-review-card__image-wrap",
                                  );
                                  const contentWrap = event.currentTarget.closest(
                                    ".pd-review-card__content",
                                  );

                                  if (imageWrap) imageWrap.style.display = "none";
                                  if (contentWrap)
                                    contentWrap.classList.add("image-error");
                                }}
                              />
                            </div>
                          )}

                          <div className="pd-review-card__copy">
                            <span
                              className="pd-review-card__quote"
                              aria-hidden="true"
                            >
                              “
                            </span>
                            <h4>{review.title || "Customer Review"}</h4>
                            <p>
                              {review.comment ||
                                review.text ||
                                "The customer shared a positive product experience."}
                            </p>
                          </div>
                        </div>

                        <div className="pd-review-card__footer">
                          <span>
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  },
                                )
                              : review.date || "Recently added"}
                          </span>

                          {review.isVerifiedPurchase || review.verified ? (
                            <span className="pd-review-card__verified">
                              <CheckCircle size={14} /> Verified purchase
                            </span>
                          ) : (
                            <span className="pd-review-card__customer">
                              Customer review
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="pd-reviews__empty">
                    <MessageSquareText size={34} />
                    <h3>Be the first to review this product</h3>
                    <p>
                      Your feedback can help other customers make the right
                      choice.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="pd-related">
        <div className="container">
          <div className="pd-related__heading">
            <div className="section-badge">🌾 You may also like</div>
            <h2 className="section-title">
              Related <span>Farm Products</span>
            </h2>
            <p>
              More naturally sourced products selected for your everyday
              wellness.
            </p>
          </div>

          <div className="pd-related__grid">
            {relatedProducts.length > 0 ? relatedProducts.map((relatedProduct) => (
              <Link
                to={`/product/${relatedProduct.slug}`}
                key={relatedProduct.id}
                className="pd-related-card"
              >
                <div className="pd-related-card__image-wrap">
                  <img src={relatedProduct.imgs && relatedProduct.imgs[0] ? relatedProduct.imgs[0] : (relatedProduct.img || "/product_ghee.png")} alt={relatedProduct.name} />
                  {relatedProduct.originalPrice > relatedProduct.price && (
                    <span>
                      {Math.round(
                        ((relatedProduct.originalPrice - relatedProduct.price) /
                          relatedProduct.originalPrice) *
                          100,
                      )}
                      % OFF
                    </span>
                  )}
                </div>
                <div className="pd-related-card__body">
                  <small>{relatedProduct.category}</small>
                  <h3>{relatedProduct.name}</h3>
                  <div className="pd-related-card__rating">
                    <StarRating rating={relatedProduct.rating || 5} size={13} />
                    <span>{relatedProduct.rating || 5}</span>
                  </div>
                  <div className="pd-related-card__footer">
                    <div>
                      <strong>₹{relatedProduct.price}</strong>
                      {relatedProduct.originalPrice > relatedProduct.price && (
                        <del>₹{relatedProduct.originalPrice}</del>
                      )}
                    </div>
                    <span className="pd-related-card__add">
                      <Plus size={18} />
                    </span>
                  </div>
                </div>
              </Link>
            )) : (
              <p style={{ color: "var(--gray-500)", textAlign: "center", width: "100%", padding: "40px 0" }}>No related products found.</p>
            )}
          </div>
        </div>
      </section>

      <div className="pd-sticky-bar">
        <div className="pd-sticky-bar__price">
          <span>Total</span>
          <strong>₹{(currentPrice * qty).toLocaleString("en-IN")}</strong>
        </div>
        <button type="button" onClick={handleAddToCart}>
          <ShoppingCart size={18} /> Add to cart
        </button>
        <button type="button" onClick={handleBuyNow}>
          Buy now
        </button>
      </div>
    </div>
  );
}