import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RunningText } from "@/components/RunningText";
import { ProductCard } from "@/components/ProductCard";
import { FeatureRow } from "@/components/FeatureRow";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
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
import FAQSection from "@/components/FAQSection";
import BestSellerSection from "@/components/BestSellerSection";

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
  category?: string;
  images?: string[];
  image_url?: string;
  slug?: string;
  createdAt?: string;
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
  reviews?: Array<{
    id: string;
    username: string;
    email: string;
    rating: number;
    text: string;
    status: string;
    createdAt: string;
  }>;
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
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);

        const url = "/api/products?featured=true&active=all";
        homeLog("[Index] Featured: request", { url });
        const { ok, status, json } = await api(url);
        homeLog("[Index] Featured: response", {
          url,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(json?.message || json?.error || "Failed to load");

        const list = Array.isArray(json?.data)
          ? (json.data as ProductRow[])
          : [];

        if (!Array.isArray(json?.data)) {
          homeWarn("[Index] Featured: json.data is not an array", { url, json });
        }
        homeLog("[Index] Featured: mapped list length", { len: list.length });
        if (!ignore) setFeaturedProducts(list);
      } catch (e: any) {
        homeError("[Index] Featured: error", e);
        if (!ignore)
          setFeaturedError(e?.message || "Failed to load featured products");
      } finally {
        if (!ignore) setFeaturedLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Fetch New Arrivals
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setNewArrivalsLoading(true);
        setNewArrivalsError(null);

        const limit = 12;
        const url = `/api/products?sort=createdAt:desc&limit=${limit}&active=all`;
        homeLog("[Index] NewArrivals: request", { url });
        const { ok, status, json } = await api(url);
        homeLog("[Index] NewArrivals: response", {
          url,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(json?.message || json?.error || "Failed to load");

        let list = Array.isArray(json?.data)
          ? (json.data as ProductRow[])
          : [];

        if (!Array.isArray(json?.data)) {
          homeWarn("[Index] NewArrivals: json.data is not an array", {
            url,
            json,
          });
        }
        homeLog("[Index] NewArrivals: list before sort", {
          len: list.length,
          sampleCreatedAt: list[0]?.createdAt,
        });
        list = list.sort((a, b) => {
          const da = new Date(a.createdAt || "").getTime();
          const db = new Date(b.createdAt || "").getTime();
          return db - da;
        });

        homeLog("[Index] NewArrivals: list after sort", {
          len: list.length,
          firstCreatedAt: list[0]?.createdAt,
        });
        if (!ignore) setNewArrivals(list.slice(0, limit));
      } catch (e: any) {
        homeError("[Index] NewArrivals: error", e);
        if (!ignore)
          setNewArrivalsError(e?.message || "Failed to load new arrivals");
      } finally {
        if (!ignore) setNewArrivalsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Fetch categories + products for each category (parallel)
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setCatsLoading(true);
        setCatsError(null);

        const catsUrl = "/api/categories";
        homeLog("[Index] Categories: request", { url: catsUrl });
        const { ok, status, json } = await api(catsUrl);
        homeLog("[Index] Categories: response", {
          url: catsUrl,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(
            json?.message || json?.error || "Failed to load categories"
          );

        const list = Array.isArray(json?.data)
          ? (json.data as CategoryRow[])
          : [];

        const subcategories = list.filter(cat => cat.parent !== null);
        if (HOME_DEBUG) {
          const parentNull = list.filter((c) => c.parent === null).length;
          const parentNotNull = subcategories.length;
          homeLog("[Index] Categories: parent stats", {
            total: list.length,
            parentNull,
            parentNotNull,
          });
          if (parentNotNull === 0 && list.length > 0) {
            homeWarn(
              "[Index] Categories: 0 subcategories found (parent !== null). The carousel will be empty with current logic.",
              { total: list.length, parentNull }
            );
          }
        }
        if (!ignore) setCats(subcategories);

        setMixedLoading(true);
        setMixedError(null);

        const catIds = subcategories.map((cat) => cat.slug || cat.name || "");
        homeLog("[Index] Categories: catIds for product lookup", {
          len: catIds.length,
          sample: catIds.slice(0, 5),
        });
        const productPromises = catIds.map((catId) =>
          api(`/api/products?category=${encodeURIComponent(catId)}&limit=1`)
        );

        const results = await Promise.all(productPromises);
        const catMap = new Map<string, ProductRow>();

        results.forEach((res, index) => {
          if (res.ok) {
            const products = Array.isArray(res.json?.data)
              ? (res.json.data as ProductRow[])
              : [];
            if (products.length > 0) {
              catMap.set(catIds[index], products[0]);
            }
          } else if (HOME_DEBUG) {
            homeWarn("[Index] Category product lookup failed", {
              catId: catIds[index],
              status: res.status,
              message: res.json?.message || res.json?.error,
            });
          }
        });
        homeLog("[Index] Categories: categoryProducts map size", {
          size: catMap.size,
        });

        const preUrl = "/api/products?limit=200";
        homeLog("[Index] Mixed: preload request", { url: preUrl });
        const pre = await api(preUrl);
        homeLog("[Index] Mixed: preload response", {
          url: preUrl,
          ok: pre.ok,
          status: pre.status,
          dataType: Array.isArray(pre.json?.data) ? "array" : typeof pre.json?.data,
          dataLen: Array.isArray(pre.json?.data) ? pre.json.data.length : undefined,
          message: pre.json?.message || pre.json?.error,
        });
        if (!pre.ok)
          throw new Error(
            pre.json?.message || pre.json?.error || "Failed to load products"
          );

        const productsAll = Array.isArray(pre.json?.data)
          ? (pre.json.data as ProductRow[])
          : [];
        if (!Array.isArray(pre.json?.data)) {
          homeWarn("[Index] Mixed: pre.json.data is not an array", {
            url: preUrl,
            json: pre.json,
          });
        }

        const catNames = new Set<string>(catIds);
        const filtered = productsAll.filter(
          (p) => p.category && catNames.has(String(p.category))
        );
        const enriched = filtered.length ? filtered : productsAll;
        homeLog("[Index] Mixed: filter stats", {
          all: productsAll.length,
          filtered: filtered.length,
          enriched: enriched.length,
          catIds: catIds.length,
        });

        const mixed = enriched
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          )
          ;

        if (!ignore) {
          setCategoryProducts(catMap);
          setMixedProducts(mixed);
        }
      } catch (e: any) {
        homeError("[Index] Categories/Mixed: error", e);
        if (!ignore) {
          setCatsError(e?.message || "Failed to load categories");
          setMixedError(e?.message || "Failed to load products");
          setCats([]);
          setMixedProducts([]);
          setCategoryProducts(new Map());
        }
      } finally {
        if (!ignore) {
          setCatsLoading(false);
          setMixedLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch regions
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setRegionsLoading(true);
        setRegionsError(null);

        const regionsUrl = "/api/regions";
        homeLog("[Index] Regions: request", { url: regionsUrl });
        const { ok, status, json } = await api(regionsUrl);
        homeLog("[Index] Regions: response", {
          url: regionsUrl,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(
            json?.message || json?.error || "Failed to load regions"
          );

        const list = Array.isArray(json?.data)
          ? (json.data as any[])
          : [];

        if (!ignore) setRegions(list);
      } catch (e: any) {
        console.error("Failed to load regions:", e);
        if (!ignore) {
          setRegionsError(e?.message || "Failed to load regions");
          setRegions([]);
        }
      } finally {
        if (!ignore) setRegionsLoading(false);
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
    const discountedPrice = Math.round(originalPrice * 0.8); // 20% discount for demonstration
    // Calculate rating from actual reviews
    let rating = "0.0";
    if (p.reviews && p.reviews.length > 0) {
      const totalRating = p.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      rating = (totalRating / p.reviews.length).toFixed(1);
    }

    return {
      id,
      name: title,
      price: originalPrice,
      image: img,
      category: p.category || "",
      slug: p.slug || "",
      images: Array.isArray(p.images) ? p.images : [],
      discountedPrice: discountedPrice,
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
      <RunningText />

      {/* Ticker line – header ke niche */}

      {/* Product Slider Section */}
      {/* <ProductSlider className="pt-24" /> */}
    

      {/* Featured Products */}
      <section className="bg-[#faf3eb] py-8 sm:py-16 lg:py-12 mt-16">
  <div className="container mx-auto px-4 sm:px-6">
    {/* Header */}
    <div className="flex items-center mb-12 justify-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center">
        <span className="text-black">Collection</span>
      </h2>
    </div>

    {featuredLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    ) : featuredError ? (
      <div className="text-center py-12 text-gray-500">
        {featuredError}
      </div>
    ) : (
      <div className="relative">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4 sm:-ml-6">
            {(featuredProducts.length
              ? featuredProducts
              : newArrivals
            ).map((product) => {
              const card = mapToCard(product);
              const to = `/product/${card.id}`;
              return (
                <CarouselItem
                  key={String(product._id || product.id)}
                  className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard {...card} to={to} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {/* Navigation Buttons - Desktop */}
          <div className="hidden sm:flex gap-2 absolute -top-[72px] right-0">
            <CarouselPrevious 
              className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
              onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
            <CarouselNext 
              className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
              onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
          </div>
          
          {/* Navigation Buttons - Mobile */}
          <div className="flex sm:hidden justify-center gap-2 mt-6">
            <CarouselPrevious 
              className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
            <CarouselNext 
              className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
            />
          </div>
        </Carousel>
      </div>
    )}
  </div>
</section>

      {/* Categories grid with product showcase */}
        <section className="bg-[#FFF8E1] mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-6 sm:pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Shop By Categories
          </h2>
        </div>

        {catsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 mb-8 sm:mb-12 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : catsError ? (
          <div className="text-center text-sm text-muted-foreground mb-12">
            {catsError}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
            {topCats.slice(0, 8).map((c) => {
              const catId = c.slug || c.name || "";
              const prod = categoryProducts.get(catId);
              const to = `/collection/${c.slug || slugify(c.name || "")}`;

              return (
                <Link
                  key={String(c._id || c.id || c.slug || c.name)}
                  to={to}
                  className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 group"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl bg-primary-foreground flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 group-hover:shadow-lg">
                    <img
                      src={resolveImage(c.imageUrl || "/placeholder.svg")}
                      alt={c.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-2">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Shop By Region */}
      <section className="bg-[#faf3eb] mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-6 sm:pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Shop By Region
          </h2>
        </div>

        {regionsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8 sm:mb-12 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : regionsError ? (
          <div className="text-center text-sm text-muted-foreground mb-12">
            {regionsError}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {regions.slice(0, 6).map((region) => {
              const to = `/collection/region/${region.slug || slugify(region.name || "")}`;

              return (
                <Link
                  key={String(region._id || region.id || region.slug || region.name)}
                  to={to}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    {/* Torn edge effect using clip-path */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 opacity-40"></div>
                    
                    {/* Decorative torn edges */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-200 to-transparent opacity-60"></div>
                    <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-transparent via-amber-200 to-transparent opacity-60"></div>
                    <div className="absolute right-0 top-0 w-2 h-full bg-gradient-to-b from-transparent via-orange-200 to-transparent opacity-60"></div>
                    
                    {/* Circular stamp in corner */}
                    <div className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-red-500 bg-red-50 flex items-center justify-center opacity-80">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-red-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">✓</span>
                      </div>
                    </div>
                    
                    {/* Postmark style cancellation lines */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-red-300 opacity-30 rotate-45"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-red-300 opacity-30 -rotate-45"></div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center h-32">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/80 flex items-center justify-center mb-3 border-2 border-amber-300 shadow-sm">
                        <img
                          src={resolveImage(region.imageUrl || "/placeholder.svg")}
                          alt={region.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                        />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-center text-gray-800 group-hover:text-red-600 transition-colors">
                        {region.name}
                      </h3>
                      <p className="text-xs text-gray-600 text-center mt-1 font-medium">Authentic</p>
                      <p className="text-xs text-gray-500 text-center">Products</p>
                    </div>
                    
                    {/* Vintage postcard texture overlay */}
                    <div className="absolute inset-0 opacity-20 mix-blend-multiply">
                      <div className="w-full h-full bg-gradient-to-br from-transparent via-amber-200 to-transparent"></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

   {/* Banner Section */}
  {/* Banner Section */}

      

      {/* New Arrivals */}
      <section className="bg-[#faf3eb] container mx-auto px-4 py-12 md:py-12 bg-white rounded-xl shadow-sm">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            New Arrivals
          </h2>
         
        </div>

        {newArrivalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : newArrivalsError ? (
          <div className="text-center py-12 text-destructive-foreground">
            {newArrivalsError}
          </div>
        ) : (
          <div className="relative">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4 sm:-ml-6">
                {newArrivals.map((product) => {
                  const card = mapToCard(product);
                  const to = `/product/${card.id}`;
                  return (
                    <CarouselItem
                      key={String(product._id || product.id)}
                      className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <ProductCard {...card} to={to} />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              
              {/* Navigation Buttons - Desktop */}
              <div className="hidden sm:flex gap-2 absolute -top-[72px] right-0">
                <CarouselPrevious 
                  className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
                  onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
                />
                <CarouselNext 
                  className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
                  onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
                />
              </div>
              
              {/* Navigation Buttons - Mobile */}
              <div className="flex sm:hidden justify-center gap-2 mt-6">
                <CarouselPrevious 
                  className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
                  onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
                />
                <CarouselNext 
                  className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] hover:bg-white hover:shadow-xl transition-all duration-200 shadow-md focus:outline-none focus:ring-0 active:scale-90 active:bg-gray-100 active:border-[#ba8c5c]" 
                  onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)}
                />
              </div>
            </Carousel>
            
            <div className="text-center mt-10 md:mt-16">
              <Link
                to="/shop/new-arrivals"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-gray-900 transition-colors group"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Best Seller Section */}
      <BestSellerSection />

  
      {/* From these categories */}
      <InfluencerSection />
      <InfluencerImageGrid />

      <AboutUsSection />
      <WhyUsSection />

      <FeatureSection />

      <RecentReviewsSection />

      <Footer />
      <PWAInstallPrompt />
      <WhatsAppButton phoneNumber="+91 7355818140" />
    </div>
  );
};

export default Index;
