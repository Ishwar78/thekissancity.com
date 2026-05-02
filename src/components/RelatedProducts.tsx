import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';

interface RelatedProduct {
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
    type: 'flat' | 'percentage';
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
    } else {
      return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
    }
  }
  return s;
};

const calculateDiscountedPrice = (price: number, discount?: { type: 'flat' | 'percentage'; value: number }) => {
  if (!discount || discount.value === 0) return price;
  if (discount.type === 'percentage') {
    return price - (price * discount.value / 100);
  }
  return price - discount.value;
};

export const RelatedProducts = ({ productId }: { productId: string }) => {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        const { ok, json } = await api(`/api/products/${productId}/related`);
        if (ok && Array.isArray(json?.data)) {
          setProducts(json.data);
        }
      } catch (e) {
        console.error('Failed to load related products:', e);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRelated();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="rp-section">
        <h2 className="rp-title">
          You May <span>Also Like</span>
        </h2>
        <div className="rp-scroll">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="rp-item">
              <div className="rp-skeleton">
                <div className="rp-skeleton-img" />
                <div className="rp-skeleton-line" />
                <div className="rp-skeleton-line rp-skeleton-line-sm" />
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
        /* Related Products CSS - matching product card aesthetic */
        .rp-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1.5px solid rgba(107, 68, 35, 0.1);
          width: 100%;
        }

        @media (min-width: 640px) {
          .rp-section {
            margin-top: 4rem;
            padding-top: 3rem;
          }
        }

        .rp-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: #6b4423;
        }

        .rp-title span {
          color: #2d6a4f;
          position: relative;
          display: inline-block;
        }

        .rp-title span::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 0;
          width: 100%;
          height: 6px;
          background: rgba(45, 106, 79, 0.15);
          border-radius: 4px;
          z-index: -1;
        }

        @media (min-width: 640px) {
          .rp-title {
            font-size: 2rem;
            margin-bottom: 2rem;
          }
        }

        /* Scroll container */
        .rp-scroll {
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
          .rp-scroll {
            gap: 1rem;
            margin-left: -1rem;
            margin-right: -1rem;
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }

        .rp-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .rp-scroll::-webkit-scrollbar-track {
          background: #d8f3dc;
          border-radius: 20px;
        }

        .rp-scroll::-webkit-scrollbar-thumb {
          background: #2d6a4f;
          border-radius: 20px;
        }

        .rp-scroll::-webkit-scrollbar-thumb:hover {
          background: #1b4332;
        }

        /* Product item */
        .rp-item {
          flex-shrink: 0;
          width: 160px;
          position: relative;
          transition: transform 0.2s ease;
        }

        .rp-item:hover {
          transform: translateY(-2px);
        }

        @media (min-width: 640px) {
          .rp-item {
            width: 192px;
          }
        }

        /* Card */
        .rp-card {
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

        .rp-card:hover {
          box-shadow: 0 12px 28px rgba(45, 106, 79, 0.15) !important;
          border-color: rgba(45, 106, 79, 0.22) !important;
        }

        /* Image wrapper */
        .rp-img-wrap {
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

        .rp-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
          transition: transform 0.5s ease;
          position: relative;
          z-index: 1;
        }

        .rp-card:hover .rp-img-wrap img {
          transform: scale(1.08);
        }

        /* Dark overlay on hover */
        .rp-img-wrap::after {
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

        .rp-card:hover .rp-img-wrap::after {
          opacity: 1;
        }

        /* Wishlist button */
        .rp-wishlist-btn {
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

        .rp-wishlist-btn:hover {
          transform: scale(1.15);
          background: #ffffff !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
        }

        .rp-wishlist-btn:focus,
        .rp-wishlist-btn:active {
          background: rgba(255, 255, 255, 0.95) !important;
          outline: none;
        }

        /* Best seller badge */
        .rp-badge {
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
          background: linear-gradient(135deg, #2d6a4f, #40916c);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Discount badge */
        .rp-discount-badge {
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
          background: #6b4423;
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Divider */
        .rp-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(107, 68, 35, 0.1), transparent);
          margin: 6px 12px 0;
        }

        /* Body */
        .rp-body {
          padding: 8px 12px 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .rp-category {
          font-size: 9px;
          font-weight: 600;
          color: #6b4423;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          opacity: 0.7;
          margin-bottom: 4px;
        }

        .rp-name {
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

        .rp-card:hover .rp-name {
          color: #1b4332;
        }

        /* Price row */
        .rp-price-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: auto;
        }

        .rp-price {
          font-size: 16px;
          font-weight: 800;
          color: #2d6a4f;
          letter-spacing: -0.3px;
        }

        .rp-original {
          font-size: 11px;
          color: #a0a0a0;
          text-decoration: line-through;
          font-weight: 400;
        }

        .rp-savings {
          font-size: 9px;
          font-weight: 700;
          color: #2d6a4f;
          background: #d8f3dc;
          padding: 2px 6px;
          border-radius: 20px;
          margin-left: auto;
        }

        /* Quick view button (appears on hover) */
        .rp-quick-view {
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          opacity: 0;
          background: rgba(255, 255, 255, 0.95);
          color: #2d6a4f;
          border: none;
          border-radius: 30px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          white-space: nowrap;
          z-index: 5;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(45, 106, 79, 0.1);
        }

        .rp-quick-view:hover {
          background: #2d6a4f;
          color: white;
        }

        .rp-card:hover .rp-quick-view {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Skeleton loading */
        .rp-skeleton {
          background: white;
          border-radius: 18px;
          padding: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(107, 68, 35, 0.05);
        }

        .rp-skeleton-img {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(90deg, #f0e5d0 25%, #faf3eb 50%, #f0e5d0 75%);
          background-size: 200% 100%;
          animation: rp-shimmer 1.5s infinite;
          border-radius: 14px;
          margin-bottom: 10px;
        }

        .rp-skeleton-line {
          height: 14px;
          width: 100%;
          background: linear-gradient(90deg, #f0e5d0 25%, #faf3eb 50%, #f0e5d0 75%);
          background-size: 200% 100%;
          animation: rp-shimmer 1.5s infinite;
          border-radius: 20px;
          margin-bottom: 8px;
        }

        .rp-skeleton-line-sm {
          width: 60%;
          margin-bottom: 0;
        }

        @keyframes rp-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Stock indicator */
        .rp-stock {
          font-size: 9px;
          color: #2d6a4f;
          margin-top: 4px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
        }

        .rp-stock::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #2d6a4f;
          display: inline-block;
        }

        .rp-stock.low-stock::before {
          background: #f59e0b;
        }

        .rp-stock.out-of-stock::before {
          background: #ef4444;
        }

        .rp-stock.low-stock {
          color: #f59e0b;
        }

        .rp-stock.out-of-stock {
          color: #ef4444;
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .rp-item {
            width: 140px;
          }
          
          .rp-name {
            font-size: 12px;
          }
          
          .rp-price {
            font-size: 14px;
          }
        }
      `}</style>

      <div className="rp-section">
        <h2 className="rp-title">
          You May <span>Also Like</span>
        </h2>

        <div className="rp-scroll">
          {products.map((product) => {
            const id = product._id || product.id;
            const slug = product.slug || '';
            const title = product.title || product.name || 'Product';
            const price = Number(product.price || 0);
            const image = resolveImage(product.image_url || product.images?.[0]);
            const stock = Number(product.stock || 0);
            const discount = product.discount;
            const finalPrice = calculateDiscountedPrice(price, discount);
            const discountPercentage = discount?.type === 'percentage' ? discount.value :
              (discount?.value ? Math.round((discount.value / price) * 100) : 0);

            const productLink = slug ? `/products/${slug}` : `/product/${id}`;

            const handleWishlistClick = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(id);
            };

            const handleAddToCart = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();

              const cartItem = {
                id: id,
                title: title,
                price: finalPrice,
                originalPrice: price,
                image: image,
              };

              addToCart(cartItem, 1);
            };

            const inWishlist = isInWishlist(id);

            return (
              <div key={id} className="rp-item group">
                <Link to={productLink} className="block h-full">
                  <Card className="rp-card">
                    {/* Image section */}
                    <div className="rp-img-wrap">
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
                        <div className="rp-badge">Best Seller</div>
                      )}
                      {discountPercentage > 0 && (
                        <div className="rp-discount-badge">{discountPercentage}% OFF</div>
                      )}

                      {/* Wishlist button */}
                      <button
                        onClick={handleWishlistClick}
                        className="rp-wishlist-btn"
                        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          size={14}
                          fill={inWishlist ? '#e63946' : 'none'}
                          color={inWishlist ? '#e63946' : '#6b4423'}
                          strokeWidth={2.2}
                        />
                      </button>

                      {/* Add to cart button */}
                      <button className="rp-quick-view" onClick={handleAddToCart}>
                        Add to cart
                      </button>
                    </div>

                    <div className="rp-divider" />

                    {/* Content section */}
                    <div className="rp-body">
                      <div className="rp-category">
                        {product.category || 'Collection'}
                      </div>

                      <h3 className="rp-name">{title}</h3>

                      <div className="rp-price-row">
                        <span className="rp-price">
                          ₹{finalPrice.toLocaleString('en-IN')}
                        </span>

                        {discount && discount.value > 0 && (
                          <>
                            <span className="rp-original">
                              ₹{price.toLocaleString('en-IN')}
                            </span>
                            {discountPercentage > 0 && (
                              <span className="rp-savings">
                                Save {discountPercentage}%
                              </span>
                            )}
                          </>
                        )}
                      </div>


                      {/* {stock > 0 ? (
                        <div className={`rp-stock ${stock < 5 ? 'low-stock' : ''}`}>
                          {stock < 5 ? `Only ${stock} left` : 'In Stock'}
                        </div>
                      ) : (
                        <div className="rp-stock out-of-stock">Out of Stock</div>
                      )} */}
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