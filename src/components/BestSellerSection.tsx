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
  }; // Update discount field to be an object
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

  const displayPrice = (() => {
    if (product.quantityOptions && product.quantityOptions.length > 0) {
      const active = product.quantityOptions.filter(o => o.isActive && o.stock > 0 && o.price > 0);
      const pool = active.length > 0 ? active : product.quantityOptions.filter(o => o.price > 0);
      if (pool.length > 0) return Math.min(...pool.map(o => o.price));
    }
    return product.price || 0;
  })();

  const discountPercentage = product.discount?.value || 0; // Handle discount object with value field

  // Debug: Check if we have discount data
  console.log(`BestSeller "${product.title}":`, {
    discount: product.discount,
    discountPercentage: discountPercentage,
    hasDiscount: discountPercentage > 0
  });

  const bullets = product.highlights?.slice(0, 3) || [];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { id, title, price: displayPrice, image };
    if (!user) {
      try { localStorage.setItem('uni_add_intent', JSON.stringify({ item, qty: 1 })); } catch {}
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
        className="relative flex flex-row overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-lg max-w-md"
        style={{
          backgroundColor: '#fff',
          boxShadow: '0 2px 12px rgba(107,68,35,0.10)',
          minHeight: '220px',
          border: '1px solid #f0e8dc',
        }}
      >
        {/* BEST SELLER Ribbon */}
        {index % 2 === 1 && (
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
        )}

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: '#6b4423', color: '#ffffff' }}
          >
            {discountPercentage}% OFF
          </div>
        )} 

        {/* Image — left */}
       {/* Image — left, full cover */}
      <div
        className="shrink-0 overflow-hidden"
        style={{
          width: '160px',
          minWidth: '160px',
          height: '220px', // Fixed height for consistency
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
        <div className="flex flex-col flex-1 p-4 min-w-0">

          {/* Title + Wishlist */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className="font-bold leading-snug line-clamp-1 flex-1"
              style={{
                color: '#2d5a1b',
                fontFamily: "'Georgia', serif",
                fontSize: '0.92rem',
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
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className="text-2xl font-black"
              style={{ color: '#2d5a1b', fontFamily: "'Georgia', serif" }}
            >
              {displayPrice > 0 ? `₹${displayPrice.toLocaleString('en-IN')}` : '—'}
            </span>
            {product.originalPrice && product.originalPrice > displayPrice && (
              <span className="text-sm line-through" style={{ color: '#b0957a' }}>
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="mb-3 h-px" style={{ backgroundColor: '#ede8e0' }} />

          {/* Bullets or category */}
          <div className="flex-1 mb-4 overflow-hidden">
            {bullets.length > 0 ? (
              <ul className="space-y-1 max-h-16 overflow-hidden">
                {bullets.slice(0, 2).map((b, i) => (
                  <li key={i} className="text-xs flex items-start gap-1.5" style={{ color: '#7a5c3a' }}>
                    <span className="font-bold mt-px" style={{ color: '#c8973a' }}>·</span>
                    <span className="leading-relaxed line-clamp-1">{b}</span>
                  </li>
                ))}
                {/* {bullets.length > 2 && (
                  <li className="text-xs font-medium" style={{ color: '#c8973a' }}>
                    +{bullets.length - 2} more...
                  </li>
                )} */}
              </ul>
            ) : (
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#7a5c3a' }}>
                {product.category ? `Premium ${product.category}` : 'Pure & Natural · Farm Fresh'}
              </p>
            )}
          </div>

          {/* Quantity pills */}
          {product.quantityOptions && product.quantityOptions.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.quantityOptions.slice(0, 3).map((opt) => (
                <span
                  key={opt.id}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#f0e8d8', color: '#6b4423' }}
                >
                  {opt.displayLabel || `${opt.quantity}${opt.unit}`}
                </span>
              ))}
            </div>
          )}

          {/* Add to Cart — reduced width, left aligned */}
          <div className="mt-auto">
            <button
              onClick={handleAddToCart}
              className="py-2.5 px-6 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #2d5a1b, #3a7522)',
                color: '#fff',
                minWidth: '165px',
                boxShadow: '0 2px 8px rgba(45,90,27,0.25)',
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
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
        const res = await api('/api/products?isBestSeller=true&limit=12&active=true');
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
    <section className="py-14" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Section Header */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to right, transparent, #c8973a)' }}
          />
          <h2
            className="text-2xl md:text-4xl font-bold whitespace-nowrap px-2"
            style={{
              color: '#6b4423',
              fontFamily: "'Georgia', 'Times New Roman', serif",
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {products.slice(0, 4).map((product, index) => (
            <BestSellerCard
              key={String(product._id || product.id)}
              product={product}
              index={index}
            />
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
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
};