import { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

type ProductRow = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
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
  updatedAt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const resolveImage = (src?: string) => {
  const s = String(src || '');
  if (!s) return '/placeholder.svg';
  if (s.startsWith('http')) {
    // Add cache-busting timestamp to force fresh image loading
    const separator = s.includes('?') ? '&' : '?';
    return `${s}${separator}_t=${Date.now()}`;
  }
  return s.startsWith('/') ? s : `/uploads/${s}`;
};

const Products = () => {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [productUpdateKey, setProductUpdateKey] = useState(0);

  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    products.forEach((p) => { if (p.category) cats.add(String(p.category)); });
    apiCategories.forEach((n) => { if (n) cats.add(String(n)); });
    return Array.from(cats);
  }, [products, apiCategories]);

  useEffect(() => {
    fetchProducts();
  }, [productUpdateKey]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { ok, json } = await api('/api/categories');
        const list = ok && Array.isArray(json?.data) ? (json.data as Array<{ name?: string; slug?: string }>) : [];
        const names = list.map((c) => String(c.name || c.slug || '').trim()).filter(Boolean);
        if (!ignore) setApiCategories(names);
      } catch {
        if (!ignore) setApiCategories([]);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Add this new useEffect for custom event
  useEffect(() => {
    const handleProductCreated = () => {
      console.log('productCreated event received in Products.tsx - refreshing products');
      setProductUpdateKey(prev => prev + 1);
    };

    window.addEventListener("productCreated", handleProductCreated);

    return () => {
      window.removeEventListener("productCreated", handleProductCreated);
    };
  }, []);

  const fetchProducts = async () => {
    console.log('fetchProducts called in Products.tsx with productUpdateKey:', productUpdateKey);
    try {
      // Add more aggressive cache-busting
      const cacheBuster = Date.now() + Math.random();
      const { ok, json } = await api(`/api/products?_t=${cacheBuster}&_r=${Math.random()}`);
      if (!ok) throw new Error(json?.message || json?.error || 'Failed to load');
      const list = Array.isArray(json?.data) ? (json.data as ProductRow[]) : [];
      
      // Find the specific product you updated
      const updatedProduct = list.find(p => p._id === '6981977ec651401afa9a1c10'); // Men Shorts product ID
      if (updatedProduct) {
        console.log('Updated product data in Products.tsx:', {
          id: updatedProduct._id,
          title: updatedProduct.title,
          image_url: updatedProduct.image_url,
          images: updatedProduct.images?.slice(0, 2), // Show first 2 images
          updatedAt: updatedProduct.updatedAt
        });
      }
      
      setProducts(list);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error('Please sign in to add to wishlist');
      return;
    }
    try {
      const userId = String((user as any).id || (user as any)._id || '');
      const { ok, json } = await api('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ userId, productId }),
      });
      if (!ok) throw new Error(json?.message || json?.error || 'Failed to add');
      toast.success('Added to wishlist');
    } catch (e: any) {
      const msg = (e?.message || '').toLowerCase();
      if (msg.includes('already') || msg.includes('duplicate') || msg.includes('exists')) {
        toast.error('Already in wishlist');
      } else {
        toast.error(e?.message || 'Failed to add to wishlist');
      }
    }
  };

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-3 sm:px-4 pt-24 pb-12">
        <div className="text-center mb-8 sm:mb-12 mt-8">
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-2 sm:mb-4">
            All <span className="text-primary">Products</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8 sm:mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-sm sm:text-base">Loading products...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const id = String(product._id || product.id || '');
              const title = product.title || product.name || '';
              const slug = product.slug || '';
              const rawImg = product.image_url || (Array.isArray(product.images) ? product.images[0] : '') || '/placeholder.svg';
              const img = resolveImage(rawImg);
              const productLink = slug ? `/products/${slug}` : `/product/${id}`;
              return (
                <Link key={id} to={productLink}>
                  <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300">
                  <div className="aspect-square overflow-hidden bg-secondary relative">
                    <img
                      src={img}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        console.error('Image failed to load:', img);
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', img);
                      }}
                    />
                    <button
                      onClick={() => addToWishlist(id)}
                      className="absolute top-2 right-2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                    >
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 line-clamp-2">{title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">
                      {product.description}
                    </p>
                   <div className="flex items-baseline gap-2 mb-2">
  {Number(product?.price) > 0 && (
    <p className="text-sm sm:text-lg font-bold">
      {(() => {
        const basePrice = Number(product.price);

        if (product?.discount?.value > 0 && product.discount.type === "percentage") {
          return "₹" + Math.round(
            basePrice - (basePrice * product.discount.value) / 100
          ).toLocaleString("en-IN");
        }

        if (product?.discount?.value > 0 && product.discount.type === "flat") {
          return "₹" + Math.max(0, basePrice - product.discount.value).toLocaleString("en-IN");
        }

        return "₹" + basePrice.toLocaleString("en-IN");
      })()}
    </p>
  )}

  {Number(product?.price) > 0 && product?.discount?.value > 0 && (
    <>
      <p className="text-xs sm:text-sm text-muted-foreground line-through">
        ₹{Number(product.price).toLocaleString("en-IN")}
      </p>

      <Badge className="bg-red-500 hover:bg-red-600 text-xs">
        {product.discount.type === "percentage"
          ? `${product.discount.value}% OFF`
          : `₹${product.discount.value} OFF`}
      </Badge>
    </>
  )}
</div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-muted-foreground">Stock: {Number(product.stock || 0)}</p>
                      <Button size="icon" variant="secondary" className="h-8 w-8 sm:h-10 sm:w-10">
                        <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
