import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductQuantitySelector } from "@/components/ProductQuantitySelector"
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Ruler,
  ArrowRight,
  Banknote,
  Truck,
  RefreshCcw,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn, escapeHtml } from "@/lib/utils";
import { SizeChartModal } from "@/components/SizeChartModal";
import { SizeChartTableModal } from "@/components/SizeChartTableModal";
import { ReviewModal } from "@/components/ReviewModal";
import ReviewsList from "@/components/ReviewsList";
import { SimpleCoupon } from "@/components/SimpleCoupon";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { ShareButton } from "@/components/ShareButton";
import { useCouponRefresh } from "@/hooks/useCouponRefresh";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart } from "lucide-react";

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

type P = {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  image_url?: string;
  stock?: number;
  description?: string;
  paragraph1?: string;
  paragraph2?: string;
  longDescription?: string;
  highlights?: string[];
  specs?: Array<{ key: string; value: string }>;
  createdAt?: string;
  updatedAt?: string;
  sizes?: string[];
  trackInventoryBySize?: boolean;
  sizeInventory?: Array<{ code: string; label: string; qty: number }>;
  sizeChartUrl?: string;
  sizeChartTitle?: string;
  sizeChart?: {
    title?: string;
    rows?: Array<{ sizeLabel: string; chest: string; brandSize: string }>;
    guidelines?: string;
    diagramUrl?: string;
    fieldLabels?: Record<string, string>;
  };
  colors?: string[];
  colorImages?: Record<string, string[]>;
  colorVariants?: Array<{
    colorName: string;
    colorCode?: string;
    images: string[];
    primaryImageIndex?: number;
  }>;
  colorInventory?: Array<{ color: string; qty: number }>;
  discount?: { type: 'percentage' | 'flat'; value: number };
  sku?: string;
  slug?: string;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  averageRating?: number;
  reviewCount?: number;
  faq?: Array<{ question: string; answer: string }>;
  sizeFit?: {
    fit?: string;
    modelWearingSize?: string;
  };
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { refreshKey } = useCouponRefresh();
  const { add: addRecentlyViewed } = useRecentlyViewed();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<P | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const quantityOptions = useMemo(() => {
    const optionsSource = product?.quantityOptions || product?.sizeInventory || [];
    if (optionsSource.length === 0) return [];
    return optionsSource.map((item, index) => {
      const displayLabel = item.displayLabel || item.label || item.code || `${item.quantity || 1}${item.unit || 'g'}`;
      const price = item.price || Number(product.price) || 0;
      const originalPrice = item.originalPrice || Number(product.originalPrice) || undefined;
      const stock = item.stock || item.qty || 999;
      return {
        id: item.id || item.code || `option-${index}`,
        quantity: item.quantity || parseInt(item.code) || 1,
        unit: item.unit || 'g' as const,
        packSize: item.packSize || 1,
        displayLabel,
        price,
        originalPrice,
        stock,
        isActive: stock > 0,
        sortOrder: index
      };
    });
  }, [product]);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showSizeChartTable, setShowSizeChartTable] = useState(false);
  const [sizeStockError, setSizeStockError] = useState<string>("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "additional" | "faq" | "reviews">(
    typeof window !== 'undefined' && window.innerWidth >= 768 ? "description" : ""
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        if (!slug) throw new Error("Missing product identifier");
        const cacheBuster = Date.now();
        const { ok, json } = await api(`/api/products/${slug}?_t=${cacheBuster}`);
        if (!ok) throw new Error(json?.message || json?.error || "Failed to load product");
        if (!ignore) {
          const productData = json?.data as P;
          setProduct(productData);
          setSelectedSize("");
          const pid = productData._id || productData.id;
          if (pid) addRecentlyViewed({ id: String(pid), slug: productData.slug });
          setSelectedColors([]);
          setQuantity(1);
        }
      } catch (e: any) {
        if (!ignore) toast({ title: e?.message || "Failed to load product", variant: "destructive" });
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [slug, toast, addRecentlyViewed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  useEffect(() => {
    if (!product) {
      document.title = "uni10 - Premium Streetwear & Lifestyle";
      return;
    }
    const productTitle = product.title || product.name || "Product";
    const productPrice = Number(product.price || 0);
    const priceStr = productPrice.toLocaleString("en-IN");
    const pageTitle = product.seo?.title || `${productTitle} - ₹${priceStr} | uni10`;
    const description = product.seo?.description || product.description || `Shop ${productTitle} at uni10. Premium streetwear and lifestyle products.`;
    const imageUrl = resolveImage(product.image_url || (product.images?.[0] || ""));
    document.title = pageTitle;
    const setMeta = (sel: string, attr: string, val: string, content: string) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    setMeta('meta[name="description"]', "name", "description", description);
    if (product.seo?.keywords) setMeta('meta[name="keywords"]', "name", "keywords", product.seo.keywords);
    setMeta('meta[property="og:title"]', "property", "og:title", pageTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", description);
    setMeta('meta[property="og:image"]', "property", "og:image", imageUrl);
    setMeta('meta[property="og:type"]', "property", "og:type", "product");
    setMeta('meta[property="og:url"]', "property", "og:url", window.location.href);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", imageUrl);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", pageTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${window.location.origin}/products/${slug}`);
  }, [product, slug]);

  useEffect(() => {
    const checkVerifiedBuyer = async () => {
      if (!user || !product?._id && !product?.id) { setIsVerifiedBuyer(false); return; }
      try {
        const { ok, json } = await api("/api/orders/mine");
        if (!ok || !Array.isArray(json?.data)) { setIsVerifiedBuyer(false); return; }
        const productId = product._id || product.id;
        const hasPurchased = json.data.some((order: any) =>
          Array.isArray(order.items) && order.items.some((item: any) => String(item.productId || item.id) === String(productId))
        );
        setIsVerifiedBuyer(hasPurchased);
      } catch { setIsVerifiedBuyer(false); }
    };
    if (product) checkVerifiedBuyer();
  }, [user, product]);

  const img = useMemo(() => resolveImage(product?.image_url || (product?.images?.[0] || "")), [product]);
  const title = useMemo(() => product?.title || product?.name || "", [product]);

  const getCurrentStock = useCallback(() => {
    if (selectedColors.length > 0 && Array.isArray(product?.colorInventory)) {
      const selectedColorStocks = selectedColors.map(color => {
        const colorStock = product.colorInventory.find((c) => c.color === color);
        return colorStock?.qty ?? 0;
      });
      return Math.min(...selectedColorStocks);
    }
    if (Array.isArray(product?.quantityOptions) && selectedSize) {
      const selectedOption = product.quantityOptions.find((opt: any) => opt.id === selectedSize || opt.code === selectedSize);
      return selectedOption?.stock || selectedOption?.qty || 0;
    }
    if (product?.trackInventoryBySize && Array.isArray(product?.sizeInventory) && selectedSize) {
      const sizeInfo = product.sizeInventory.find((s) => s.code === selectedSize);
      return sizeInfo?.qty ?? 0;
    }
    return Number(product?.stock ?? 0);
  }, [product, selectedSize, selectedColors]);

  const stockNum = useMemo(() => getCurrentStock(), [getCurrentStock]);
  const outOfStock = stockNum === 0;

  const selectedSizeInfo = useMemo(() => {
    if (product?.trackInventoryBySize && Array.isArray(product?.sizeInventory) && selectedSize) {
      return product.sizeInventory.find((s) => s.code === selectedSize);
    }
    return null;
  }, [product, selectedSize]);

  const refetchProduct = useCallback(async () => {
    try {
      const productId = product?._id || product?.id;
      if (!productId) return;
      const cacheBuster = Date.now();
      const { ok, json } = await api(`/api/products/${productId}?_t=${cacheBuster}`);
      if (ok) setProduct(json?.data as P);
    } catch {}
  }, [product]);

  useEffect(() => {
    const onOrderPlaced = () => refetchProduct();
    window.addEventListener("order:placed", onOrderPlaced);
    return () => window.removeEventListener("order:placed", onOrderPlaced);
  }, [refetchProduct]);

  useEffect(() => {
    const handleProductCreated = () => refetchProduct();
    window.addEventListener("productCreated", handleProductCreated);
    return () => window.removeEventListener("productCreated", handleProductCreated);
  }, [refetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    const hasQuantityOptions = Array.isArray(product?.quantityOptions) && product.quantityOptions.length > 0;
    const usingSizeInventory = product?.trackInventoryBySize && Array.isArray(product?.sizeInventory);
    const requiresSelection = hasQuantityOptions || usingSizeInventory;
    if (requiresSelection && !selectedSize) {
      toast({ title: "Select an option", description: "Please choose a quantity option before adding to cart.", variant: "destructive" });
      return;
    }
    if (Array.isArray(product.colors) && product.colors.length > 0 && selectedColors.length === 0) {
      toast({ title: "Select colors", description: "Please choose at least one color before adding to cart.", variant: "destructive" });
      return;
    }
    let currentStock = product.stock ?? 0;
    let stockError = "";
    if (hasQuantityOptions && selectedSize) {
      const selectedOption = product.quantityOptions?.find((opt: any) => opt.id === selectedSize || opt.code === selectedSize);
      currentStock = selectedOption?.stock || selectedOption?.qty || 0;
      stockError = `Option ${selectedSize} is out of stock`;
    } else if (usingSizeInventory && selectedSize) {
      currentStock = product.sizeInventory?.find((s) => s.code === selectedSize)?.qty ?? 0;
      stockError = `Size ${selectedSize} is out of stock`;
    }
    if (currentStock === 0) {
      setSizeStockError(stockError || "Out of stock");
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }
    if (quantity > currentStock) {
      const errorMsg = `Only ${currentStock} available${usingSizeInventory && selectedSize ? ` for size ${selectedSize}` : ""}`;
      setSizeStockError(errorMsg);
      toast({ title: "Insufficient stock", description: errorMsg, variant: "destructive" });
      return;
    }
    setSizeStockError("");
    const itemsToAdd: any[] = [];
    let itemPrice = Number(product.price || 0);
    if (hasQuantityOptions && selectedSize) {
      const selectedOption = product.quantityOptions?.find((opt: any) => opt.id === selectedSize || opt.code === selectedSize);
      itemPrice = Number(selectedOption?.price) || itemPrice;
    }
    if (selectedColors.length > 0) {
      selectedColors.forEach(color => {
        const item: any = { id: String(product._id || product.id), title, price: itemPrice, image: img, meta: {} as any };
        if (selectedSize) item.meta.size = selectedSize;
        item.meta.color = color;
        itemsToAdd.push(item);
      });
    } else {
      const item: any = { id: String(product._id || product.id), title, price: itemPrice, image: img, meta: {} as any };
      if (selectedSize) item.meta.size = selectedSize;
      itemsToAdd.push(item);
    }
    if (!user) {
      try { localStorage.setItem("uni_add_intent", JSON.stringify({ items: itemsToAdd, qty: quantity })); } catch {}
      navigate("/auth");
      return;
    }
    itemsToAdd.forEach(item => addToCart(item, quantity));
    const colorText = selectedColors.length > 0 ? ` (${selectedColors.join(', ')})` : '';
    toast({ title: "Added to cart!", description: `${title}${colorText} has been added to your cart.` });
  };

  const handleBuyNow = () => {
    if (!product) return;
    const usingSizeInventory = product?.trackInventoryBySize && Array.isArray(product?.sizeInventory);
    if (usingSizeInventory && !selectedSize) {
      toast({ title: "Select a size", description: "Please choose a size before proceeding to checkout.", variant: "destructive" });
      return;
    }
    if (Array.isArray(product.colors) && product.colors.length > 0 && selectedColors.length === 0) {
      toast({ title: "Select colors", description: "Please choose at least one color before proceeding to checkout.", variant: "destructive" });
      return;
    }
    const currentStock = usingSizeInventory && selectedSize
      ? product.sizeInventory?.find((s) => s.code === selectedSize)?.qty ?? 0
      : product.stock ?? 0;
    if (currentStock === 0) {
      const errorMsg = usingSizeInventory && selectedSize ? `Size ${selectedSize} is out of stock` : "Out of stock";
      setSizeStockError(errorMsg);
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }
    const itemsToAdd: any[] = [];
    if (selectedColors.length > 0) {
      selectedColors.forEach(color => {
        const item: any = { id: String(product._id || product.id), title, price: Number(product.price || 0), image: img, meta: {} as any };
        if (selectedSize) item.meta.size = selectedSize;
        item.meta.color = color;
        itemsToAdd.push(item);
      });
    } else {
      const item: any = { id: String(product._id || product.id), title, price: Number(product.price || 0), image: img, meta: {} as any };
      if (selectedSize) item.meta.size = selectedSize;
      itemsToAdd.push(item);
    }
    if (!user) {
      try { localStorage.setItem("uni_add_intent", JSON.stringify({ items: itemsToAdd, qty: 1 })); } catch {}
      navigate("/auth");
      return;
    }
    itemsToAdd.forEach(item => addToCart(item, 1));
    navigate("/dashboard?checkout=true");
  };

  const colorToCss = (c: string) => c.toLowerCase().trim();

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
          <div className="animate-pulse">
            <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              <div className="aspect-square bg-gray-100 rounded-2xl" />
              <div className="space-y-5 pt-2">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-9 w-3/4 bg-gray-100 rounded" />
                <div className="h-7 w-28 bg-gray-100 rounded" />
                <div className="space-y-2 mt-4">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded" />
                </div>
                <div className="h-12 w-full bg-gray-100 rounded-xl mt-6" />
                <div className="h-12 w-full bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    document.title = "Product Not Found | uni10";
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3 text-gray-900">
              Product Not Found
            </h1>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-black text-white hover:bg-gray-800 rounded-full px-8">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <Navbar />

      <section className="w-full px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 pb-10">
        <div className="max-w-7xl mx-auto w-full">

          {/* Breadcrumb */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Shop
          </Link>

          {/* Main Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16">

            {/* Image Gallery */}
            <div className="order-1 md:order-1">
              <div className="sticky top-24">
                <ProductImageGallery
                  images={product?.images || []}
                  productTitle={title}
                  selectedColor={selectedColors[0] || ''}
                  colorImages={product?.colorImages}
                  colorVariants={product?.colorVariants}
                  productId={String(product?._id || product?.id)}
                  showWishlistButton={true}
                  showShareButton={true}
                  onWishlistClick={() => toggleWishlist(String(product?._id || product?.id))}
                  onShareClick={() => {
                    if (navigator.share) {
                      navigator.share({ title, text: `Check out this product: ${title}`, url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link copied!", description: "Product link copied to clipboard" });
                    }
                  }}
                  isInWishlist={isInWishlist(String(product?._id || product?.id))}
                />
              </div>
            </div>

            {/* Product Info Panel */}
            <div className="order-2 min-w-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-7">

                {/* Category Badge */}
                <span className="inline-block text-[10px] font-semibold tracking-widest uppercase text-gray-400 mb-3">
                  {product.category}
                </span>

                {/* Title */}
                <h2 className="text-xl sm:text-xl md:text-2xl font-black tracking-tight text-gray-900 leading-none mb-4">
                  {title}
                </h2>

                {/* Price + Rating Row */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  {Number(product?.price) > 0 && (
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        ₹{(() => {
                          const basePrice = Number(product.price);
                          let finalPrice = basePrice;
                          if (product?.discount?.value > 0 && product.discount.type === "percentage") {
                            finalPrice = basePrice - (basePrice * product.discount.value) / 100;
                          } else if (product?.discount?.value > 0 && product.discount.type === "flat") {
                            finalPrice = Math.max(0, basePrice - product.discount.value);
                          }
                          return Math.round(finalPrice).toLocaleString("en-IN");
                        })()}
                      </span>
                      {product?.discount?.value > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  )}
                  {/* Rating Pill */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1">
                      <span className="text-sm font-bold text-gray-900">{product?.averageRating || 4.2}</span>
                      <span className="text-emerald-500 text-xs">★</span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {(product?.reviewCount || 4500) >= 1000
                        ? `${((product?.reviewCount || 4500) / 1000).toFixed(1)}k`
                        : product?.reviewCount || 4500} ratings
                    </span>
                  </div>
                </div>

                {/* Info Badges */}
                {/* <div className=" mb-5">
                  {product.paragraph1 && (
                    <div className="flex items-center gap-2  rounded-lg px-3 py-2">
                      <svg className="w-3.5 h-3.5 text-red-500 shrink-0" viewBox="0 0 15 15" fill="currentColor">
                        <path d="M7.49991 0.879059C3.87771 0.879059 0.879059 3.87771 0.879059 7.49991C0.879059 11.1221 3.87771 14.1208 7.49991 14.1208C11.1221 14.1208 14.1208 11.1221 14.1208 7.49991C14.1208 3.87771 11.1221 0.879059 7.49991 0.879059ZM1.82737 7.49991C1.82737 4.40422 4.40422 1.82737 7.49991 1.82737C10.5956 1.82737 13.1724 4.40422 13.1724 7.49991C13.1724 10.5956 10.5956 13.1724 7.49991 13.1724C4.40422 13.1724 1.82737 10.5956 1.82737 7.49991ZM8.24991 4.24991C8.24991 3.8357 7.91422 3.49991 7.49991 3.49991C7.0857 3.49991 6.74991 3.8357 6.74991 4.24991V7.49991C6.74991 7.91412 7.0857 8.24991 7.49991 8.24991C7.91412 8.24991 8.24991 7.91412 8.24991 7.49991V4.24991ZM7.49991 9.74991C7.10287 9.74991 6.77259 10.0551 6.75017 10.4516L6.74991 10.5C6.74991 10.8971 7.05515 11.2274 7.45164 11.2498L7.49991 11.2499C7.89711 11.2499 8.22739 10.9447 8.24982 10.5482L8.24991 10.5C8.24991 10.1029 7.94467 9.77263 7.54818 9.75021L7.49991 9.74991Z" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-red-700 font-medium">{product.paragraph1}</p>
                    </div>
                  )}
                  {product.paragraph2 && (
                    <div className="flex items-center gap-2  rounded-lg px-3 py-2">
                      <svg className="w-3.5 h-3.5 text-gray-500 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2.5 2C2.22386 2 2 2.22386 2 2.5C2 2.77614 2.22386 3 2.5 3H3.12104L4.5 10.5H12.5L14 4.5H5L4.87896 3.81957C4.82128 3.52339 4.55871 3.31547 4.25 3.31547H2.5ZM5.12104 5.5H12.7639L11.7639 9.5H5.5L5.12104 5.5ZM5.5 12C4.67157 12 4 12.6716 4 13.5C4 14.3284 4.67157 15 5.5 15C6.32843 15 7 14.3284 7 13.5C7 12.6716 6.32843 12 5.5 12ZM11.5 12C10.6716 12 10 12.6716 10 13.5C10 14.3284 10.6716 15 11.5 15C12.3284 15 13 14.3284 13 13.5C13 12.6716 12.3284 12 11.5 12Z" fillRule="evenodd" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-gray-700 font-medium">{product.paragraph2}</p>
                    </div>
                  )}
                </div> */}
                 {product.paragraph1 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-red-800 mt-0.5">
                        <svg width="13" height="13" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.49991 0.879059C3.87771 0.879059 0.879059 3.87771 0.879059 7.49991C0.879059 11.1221 3.87771 14.1208 7.49991 14.1208C11.1221 14.1208 14.1208 11.1221 14.1208 7.49991C14.1208 3.87771 11.1221 0.879059 7.49991 0.879059ZM1.82737 7.49991C1.82737 4.40422 4.40422 1.82737 7.49991 1.82737C10.5956 1.82737 13.1724 4.40422 13.1724 7.49991C13.1724 10.5956 10.5956 13.1724 7.49991 13.1724C4.40422 13.1724 1.82737 10.5956 1.82737 7.49991ZM8.24991 4.24991C8.24991 3.8357 7.91422 3.49991 7.49991 3.49991C7.0857 3.49991 6.74991 3.8357 6.74991 4.24991V7.49991C6.74991 7.91412 7.0857 8.24991 7.49991 8.24991C7.91412 8.24991 8.24991 7.91412 8.24991 7.49991V4.24991ZM7.49991 9.74991C7.10287 9.74991 6.77259 10.0551 6.75017 10.4516L6.74991 10.5C6.74991 10.8971 7.05515 11.2274 7.45164 11.2498L7.49991 11.2499C7.89711 11.2499 8.22739 10.9447 8.24982 10.5482L8.24991 10.5C8.24991 10.1029 7.94467 9.77263 7.54818 9.75021L7.49991 9.74991Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                        </svg>
                      </span>
                      <p className="text-red-800 font-medium">{product.paragraph1}</p>
                    </div>
                  )}


                  {product.paragraph2 && (
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-gray-900 flex items-center">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M2.5 2C2.22386 2 2 2.22386 2 2.5C2 2.77614 2.22386 3 2.5 3H3.12104L4.5 10.5H12.5L14 4.5H5L4.87896 3.81957C4.82128 3.52339 4.55871 3.31547 4.25 3.31547H2.5ZM5.12104 5.5H12.7639L11.7639 9.5H5.5L5.12104 5.5ZM5.5 12C4.67157 12 4 12.6716 4 13.5C4 14.3284 4.67157 15 5.5 15C6.32843 15 7 14.3284 7 13.5C7 12.6716 6.32843 12 5.5 12ZM11.5 12C10.6716 12 10 12.6716 10 13.5C10 14.3284 10.6716 15 11.5 15C12.3284 15 13 14.3284 13 13.5C13 12.6716 12.3284 12 11.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                        </svg>
                      </span>
                      <p className="text-gray-900 font-medium">{product.paragraph2}</p>
                    </div>
                  )}
                <div className="h-px bg-gray-100 mb-5" />

                {/* Color Options */}
                {(() => {
                  const colorOptions = product?.colorVariants?.length > 0
                    ? product.colorVariants.map(cv => ({ name: cv.colorName, code: cv.colorCode }))
                    : product?.colors?.length > 0
                    ? product.colors.map(c => ({ name: c, code: undefined }))
                    : [];
                  return colorOptions.length > 0 ? (
                    <div className="mb-5">
                      <label className="block text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wider">
                        Color
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((colorOpt) => {
                          const c = colorOpt.name;
                          const colorStock = Array.isArray(product.colorInventory)
                            ? product.colorInventory.find(ci => ci.color === c)?.qty ?? 0
                            : Number(product.stock ?? 0);
                          const isOutOfStock = colorStock === 0;
                          const isSelected = selectedColors.includes(c);
                          return (
                            <label
                              key={c}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer",
                                isOutOfStock
                                  ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400"
                                  : isSelected
                                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isOutOfStock}
                                onChange={() => {
                                  setSelectedColors((prev) =>
                                    prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]
                                  );
                                }}
                                className="sr-only"
                              />
                              <span
                                className="h-3 w-3 rounded-full border border-white shadow-sm shrink-0"
                                style={{ backgroundColor: colorOpt.code ? colorOpt.code : colorToCss(c) }}
                              />
                              {c}
                              {isOutOfStock && <span className="text-[10px] opacity-60">OOS</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Size — tracked inventory */}
                {product?.trackInventoryBySize && Array.isArray(product?.sizeInventory) && product.sizeInventory.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Size</label>
                      {product.sizeChart ? (
                        <button type="button" onClick={() => setShowSizeChartTable(true)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 transition-colors">
                          <Ruler className="h-3 w-3" />Size Chart
                        </button>
                      ) : product.sizeChartUrl && (
                        <button type="button" onClick={() => setShowSizeChart(true)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 transition-colors">
                          <Ruler className="h-3 w-3" />Size Chart
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizeInventory.map((sizeItem) => {
                        const isOutOfStock = sizeItem.qty === 0;
                        const isLowStock = sizeItem.qty > 0 && sizeItem.qty <= 3;
                        return (
                          <div key={sizeItem.code} className="relative">
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => { setSelectedSize(sizeItem.code); setSizeStockError(""); }}
                              className={cn(
                                "relative px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all min-w-[44px] text-center",
                                isOutOfStock
                                  ? "opacity-40 cursor-not-allowed bg-gray-50 border-gray-100 text-gray-400"
                                  : selectedSize === sizeItem.code
                                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                              )}
                            >
                              {sizeItem.label}
                              {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-full h-px bg-gray-400 rotate-[-20deg]" />
                                </div>
                              )}
                            </button>
                            {isLowStock && !isOutOfStock && (
                              <span className="block text-[10px] text-orange-500 font-semibold text-center mt-1">
                                {sizeItem.qty} left
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {sizeStockError && <p className="text-xs text-red-500 mt-2">{sizeStockError}</p>}
                  </div>
                )}

                {/* Simple sizes */}
                {!product?.trackInventoryBySize && Array.isArray(product?.sizes) && product.sizes.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Size</label>
                      {product.sizeChart ? (
                        <button type="button" onClick={() => setShowSizeChartTable(true)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 transition-colors">
                          <Ruler className="h-3 w-3" />Size Chart
                        </button>
                      ) : product.sizeChartUrl && (
                        <button type="button" onClick={() => setShowSizeChart(true)} className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 transition-colors">
                          <Ruler className="h-3 w-3" />Size Chart
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => { setSelectedSize(sz); setSizeStockError(""); }}
                          className={cn(
                            "px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all min-w-[44px]",
                            selectedSize === sz
                              ? "bg-gray-900 text-white border-gray-900"
                              : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                          )}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Options */}
                {product?.sizeInventory && product.sizeInventory.length > 0 && (
                  <ProductQuantitySelector
                    options={product.sizeInventory.map((item, index) => ({
                      id: item.code,
                      quantity: parseInt(item.code) || 1,
                      unit: 'ml' as const,
                      packSize: 1,
                      displayLabel: item.code,
                      price: Number(product.price) || 0,
                      originalPrice: Number(product.originalPrice) || undefined,
                      stock: item.qty,
                      isActive: item.qty > 0,
                      sortOrder: index
                    }))}
                    selectedOption={selectedSize}
                    onSelectionChange={(optionId) => { setSelectedSize(optionId); setSizeStockError(""); }}
                    disabled={false}
                  />
                )}
                {quantityOptions && quantityOptions.length > 0 && (
                  <ProductQuantitySelector
                    options={quantityOptions.map((option, index) => ({
                      id: option.id,
                      quantity: option.quantity || 1,
                      unit: option.unit || 'ml' as const,
                      packSize: option.packSize || 1,
                      displayLabel: option.displayLabel,
                      price: option.price || 0,
                      originalPrice: option.originalPrice,
                      stock: option.stock || 999,
                      isActive: true,
                      sortOrder: index
                    }))}
                    selectedOption={selectedSize}
                    onSelectionChange={(optionId) => { setSelectedSize(optionId); setSizeStockError(""); }}
                    disabled={false}
                  />
                )}

                {/* Quantity Selector */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-700 mb-2.5 uppercase tracking-wider">
                    Quantity
                  </label>
                  <div className="flex items-center gap-0 border border-gray-200 rounded-xl w-fit overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="h-10 w-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors text-lg font-light border-r border-gray-200"
                    >
                      −
                    </button>
                    <span className="h-10 w-12 flex items-center justify-center font-semibold text-sm text-gray-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="h-10 w-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors text-lg font-light border-l border-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2.5 mb-5">
                  <Button
                    size="lg"
                    className="w-full h-12 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={outOfStock}
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    {outOfStock ? "Out of Stock" : "Add to Cart"}
                  </Button>
                  {!outOfStock && (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full h-12 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white text-sm font-semibold rounded-xl transition-all duration-200"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                  )}
                </div>

                {/* Coupon */}
                <SimpleCoupon
                  onUseNow={(code) => navigate(`/cart?coupon=${encodeURIComponent(code)}`)}
                  productPrice={Number(product.price ?? 0)}
                />

                {/* Trust Badges */}
                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-gray-100 pt-5">
                  {[
                    { icon: <Banknote className="w-4 h-4" />, label: "Cash on Delivery" },
                    { icon: <Truck className="w-4 h-4" />, label: "Free Shipping" },
                    { icon: <RefreshCcw className="w-4 h-4" />, label: "Easy Returns" },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                        {icon}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 leading-tight uppercase tracking-wide">{label}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* Info Tabs Section */}
          <div className="max-w-7xl mx-auto w-full mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Mobile Accordion */}
            <div className="md:hidden divide-y divide-gray-100">
              {[
                {
                  id: "description",
                  label: "Description",
                  content: product?.longDescription ? (
                    <p className="text-xs text-gray-600 leading-7 whitespace-pre-wrap break-words">
                      {escapeHtml(product.longDescription)}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6">No description available.</p>
                  )
                },
                ...(product?.highlights?.length || product?.specs?.length ? [{
                  id: "additional",
                  label: "Product Details",
                  content: (
                    <div className="space-y-4">
                      {product?.highlights?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Key Features</h4>
                          <ul className="space-y-1.5">
                            {product.highlights.map((h, i) => (
                              <li key={i} className="flex gap-2 text-xs text-gray-600">
                                <span className="text-gray-900 font-bold mt-0.5">·</span>{h}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {product?.specs?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Specifications</h4>
                          <div className="divide-y divide-gray-100">
                            {product.specs.map((s, i) => (
                              <div key={i} className="flex justify-between py-2">
                                <span className="text-xs font-medium text-gray-700">{s.key}</span>
                                <span className="text-xs text-gray-500">{s.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                }] : []),
                ...(product?.faq?.length > 0 ? [{
                  id: "faq",
                  label: `FAQ (${product.faq.length})`,
                  content: (
                    <div className="space-y-2">
                      {product.faq.map((faq, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                            className="w-full text-left px-4 py-3 bg-gray-50 flex items-center justify-between gap-2"
                          >
                            <span className="text-xs font-medium text-gray-900">{faq.question}</span>
                            <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform", openFaqIndex === idx && "rotate-180")} />
                          </button>
                          {openFaqIndex === idx && (
                            <div className="px-4 py-3 bg-white">
                              <p className="text-xs text-gray-600 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                }] : []),
                {
                  id: "reviews",
                  label: `Reviews (${product?.reviewCount || 0})`,
                  content: (
                    <ReviewsList
                      productId={String(product?._id || product?.id)}
                      reviewKey={reviewKey}
                      isVerifiedBuyer={isVerifiedBuyer}
                      onReviewSubmitted={() => { setReviewKey((prev) => prev + 1); refetchProduct(); }}
                    />
                  )
                }
              ].map(({ id, label, content }) => (
                <div key={id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(activeTab === id ? "" : id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-gray-800">{label}</span>
                    <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform duration-200", activeTab === id && "rotate-180")} />
                  </button>
                  {activeTab === id && (
                    <div className="px-5 pb-5">
                      {content}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Tab Layout */}
            <div className="hidden md:flex">
              {/* Sidebar Tabs */}
              <div className="w-48 lg:w-56 border-r border-gray-100 p-4 shrink-0">
                <div className="space-y-1 sticky top-28">
                  {[
                    { id: "description", label: "Description" },
                    ...((product?.highlights?.length || product?.specs?.length) ? [{ id: "additional", label: "Product Details" }] : []),
                    ...(product?.faq?.length > 0 ? [{ id: "faq", label: `FAQ (${product.faq.length})` }] : []),
                    { id: "reviews", label: `Reviews (${product?.reviewCount || 0})` },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id as any)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between group",
                        activeTab === id
                          ? "bg-gray-900 text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {label}
                      <ArrowRight className={cn("h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity", activeTab === id && "opacity-100")} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-6 sm:p-8 min-w-0">
                {activeTab === "description" && (
                  <div ref={descriptionRef} className="animate-in fade-in duration-200">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 mb-1">Product Description</h3>
                    <div className="h-0.5 w-10 bg-gray-900 rounded-full mb-5" />
                    {product?.longDescription ? (
                      <p className="text-sm text-gray-600 leading-8 whitespace-pre-wrap break-words max-w-2xl">
                        {escapeHtml(product.longDescription)}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-400">No description available</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "additional" && (
                  <div className="animate-in fade-in duration-200 space-y-8">
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900 mb-1">Additional Information</h3>
                      <div className="h-0.5 w-10 bg-gray-900 rounded-full mb-5" />
                    </div>
                    {product?.highlights?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Key Features</h4>
                        <ul className="space-y-2.5">
                          {product.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-gray-900 shrink-0" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product?.specs?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Specifications</h4>
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full">
                            <tbody className="divide-y divide-gray-100">
                              {product.specs.map((spec, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-800 w-2/5">{spec.key}</td>
                                  <td className="px-5 py-3.5 text-xs text-gray-600">{spec.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "faq" && product?.faq?.length > 0 && (
                  <div className="animate-in fade-in duration-200">
                    <h3 className="text-xl font-black tracking-tight text-gray-900 mb-1">Frequently Asked Questions</h3>
                    <div className="h-0.5 w-10 bg-gray-900 rounded-full mb-5" />
                    <div className="space-y-2 max-w-2xl">
                      {product.faq.map((item, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                          <div key={index} className="border border-gray-100 rounded-xl overflow-hidden">
                            <button
                              type="button"
                              onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                              className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                            >
                              <span className="text-sm font-semibold text-gray-900">{item.question}</span>
                              <ChevronDown className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
                            </button>
                            <div className={cn("transition-all duration-200 ease-in-out overflow-hidden", isOpen ? "max-h-96" : "max-h-0")}>
                              <div className="px-5 pb-5 pt-0 border-t border-gray-100">
                                <p className="text-sm text-gray-600 leading-relaxed pt-4">{item.answer}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div className="animate-in fade-in duration-200">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black tracking-tight text-gray-900">Customer Reviews</h3>
                      {product?.reviewCount > 0 && (
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                          {product.reviewCount}
                        </span>
                      )}
                    </div>
                    <div className="h-0.5 w-10 bg-gray-900 rounded-full mb-5" />
                    <ReviewsList key={product?._id || product?.id || ""} productId={product?._id || product?.id || ""} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recently Viewed & Related */}
          <div className="max-w-7xl mx-auto w-full mt-8 space-y-8">
            <RecentlyViewed excludeProductId={product?._id || product?.id || ""} />
            <RelatedProducts productId={product?._id || product?.id || ""} />
          </div>

        </div>
      </section>

      {/* Modals */}
      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        productId={product?._id || product?.id || ""}
        onSuccess={() => setReviewKey((prev) => prev + 1)}
      />
      <SizeChartModal
        open={showSizeChart}
        onOpenChange={setShowSizeChart}
        title={product?.sizeChartTitle || "Size Chart"}
        chartUrl={product?.sizeChartUrl}
      />
      <SizeChartTableModal
        open={showSizeChartTable}
        onOpenChange={setShowSizeChartTable}
        title={product?.sizeChart?.title || `${title} • Size Chart`}
        rows={product?.sizeChart?.rows}
        guidelines={product?.sizeChart?.guidelines}
        diagramUrl={product?.sizeChart?.diagramUrl}
        fieldLabels={product?.sizeChart?.fieldLabels}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;