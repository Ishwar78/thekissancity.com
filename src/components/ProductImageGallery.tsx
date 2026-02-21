import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Component-specific CSS to override global styles - iOS optimized
const galleryStyles = `
  .gallery-icon-btn,
  .gallery-nav-btn {
    background-color: transparent !important;
    background: transparent !important;
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }

  .gallery-icon-btn:hover,
  .gallery-nav-btn:hover {
    background-color: transparent !important;
    background: transparent !important;
  }

  .gallery-icon-btn:active,
  .gallery-nav-btn:active {
    background-color: transparent !important;
    background: transparent !important;
    -webkit-transform: scale(0.95);
    transform: scale(0.95);
  }

  .gallery-icon-btn:focus,
  .gallery-nav-btn:focus {
    background-color: transparent !important;
    background: transparent !important;
    outline: none !important;
  }

  /* iOS-specific optimizations */
  @media (max-width: 768px) {
    body .gallery-icon-btn,
    body .gallery-nav-btn {
      background-color: transparent !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-appearance: none;
      appearance: none;
    }
    
    /* Prevent zoom on tap for iOS */
    body .gallery-nav-btn {
      touch-action: manipulation;
    }
  }

  /* Simplified mobile navigation - iOS friendly */
  @media (max-width: 768px) {
    body div[data-gallery="true"] button.gallery-nav-btn {
      position: absolute !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      background-color: rgba(255, 255, 255, 0.8) !important;
      border: none !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
      left: 8px !important;
      right: auto !important;
      border-radius: 50% !important;
      width: 44px !important;
      height: 44px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      -webkit-tap-highlight-color: transparent !important;
    }
    
    body div[data-gallery="true"] button.gallery-nav-btn:nth-of-type(2) {
      left: auto !important;
      right: 8px !important;
    }
    
    body div[data-gallery="true"] button.gallery-nav-btn:active {
      background-color: rgba(255, 255, 255, 0.9) !important;
      -webkit-transform: translateY(-50%) scale(0.95) !important;
      transform: translateY(-50%) scale(0.95) !important;
    }
  }
`;

