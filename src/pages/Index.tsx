import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RunningText } from "@/components/RunningText";
import { ProductCard } from "@/components/ProductCard";
import { FeatureRow } from "@/components/FeatureRow";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PostInstallExperience } from "@/components/PostInstallExperience";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-cosmic.jpg";
import { ProductSlider } from "@/components/ProductSlider";
import InfluencerSection from "@/components/InfluencerSection";
import InfluencerImageGrid from "@/components/InfluencerImageGrid";
import AboutUsSection from "@/components/AboutUsSection";
import WhyUsSection from "@/components/WhyUsSection";
import { FeatureSection } from "@/components/FeatureSection";
import RecentReviewsSection from "@/components/RecentReviewsSection";
import BlogSection from "@/components/BlogSection";
import BestSellerSection from "@/components/BestSellerSection";
import VideoSection from "@/components/VideoSection";



// ── STEP 1: Paste this ABOVE your Index component (outside it) ──
import * as React from "react";

const useScrollReveal = (threshold = 0.15) => {
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
};

// ── STEP 2: Paste this INSIDE your Index component, with your other hooks ──
// const { ref: naRef, visible: naVisible } = useScrollReveal();
// ✅ UPDATED FEATURE IMAGES
// HOODIES -> new image
import hoodiesFeatureImg from "@/assets/IMG_4100.jpg";
// LOWER -> previously denims image
import lowerFeatureImg from "@/assets/IMG_4099.jpg";
// CO-ORD
import coordFeatureImg from "@/assets/IMG_4098.jpg";

import { NewsTicker } from "@/components/NewsTicker";
import { useEffect, useMemo, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Types aligned with server payloads
type ProductRow = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  image?: string;
  image_url?: string;
  images?: string[];
  category?: string;
  slug?: string;
  rating?: number;
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
  region?: string;
  gender?: string;
  stock?: number;
  paragraph1?: string;
  paragraph2?: string;
  highlights?: string[];
  specs?: Array<{ key: string; value: string }>;
  colors?: string[];
  colorVariants?: Array<{
    colorName: string;
    colorCode: string;
    images: string[];
    primaryImageIndex: number;
  }>;
  colorInventory?: Array<{
    color: string;
    qty: number;
  }>;
  colorImages?: Record<string, string>;
  sizes?: string[];
  trackInventoryBySize?: boolean;
  sizeInventory?: Array<{
    code: string;
    label: string;
    qty: number;
  }>;
  sizeChartUrl?: string;
  sizeChartTitle?: string;
  sizeChart?: {
    title: string;
    fieldLabels: {
      chest: string;
      waist: string;
      length: string;
    };
    rows: Array<{
      sizeLabel: string;
      chest: string;
      waist: string;
      length: string;
      brandSize: string;
    }>;
    guidelines: string;
    diagramUrl: string;
  };
  discount?: {
    type: 'flat' | 'percentage';
    value: number;
  };
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
  sizeFit?: {
    fit: string;
    modelWearingSize: string;
  };
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  active?: boolean;
  featured?: boolean;
  isBestSeller?: boolean;
  reviews?: Array<{
    id: string;
    username: string;
    email: string;
    rating: number;
    text: string;
    status: string;
    createdAt: Date;
  }>;
  createdAt?: Date;
};

type CategoryRow = {
  _id?: string;
  id?: string;
  name?: string;
  imageUrl?: string;
  slug?: string;
  parent?: string | null;
};

