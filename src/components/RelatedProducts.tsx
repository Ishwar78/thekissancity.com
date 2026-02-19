import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';

interface RelatedProduct {
  _id?: string;
  id?: string;
  title?: string;
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

  // Force transparent background for ALL wishlist buttons globally
  useEffect(() => {
    const forceTransparentBackground = () => {
      // Target all wishlist buttons by multiple selectors
      const selectors = [
        '[aria-label*="wishlist"]',
        '[aria-label*="Wishlist"]',
        'button[class*="p-1.5"][class*="rounded-full"]',
        'button[class*="p-2"][class*="rounded-full"]',
        'button:has(svg[class*="lucide-heart"])',
        'button:has(svg[class*="heart"])'
      ];
      
      selectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
          const btn = button as HTMLElement;
          btn.style.setProperty('background-color', 'transparent', 'important');
          btn.style.setProperty('background', 'transparent', 'important');
          btn.style.setProperty('background-image', 'none', 'important');
          btn.style.setProperty('box-shadow', 'none', 'important');
        });
      });
    };
    
    // Initial force
    forceTransparentBackground();
    
    // Continuous monitoring to fight back
    const interval = setInterval(forceTransparentBackground, 50);
    
    // Also fight back on interactions
    const handleGlobalInteraction = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button');
      if (button) {
        const isWishlistBtn = 
          button.getAttribute('aria-label')?.toLowerCase().includes('wishlist') ||
          button.className.includes('p-1.5') ||
          button.className.includes('p-2') ||
          button.querySelector('svg[class*="heart"]') ||
          button.querySelector('svg[class*="lucide-heart"]');
          
        if (isWishlistBtn) {
          setTimeout(() => {
            const btn = button as HTMLElement;
            btn.style.setProperty('background-color', 'transparent', 'important');
            btn.style.setProperty('background', 'transparent', 'important');
            btn.style.setProperty('background-image', 'none', 'important');
            btn.style.setProperty('box-shadow', 'none', 'important');
          }, 0);
        }
      }
    };
    
    document.addEventListener('mousedown', handleGlobalInteraction);
    document.addEventListener('touchstart', handleGlobalInteraction);
    document.addEventListener('click', handleGlobalInteraction);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleGlobalInteraction);
      document.removeEventListener('touchstart', handleGlobalInteraction);
      document.removeEventListener('click', handleGlobalInteraction);
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tighter mb-6 sm:mb-8">
          Related Products
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 sm:w-48 animate-pulse">
              <div className="aspect-square bg-muted rounded-lg mb-3 sm:mb-4" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-4 w-3/4 bg-muted rounded" />
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
        /* Override for ALL wishlist buttons - prevent white background from global p-2 rules */
        button[aria-label*="wishlist"],
        button[aria-label*="Wishlist"],
        button[class*="p-1.5"][class*="rounded-full"],
        button[class*="p-2"][class*="rounded-full"],
        button[aria-label*="wishlist"]:hover,
        button[aria-label*="Wishlist"]:hover,
        button[class*="p-1.5"][class*="rounded-full"]:hover,
        button[class*="p-2"][class*="rounded-full"]:hover,
        button[aria-label*="wishlist"]:active,
        button[aria-label*="Wishlist"]:active,
        button[class*="p-1.5"][class*="rounded-full"]:active,
        button[class*="p-2"][class*="rounded-full"]:active,
        button[aria-label*="wishlist"]:focus,
        button[aria-label*="Wishlist"]:focus,
        button[class*="p-1.5"][class*="rounded-full"]:focus,
        button[class*="p-2"][class*="rounded-full"]:focus {
          background-color: transparent !important;
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
        
        /* Ultra-specific override for any button with heart icon */
        button svg[class*="lucide-heart"],
        button svg[class*="heart"],
        button:has(svg[class*="lucide-heart"]),
        button:has(svg[class*="heart"]) {
          background-color: transparent !important;
          background: transparent !important;
          background-image: none !important;
          box-shadow: none !important;
        }
      `}</style>
    <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tighter mb-6 sm:mb-8">
        Related Products
      </h2>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4">
        {products.map((product) => {
          const id = product._id || product.id;
          const slug = product.slug || '';
          const title = product.title || 'Product';
          const price = Number(product.price || 0);
          const image = resolveImage(product.image_url || product.images?.[0]);
          const stock = Number(product.stock || 0);
          const discount = product.discount;
          const finalPrice = calculateDiscountedPrice(price, discount);
          const discountLabel = discount && discount.value > 0
            ? discount.type === 'percentage'
              ? `${discount.value}% off`
              : `₹${discount.value} off`
            : null;
          const productLink = slug ? `/products/${slug}` : `/product/${id}`;

          const handleWishlistClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          };

          return (
            <div key={id} className="flex-shrink-0 w-40 sm:w-48 group relative">
              <Link to={productLink} className="block">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* {product.isBestSeller && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm">
                        Best Seller
                      </Badge>
                    )} */}
                    {/* {discountLabel && (
                      <Badge className="absolute top-12 left-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-xs sm:text-sm">
                        {discountLabel}
                      </Badge>
                    )} */}
                    <button
                      onClick={handleWishlistClick}
                      className="absolute top-1 -right-1 p-2 hover:bg-black/5 rounded-full transition-all duration-200 z-10"
                      style={{
                        backgroundColor: 'transparent',
                        background: 'transparent',
                        backgroundImage: 'none',
                        boxShadow: 'none'
                      }}
                    >
                      <Heart
                        className="h-4 w-4 transition-all"
                        fill={isInWishlist(id) ? '#000000' : 'none'}
                        color="#000000"
                      />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-bold">
                        ₹{finalPrice.toLocaleString('en-IN')}
                      </span>
                      {discount && discount.value > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    
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
