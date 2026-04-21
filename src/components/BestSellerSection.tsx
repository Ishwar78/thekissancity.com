import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

interface Product {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  price: number;
  originalPrice?: number;
  discount?: {
    type: 'percentage';
    value: number;
  };
  images?: string[];
  image_url?: string;
  slug?: string;
  category?: string;
  description?: string;
  highlights?: string[];
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

const BestSellerCard = ({ product, index }: { product: Product; index: number }) => {
  const { user } = useAuth();
  const { addToCart } = (() => {
    try { return useCart(); }
    catch { return { addToCart: () => {} } as any; }
  })();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const id = product._id || product.id || '';
  const title = product.title || product.name || 'Product';
  const image = product.images?.[0] || product.image_url || '/placeholder.svg';
  const slug = product.slug || id;
  const linkTo = `/products/${slug}`;

  const rawPrice = (() => {
    if (product.quantityOptions && product.quantityOptions.length > 0) {
      const active = product.quantityOptions.filter(o => o.isActive && o.stock > 0 && o.price > 0);
      const pool = active.length > 0 ? active : product.quantityOptions.filter(o => o.price > 0);
      if (pool.length > 0) return Math.min(...pool.map(o => o.price));
    }
    return product.price || 0;
  })();

  const discountPercentage = product.discount?.value || 0;
  const discountType = product.discount?.type || 'flat';

  const displayPrice = (() => {
    if (discountPercentage > 0) {
      if (discountType === 'percentage') {
        return Math.round(rawPrice * (1 - discountPercentage / 100));
      } else {
        // flat discount
        return Math.max(0, rawPrice - discountPercentage);
      }
    }
    return rawPrice;
  })();

  const originalPriceToShow = discountPercentage > 0 ? rawPrice : (product.originalPrice && product.originalPrice > displayPrice ? product.originalPrice : undefined);

  const bullets = product.highlights?.slice(0, 3) || [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { id, title, price: displayPrice, image };
    if (!user) {
      try { localStorage.setItem('kissancity_add_intent', JSON.stringify({ item, qty: 1 })); } catch {}
      navigate('/auth');
      return;
    }
    addToCart(item, 1);
    toast.success('Added to cart!');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    toggleWishlist(id);
  };

  return (
    <Link to={linkTo} className="block group">
      <div
        className="relative flex flex-row overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-lg w-full"
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 12px rgba(107,68,35,0.10)',
          border: '1px solid #f0e8dc',
        }}
      >
        {/* BEST SELLER Ribbon */}
      
