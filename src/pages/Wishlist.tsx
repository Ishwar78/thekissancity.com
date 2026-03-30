import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Trash2, ShoppingBag, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { api } from '@/lib/api';

type ProductRow = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  category?: string;
  stock?: number;
  image_url?: string;
  images?: string[];
  slug?: string;
  discount?: {
    type: 'flat' | 'percentage';
    value: number;
  };
  isBestSeller?: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const resolveImage = (src?: string) => {
  const s = String(src || '');
  if (!s) return '/placeholder.svg';
  if (s.startsWith('http')) return s;
  
  // Handle Cloudinary images
  if (s.includes('cloudinary')) {
    if (s.includes('/w_') || s.includes('/h_') || s.includes('/c_')) return s;
    return s.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
  }
  
  const isLocalBase = (() => { 
    try { return API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1'); } 
    catch { return false; } 
  })();
  
  const isHttpsPage = (() => { 
    try { return location.protocol === 'https:'; } 
    catch { return false; } 
  })();
  
  if (s.startsWith('/uploads') || s.startsWith('uploads')) {
    return s.startsWith('/') ? s : `/uploads/${s}`;
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

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (wishlistIds.size === 0) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }
    fetchWishlistProducts();
  }, [user, refreshTrigger]);

  useEffect(() => {
    console.log('Wishlist IDs changed:', Array.from(wishlistIds));
    if (wishlistIds.size === 0) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }
    fetchWishlistProducts();
  }, [wishlistIds.size]);

  useEffect(() => {
    const handleFocus = () => {
      if (wishlistIds.size > 0) {
        refreshWishlistProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [wishlistIds.size]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (wishlistIds.size > 0 && !document.hidden) {
        refreshWishlistProducts();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [wishlistIds.size]);

  const refreshWishlistProducts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const fetchWishlistProducts = async () => {
    try {
      setLoading(true);

      if (wishlistIds.size === 0) {
        setWishlistProducts([]);
        return;
      }

      const ids = Array.from(wishlistIds);
      const results = await Promise.allSettled(
        ids.map((id) => api(`/api/products/${id}?_t=${Date.now()}`))
      );
      const products: ProductRow[] = [];
      console.log('Fetching products for IDs:', ids);
      
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'fulfilled') {
          const { ok, json } = result.value;
          if (ok && json?.data) {
            products.push(json.data as ProductRow);
            console.log(`Successfully fetched product ${ids[i]}`);
          } else {
            console.warn(`Failed to fetch product ${ids[i]}:`, json);
          }
        } else {
          console.warn(`Error fetching product ${ids[i]}:`, result.reason);
        }
      }
      console.log('Final products array:', products);

      setWishlistProducts(products);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load wishlist');
      setWishlistProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: string) => {
    setWishlistProducts(prev => prev.filter(product => {
      const id = String(product._id || product.id || '');
      return id !== productId;
    }));
    
    await removeFromWishlist(productId);
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (e: React.MouseEvent, product: ProductRow) => {
    e.preventDefault();
    e.stopPropagation();
    
    const id = String(product._id || product.id || '');
    const title = product.title || product.name || "Product";
    const price = Number(product.price || 0);
    const discount = product.discount;
    const finalPrice = calculateDiscountedPrice(price, discount);
    const rawImg = product.image_url || (Array.isArray(product.images) ? product.images[0] : '') || '/placeholder.svg';
    const image = resolveImage(rawImg);
    
    const cartItem = {
      id: id,
      title: title,
      price: finalPrice,
      originalPrice: price,
      image: image,
    };
    
    if (!user) {
      try { 
        localStorage.setItem('kissancity_add_intent', JSON.stringify({ item: cartItem, qty: 1 })); 
      } catch {}
      navigate('/auth');
      return;
    }
    
    addToCart(cartItem, 1);
    toast.success('Added to cart');
  };

  return (
    <>
      <style>{`
        /* Wishlist Page CSS - matching product card aesthetic */
        .wishlist-page {
          --green: #2d6a4f;
          --green-dark: #1b4332;
          --green-soft: #d8f3dc;
          --brown: #6b4423;
          --brown-soft: #f0e5d0;
          --cream: #faf3eb;
          --muted: #a0a0a0;
          --r: 20px;
          --ri: 16px;
        }

        /* Hero section */
        .wishlist-hero {
          background: linear-gradient(135deg, var(--cream) 0%, #fff 100%);
          padding: 2rem 0 1rem;
          border-bottom: 1px solid rgba(107, 68, 35, 0.1);
        }

        .wishlist-title {
          font-size: 2.5rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--brown);
          margin-bottom: 0.5rem;
        }

        .wishlist-title span {
          color: var(--green);
          position: relative;
          display: inline-block;
        }

        .wishlist-title span::after {
          content: '';
          position: absolute;
          bottom: 8px;
          left: 0;
          width: 100%;
          height: 8px;
          background: rgba(45, 106, 79, 0.15);
          border-radius: 4px;
          z-index: -1;
        }

        .wishlist-subtitle {
          font-size: 0.9rem;
          color: var(--muted);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .wishlist-subtitle .count {
          background: var(--green-soft);
          color: var(--green);
          padding: 0.2rem 0.8rem;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.8rem;
        }

        @media (min-width: 640px) {
          .wishlist-title {
            font-size: 3.5rem;
          }
          .wishlist-subtitle {
            font-size: 1rem;
          }
        }

        @media (min-width: 768px) {
          .wishlist-title {
            font-size: 4.5rem;
          }
        }

        /* Empty state */
        .wishlist-empty {
          text-align: center;
          padding: 3rem 1rem;
          background: white;
          border-radius: var(--r);
          border: 1.5px dashed rgba(107, 68, 35, 0.15);
          max-width: 400px;
          margin: 2rem auto;
        }

        .wishlist-empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: var(--green-soft);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--green);
        }

        .wishlist-empty h3 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--brown);
          margin-bottom: 0.5rem;
        }

        .wishlist-empty p {
          color: var(--muted);
          margin-bottom: 2rem;
          font-size: 0.95rem;
        }

        .wishlist-empty-btn {
          background: var(--green) !important;
          color: white !important;
          padding: 0.75rem 2rem !important;
          border-radius: 30px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
          border: none !important;
        }

        .wishlist-empty-btn:hover {
          background: var(--green-dark) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(45, 106, 79, 0.3);
        }

        /* Grid */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .wishlist-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.25rem;
          }
        }

        @media (min-width: 768px) {
          .wishlist-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
        }

        @media (min-width: 1024px) {
          .wishlist-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 1.75rem;
          }
        }

        /* Card */
        .wishlist-card {
          border: 1.5px solid rgba(107, 68, 35, 0.08) !important;
          border-radius: var(--r) !important;
          box-shadow: 0 4px 12px rgba(45, 106, 79, 0.06) !important;
          background: #ffffff !important;
          overflow: hidden;
          transition: all 0.3s ease !important;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .wishlist-card:hover {
          box-shadow: 0 12px 28px rgba(45, 106, 79, 0.15) !important;
          border-color: rgba(45, 106, 79, 0.22) !important;
          transform: translateY(-4px);
        }

        /* Image wrapper */
        .wishlist-img-wrap {
          position: relative;
          aspect-ratio: 1;
          background: var(--cream);
          margin: 0.75rem 0.75rem 0;
          border-radius: var(--ri);
          overflow: hidden;
        }

        .wishlist-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 1rem;
          transition: transform 0.5s ease;
        }

        .wishlist-card:hover .wishlist-img-wrap img {
          transform: scale(1.08);
        }

        /* Dark overlay on hover */
        .wishlist-img-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(27, 67, 50, 0.5) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.35s ease;
          border-radius: var(--ri);
          pointer-events: none;
        }

        .wishlist-card:hover .wishlist-img-wrap::after {
          opacity: 1;
        }

        /* Badge */
        .wishlist-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          letter-spacing: 0.3px;
          z-index: 3;
          text-transform: uppercase;
        }

        .wishlist-badge-bestseller {
          background: linear-gradient(135deg, var(--green), #40916c);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .wishlist-badge-discount {
          background: var(--brown);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        /* Remove button */
        .wishlist-remove-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95) !important;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease !important;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(4px);
          color: #e63946;
        }

        .wishlist-remove-btn:hover {
          transform: scale(1.15);
          background: #ffffff !important;
          box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3) !important;
        }

        .wishlist-remove-btn svg {
          transition: all 0.2s ease;
        }

        .wishlist-remove-btn:hover svg {
          fill: #e63946;
        }

        /* Quick add button (appears on hover) */
        .wishlist-quick-add {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          opacity: 0;
          background: #ffffff;
          color: var(--green);
          border: 1px solid rgba(45, 106, 79, 0.2);
          border-radius: 30px;
          padding: 0.5rem 1.25rem;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          cursor: pointer;
          white-space: nowrap;
          z-index: 5;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }

        .wishlist-quick-add:hover {
          background: var(--green);
          color: white;
          border-color: var(--green);
        }

        .wishlist-card:hover .wishlist-quick-add {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }

        /* Divider */
        .wishlist-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(107, 68, 35, 0.1), transparent);
          margin: 0.5rem 1rem 0;
        }

        /* Card body */
        .wishlist-body {
          padding: 0.75rem 1rem 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .wishlist-category {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--brown);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          opacity: 0.7;
          margin-bottom: 0.25rem;
        }

        .wishlist-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--green);
          line-height: 1.4;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
          min-height: 2.5rem;
        }

        .wishlist-card:hover .wishlist-name {
          color: var(--green-dark);
        }

        /* Price row */
        .wishlist-price-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: auto;
        }

        .wishlist-price {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--green);
          letter-spacing: -0.3px;
        }

        .wishlist-original {
          font-size: 0.8rem;
          color: var(--muted);
          text-decoration: line-through;
          font-weight: 400;
        }

        .wishlist-savings {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--green);
          background: var(--green-soft);
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
          margin-left: auto;
        }

        /* Stock indicator */
        .wishlist-stock {
          font-size: 0.7rem;
          color: var(--green);
          margin-top: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .wishlist-stock::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          display: inline-block;
        }

        .wishlist-stock.low-stock::before {
          background: #f59e0b;
        }

        .wishlist-stock.low-stock {
          color: #f59e0b;
        }

        .wishlist-stock.out-of-stock::before {
          background: #ef4444;
        }

        .wishlist-stock.out-of-stock {
          color: #ef4444;
        }

        /* Loading skeleton */
        .wishlist-skeleton-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        @media (min-width: 768px) {
          .wishlist-skeleton-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        .wishlist-skeleton-card {
          background: white;
          border-radius: var(--r);
          padding: 0.75rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(107, 68, 35, 0.05);
        }

        .wishlist-skeleton-img {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(90deg, #f0e5d0 25%, #faf3eb 50%, #f0e5d0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: var(--ri);
          margin-bottom: 1rem;
        }

        .wishlist-skeleton-line {
          height: 1rem;
          width: 100%;
          background: linear-gradient(90deg, #f0e5d0 25%, #faf3eb 50%, #f0e5d0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 20px;
          margin-bottom: 0.75rem;
        }

        .wishlist-skeleton-line-sm {
          width: 60%;
          margin-bottom: 0;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Responsive adjustments */
        @media (max-width: 480px) {
          .wishlist-name {
            font-size: 0.8rem;
            min-height: 2.2rem;
          }
          
          .wishlist-price {
            font-size: 1rem;
          }
          
          .wishlist-remove-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>

      <div className="wishlist-page min-h-screen bg-[#faf9f7] flex flex-col">
        <Navbar />
        
        {/* Hero Section */}
        <div className="wishlist-hero">
          <main className="container mx-auto px-3 sm:px-4 pt-32 pb-8 md:pt-36 lg:pt-40">
            <div className="text-center">
              <h1 className="wishlist-title">
                My <span>Wishlist</span>
              </h1>
              <p className="wishlist-subtitle">
                <ShoppingBag size={16} className="text-green-600" />
                Your saved items
                {!loading && wishlistProducts.length > 0 && (
                  <span className="count">{wishlistProducts.length} items</span>
                )}
              </p>
            </div>
          </main>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-3 sm:px-4 py-8 flex-grow">
          {loading ? (
            <div className="wishlist-skeleton-grid">
              {Array(8).fill(null).map((_, i) => (
                <div key={i} className="wishlist-skeleton-card">
                  <div className="wishlist-skeleton-img" />
                  <div className="wishlist-skeleton-line" />
                  <div className="wishlist-skeleton-line wishlist-skeleton-line-sm" />
                </div>
              ))}
            </div>
          ) : wishlistProducts.length === 0 ? (
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">
                <Heart size={40} strokeWidth={1.5} />
              </div>
              <h3>Your wishlist is empty</h3>
              <p>Save your favorite items and they'll appear here</p>
              <Button 
                onClick={() => navigate('/shop')} 
                className="wishlist-empty-btn"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlistProducts.map((product) => {
                const id = String(product._id || product.id || '');
                const slug = product.slug || '';
                const title = product.title || product.name || '';
                const rawImg = product.image_url || (Array.isArray(product.images) ? product.images[0] : '') || '/placeholder.svg';
                const img = resolveImage(rawImg);
                const productLink = slug ? `/products/${slug}` : `/product/${id}`;
                const price = Number(product.price || 0);
                const discount = product.discount;
                const finalPrice = calculateDiscountedPrice(price, discount);
                const discountPercentage = discount?.type === 'percentage' ? discount.value : 
                  (discount?.value ? Math.round((discount.value / price) * 100) : 0);
                const stock = Number(product.stock || 0);

                return (
                  <Card key={id} className="wishlist-card group">
                    <Link to={productLink} className="block h-full">
                      {/* Image section */}
                      <div className="wishlist-img-wrap">
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />

                        {/* Badges */}
                        {product.isBestSeller && !discountPercentage && (
                          <div className="wishlist-badge wishlist-badge-bestseller">
                            Best Seller
                          </div>
                        )}
                        {discountPercentage > 0 && (
                          <div className="wishlist-badge wishlist-badge-discount">
                            {discountPercentage}% OFF
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={(e) => { 
                            e.preventDefault(); 
                            e.stopPropagation(); 
                            handleRemove(id); 
                          }}
                          className="wishlist-remove-btn"
                          aria-label="Remove from wishlist"
                        >
                          <Heart
                            size={16}
                            fill="#e63946"
                            color="#e63946"
                          />
                        </button>

                        {/* Quick add button */}
                        <button 
                          className="wishlist-quick-add"
                          onClick={(e) => {
                            handleAddToCart(e, product);
                          }}
                        >
                          Add to Cart
                        </button>
                      </div>

                      <div className="wishlist-divider" />

                      {/* Content section */}
                      <div className="wishlist-body">
                        <div className="wishlist-category">
                          {product.category || 'Collection'}
                        </div>
                        
                        <h3 className="wishlist-name">{title}</h3>

                        <div className="wishlist-price-row">
                          <span className="wishlist-price">
                            ₹{finalPrice.toLocaleString('en-IN')}
                          </span>
                          
                          {discount && discount.value > 0 && (
                            <>
                              <span className="wishlist-original">
                                ₹{price.toLocaleString('en-IN')}
                              </span>
                              {discountPercentage > 0 && (
                                <span className="wishlist-savings">
                                  Save {discountPercentage}%
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        {/* Stock indicator */}
                        {stock > 0 ? (
                          <div className={`wishlist-stock ${stock < 5 ? 'low-stock' : ''}`}>
                            {stock < 5 ? `Only ${stock} left` : 'In Stock'}
                          </div>
                        ) : (
                          <div className="wishlist-stock out-of-stock">Out of Stock</div>
                        )}
                      </div>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Wishlist;