interface ProductImageGalleryProps {
  images?: string[];
  productTitle?: string;
  selectedColor?: string;
  colorImages?: Record<string, string[]>;
  colorVariants?: Array<{
    colorName: string;
    colorCode?: string;
    images: string[];
    primaryImageIndex?: number;
  }>;
  productId?: string;
  showWishlistButton?: boolean;
  showShareButton?: boolean;
  onWishlistClick?: () => void;
  onShareClick?: () => void;
  isInWishlist?: boolean;
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

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  productTitle = 'Product',
  selectedColor,
  colorImages,
  colorVariants,
  productId,
  showWishlistButton = false,
  showShareButton = false,
  onWishlistClick,
  onShareClick,
  isInWishlist = false,
}) => {

  
  // Remove aggressive DOM manipulation that causes iOS hangs
  useEffect(() => {
    // Simplified iOS-compatible initialization
    const initializeGallery = () => {
      // Only add iOS-specific touch optimizations
      if ('ontouchstart' in window) {
        const galleryElement = document.querySelector('[data-gallery="true"]');
        if (galleryElement) {
          galleryElement.addEventListener('touchstart', (e) => {
            // Prevent default only for specific cases on iOS
            if (e.target instanceof HTMLButtonElement) {
              e.target.style.setProperty('-webkit-tap-highlight-color', 'transparent');
            }
          }, { passive: true });
        }
      }
    };

    // Delay initialization to ensure DOM is ready
    const timeoutId = setTimeout(initializeGallery, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [thumbScrollPos, setThumbScrollPos] = useState(0);

  // Touch handlers for swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Simplified global mouse up handler for iOS compatibility
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Minimal cleanup for iOS - avoid aggressive DOM manipulation
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    // Use passive listeners for better iOS performance
    document.addEventListener('mouseup', handleGlobalMouseUp, { passive: true });
    document.addEventListener('touchend', handleGlobalMouseUp, { passive: true });

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Remove aggressive position locking for iOS compatibility
  useEffect(() => {
    // iOS Safari handles positioning differently - avoid aggressive overrides
    const lockButtonPositions = () => {
      const navButtons = document.querySelectorAll('.gallery-nav-btn');
      navButtons.forEach((btn, index) => {
        const button = btn as HTMLElement;
        
        // Only apply minimal positioning for iOS compatibility
        if (window.innerWidth >= 768) {
          button.style.setProperty('position', 'absolute');
          button.style.setProperty('top', '50%');
          button.style.setProperty('transform', 'translateY(-50%)');
          
          if (index === 0) {
            button.style.setProperty('left', '8px');
            button.style.setProperty('right', 'auto');
          } else {
            button.style.setProperty('left', 'auto');
            button.style.setProperty('right', '8px');
          }
        }
      });
    };

    // Initial positioning
    lockButtonPositions();
    
    // Only update on resize, not continuously (better for iOS performance)
    const handleResize = () => {
      setTimeout(lockButtonPositions, 100);
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get images for the selected color
  // First, try the new colorVariants structure
  // Then fallback to old colorImages structure
  // Finally, fallback to default images
  const getImagesForSelectedColor = (): string[] => {
    if (selectedColor) {
      // Try new colorVariants structure first
      if (colorVariants && Array.isArray(colorVariants)) {
        const variant = colorVariants.find(cv => cv.colorName === selectedColor);
        if (variant && Array.isArray(variant.images) && variant.images.length > 0) {
          return variant.images;
        }
      }

      // Fallback to old colorImages structure
      if (colorImages && typeof colorImages === 'object' && colorImages[selectedColor]?.length > 0) {
        const primaryColorImage = colorImages[selectedColor][0];
        // Filter out the primaryColorImage from the general images to avoid duplication
        const filteredGeneralImages = images.filter(img => img !== primaryColorImage);
        return [primaryColorImage, ...filteredGeneralImages];
      }
    }

    // Default fallback to general product images
    return images;
  };

  // Get the primary image index for the selected color
  const getPrimaryImageIndex = (): number => {
    if (!selectedColor || !colorVariants) return 0;

    const variant = colorVariants.find(cv => cv.colorName === selectedColor);
    return variant?.primaryImageIndex ?? 0;
  };

  const imagesToUse = getImagesForSelectedColor();
  const primaryIndex = getPrimaryImageIndex();

  // When color changes, set the main image to the primary image for that color
  useEffect(() => {
    setSelectedIndex(primaryIndex);
  }, [selectedColor, primaryIndex]);

  const validImages = imagesToUse
    .filter((img) => img && String(img).length > 0)
    .map(resolveImage);

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-white rounded-lg flex items-center justify-center">
        <div className="text-center">
          <img
            src="/placeholder.svg"
            alt={productTitle}
            className="w-32 h-32 object-contain mx-auto opacity-50"
          />
          <p className="text-muted-foreground text-sm mt-2">No image available</p>
        </div>
      </div>
    );
  }

  const mainImage = validImages[selectedIndex];
  const hasMultiple = validImages.length > 1;

  const thumbnailImages = validImages.filter((_, idx) => idx !== selectedIndex);

  const handlePrevThumbnail = () => {
    if (thumbScrollPos > 0) {
      setThumbScrollPos(Math.max(0, thumbScrollPos - 100));
    }
  };

  const handleNextThumbnail = () => {
    const maxScroll = Math.max(0, validImages.length * 100 - 400);
    if (thumbScrollPos < maxScroll) {
      setThumbScrollPos(Math.min(maxScroll, thumbScrollPos + 100));
    }
  };

  // iOS-optimized touch handlers for swipe functionality
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle single touch to prevent iOS conflicts
    if (e.touches.length === 1) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultiple) {
      setSelectedIndex((i) => (i + 1) % validImages.length);
    }
    if (isRightSwipe && hasMultiple) {
      setSelectedIndex((i) => (i - 1 + validImages.length) % validImages.length);
    }
    
    // Reset states to prevent memory leaks on iOS
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Throttle touch move for iOS performance
    if (touchStart) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  return (
    <>
      <style>{galleryStyles}</style>
      {(() => {
       
        return null;
      })()}
      <div className="w-full space-y-4" data-gallery="true">
      {/* Main Image */}
      <div
        className="relative w-full rounded-lg overflow-hidden group cursor-zoom-in"
        style={{ aspectRatio: '1', touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={mainImage}
          alt={productTitle}
          className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
        />

        {/* Wishlist and Share Buttons */}
        <div className="absolute top-3 right-2 flex flex-col gap-2 z-10">
          {showWishlistButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWishlistClick?.();
              }}
              className="gallery-icon-btn p-2 rounded-full"
              aria-label="Add to wishlist"
            >
              <Heart
                className="h-5 w-5 transition-all"
                fill={isInWishlist ? '#000000' : 'none'}
                color="#000000"
              />
            </button>
          )}
          {showShareButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShareClick?.();
              }}
              className="gallery-icon-btn p-2 rounded-full"
              aria-label="Share product"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Arrows and Counter - iOS optimized */}
        {hasMultiple && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => (i - 1 + validImages.length) % validImages.length)}
              className="gallery-nav-btn absolute left-3 top-1/2 -translate-y-1/2 text-foreground p-2 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Previous image"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectedIndex((i) => (i + 1) % validImages.length)}
              className="gallery-nav-btn absolute right-3 top-1/2 -translate-y-1/2 text-foreground p-2 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Next image"
              style={{ touchAction: 'manipulation' }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-foreground text-xs px-3 py-1.5 rounded-full bg-black/50 text-white">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Section */}
      {hasMultiple && (
        <div>
          <div className="relative">
            {/* Mobile: Horizontal Scroll */}
            {isMobile ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {thumbnailImages.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setSelectedIndex(validImages.indexOf(img))}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all aspect-square',
                      selectedIndex === idx
                        ? 'border-primary shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        console.error('Failed to load image:', target.src);
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : (
              /* Desktop: Grid with Navigation */
              <div className="space-y-2">
                <div className="relative flex items-center gap-2">
                {(() => {
                  const canScrollPrev = thumbScrollPos > 0;
                  return (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handlePrevThumbnail}
                      className={cn(
                        "absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-border",
                        canScrollPrev 
                          ? "opacity-100" 
                          : "opacity-0 pointer-events-none"
                      )}
                      style={{
                        opacity: canScrollPrev ? 1 : 0,
                        pointerEvents: canScrollPrev ? 'auto' : 'none',
                        transition: 'all 200ms ease-in-out',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        outline: 'none',
                        touchAction: 'manipulation'
                      }}
                      aria-label="Previous thumbnails"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  );
                })()}


                  <div className="flex-1 overflow-hidden">
                    <div
                      className="flex gap-2 transition-transform duration-200"
                      style={{ transform: `translateX(-${thumbScrollPos}px)` }}
                    >
                      {thumbnailImages.map((img, idx) => (
                        <button
                          key={img}
                          onClick={() => setSelectedIndex(validImages.indexOf(img))}
                          className={cn(
                            'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all aspect-square',
                            selectedIndex === idx
                              ? 'border-primary shadow-md'
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              console.error('Failed to load image:', target.src);
                              target.src = '/placeholder.svg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const canScrollNext = thumbScrollPos < Math.max(0, validImages.length * 88 - 400);
                    return (
                      <button
                        onClick={handleNextThumbnail}
                        className={cn(
                          "absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-border",
                          canScrollNext 
                            ? "opacity-100" 
                            : "opacity-0 pointer-events-none"
                        )}
                        style={{
                          opacity: canScrollNext ? 1 : 0,
                          pointerEvents: canScrollNext ? 'auto' : 'none',
                          transition: 'all 200ms ease-in-out',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          outline: 'none',
                          touchAction: 'manipulation'
                        }}
                        aria-label="Next thumbnails"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  })()}
                </div>

                {/* Image Counter */}
                <p className="text-xs text-gray-600 text-center mt-1">
                  {selectedIndex + 1} / {validImages.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </>
  );
};
