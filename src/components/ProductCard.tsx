import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  discountAmount?: number;
  image: string;
  category: string;
  to?: string;
  slug?: string;
  images?: string[];
  rating?: number;
  isBestSeller?: boolean;
  quantityOptions?: Array<{
    id: string;
    quantity: number;
    unit: 'gm' | 'ml' | 'l' | 'pcs';
    packSize: number;
    displayLabel: string;
    price: number;
    originalPrice?: number;
    stock: number;
    isActive: boolean;
    sortOrder: number;
  }>;
}

export const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  discountPercentage,
  image,
  category,
  to,
  slug,
  images,
  isBestSeller,
  quantityOptions
}: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = (() => {
    try { return useCart(); }
    catch { return { addToCart: () => {} } as any; }
  })();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const primaryImage = images && images.length > 0 ? images[0] : image;

  const src = (() => {
    if (image && image.includes('cloudinary')) {
      if (image.includes('/w_') || image.includes('/h_') || image.includes('/c_')) return image;
      return image.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
    }
    return image;
  })();

  const linkTo = to || (slug && String(slug).trim() ? `/products/${slug}` : `/products/${id}`);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { id, title: name, price, image: primaryImage };
    if (!user) {
      try { localStorage.setItem('uni_add_intent', JSON.stringify({ item, qty: 1 })); } catch {}
      navigate('/auth');
      return;
    }
    addToCart(item, 1);
    toast.success('Added to cart');
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/auth'); return; }
    toggleWishlist(id);
  };

  const inWishlist = isInWishlist(id);

  return (
    <>
      <style>{`
        .pc3 {
          --green:      #2d6a4f;
          --green-dark: #1b4332;
          --green-soft: #d8f3dc;
          --brown:      #6b4423;
          --brown-soft: #f0e5d0;
          --cream:      #faf3eb;
          --muted:      #a0a0a0;
          --r:          18px;
          --ri:         14px;
        }

        /* Card */
        .pc3-card {
          position: relative;
          border: 1.5px solid rgba(107,68,35,0.08) !important;
          border-radius: var(--r) !important;
          box-shadow: 0 2px 10px rgba(45,106,79,0.06) !important;
          background: #fff !important;
          overflow: hidden;
          width: 100%;
          max-width: 300px;
          transition: box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s !important;
        }
        .pc3-card:hover {
          box-shadow: 0 14px 40px rgba(45,106,79,0.15) !important;
          border-color: rgba(45,106,79,0.22) !important;
          transform: translateY(-5px);
        }

        /* Image wrap */
        .pc3-img-wrap {
          position: relative;
          aspect-ratio: 1;
          background: var(--cream);
          border-radius: var(--ri);
          margin: 8px 8px 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pc3-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 14px;
          transition: transform 0.5s ease;
          position: relative;
          z-index: 1;
        }
        .pc3-card:hover .pc3-img-wrap img {
          transform: scale(1.07);
        }

        /* Dark overlay on hover */
        .pc3-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(27,67,50,0.6) 0%, transparent 55%);
          opacity: 0;
          transition: opacity 0.35s ease;
          border-radius: var(--ri);
          pointer-events: none;
          z-index: 2;
        }
        .pc3-card:hover .pc3-img-wrap::after { opacity: 1; }

        /* Add to cart button — slides up */
        .pc3-cart-btn {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: var(--green);
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
        .pc3-cart-btn:hover {
          background: var(--green);
          color: #fff;
        }
        .pc3-card:hover .pc3-cart-btn {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Badges */
        .pc3-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 9px;
          border-radius: 20px;
          letter-spacing: 0.5px;
          z-index: 3;
          text-transform: uppercase;
        }
        .pc3-badge-discount { background: var(--brown); color: #fff; }
        .pc3-badge-bestseller {
          background: linear-gradient(135deg, var(--green), #40916c);
          color: #fff;
        }

        /* Wishlist */
        .pc3-wishlist-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9) !important;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.2s !important;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          backdrop-filter: blur(4px);
        }
        .pc3-wishlist-btn:hover { transform: scale(1.15); background: #fff !important; }
        .pc3-wishlist-btn:focus, .pc3-wishlist-btn:active {
          background: rgba(255,255,255,0.9) !important;
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
        }

        /* Divider */
        .pc3-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(107,68,35,0.1), transparent);
          margin: 8px 12px 0;
        }

        /* Body */
        .pc3-body { padding: 10px 12px 14px; }

        .pc3-category {
          font-size: 10px;
          font-weight: 600;
          color: var(--brown);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          opacity: 0.7;
          margin-bottom: 3px;
        }

        .pc3-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--green);
          line-height: 1.4;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: 0.2px;
          transition: color 0.2s;
        }
        .pc3-card:hover .pc3-name { color: var(--green-dark); }

        /* Price */
        .pc3-price-row {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .pc3-price {
          font-size: 16px;
          font-weight: 800;
          color: var(--green);
          letter-spacing: -0.3px;
        }
        .pc3-original {
          font-size: 12px;
          color: var(--muted);
          text-decoration: line-through;
          font-weight: 400;
        }
        .pc3-savings {
          font-size: 10px;
          font-weight: 700;
          color: var(--green);
          background: var(--green-soft);
          padding: 2px 7px;
          border-radius: 20px;
          margin-left: auto;
        }

        /* Qty tags */
        .pc3-qty-row { display: flex; flex-wrap: wrap; gap: 4px; }
        .pc3-qty-tag {
          font-size: 10px;
          font-weight: 600;
          background: var(--brown-soft);
          color: var(--brown);
          padding: 2px 8px;
          border-radius: 20px;
          letter-spacing: 0.2px;
          transition: background 0.2s, color 0.2s;
        }
        .pc3-qty-tag:hover { background: var(--green-soft); color: var(--green); }
      `}</style>

      <div className="pc3">
        <Card className="pc3-card group">
          <Link to={linkTo} className="block">

            {/* Image */}
            <div className="pc3-img-wrap">
              <img src={src} alt={name} loading="lazy" />

              {isBestSeller && !discountPercentage && (
                <div className="pc3-badge pc3-badge-bestseller">Best Seller</div>
              )}
              {!!discountPercentage && discountPercentage > 0 && (
                <div className="pc3-badge pc3-badge-discount">{discountPercentage}% OFF</div>
              )}

              <button
                onClick={handleWishlistClick}
                className="pc3-wishlist-btn"
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={15}
                  fill={inWishlist ? '#e63946' : 'none'}
                  color={inWishlist ? '#e63946' : '#6b4423'}
                  strokeWidth={2.2}
                />
              </button>

              <button className="pc3-cart-btn" onClick={handleAdd}>
                <ShoppingCart size={13} />
                Add to Cart
              </button>
            </div>

            <div className="pc3-divider" />

            {/* Body */}
            <div className="pc3-body">
              <div className="pc3-category">{category}</div>
              <h3 className="pc3-name">{name}</h3>

              <div className="pc3-price-row">
                <span className="pc3-price">₹{price.toLocaleString('en-IN')}</span>
                {originalPrice && originalPrice > price && (
                  <span className="pc3-original">₹{originalPrice.toLocaleString('en-IN')}</span>
                )}
                {!!discountPercentage && discountPercentage > 0 && (
                  <span className="pc3-savings">Save {discountPercentage}%</span>
                )}
              </div>

              {quantityOptions && quantityOptions.length > 0 && (
                <div className="pc3-qty-row">
                  {quantityOptions.slice(0, 3).map((opt) => (
                    <span key={opt.id} className="pc3-qty-tag">{opt.displayLabel}</span>
                  ))}
                  {quantityOptions.length > 3 && (
                    <span className="pc3-qty-tag">+{quantityOptions.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          </Link>
        </Card>
      </div>
    </>
  );
};