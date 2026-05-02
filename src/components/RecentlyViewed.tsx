import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Heart, History, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { useWishlist } from "@/hooks/useWishlist";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RecentProduct {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  image_url?: string;
  images?: string[];
  category?: string;
  stock?: number;
  slug?: string;
  discount?: {
    type: "flat" | "percentage";
    value: number;
  };
  isBestSeller?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;
  
  // Handle Cloudinary images
  if (s.includes('cloudinary')) {
    if (s.includes('/w_') || s.includes('/h_') || s.includes('/c_')) return s;
    return s.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
  }
  
  const isLocalBase = (() => {
    try {
      return (
        API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1")
      );
    } catch {
      return false;
    }
  })();
  const isHttpsPage = (() => {
    try {
      return location.protocol === "https:";
    } catch {
      return false;
    }
  })();
  if (s.startsWith("/uploads") || s.startsWith("uploads")) {
    if (API_BASE && !(isLocalBase && isHttpsPage)) {
      const base = API_BASE.endsWith("/")
        ? API_BASE.slice(0, -1)
        : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
    return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
  }
  return s;
};

const calculateDiscountedPrice = (
  price: number,
  discount?: { type: "flat" | "percentage"; value: number }
) => {
  if (!discount || discount.value === 0) return price;
  if (discount.type === "percentage") {
    return price - (price * discount.value) / 100;
  }
  return price - discount.value;
};

export const RecentlyViewed = ({
  excludeProductId,
}: {
  excludeProductId: string;
}) => {
  const { getList } = useRecentlyViewed();
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRecent = async () => {
      const list = getList().filter(
        (item) => String(item.id) !== String(excludeProductId)
      );
      if (list.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const results = await Promise.all(
          list.map(async (item) => {
            const idOrSlug = item.slug || item.id;
            const { ok, json } = await api(
              `/api/products/${idOrSlug}?_t=${Date.now()}`
            );
            if (ok && json?.data) return json.data as RecentProduct;
            return null;
          })
        );
        const valid = results.filter(
          (p): p is RecentProduct => p != null && !!(p._id || p.id)
        );
        setProducts(valid);
      } catch (e) {
        console.error("Failed to load recently viewed:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (excludeProductId) {
      loadRecent();
    }
  }, [excludeProductId, getList]);

  const handleAddToCart = (e: React.MouseEvent, product: RecentProduct) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = product._id || product.id;
    const title = product.title || product.name || "Product";
    const price = Number(product.price || 0);
    const image = resolveImage(product.image_url || product.images?.[0]);
    
    const item = { id, title, price, image };
    
    if (!user) {
      try { 
        localStorage.setItem('kissancity_add_intent', JSON.stringify({ item, qty: 1 })); 
      } catch {}
      navigate('/auth');
      return;
    }
    
    addToCart(item, 1);
    toast.success('Added to cart');
  };

  const handleWishlistClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { 
      navigate('/auth'); 
      return; 
    }
    toggleWishlist(id);
  };

  const listToShow = getList().filter(
    (item) => String(item.id) !== String(excludeProductId)
  );
  
  if (listToShow.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="rv-section">
        <h2 className="rv-title">
          <History className="rv-title-icon" />
          Recently Viewed
        </h2>
        <div className="rv-scroll">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="rv-item">
              <div className="rv-skeleton">
                <div className="rv-skeleton-img" />
                <div className="rv-skeleton-line" />
                <div className="rv-skeleton-line rv-skeleton-line-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        /* Recently Viewed CSS - matching product card aesthetic */
        .rv-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1.5px solid rgba(107, 68, 35, 0.1);
          width: 100%;
        }

        @media (min-width: 640px) {
          .rv-section {
            margin-top: 4rem;
            padding-top: 3rem;
          }
        }

        .rv-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #6b4423;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rv-title-icon {
          width: 1.75rem;
          height: 1.75rem;
          color: #2d6a4f;
          opacity: 0.8;
        }

        @media (min-width: 640px) {
          .rv-title {
            font-size: 2rem;
            margin-bottom: 2rem;
          }
          .rv-title-icon {
            width: 2rem;
            height: 2rem;
          }
        }

        /* Scroll container */
        .rv-scroll {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          padding-bottom: 1rem;
          margin-left: -0.75rem;
          margin-right: -0.75rem;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          scrollbar-width: thin;
          scrollbar-color: #2d6a4f #d8f3dc;
        }

        @media (min-width: 640px) {
          .rv-scroll {
            gap: 1rem;
            margin-left: -1rem;
            margin-right: -1rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        .rv-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .rv-scroll::-webkit-scrollbar-track {
          background: #d8f3dc;
          border-radius: 20px;
        }

        .rv-scroll::-webkit-scrollbar-thumb {
          background: #2d6a4f;
          border-radius: 20px;
        }

        .rv-scroll::-webkit-scrollbar-thumb:hover {
          background: #1b4332;
        }

        /* Product item */
        .rv-item {
          flex-shrink: 0;
          width: 160px;
          position: relative;
          transition: transform 0.2s ease;
        }

        .rv-item:hover {
          transform: translateY(-2px);
        }

        @media (min-width: 640px) {
          .rv-item {
            width: 192px;
          }
        }

        /* Card */
        .rv-card {
          border: 1.5px solid rgba(107, 68, 35, 0.08) !important;
          border-radius: 18px !important;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.06) !important;
          background: #ffffff !important;
          overflow: hidden;
          width: 100%;
          transition: all 0.3s ease !important;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .rv-card:hover {
          box-shadow: 0 12px 28px rgba(45, 106, 79, 0.15) !important;
          border-color: rgba(45, 106, 79, 0.22) !important;
        }

        /* Image wrapper */
        .rv-img-wrap {
          position: relative;
          aspect-ratio: 1;
          background: #faf3eb;
          border-radius: 14px;
          margin: 8px 8px 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rv-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
          transition: transform 0.5s ease;
          position: relative;
          z-index: 1;
        }

        .rv-card:hover .rv-img-wrap img {
          transform: scale(1.08);
        }

        /* Dark overlay on hover */
        .rv-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(27, 67, 50, 0.5) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.35s ease;
          border-radius: 14px;
          pointer-events: none;
          z-index: 2;
        }

        .rv-card:hover .rv-img-wrap::after {
          opacity: 1;
        }

        /* Add to cart button — slides up */
        .rv-cart-btn {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #2d6a4f;
          border: none;
          border-radius: 30px;
          padding: 8px 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          white-space: nowrap;
          z-index: 5;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          transition: transform 0.3s ease, opacity 0.3s ease, background 0.2s, color 0.2s;
        }

        .rv-cart-btn:hover {
          background: #2d6a4f;
          color: #ffffff;
        }

        .rv-card:hover .rv-cart-btn {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Wishlist button */
        .rv-wishlist-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95) !important;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease !important;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(4px);
        }

        .rv-wishlist-btn:hover {
          transform: scale(1.15);
          background: #ffffff !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .rv-wishlist-btn:focus,
        .rv-wishlist-btn:active {
          background: rgba(255, 255, 255, 0.95) !important;
          outline: none;
        }

        /* Badges */
        .rv-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 9px;
          font-weight: 800;
          padding: 4px 8px;
          border-radius: 20px;
          letter-spacing: 0.3px;
          z-index: 3;
          text-transform: uppercase;
        }

        .rv-badge-bestseller {
          background: linear-gradient(135deg, #2d6a4f, #40916c);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .rv-badge-discount {
          background: #6b4423;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Divider */
        .rv-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(107, 68, 35, 0.1), transparent);
          margin: 6px 12px 0;
        }

        /* Body */
        .rv-body {
          padding: 8px 12px 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .rv-category {
          font-size: 9px;
          font-weight: 600;
          color: #6b4423;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          opacity: 0.7;
          margin-bottom: 4px;
        }

        .rv-name {
          font-size: 13px;
          font-weight: 700;
          color: #2d6a4f;
          line-height: 1.4;
          margin-bottom: 6px;
          /* Allow multi-line text to show complete name */
          display: block;
          overflow: visible;
          white-space: normal;
          letter-spacing: 0.2px;
          transition: color 0.2s;
        }

        .rv-card:hover .rv-name {
          color: #1b4332;
        }

        /* Price row */
        .rv-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: auto;
        }

        .rv-price {
          font-size: 16px;
          font-weight: 800;
          color: #2d6a4f;
          letter-spacing: -0.3px;
        }

        .rv-original {
          font-size: 11px;
          color: #a0a0a0;
          text-decoration: line-through;
          font-weight: 400;
        }

        .rv-savings {
          font-size: 9px;
          font-weight: 700;
          color: #2d6a4f;
          background: #d8f3dc;
          padding: 2px 6px;
          border-radius: 20px;
          margin-left: auto;
        }

        /* Stock indicator */
        .rv-stock {
          font-size: 9px;
          color: #2d6a4f;
          margin-top: 4px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .rv-stock::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2d6a4f;
          display: inline-block;
        }

        .rv-stock.low-stock::before {
          background: #f59e0b;
        }

        .rv-stock.out-of-stock::before {
          background: #ef4444;
        }

        .rv-stock.low-stock {
          color: #f59e0b;
        }

        .rv-stock.out-of-stock {
          color: #ef4444;
        }

        /* Skeleton loading */
        .rv-skeleton {
          background: white;
          border-radius: 18px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(107, 68, 35, 0.05);
        }

        .rv-skeleton-img {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(90deg, #f0e5d0 25%, #faf3eb 50%, #f0e5d0 75%);
          background-size: 200% 100%;
          animation: rv-shimmer 1.5s infinite;
          border-radius: 14px;
          margin-bottom: 10px;
        }

        .rv-skeleton-line {
          height: 14px;
          width: 100%;
          background: linear-gradient(90deg, #f0e5d0 25%, #faf3eb 50%, #f0e5d0 75%);
          background-size: 200% 100%;
          animation: rv-shimmer 1.5s infinite;
          border-radius: 20px;
          margin-bottom: 8px;
        }

        .rv-skeleton-line-sm {
          width: 60%;
          margin-bottom: 0;
        }

        @keyframes rv-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .rv-item {
            width: 140px;
          }
          
          .rv-name {
            font-size: 12px;
          }
          
          .rv-price {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="rv-section">
        <h2 className="rv-title">
          <History className="rv-title-icon" />
          Recently Viewed
        </h2>
        
        <div className="rv-scroll">
          {products.map((product) => {
            const id = product._id || product.id;
            const slug = product.slug || "";
            const title = product.title || product.name || "Product";
            const price = Number(product.price || 0);
            const image = resolveImage(product.image_url || product.images?.[0]);
            const stock = Number(product.stock || 0);
            const discount = product.discount;
            const finalPrice = calculateDiscountedPrice(price, discount);
            const discountPercentage = discount?.type === 'percentage' ? discount.value : 
              (discount?.value ? Math.round((discount.value / price) * 100) : 0);
            const productLink = slug ? `/products/${slug}` : `/product/${id}`;

            return (
              <div key={id} className="rv-item group">
                <Link to={productLink} className="block h-full">
                  <Card className="rv-card">
                    {/* Image section */}
                    <div className="rv-img-wrap">
                      <img
                        src={image}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />

                      {/* Badges */}
                      {product.isBestSeller && !discountPercentage && (
                        <div className="rv-badge rv-badge-bestseller">Best Seller</div>
                      )}
                      {discountPercentage > 0 && (
                        <div className="rv-badge rv-badge-discount">{discountPercentage}% OFF</div>
                      )}

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => handleWishlistClick(e, id)}
                        className="rv-wishlist-btn"
                        aria-label={isInWishlist(id) ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          size={14}
                          fill={isInWishlist(id) ? '#e63946' : 'none'}
                          color={isInWishlist(id) ? '#e63946' : '#6b4423'}
                          strokeWidth={2.2}
                        />
                      </button>

                      {/* Add to Cart button */}
                      <button 
                        className="rv-cart-btn" 
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart size={13} />
                        Add to Cart
                      </button>
                    </div>

                    <div className="rv-divider" />

                    {/* Content section */}
                    <div className="rv-body">
                      <div className="rv-category">
                        {product.category || 'Collection'}
                      </div>
                      
                      <h3 className="rv-name">{title}</h3>

                      <div className="rv-price-row">
                        <span className="rv-price">
                          ₹{finalPrice.toLocaleString("en-IN")}
                        </span>
                        
                        {discount && discount.value > 0 && (
                          <>
                            <span className="rv-original">
                              ₹{price.toLocaleString("en-IN")}
                            </span>
                            {discountPercentage > 0 && (
                              <span className="rv-savings">
                                Save {discountPercentage}%
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Stock indicator */}
                      {stock > 0 ? (
                        <div className={`rv-stock ${stock < 5 ? 'low-stock' : ''}`}>
                          {stock < 5 ? `Only ${stock} left` : 'In Stock'}
                        </div>
                      ) : (
                        <div className="rv-stock out-of-stock">Out of Stock</div>
                      )}
                    </div>
                  </Card>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};