          <div
            className="absolute -top-3 right-0 z-10 pr-3 pl-5 py-1"
            style={{
              background: 'linear-gradient(135deg, #b8832a, #e8b84b)',
              clipPath: 'polygon(10% 0%, 100% 0%, 100% 100%, 10% 100%, 0% 50%)',
            }}
          >
            <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white">
              ★ BEST SELLER
            </span>
          </div>
      

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div
            className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: '#6b4423', color: '#ffffff' }}
          >
            {discountPercentage}% OFF
          </div>
        )}

        {/* Image — left, responsive width */}
        <div
          className="shrink-0 overflow-hidden"
          style={{
            width: 'clamp(110px, 35%, 160px)',
            minWidth: 'clamp(110px, 35%, 160px)',
            aspectRatio: '3/4',
            background: 'linear-gradient(135deg, #f7f0e6 0%, #ede0cc 100%)',
            borderRadius: '16px 0 0 16px',
          }}
        >
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ display: 'block' }}
            loading="lazy"
          />
        </div>

        {/* Content — right */}
        <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0 overflow-hidden">

          {/* Title + Wishlist */}
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <h3
              className="font-bold leading-snug line-clamp-2 flex-1 min-w-0"
              style={{
                color: '#2d5a1b',
                fontFamily: "'Georgia', serif",
                fontSize: 'clamp(0.78rem, 2.5vw, 0.92rem)',
              }}
            >
              {title}
            </h3>
            <button
              onClick={handleWishlist}
              className="shrink-0 mt-0.5 p-1 rounded-full transition-all hover:scale-110"
              style={{ background: 'transparent' }}
              aria-label="Wishlist"
            >
              <Heart
                className="h-4 w-4 transition-all"
                fill={isInWishlist(id) ? '#6b4423' : 'none'}
                color="#6b4423"
                strokeWidth={2}
              />
            </button>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2">
            <span
              className="font-black"
              style={{
                color: '#2d5a1b',
                fontFamily: "'Georgia', serif",
                fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
              }}
            >
              {displayPrice > 0 ? `₹${displayPrice.toLocaleString('en-IN')}` : '—'}
            </span>
            {originalPriceToShow && originalPriceToShow > displayPrice && (
              <span
                className="text-xs line-through"
                style={{ color: '#b0957a' }}
              >
                ₹{originalPriceToShow.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="mb-2 h-px" style={{ backgroundColor: '#ede8e0' }} />

          {/* Bullets or category */}
          <div className="flex-1 mb-2 overflow-hidden">
            {bullets.length > 0 ? (
              <ul className="space-y-0.5">
                {bullets.slice(0, 2).map((b, i) => (
                  <li key={i} className="flex items-start gap-1" style={{ color: '#7a5c3a' }}>
                    <span className="font-bold shrink-0" style={{ color: '#c8973a', fontSize: '0.75rem' }}>·</span>
                    <span
                      className="leading-relaxed line-clamp-1"
                      style={{ fontSize: 'clamp(0.65rem, 2vw, 0.75rem)' }}
                    >
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                className="leading-relaxed line-clamp-2"
                style={{ color: '#7a5c3a', fontSize: 'clamp(0.65rem, 2vw, 0.75rem)' }}
              >
                {product.category ? `Premium ${product.category}` : 'Pure & Natural · Farm Fresh'}
              </p>
            )}
          </div>

          {/* Quantity pills */}
          {product.quantityOptions && product.quantityOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.quantityOptions.slice(0, 3).map((opt) => (
                <span
                  key={opt.id}
                  className="font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: '#f0e8d8',
                    color: '#6b4423',
                    fontSize: 'clamp(0.6rem, 1.8vw, 0.625rem)',
                  }}
                >
                  {opt.displayLabel || `${opt.quantity}${opt.unit}`}
                </span>
              ))}
            </div>
          )}

          {/* Add to Cart */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              className="w-full py-2 px-3 rounded-xl font-bold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #2d5a1b, #3a7522)',
                color: '#fff',
                fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)',
                boxShadow: '0 2px 8px rgba(45,90,27,0.25)',
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export { BestSellerCard };

export default function BestSellerSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api('/api/products?isBestSeller=true&limit=8&active=true');
        if (!res.ok) throw new Error(res.json?.message || 'Failed to fetch best sellers');
        setProducts(res.json.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: '#F5F5E8' }}>
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" style={{ color: '#6b4423' }} />
        </div>
      </section>
    );
  }

  if (error || !products.length) return null;

  return (
    <section className="py-10 sm:py-14" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="container mx-auto px-3 sm:px-4 max-w-5xl">

        {/* Section Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-7 sm:mb-10">
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to right, transparent, #c8973a)' }}
          />
          <h2
            className="font-bold whitespace-nowrap px-2"
            style={{
              color: '#6b4423',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 'clamp(1.2rem, 5vw, 2.25rem)',
            }}
          >
            · Our Bestsellers ·
          </h2>
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to left, transparent, #c8973a)' }}
          />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
          {products.slice(0, 4).map((product, index) => (
            <BestSellerCard
              key={String(product._id || product.id)}
              product={product}
              index={index}
            />
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-7 sm:mt-10">
          <Link
            to="/best-sellers"
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors group"
            style={{ color: '#6b4423' }}
          >
            View All Best Sellers
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}