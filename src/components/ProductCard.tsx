import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";
import { useEffect } from "react";

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
  discountedPrice, 
  discountPercentage, 
  discountAmount, 
  image, 
  category, 
  to, 
  slug, 
  images, 
  rating, 
  isBestSeller,
  quantityOptions
}: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = (() => { 
    try { 
      return useCart(); 
    } catch { 
      return { addToCart: () => {} } as any; 
    } 
  })();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const primaryImage = images && images.length > 0 ? images[0] : image;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const item = { id, title: name, price, image: primaryImage };
    if (!user) {
      try {
        localStorage.setItem('uni_add_intent', JSON.stringify({ item, qty: 1 }));
      } catch {}
      navigate('/auth');
      return;
    }
    addToCart(item, 1);
    toast.success('Added to cart');
  };

  const src = (() => {
    // Handle Cloudinary URLs with transformations
    if (image && image.includes('cloudinary')) {
      // If it's already a Cloudinary URL with transformations, use as-is
      if (image.includes('/w_') || image.includes('/h_') || image.includes('/c_')) {
        return image;
      }
      // Add basic optimization for Cloudinary images
      return image.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto,f_auto/');
    }
    return image;
  })();

  const linkTo = to || (slug && String(slug).trim() ? `/products/${slug}` : `/products/${id}`);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(id);
  };

  // Force transparent background for ALL wishlist buttons globally
  useEffect(() => {
    const forceTransparentBackground = () => {
      // Target all wishlist buttons by multiple selectors
      const selectors = [
        `#wishlist-btn-${id}`,
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
  }, [id]);

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

      <Card className="group overflow-hidden border-0 shadow-none hover:shadow-md transition-all duration-300 relative bg-white w-full max-w-[280px]">
        <Link to={linkTo} className="block">
          <div className="aspect-square overflow-hidden bg-gray-50 relative flex items-center justify-center rounded-lg mb-3">
            <img
              src={src}
              alt={name}
              className="w-full h-full object-contain p-2 sm:p-4 group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <button
              onClick={handleWishlistClick}
              id={`wishlist-btn-${id}`}
              className="absolute top-2 right-2 sm:top-3 sm:-right-2 p-1.5 sm:p-2 rounded-full hover:bg-black/5 transition-all duration-200 z-10"
              style={{
                backgroundColor: 'transparent',
                background: 'transparent',
                backgroundImage: 'none',
                boxShadow: 'none'
              }}
              aria-label={isInWishlist(id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className="h-4 w-4 sm:h-5 sm:w-5 transition-all"
                fill={isInWishlist(id) ? '#000000' : 'none'}
                color="#000000"
                strokeWidth={2}
              />
            </button>
          </div>
          <div className="px-1 sm:px-2 pb-2 sm:pb-3">
            <Link to={linkTo}>
              <h3 className="font-medium text-xs sm:text-sm text-gray-900 hover:text-gray-700 transition-colors truncate mb-1.5 sm:mb-2 leading-tight uppercase tracking-wide">
                {name}
              </h3>
            </Link>
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold text-gray-900">
                ₹{price.toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs sm:text-sm text-gray-400 line-through font-normal">
                  {originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            
            {/* Quantity Options Display */}
            {quantityOptions && quantityOptions.length > 0 && (
              <div className="mt-1.5">
                <div className="flex flex-wrap gap-1">
                  {quantityOptions.slice(0, 2).map((option) => (
                    <span 
                      key={option.id}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium"
                    >
                      {option.displayLabel}
                    </span>
                  ))}
                  {quantityOptions.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                      +{quantityOptions.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
      </Card>
    </>
  );
};