type FeatureRowData = {
  key: string;
  title: string;
  link?: string;
  imageAlt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const HOME_DEBUG = !!import.meta.env.DEV;

function homeLog(...args: any[]) {
  if (!HOME_DEBUG) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

function homeWarn(...args: any[]) {
  if (!HOME_DEBUG) return;
  // eslint-disable-next-line no-console
  console.warn(...args);
}

function homeError(...args: any[]) {
  if (!HOME_DEBUG) return;
  // eslint-disable-next-line no-console
  console.error(...args);
}

const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;

  const isLocalBase = (() => {
    try {
      return API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1");
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
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
    return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
  }
  return s;
};

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const Index = () => {
  // Feature Rows state
  const [featureRows, setFeatureRows] = useState<FeatureRowData[]>([]);
  const [featureRowsLoading, setFeatureRowsLoading] = useState(true);

  /**
   * ✅ DEFAULT FEATURE ROWS (Final truth)
   * Homepage ke big titles ka base control yahi se hoga.
   */
  const defaultFeatureRows: FeatureRowData[] = [
    {
      key: "hoodies",
      title: "HOODIES",
      imageAlt: "Hoodies Collection",
    },
    {
      key: "lower",
      title: "BOTTOMS",
      imageAlt: "Lower Collection",
    },
    {
      key: "co-ord",
      title: "CO-ORD",
      imageAlt: "Co-ord Collection",
    },
  ];

  // Featured Products state
  const [featuredProducts, setFeaturedProducts] = useState<ProductRow[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // New Arrivals state
  const [newArrivals, setNewArrivals] = useState<ProductRow[]>([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [newArrivalsError, setNewArrivalsError] = useState<string | null>(null);

  // Categories + mixed products state
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);
  const [mixedProducts, setMixedProducts] = useState<ProductRow[]>([]);
  const [mixedLoading, setMixedLoading] = useState(true);
  const [mixedError, setMixedError] = useState<string | null>(null);
  
  // Selected category for banner display
  const [selectedCategory, setSelectedCategory] = useState<CategoryRow | null>(null);

  // Regions state
  const [regions, setRegions] = useState<any[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [regionsError, setRegionsError] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<
    Map<string, ProductRow>
  >(new Map());

  /**
   * ✅ Fetch Feature Rows from settings
   * - API title default ko blindly override nahi karega
   * - Title sirf tab override hoga jab key match ho
   */
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setFeatureRowsLoading(true);

        const { ok, json } = await api("/api/settings/home");
        if (!ok) throw new Error(json?.message || json?.error || "Failed");

        const rows = Array.isArray(json?.data?.featureRows)
          ? (json.data.featureRows as Partial<FeatureRowData>[])
          : [];

        if (ignore) return;

        const merged = defaultFeatureRows.map((def, idx) => {
          const byKey = rows.find((r) => r?.key && r.key === def.key);
          const fallback = rows[idx];
          const src = byKey || fallback || {};

          return {
            ...def,
            imageAlt: src.imageAlt ?? def.imageAlt,
            link: src.link ?? def.link,
            title:
              src.key && src.key === def.key && src.title
                ? String(src.title)
                : def.title,
          };
        });

        setFeatureRows(merged);
      } catch {
        if (!ignore) setFeatureRows(defaultFeatureRows);
      } finally {
        if (!ignore) setFeatureRowsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);


  // Handler to clear hover states on mobile after touch
  const clearHoverState = (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e?.currentTarget) return;
    
    const button = e.currentTarget;
    
    // Don't blur immediately - wait for click to complete
    setTimeout(() => {
      button.blur();
      requestAnimationFrame(() => {
        button.blur();
      });
    }, 100);
  };

  // Aggressive focus clearing for carousel buttons
  useEffect(() => {
    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' && (
        target.className.includes('rounded-full') && 
        target.className.includes('h-10') && 
        target.className.includes('w-10')
      )) {
        // Immediate blur
        (target as HTMLElement).blur();
        
        // Prevent focus from returning
        setTimeout(() => {
          (target as HTMLElement).blur();
          (target as HTMLElement).setAttribute('tabindex', '-1');
        }, 5);
        
        // Restore tabindex after a short delay
        setTimeout(() => {
          (target as HTMLElement).removeAttribute('tabindex');
        }, 100);
      }
    };

    // Also handle touch events for mobile
    const handleTouchEnd = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' && (
        target.className.includes('rounded-full') && 
        target.className.includes('h-10') && 
        target.className.includes('w-10')
      )) {
        // Immediate blur for touch
        (target as HTMLElement).blur();
        
        // Prevent focus from returning
        setTimeout(() => {
          (target as HTMLElement).blur();
          (target as HTMLElement).setAttribute('tabindex', '-1');
        }, 5);
        
        // Restore tabindex after a short delay
        setTimeout(() => {
          (target as HTMLElement).removeAttribute('tabindex');
        }, 100);
      }
    };

    document.addEventListener('click', handleButtonClick);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('click', handleButtonClick);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const { user } = useAuth();
  
  // ── STEP 2: Paste this INSIDE your Index component, with your other hooks ──
  const { ref: naRef, visible: naVisible } = useScrollReveal();
  
  // Prevent double fetch when user loads
  const hasFetchedProducts = React.useRef(false);

  // ─── DROP-IN REPLACEMENT for the big useEffect in Index.tsx ──────────────────
  // Replaces 4 separate API calls with 1 batch call to /api/products/homepage
  // Cut from 3 min → under 2 seconds on a cold connection.
  useEffect(() => {
    if (hasFetchedProducts.current) return;
    hasFetchedProducts.current = true;
    let ignore = false;

    (async () => {
      try {
        setFeaturedLoading(true);
        setNewArrivalsLoading(true);
        setCatsLoading(true);
        setMixedLoading(true);
        setRegionsLoading(true);

        const { ok, json } = await api('/api/products/homepage');

        if (!ok) throw new Error(json?.message || json?.error || 'Batch fetch failed');
        if (ignore) return;

        const {
          featured = [],
          newArrivals = [],
          categories = [],
          regions = [],
        } = json?.data || {};

        // ── Featured ──────────────────────────────────────────────────────────
        setFeaturedProducts(featured as ProductRow[]);

        // ── New Arrivals ──────────────────────────────────────────────────────
        const sorted = [...(newArrivals as ProductRow[])].sort(
          (a, b) =>
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        setNewArrivals(sorted.slice(0, 8));

        // ── Categories ────────────────────────────────────────────────────────
        const allCats = categories as CategoryRow[];
        const parentCats = allCats.filter((c) => !c.parent);
        setCats(parentCats);

        // Build category product map from already-fetched data (no extra fetch)
        const allProducts: ProductRow[] = [...(featured as ProductRow[]), ...(newArrivals as ProductRow[])];
        const catMap = new Map<string, ProductRow>();
        allProducts.forEach((product) => {
          const catName = String(product.category || '').toLowerCase();
          const catSlug = catName.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const matchedCat = parentCats.find((c) => {
            const n = (c.name || '').toLowerCase();
            return n === catName || n === catSlug;
          });
          if (matchedCat) {
            const key = matchedCat.slug || catSlug;
            if (!catMap.has(key)) catMap.set(key, product);
          }
        });
        setCategoryProducts(catMap);
        setMixedProducts(Array.from(catMap.values()));

        // ── Regions ───────────────────────────────────────────────────────────
        setRegions(regions);
      } catch (e: any) {
        if (!ignore) {
          const msg = e?.message || 'Failed to load';
          setFeaturedError(msg);
          setNewArrivalsError(msg);
          setCatsError(msg);
          setMixedError(msg);
          setRegionsError(msg);
          setCats([]);
          setMixedProducts([]);
          setCategoryProducts(new Map());
          setRegions([]);
        }
      } finally {
        if (!ignore) {
          setFeaturedLoading(false);
          setNewArrivalsLoading(false);
          setCatsLoading(false);
          setMixedLoading(false);
          setRegionsLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // Helpers to map product row to ProductCard props
  const mapToCard = (p: ProductRow) => {
    const id = String(p._id || p.id || "");
    const title = p.title || p.name || "";
    const rawImg =
      p.image_url ||
      (Array.isArray(p.images) ? p.images[0] : "") ||
      (p as any).image ||
      "/placeholder.svg";

    const img = resolveImage(rawImg);
    const originalPrice = Number(p.price || 0);
    
    // Check if product has discount data
    let discountPercentage = 0;
    let discountedPrice = originalPrice;
    
    // Check for discount in the correct structure
    if (p.discount && p.discount.value && p.discount.value > 0) {
      if (p.discount.type === 'percentage') {
        discountPercentage = p.discount.value;
        discountedPrice = Math.round(originalPrice * (1 - discountPercentage / 100));
      } else if (p.discount.type === 'flat') {
        discountPercentage = Math.round((p.discount.value / originalPrice) * 100);
        discountedPrice = Math.round(originalPrice - p.discount.value);
      }
    }
    
    // Calculate rating from actual reviews
    let rating = "0.0";
    if (p.reviews && p.reviews.length > 0) {
      const totalRating = p.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      rating = (totalRating / p.reviews.length).toFixed(1);
    }

    return {
      id,
      name: title,
      price: discountedPrice, // Show discounted price as main price
      originalPrice: originalPrice, // Show original price for strikethrough
      discountedPrice: discountedPrice,
      discountPercentage: discountPercentage,
      image: img,
      category: p.category || "",
      slug: p.slug || "",
      images: Array.isArray(p.images) ? p.images : [],
      rating: Number(rating),
      quantityOptions: p.quantityOptions || [],
    };
  };

  const catSlugForProduct = (p: ProductRow) => {
    const cat = String(p.category || "");
    const found = cats.find((c) => c.slug === cat || c.name === cat);
    if (found?.slug) return found.slug;
    return slugify(cat);
  };

  const topCats = useMemo(() => cats.slice(0, 8), [cats]);

  /**
   * ✅ Helper: Feature Rows ke "View" button ke liye
   * - Pehle categories (cats) me se matching category dhoondta hai
   * - Agar mil jaye to `/collection/<slug>` pe le جاتا hai
   * - Warna `/shop?category=<fallbackTitle>` pe redirect
   */
  const getFeatureCategoryLink = (key: string, fallbackTitle: string) => {
    const k = key.toLowerCase();
    const fallback = fallbackTitle.toLowerCase();

    const match = cats.find((c) => {
      const name = (c.name || "").toLowerCase();

      if (k === "hoodies") {
        return name.includes("hood");
      }
      if (k === "lower") {
        return (
          name.includes("lower") ||
          name.includes("bottom") ||
          name.includes("bottoms") ||
          name.includes("denim")
        );
      }
      if (k === "co-ord" || k === "coord") {
        return name.includes("co-ord") || name.includes("coord");
      }

      // generic fallback – exact match on title text
      return name === fallback;
    });

    if (match) {
      const slug = match.slug || slugify(match.name || "");
      return `/collection/${slug}`;
    }

    // Fallback: old /shop?category= query approach
    return `/shop?category=${encodeURIComponent(fallbackTitle)}`;
  };

  // New arrivals marquee
  // ✅ Feature row titles + links ek jagah calculate kar liye
  const hoodiesTitle = featureRows[0]?.title || "HOODIES";
  const lowerTitle = featureRows[1]?.title || "BOTTOMS";
  const coordTitle = featureRows[2]?.title || "CO-ORD";

  const hoodiesLink = getFeatureCategoryLink("hoodies", hoodiesTitle);
  const lowerLink = getFeatureCategoryLink("lower", lowerTitle);
  const coordLink = getFeatureCategoryLink("co-ord", coordTitle);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden sm:overflow-x-visible text-gray-800">
      <style>{`
        /* Nuclear option for mobile carousel buttons */
        @media (max-width: 768px) {
          button[data-slot="carousel-previous"],
          button[data-slot="carousel-next"],
          .carousel-previous,
          .carousel-next,
          button[class*="carousel"],
          button[class*="CarouselPrevious"],
          button[class*="CarouselNext"] {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-touch-callout: none !important;
            user-select: none !important;
            outline: none !important;
            transition: all 0.1s ease !important;
            position: relative !important;
            pointer-events: auto !important;
          }
          
          /* Completely disable hover on mobile */
          button[data-slot="carousel-previous"]:hover,
          button[data-slot="carousel-next"]:hover,
          .carousel-previous:hover,
          .carousel-next:hover,
          button[class*="carousel"]:hover,
          button[class*="CarouselPrevious"]:hover,
          button[class*="CarouselNext"]:hover {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          }
          
          /* Active state - slight scale for feedback */
          button[data-slot="carousel-previous"]:active,
          button[data-slot="carousel-next"]:active,
          .carousel-previous:active,
          .carousel-next:active,
          button[class*="carousel"]:active,
          button[class*="CarouselPrevious"]:active,
          button[class*="CarouselNext"]:active {
            transform: scale(0.95) !important;
          }
        }
        
        /* Add this to your existing style tag */
        button[data-slot="carousel-previous"]:focus,
        button[data-slot="carousel-next"]:focus {
          outline: none !important;
          background-color: white !important;
          border-color: #d1d5db !important;
        }

        button[data-slot="carousel-previous"]:not(:active):not(:hover),
        button[data-slot="carousel-next"]:not(:active):not(:hover) {
          background-color: white !important;
          border-color: #d1d5db !important;
          color: #374151 !important;
        }
          button[data-slot="carousel-previous"]:active,
          button[data-slot="carousel-next"]:active,
          .carousel-previous:active,
          .carousel-next:active,
          button[class*="carousel"]:active,
          button[class*="CarouselPrevious"]:active,
          button[class*="CarouselNext"]:active {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: scale(0.95) !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          }
          
          /* Focus state - no outline */
          button[data-slot="carousel-previous"]:focus,
          button[data-slot="carousel-next"]:focus,
          .carousel-previous:focus,
          .carousel-next:focus,
          button[class*="carousel"]:focus,
          button[class*="CarouselPrevious"]:focus,
          button[class*="CarouselNext"]:focus {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
            outline: none !important;
          }
          
          /* Focus-visible state - no outline */
          button[data-slot="carousel-previous"]:focus-visible,
          button[data-slot="carousel-next"]:focus-visible,
          .carousel-previous:focus-visible,
          .carousel-next:focus-visible,
          button[class*="carousel"]:focus-visible,
          button[class*="CarouselPrevious"]:focus-visible,
          button[class*="CarouselNext"]:focus-visible {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
            outline: none !important;
          }
          
          /* Override any inline styles */
          button[data-slot="carousel-previous"][style],
          button[data-slot="carousel-next"][style],
          .carousel-previous[style],
          .carousel-next[style],
          button[class*="carousel"][style],
          button[class*="CarouselPrevious"][style],
          button[class*="CarouselNext"][style] {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          }
          
          /* Force remove hover effect completely */
          * {
            -webkit-tap-highlight-color: transparent !important;
          }
          
          /* Remove focus ring immediately after click */
          button[data-slot="carousel-previous"]:not(:hover):not(:active),
          button[data-slot="carousel-next"]:not(:hover):not(:active),
          .carousel-previous:not(:hover):not(:active),
          .carousel-next:not(:hover):not(:active),
          button[class*="carousel"]:not(:hover):not(:active),
          button[class*="CarouselPrevious"]:not(:hover):not(:active),
          button[class*="CarouselNext"]:not(:hover):not(:active) {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          }
          
          /* Prevent focus retention on mobile */
          button[data-slot="carousel-previous"]:focus,
          button[data-slot="carousel-next"]:focus,
          .carousel-previous:focus,
          .carousel-next:focus,
          button[class*="carousel"]:focus,
          button[class*="CarouselPrevious"]:focus,
          button[class*="CarouselNext"]:focus {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
            outline: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }
        }
        
        /* Force remove focus/active states on carousel buttons */
        button[class*="Carousel"]:focus,
        button[class*="Carousel"]:active,
        button[class*="Carousel"]:focus-visible {
          outline: none !important;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        }

        /* Remove hover styles on mobile completely */
        @media (hover: none) and (pointer: coarse) {
          button[class*="Carousel"]:hover,
          button[class*="Carousel"]:focus,
          button[class*="Carousel"]:active {
            background-color: white !important;
            border-color: #d1d5db !important;
            color: #374151 !important;
            transform: none !important;
          }
        }
        
        /* Additional mobile-specific override */
        @media (max-width: 640px) {
          button[data-slot="carousel-previous"],
          button[data-slot="carousel-next"],
          .carousel-previous,
          .carousel-next,
          button[class*="carousel"],
          button[class*="CarouselPrevious"],
          button[class*="CarouselNext"] {
            pointer-events: auto !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
            -webkit-touch-callout: none !important;
          }
        }
      `}</style>
      <Navbar />
      {/* <RunningText /> */}

      {/* Ticker line – header ke niche */}

      {/* Product Slider Section */}
      <ProductSlider className="-mb-4 mt-20 sm:mt-20 md:mt-0 lg:mt-8" />
    

      {/* Featured Products */}
  <section style={{ backgroundColor: '#F5F0E8' }} className="py-14 sm:py-20 overflow-hidden">
  <style>{`
    .coll-section {
      --green:      #2d6a4f;
      --green-dark: #1b4332;
      --green-soft: #d8f3dc;
      --brown:      #6b4423;
      --brown-mid:  #ba8c5c;
      --cream:      #faf3eb;
    }
    .coll-eyebrow {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--brown-mid);
      background: rgba(107,68,35,0.08);
      padding: 4px 14px;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 8px;
    }
    .coll-title {
      font-size: clamp(1.5rem, 4vw, 2.5rem);
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1;
      color: var(--brown);
      margin-bottom: 10px;
      white-space: nowrap;
    }
    .coll-title span { color: var(--green); }
    .coll-title-underline {
      height: 4px;
      width: 60px;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--green), var(--brown-mid));
    }
    .coll-nav-btn {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 42px !important;
      height: 42px !important;
      border-radius: 50% !important;
      border: 1.5px solid rgba(107,68,35,0.18) !important;
      background: #fff !important;
      box-shadow: 0 2px 10px rgba(45,106,79,0.08) !important;
      transition: all 0.2s ease !important;
      flex-shrink: 0;
      position: static !important;
      transform: none !important;
    }
    .coll-nav-btn:hover {
      border-color: #2d6a4f !important;
      box-shadow: 0 4px 18px rgba(45,106,79,0.2) !important;
      transform: scale(1.05) !important;
      background: #fff !important;
    }
    .coll-nav-btn:active  { transform: scale(0.94) !important; }
    .coll-nav-btn:focus   { outline: none !important; box-shadow: 0 2px 10px rgba(45,106,79,0.08) !important; }

    /* Skeleton shimmer */
    .coll-skeleton-card {
      background: #fff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(45,106,79,0.06);
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .coll-shimmer {
      background: linear-gradient(90deg, #ede8e0 25%, #f5f0e8 50%, #ede8e0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
  `}</style>

  <div className="coll-section container mx-auto px-4 sm:px-6">

    {featuredLoading ? (
      <>
        {/* Static header during loading */}
        <div className="mb-10 sm:mb-12 text-center">
          <span className="coll-eyebrow">Our Products</span>
          <h2 className="coll-title">Featured <span>Collection</span></h2>
          <div className="coll-title-underline mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="coll-skeleton-card">
              <div className="aspect-square coll-shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-3 rounded-full coll-shimmer" />
                <div className="h-3 rounded-full coll-shimmer w-3/4" />
                <div className="h-3 rounded-full coll-shimmer w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </>
    ) : featuredError ? (
      <>
        <div className="mb-10 sm:mb-12 text-center">
          <span className="coll-eyebrow">Our Products</span>
          <h2 className="coll-title">Featured <span>Collection</span></h2>
          <div className="coll-title-underline mx-auto" />
        </div>
        <div className="text-center py-16 text-gray-400 text-sm">{featuredError}</div>
      </>
    ) : (
      /* ── Carousel wraps EVERYTHING including nav buttons ── */
      <Carousel opts={{ align: "start", loop: true }} className="w-full">

        {/* Header row with nav buttons INSIDE Carousel */}
        <div className="flex flex-col items-center mb-10 sm:mb-12">
          <div className="text-center">
            <span className="coll-eyebrow">Our Products</span>
            <h2 className="coll-title">Featured <span>Collection</span></h2>
            <div className="coll-title-underline mx-auto" />
          </div>

          {/* Desktop nav — inside Carousel context ✓ */}
          <div className="hidden sm:flex items-center gap-2 mt-4">
            <CarouselPrevious
              className="coll-nav-btn"
              onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
            <CarouselNext
              className="coll-nav-btn"
              onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
          </div>
        </div>

        <CarouselContent className="-ml-4 sm:-ml-5">
          {(featuredProducts.length ? featuredProducts : newArrivals).map((product) => {
            const card = mapToCard(product);
            const to = `/product/${card.id}`;
            return (
              <CarouselItem
                key={String(product._id || product.id)}
                className="pl-4 sm:pl-5 basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <ProductCard {...card} to={to} />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Mobile nav — inside Carousel context ✓ */}
        <div className="flex sm:hidden justify-center gap-3 mt-8">
          <CarouselPrevious
            className="coll-nav-btn"
            onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
          />
          <CarouselNext
            className="coll-nav-btn"
            onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
          />
        </div>

      </Carousel>
    )}

  </div>
</section>

    {/* Category Banner Display — place this AFTER your category chips/tabs JSX */}
       <section
  style={{ backgroundColor: '#F5F0E8' }}
  className="mx-auto px-4 sm:px-8 pb-10 sm:pb-16 pt-4 sm:pt-4"
>
  {/* Header */}
  <div className="text-center mb-10">
    <span
      className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-3 px-4 py-1 rounded-full"
      style={{ background: '#e8d5bc', color: '#6b4423' }}
    >
      Explore
    </span>
    <h2
      className="text-3xl md:text-5xl font-extrabold tracking-tight"
      style={{ color: '#2d6a4f' }}
    >
      Shop By Categories
    </h2>
    <div
      className="mx-auto mt-3 h-1 w-16 rounded-full"
      style={{ background: 'linear-gradient(90deg, #2d6a4f, #6b4423)' }}
    />
  </div>

  <style>{`
    .cat-pill {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
    }
    .cat-img-ring {
      position: relative;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, #2d6a4f 0%, #6b4423 100%);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .cat-pill:hover .cat-img-ring {
      transform: scale(1.08) translateY(-3px);
      box-shadow: 0 12px 28px rgba(45,106,79,0.25);
    }
    .cat-img-inner {
      border-radius: 50%;
      background: #faf3eb;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-img-inner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      padding: 8px;
      transition: transform 0.4s ease;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      image-rendering: pixelated;
    }
    .cat-pill:hover .cat-img-inner img {
      transform: scale(1.1);
    }
    .cat-label {
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.3px;
      color: #3d3d3d;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s;
    }
    .cat-pill:hover .cat-label {
      color: #2d6a4f;
    }

    /* Mobile carousel nav buttons */
    .cat-nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #d4c5b0;
      background: #fff;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .cat-nav-btn:hover {
      border-color: #2d6a4f;
      box-shadow: 0 4px 16px rgba(45,106,79,0.2);
    }
  `}</style>

  {catsLoading ? (
    <div className="flex justify-center gap-6 flex-wrap">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-stone-200 animate-pulse" />
          <div className="w-16 h-3 rounded bg-stone-200 animate-pulse" />
        </div>
      ))}
    </div>
  ) : catsError ? (
    <div className="text-center text-sm text-muted-foreground mb-12">{catsError}</div>
  ) : (
    <>
      {/* Mobile Carousel */}
      <div className="block sm:hidden">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {topCats.slice(0, 8).map((c) => {
              const to = `/collection/${c.slug || slugify(c.name || "")}`;
              return (
                <CarouselItem
                  key={String(c._id || c.id || c.slug || c.name)}
                  className="pl-3 basis-1/3"
                >
                  <Link to={to} className="cat-pill">
                    <div className="cat-img-ring">
                      <div className="cat-img-inner w-[72px] h-[72px]">
                        <img
                          src={resolveImage(c.imageUrl || "/placeholder.svg")}
                          alt={c.name}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <span className="cat-label w-20">{c.name}</span>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex justify-center gap-3 mt-7">
            <CarouselPrevious
              className="cat-nav-btn static translate-y-0"
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
            <CarouselNext
              className="cat-nav-btn static translate-y-0"
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
          </div>
        </Carousel>
      </div>

      {/* Desktop Grid */}
      <div className="hidden sm:flex flex-wrap justify-center gap-6 md:gap-8">
        {topCats.slice(0, 8).map((c) => {
          const to = `/collection/${c.slug || slugify(c.name || "")}`;
          return (
            <Link
              key={String(c._id || c.id || c.slug || c.name)}
              to={to}
              className="cat-pill"
            >
              <div className="cat-img-ring">
                <div className="cat-img-inner w-24 h-24 md:w-28 md:h-28">
                  <img
                    src={resolveImage(c.imageUrl || "/placeholder.svg")}
                    alt={c.name}
                    loading="lazy"
                  />
                </div>
              </div>
              <span className="cat-label w-24 md:w-28">{c.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  )}
</section>

     


  
      {/* Best Seller Section */}
      <BestSellerSection />

      {/* Video Section — below Best Sellers */}
      <VideoSection />

      {/* Shop By Region */}
  
<section
  style={{ backgroundColor: '#F5F0E8' }}
  className="mx-auto px-4 sm:px-8 pb-10 sm:pb-16 pt-4 sm:pt-4 overflow-hidden"
>
  {/* Header — identical to Shop By Categories */}
  <div className="text-center mb-10">
    <span
      className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-3 px-4 py-1 rounded-full"
      style={{ background: '#e8d5bc', color: '#6b4423' }}
    >
      Explore India
    </span>
    <h2
      className="text-3xl md:text-5xl font-extrabold tracking-tight"
      style={{ color: '#2d6a4f' }}
    >
      Shop By Region
    </h2>
    <div
      className="mx-auto mt-3 h-1 w-16 rounded-full"
      style={{ background: 'linear-gradient(90deg, #2d6a4f, #6b4423)' }}
    />
  </div>

  <style>{`
    .cat-pill {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      text-decoration: none;
    }
    .cat-img-ring {
      position: relative;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, #2d6a4f 0%, #6b4423 100%);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .cat-pill:hover .cat-img-ring {
      transform: scale(1.08) translateY(-3px);
      box-shadow: 0 12px 28px rgba(45,106,79,0.25);
    }
    .cat-img-inner {
      border-radius: 50%;
      background: #faf3eb;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-img-inner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      padding: 8px;
      transition: transform 0.4s ease;
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
      image-rendering: pixelated;
    }
    .cat-pill:hover .cat-img-inner img {
      transform: scale(1.1);
    }
    .cat-label {
      font-size: 11px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.3px;
      color: #3d3d3d;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color 0.2s;
    }
    .cat-pill:hover .cat-label {
      color: #2d6a4f;
    }

    .cat-nav-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #d4c5b0;
      background: #fff;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .cat-nav-btn:hover {
      border-color: #2d6a4f;
      box-shadow: 0 4px 16px rgba(45,106,79,0.2);
    }

    /* Skeleton shimmer */
    @keyframes region-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .region-shimmer {
      background: linear-gradient(90deg, #ede8e0 25%, #f5f0e8 50%, #ede8e0 75%);
      background-size: 200% 100%;
      animation: region-shimmer 1.4s infinite;
      border-radius: 50%;
    }
  `}</style>

  {regionsLoading ? (
    <div className="flex justify-center gap-6 flex-wrap">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <div className="region-shimmer" style={{ width: 80, height: 80 }} />
          <div className="region-shimmer rounded-full" style={{ width: 60, height: 10 }} />
        </div>
      ))}
    </div>
  ) : regionsError ? (
    <div className="text-center text-sm text-muted-foreground mb-12">{regionsError}</div>
  ) : (
    <>
      {/* Mobile Carousel */}
      <div className="block sm:hidden">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {regions.map((region) => {
              const to = `/collection/region/${region.slug || slugify(region.name || "")}`;
              return (
                <CarouselItem
                  key={String(region._id || region.id || region.slug || region.name)}
                  className="pl-3 basis-1/3"
                >
                  <Link to={to} className="cat-pill flex flex-col items-center gap-2">
                    <div className="cat-img-ring">
                      <div className="cat-img-inner w-[96px] h-[96px]">
                        <img
                          src={resolveImage(region.imageUrl || "/placeholder.svg")}
                          alt={region.name}
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <span className="cat-label w-20">{region.name}</span>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex justify-center gap-3 mt-7">
            <CarouselPrevious
              className="cat-nav-btn static translate-y-0"
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
            <CarouselNext
              className="cat-nav-btn static translate-y-0"
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
          </div>
        </Carousel>
      </div>

      {/* Desktop Grid — pill chips, same as categories */}
      <div className="hidden sm:flex flex-wrap justify-center gap-6 md:gap-8">
        {regions.map((region) => {
          const to = `/collection/region/${region.slug || slugify(region.name || "")}`;
          return (
            <Link
              key={String(region._id || region.id || region.slug || region.name)}
              to={to}
              className="cat-pill flex flex-col items-center gap-2"
            >
              <div className="cat-img-ring">
                <div className="cat-img-inner w-32 h-32 md:w-36 md:h-36">
                  <img
                    src={resolveImage(region.imageUrl || "/placeholder.svg")}
                    alt={region.name}
                    loading="lazy"
                  />
                </div>
              </div>
              <span className="cat-label w-32 md:w-36">{region.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  )}
</section>

   {/* Banner Section */}
  {/* Banner Section */}
 <section
  style={{ backgroundColor: '#F5F0E8' }}
  className="w-full py-6 md:py-8  "
 >
  <style>{`
    .na-section {
      --green:     #2d6a4f;
      --brown:     #6b4423;
      --brown-mid: #ba8c5c;
    }
    .na-reveal {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .na-reveal.na-in {
      opacity: 1;
      transform: translateY(0);
    }
    .na-d0 { transition-delay: 0.05s; }
    .na-d1 { transition-delay: 0.15s; }
    .na-d2 { transition-delay: 0.25s; }
    .na-d3 { transition-delay: 0.35s; }
    .na-eyebrow {
      display: inline-block;
      font-size: 11px; font-weight: 700;
      letter-spacing: 0.22em; text-transform: uppercase;
      color: #ba8c5c;
      background: rgba(107,68,35,0.08);
      padding: 4px 14px; border-radius: 20px;
      margin-bottom: 10px;
    }
    .na-title {
      font-size: clamp(1.9rem, 4.5vw, 3.2rem);
      font-weight: 900; letter-spacing: -0.03em; line-height: 1;
      color: #6b4423; margin-bottom: 10px;
    }
    .na-title span { color: #2d6a4f; }
    .na-underline {
      height: 4px; width: 60px; border-radius: 4px;
      background: linear-gradient(90deg, #2d6a4f, #ba8c5c);
      margin: 0 auto 10px;
    }
    @keyframes na-pop {
      0%   { transform: scale(0.7) rotate(-8deg); opacity: 0; }
      65%  { transform: scale(1.1) rotate(2deg);  opacity: 1; }
      100% { transform: scale(1) rotate(0deg);    opacity: 1; }
    }
    @keyframes na-star {
      0%, 100% { transform: scale(1) rotate(0deg); }
      50%       { transform: scale(1.35) rotate(20deg); }
    }
    .na-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: linear-gradient(135deg, #2d6a4f, #40916c);
      color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
      padding: 5px 14px; border-radius: 20px;
      box-shadow: 0 3px 12px rgba(45,106,79,0.35);
      opacity: 0;
    }
    .na-badge.na-in {
      animation: na-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards;
    }
    .na-star { display: inline-block; animation: na-star 1.8s ease-in-out infinite; }
    .na-nav-btn {
      width: 40px !important; height: 40px !important;
      border-radius: 50% !important;
      border: 1.5px solid rgba(107,68,35,0.18) !important;
      background: #fff !important;
      box-shadow: 0 2px 10px rgba(45,106,79,0.08) !important;
      transition: all 0.2s ease !important;
      position: static !important; transform: none !important;
    }
    .na-nav-btn:hover {
      border-color: #2d6a4f !important;
      box-shadow: 0 4px 18px rgba(45,106,79,0.2) !important;
      transform: scale(1.07) !important;
    }
    .na-nav-btn:active { transform: scale(0.92) !important; }
    .na-nav-btn:focus  { outline: none !important; }
    @keyframes na-shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .na-shimmer {
      background: linear-gradient(90deg,#ede8e0 25%,#f5f0e8 50%,#ede8e0 75%);
      background-size: 200% 100%;
      animation: na-shimmer 1.4s infinite;
    }
    .na-skel { background:#fff; border-radius:18px; overflow:hidden; box-shadow:0 2px 10px rgba(45,106,79,0.06); }
  `}</style>

  <div className="na-section px-4 md:px-8 pb-12" ref={naRef}>

    <div className={`text-center mb-4 sm:mb-6 na-reveal ${naVisible ? "na-in" : ""}`}>
      <span className="na-eyebrow">Just Landed</span>
      <h2 className="na-title">New <span>Arrivals</span></h2>
      <div className="na-underline" />
      <span className={`na-badge ${naVisible ? "na-in" : ""}`}>
        <span className="na-star">✦</span>
        Fresh this week
      </span>
    </div>

    {newArrivalsLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="na-skel">
            <div className="aspect-square na-shimmer" />
            <div className="p-4 space-y-3">
              <div className="h-3 rounded-full na-shimmer" />
              <div className="h-3 rounded-full na-shimmer w-3/4" />
              <div className="h-3 rounded-full na-shimmer w-1/2" />
            </div>
          </div>
        ))}
      </div>
    ) : newArrivalsError ? (
      <div className="text-center py-12 text-sm" style={{ color: '#a0a0a0' }}>
        {newArrivalsError}
      </div>
    ) : (
      <Carousel opts={{ align: "start", loop: true }} className="w-full">
        <div className="hidden sm:flex justify-end mb-4 gap-2">
          <CarouselPrevious
            className="na-nav-btn"
            onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
          />
          <CarouselNext
            className="na-nav-btn"
            onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
          />
        </div>

        <CarouselContent className="-ml-4 sm:-ml-5">
          {newArrivals.map((product, index) => {
            const card = mapToCard(product);
            const to = `/product/${card.id}`;
            const delay = `na-d${Math.min(index, 3)}`;
            return (
              <CarouselItem
                key={String(product._id || product.id)}
                className={`pl-4 sm:pl-5 basis-1/2 md:basis-1/3 lg:basis-1/4 na-reveal ${delay} ${naVisible ? "na-in" : ""}`}
              >
                <ProductCard {...card} to={to} />
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <div className="flex sm:hidden justify-center gap-3 mt-6">
          <CarouselPrevious
            className="na-nav-btn"
            onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
          />
          <CarouselNext
            className="na-nav-btn"
            onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
          />
        </div>
      </Carousel>
    )}
  </div>
</section>


  
      {/* From these categories */}
      <InfluencerSection />
      <InfluencerImageGrid />

      <div id="about-us">
        <AboutUsSection />
      </div>

           <div id="us">
            <WhyUsSection />
           </div>
     
      

         <FeatureSection/>
  
     
 <BlogSection/>

      <RecentReviewsSection />

      <Footer />
      {/* <PWAInstallPrompt /> */}
      <PostInstallExperience />
    
      <WhatsAppButton phoneNumber="+91 8295780500" />
    </div>
  );
};

export default Index;
