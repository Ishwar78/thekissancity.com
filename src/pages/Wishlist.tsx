import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
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
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const resolveImage = (src?: string) => {
  const s = String(src || '');
  if (!s) return '/placeholder.svg';
  if (s.startsWith('http')) return s;
  const isLocalBase = (() => { try { return API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1'); } catch { return false; } })();
  const isHttpsPage = (() => { try { return location.protocol === 'https:'; } catch { return false; } })();
  if (s.startsWith('/uploads') || s.startsWith('uploads')) {
    return s.startsWith('/') ? s : `/uploads/${s}`;
  }
  return s;
};

const Wishlist = () => {
  const [wishlistProducts, setWishlistProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { wishlistIds, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  // Add a refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (wishlistIds.size === 0) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }
    fetchWishlistProducts();
  }, [user, refreshTrigger]); // Add refreshTrigger dependency

  // Also update when wishlistIds change (when items are added/removed)
  useEffect(() => {
    console.log('Wishlist IDs changed:', Array.from(wishlistIds));
    if (wishlistIds.size === 0) {
      setWishlistProducts([]);
      setLoading(false);
      return;
    }
    fetchWishlistProducts();
  }, [wishlistIds.size]); // React to changes in wishlist size

  // Auto-refresh when window gets focus (user switches back to wishlist tab/window)
  useEffect(() => {
    const handleFocus = () => {
      if (wishlistIds.size > 0) {
        refreshWishlistProducts();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [wishlistIds.size]);

  // Also add a periodic refresh every 30 seconds as a fallback
  useEffect(() => {
    const interval = setInterval(() => {
      if (wishlistIds.size > 0 && !document.hidden) {
        refreshWishlistProducts();
      }
    }, 30000); // 30 seconds

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

      // Fetch each wishlist product by ID so we get all of them (no pagination/sort issues)
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
    // Immediately update the UI by removing from local state
    setWishlistProducts(prev => prev.filter(product => {
      const id = String(product._id || product.id || '');
      return id !== productId;
    }));
    
    // Then remove from wishlist (this will update the backend and wishlistIds)
    await removeFromWishlist(productId);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-40 pb-12 md:pt-44 lg:pt-48 flex-grow">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-2 sm:mb-4">
            My <span className="text-primary">Wishlist</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Your saved items</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm">Loading wishlist...</div>
        ) : wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">Your wishlist is empty</p>
            <Button onClick={() => navigate('/shop')} className="text-xs sm:text-sm">Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {wishlistProducts.map((product) => {
              const id = String(product._id || product.id || '');
              const slug = product.slug || '';
              const title = product.title || product.name || '';
              const rawImg = product.image_url || (Array.isArray(product.images) ? product.images[0] : '') || '/placeholder.svg';
              const img = resolveImage(rawImg);
              const productLink = slug ? `/products/${slug}` : `/product/${id}`;

              return (
                <Card
                  key={id}
                  className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300"
                >
                  <Link to={productLink}>
                    <div className="aspect-square overflow-hidden bg-secondary relative">
                      <img
                        src={img}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(id); }}
                        className="absolute top-3 right-3 p-2 bg-background/80 hover:bg-background rounded-full transition-all duration-200"
                      >
                        <Heart
                          className="h-4 w-4 sm:h-5 sm:w-5"
                          fill="#000000"
                          color="#000000"
                        />
                      </button>
                    </div>
                  </Link>
                  <div className="p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {product.category || 'Uncategorized'}
                    </p>
                    <Link to={productLink}>
                      <h3 className="font-semibold text-xs sm:text-base mb-2 group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
                    </Link>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm sm:text-lg font-bold">
                        ₹{Number(product.price || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist;
