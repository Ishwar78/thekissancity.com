import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ProductQuantitySelector, QuantityOption } from "@/components/ProductQuantitySelector";

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
  
  // New quantity/pack/unit structure
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
  const { refreshKey } = useCouponRefresh(); // Use global refreshKey
  const { add: addRecentlyViewed } = useRecentlyViewed();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<P | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedQuantityOption, setSelectedQuantityOption] = useState<string>("");
  // ✅ NEW: selected colors (array for multi-selection)
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
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

  // ✅ Product fast fetch – Fetch by slug or ID
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);

        if (!slug) {
          throw new Error("Missing product identifier");
        }

        // ✅ Always use /api/products/:idOrSlug with cache-busting
        // Backend khud decide karega ki yeh ID hai ya slug
        const cacheBuster = Date.now();
        const { ok, json } = await api(`/api/products/${slug}?_t=${cacheBuster}`);

        if (!ok) {
          throw new Error(json?.message || json?.error || "Failed to load product");
        }

        if (!ignore) {
          const productData = json?.data as P;

        setProduct(productData);
        setSelectedQuantityOption(""); // product change pe quantity option reset
        console.log("Product data loaded:", productData);

        // Add to recently viewed (localStorage)
        const pid = productData._id || productData.id;
        if (pid) {
          addRecentlyViewed({
            id: String(pid),
            slug: productData.slug,
          });
        }

        // Don't auto-select color - let user choose manually
        setSelectedColors([]);
        setQuantity(1);
        }
      } catch (e: any) {
        if (!ignore) {
          toast({
            title: e?.message || "Failed to load product",
            variant: "destructive",
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [slug, toast, addRecentlyViewed]);

  // ✅ Scroll top on product change (UX smooth)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  // ✅ Dynamic meta tags for social sharing (SEO + shareable URLs)
  useEffect(() => {
    if (!product) {
      document.title = "uni10 - Premium Streetwear & Lifestyle";
      return;
    }

    const productTitle = product.title || product.name || "Product";
    const productPrice = Number(product.price || 0);
    const priceStr = productPrice.toLocaleString("en-IN");

    // Use SEO title if available, otherwise use default format
    const pageTitle = product.seo?.title || `${productTitle} - ₹${priceStr} | uni10`;

    // Use SEO description if available, otherwise use product description
    const description = product.seo?.description || product.description || `Shop ${productTitle} at uni10. Premium streetwear and lifestyle products.`;
    const imageUrl = resolveImage(product.image_url || (product.images?.[0] || ""));

    // Update page title
    document.title = pageTitle;

    // Update or create meta description
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute("content", description);

    // Update or create meta keywords if SEO keywords are provided
    if (product.seo?.keywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement("meta");
        keywordsMeta.setAttribute("name", "keywords");
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute("content", product.seo.keywords);
    }

    // Update or create OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", pageTitle);

    // Update or create OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", description);

    // Update or create OG image
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", imageUrl);

    // Update or create OG type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement("meta");
      ogType.setAttribute("property", "og:type");
      document.head.appendChild(ogType);
    }
    ogType.setAttribute("content", "product");

    // Update or create OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", window.location.href);

    // Update or create canonical link for SEO
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/products/${slug}`);

    // Update Twitter card image
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImage) {
      twitterImage = document.createElement("meta");
      twitterImage.setAttribute("name", "twitter:image");
      document.head.appendChild(twitterImage);
    }
    twitterImage.setAttribute("content", imageUrl);

    // Update Twitter title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement("meta");
      twitterTitle.setAttribute("name", "twitter:title");
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute("content", pageTitle);

    // Update Twitter description
    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDesc) {
      twitterDesc = document.createElement("meta");
      twitterDesc.setAttribute("name", "twitter:description");
      document.head.appendChild(twitterDesc);
    }
    twitterDesc.setAttribute("content", description);
  }, [product, slug]);

  // ✅ Verified buyer check (runs AFTER product shown – does not block UI)
  useEffect(() => {
    const checkVerifiedBuyer = async () => {
      if (!user || !product?._id && !product?.id) {
        setIsVerifiedBuyer(false);
        return;
      }

      try {
        const { ok, json } = await api("/api/orders/mine");
        if (!ok || !Array.isArray(json?.data)) {
          setIsVerifiedBuyer(false);
          return;
        }

        const productId = product._id || product.id;
        const hasPurchased = json.data.some(
          (order: any) =>
            Array.isArray(order.items) &&
            order.items.some(
              (item: any) =>
                String(item.productId || item.id) === String(productId)
            )
        );

        setIsVerifiedBuyer(hasPurchased);
      } catch {
        setIsVerifiedBuyer(false);
      }
    };

    // Sirf tab run kare jab product change ho
    if (product) {
      checkVerifiedBuyer();
    }
  }, [user, product]);

  const img = useMemo(
    () =>
      resolveImage(
        product?.image_url || (product?.images?.[0] || "")
      ),
    [product]
  );
  const title = useMemo(
    () => product?.title || product?.name || "",
    [product]
  );

  // Get stock based on quantity options, per-size inventory, color inventory, or general stock
  const getCurrentStock = useCallback(() => {
    // Check quantity options first (new structure)
    if (selectedQuantityOption && Array.isArray(product?.quantityOptions)) {
      const selectedOption = product.quantityOptions.find(
        (option) => option.id === selectedQuantityOption
      );
      return selectedOption?.stock ?? 0;
    }

    // Check color inventory if color-wise stock tracking is enabled
    if (selectedColors.length > 0 && Array.isArray(product?.colorInventory)) {
      // For multi-color selection, return the minimum stock among selected colors
      const selectedColorStocks = selectedColors.map(color => {
        const colorStock = product.colorInventory.find(
          (c) => c.color === color
        );
        return colorStock?.qty ?? 0;
      });
      return Math.min(...selectedColorStocks);
    }

    // Return general stock if no quantity option selected
    return Number(product?.stock ?? 0);
  }, [product, selectedColors, selectedQuantityOption]);

  const stockNum = useMemo(() => getCurrentStock(), [getCurrentStock]);
  const outOfStock = stockNum === 0;

  const selectedQuantityOptionInfo = useMemo(() => {
    if (selectedQuantityOption && Array.isArray(product?.quantityOptions)) {
      return product.quantityOptions.find(
        (option) => option.id === selectedQuantityOption
      );
    }
    return null;
  }, [product, selectedQuantityOption]);

  const refetchProduct = useCallback(async () => {
    try {
      const productId = product?._id || product?.id;
      if (!productId) return;
      const cacheBuster = Date.now();
      const { ok, json } = await api(`/api/products/${productId}?_t=${cacheBuster}`);
      if (ok) setProduct(json?.data as P);
    } catch {
      // ignore refresh errors
    }
  }, [product]);

  useEffect(() => {
    const onOrderPlaced = () => {
      refetchProduct();
    };
    window.addEventListener("order:placed", onOrderPlaced);
    return () =>
      window.removeEventListener("order:placed", onOrderPlaced);
  }, [refetchProduct]);

  // Add productCreated event listener
  useEffect(() => {
    const handleProductCreated = () => {
      console.log('productCreated event received in ProductDetail.tsx');
      refetchProduct();
    };

    window.addEventListener("productCreated", handleProductCreated);

    return () => {
      window.removeEventListener("productCreated", handleProductCreated);
    };
  }, [refetchProduct]);

  const handleAddToCart = () => {
    console.log('=== handleAddToCart START ===');
    
    if (!product) {
      console.log('No product, returning');
      return;
    }

    // Check if product uses new quantity options
    const usingQuantityOptions = Array.isArray(product?.quantityOptions) && product.quantityOptions.length > 0;
    
    console.log('Inventory check:', {
      usingQuantityOptions,
      selectedQuantityOption
    });

    // Validation for quantity options
    if (usingQuantityOptions && !selectedQuantityOption) {
      console.log('Quantity option required but not selected, showing toast');
      toast({
        title: "Select a quantity",
        description: "Please choose a quantity option before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    console.log('Color check:', {
      hasColors: Array.isArray(product.colors),
      colorsLength: product.colors?.length,
      selectedColorsLength: selectedColors.length,
      selectedColors
    });

    if (Array.isArray(product.colors) && product.colors.length > 0 && selectedColors.length === 0) {
      console.log('Colors required but not selected, showing toast');
      toast({
        title: "Select colors",
        description: "Please choose at least one color before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    console.log('Proceeding with add to cart...');
    // Rest of the function continues...

    // Get current stock based on the inventory type
    let currentStock = 0;
    let stockErrorMsg = "Out of stock";
    
    if (usingQuantityOptions && selectedQuantityOption) {
      const selectedOption = product.quantityOptions?.find(
        (option) => option.id === selectedQuantityOption
      );
      currentStock = selectedOption?.stock ?? 0;
      stockErrorMsg = `Selected quantity is out of stock`;
    } else {
      currentStock = product.stock ?? 0;
    }

    if (currentStock === 0) {
      setSizeStockError(stockErrorMsg);
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }

    if (quantity > currentStock) {
      const errorMsg = `Only ${currentStock} available`;
      setSizeStockError(errorMsg);
      toast({
        title: "Insufficient stock",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setSizeStockError("");
    
    // Determine price based on quantity option or base price
    let itemPrice = Number(product.price || 0);
    if (usingQuantityOptions && selectedQuantityOption) {
      const selectedOption = product.quantityOptions?.find(
        (option) => option.id === selectedQuantityOption
      );
      itemPrice = selectedOption?.price ?? itemPrice;
    }
    
    // Create items for each selected color
    const itemsToAdd: any[] = [];
    
    if (selectedColors.length > 0) {
      // Add each selected color as a separate item
      selectedColors.forEach(color => {
        const item: any = {
          id: String(product._id || product.id),
          title,
          price: itemPrice,
          image: img,
          meta: {} as any,
        };
        if (selectedSize) item.meta.size = selectedSize;
        if (selectedQuantityOption) item.meta.quantityOption = selectedQuantityOption;
        item.meta.color = color;
        itemsToAdd.push(item);
      });
    } else {
      // No colors selected, add single item
      const item: any = {
        id: String(product._id || product.id),
        title,
        price: itemPrice,
        image: img,
        meta: {} as any,
      };
      if (selectedQuantityOption) item.meta.quantityOption = selectedQuantityOption;
      itemsToAdd.push(item);
    }

    if (!user) {
      try {
        localStorage.setItem(
          "uni_add_intent",
          JSON.stringify({ items: itemsToAdd, qty: quantity })
        );
      } catch {}
      navigate("/auth");
      return;
    }

    // Add all items to cart
    itemsToAdd.forEach(item => {
      addToCart(item, quantity);
    });

    const colorText = selectedColors.length > 0 
      ? ` (${selectedColors.join(', ')})` 
      : '';
    toast({
      title: "Added to cart!",
      description: `${title}${colorText} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Check if product uses new quantity options
    const usingQuantityOptions = Array.isArray(product?.quantityOptions) && product.quantityOptions.length > 0;
    
    // Check legacy size inventory
    const usingSizeInventory =
      product?.trackInventoryBySize &&
      Array.isArray(product?.sizeInventory);

    // Validation for quantity options
    if (usingQuantityOptions && !selectedQuantityOption) {
      console.log('Quantity option required but not selected, showing toast');
      toast({
        title: "Select a quantity",
        description: "Please choose a quantity option before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (Array.isArray(product.colors) && product.colors.length > 0 && selectedColors.length === 0) {
      toast({
        title: "Select colors",
        description: "Please choose at least one color before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    // Get current stock based on the inventory type
    let currentStock = 0;
    let stockErrorMsg = "Out of stock";
    
    if (usingQuantityOptions && selectedQuantityOption) {
      const selectedOption = product.quantityOptions?.find(
        (option) => option.id === selectedQuantityOption
      );
      currentStock = selectedOption?.stock ?? 0;
      stockErrorMsg = `Selected quantity is out of stock`;
    } else {
      currentStock = product.stock ?? 0;
    }

    if (currentStock === 0) {
      setSizeStockError(stockErrorMsg);
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }

    // Determine price based on quantity option or base price
    let itemPrice = Number(product.price || 0);
    if (usingQuantityOptions && selectedQuantityOption) {
      const selectedOption = product.quantityOptions?.find(
        (option) => option.id === selectedQuantityOption
      );
      itemPrice = selectedOption?.price ?? itemPrice;
    }

    // Create items for each selected color
    const itemsToAdd: any[] = [];
    
    if (selectedColors.length > 0) {
      // Add each selected color as a separate item
      selectedColors.forEach(color => {
        const item: any = {
          id: String(product._id || product.id),
          title,
          price: itemPrice,
          image: img,
          meta: {} as any,
        };
        if (selectedSize) item.meta.size = selectedSize;
        if (selectedQuantityOption) item.meta.quantityOption = selectedQuantityOption;
        item.meta.color = color;
        itemsToAdd.push(item);
      });
    } else {
      // No colors selected, add single item
      const item: any = {
        id: String(product._id || product.id),
        title,
        price: itemPrice,
        image: img,
        meta: {} as any,
      };
      if (selectedQuantityOption) item.meta.quantityOption = selectedQuantityOption;
      itemsToAdd.push(item);
    }

    if (!user) {
      try {
        localStorage.setItem(
          "uni_add_intent",
          JSON.stringify({ items: itemsToAdd, qty: 1 })
        );
      } catch {}
      navigate("/auth");
      return;
    }

    // Add all items to cart
    itemsToAdd.forEach(item => {
      addToCart(item, 1);
    });
    navigate("/dashboard?checkout=true");
  };

  // ✅ small helper: js color name => CSS color
  const colorToCss = (c: string) => c.toLowerCase().trim();

  // ✅ Better loading UX: skeleton instead of plain text
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-3 sm:px-4 pt-32 pb-12 md:pt-36 lg:pt-40">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4 sm:space-y-5">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-7 sm:h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-20 sm:h-24 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
              <div className="h-8 w-full bg-muted rounded" />
              <div className="h-40 sm:h-48 bg-muted rounded" />
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-3 sm:px-4 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center py-12">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3">
              Product Not Found
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              The product you're looking for doesn't exist or may have been removed.
              Please check the URL or browse our collection.
            </p>
            <Link to="/shop">
              <Button size="lg">
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
    <>
      <style>{`
        /* Global border removal for description section */
        * {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        
        div[class*="text-gray-700"] {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        div[class*="space-y-3"] {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        div[class*="animate-in"] {
          border: none !important;
          outline: none !important;
          border-radius: 0 !important;
        }
        button[class*="text-primary"] {
          border: none !important;
          outline: none !important;
        }
        /* Remove borders from any element with description */
        [class*="px-4"] {
          border: none !important;
          outline: none !important;
          border-radius: 0 !important;
        }
      `}</style>
      <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Page Header */}
     
      <section className="w-full px-3 sm:px-4 pt-24 pb-4 sm:pt-24 sm:pb-8 md:pt-28 md:pb-12">
        <div className="max-w-7xl mx-auto w-full">
          <Link
            to="/shop"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 sm:gap-8 md:gap-12 w-full bg-white p-4 sm:p-6 md:p-12 rounded-lg shadow-md">
            {/* Mobile: show images first, then description */}
            <div className="min-w-0 order-1 md:order-1">
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
                  // Share functionality - using native share if available, fallback to copying URL
                  if (navigator.share) {
                    navigator.share({
                      title: title,
                      text: `Check out this product: ${title}`,
                      url: window.location.href
                    });
                  } else {
                    // Fallback: copy URL to clipboard
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied!",
                      description: "Product link copied to clipboard",
                    });
                  }
                }}
                isInWishlist={isInWishlist(String(product?._id || product?.id))}
              />
            </div>

            
            <div className="min-w-0 p-4 sm:p-5 md:p-8 border border-gray-200 rounded-lg order-3 md:order-2">
              {/* Desktop: keep full details in right column */}
              <div className="block md:block">
              <p className="text-xs text-gray-600 uppercase tracking-wider mb-1 break-words">
                {product.category}
              </p>
              <div className="mb-2 sm:mb-3">
                <h1 className="text-xl sm:text-2xl md:text-4xl font-black tracking-tighter break-words text-gray-900">
                  {title}
                </h1>
              </div>
            <div className="flex items-baseline gap-2 mb-3 sm:mb-4 justify-between">
  {(() => {
    // Determine which price to show
    let displayPrice = Number(product?.price || 0);
    let originalPrice = Number(product?.price || 0);
    let showDiscount = false;
    
    // If quantity option is selected, use its price
    if (selectedQuantityOptionInfo) {
      displayPrice = selectedQuantityOptionInfo.price;
      originalPrice = selectedQuantityOptionInfo.originalPrice || selectedQuantityOptionInfo.price;
      showDiscount = selectedQuantityOptionInfo.originalPrice && selectedQuantityOptionInfo.originalPrice > selectedQuantityOptionInfo.price;
    } else if (product?.discount?.value > 0) {
      // Apply product-level discount if no quantity option selected
      if (product.discount.type === "percentage") {
        displayPrice = originalPrice - (originalPrice * product.discount.value) / 100;
      } else if (product.discount.type === "flat") {
        displayPrice = Math.max(0, originalPrice - product.discount.value);
      }
      showDiscount = product.discount.value > 0;
    }

    return displayPrice > 0 ? (
      <>
        <div className="flex items-baseline gap-2">
          <p className="text-lg sm:text-xl md:text-3xl font-bold text-gray-800">
            ₹{Math.round(displayPrice).toLocaleString("en-IN")}
          </p>
          {showDiscount && originalPrice > displayPrice && (
            <>
              <span className="text-sm text-gray-500 line-through">
                ₹{Math.round(originalPrice).toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-medium text-red-600">
                {selectedQuantityOptionInfo 
                  ? `${Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% OFF`
                  : product.discount.type === "percentage"
                    ? `${product.discount.value}% OFF`
                    : `₹${product.discount.value} OFF`
                }
              </span>
            </>
          )}
        </div>

        {(product?.averageRating || 4.2) && (
          <div className="flex flex-col items-start">
            <div className="flex items-center bg-green-50 px-2 py-1 rounded-md border border-green-100">
              <span className="text-sm font-bold text-gray-900 leading-none">{product?.averageRating || 4.2}</span>
              <span className="text-green-600 ml-1" style={{fontSize: '11px'}}>★</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{(product?.reviewCount || 4500) >= 1000 ? `${((product?.reviewCount || 4500) / 1000).toFixed(1)}k` : product?.reviewCount || 4500} Ratings</span>
          </div>
        )}
      </>
    ) : null;
  })()}
</div>
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
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex flex-col gap-1 flex-1">
                 

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
                </div>
                {/* <ShareButton
                  productName={title}
                  productUrl={window.location.href}
                  productImage={img}
                /> */}
              </div>
             

              
              </div>

             

              {/* ✅ COLOR OPTIONS UI - supports both old colors array and new colorVariants */}
              {(() => {
                // Use colorVariants if available, otherwise fallback to colors array
                const colorOptions = product?.colorVariants?.length > 0
                  ? product.colorVariants.map(cv => ({ name: cv.colorName, code: cv.colorCode }))
                  : product?.colors?.length > 0
                  ? product.colors.map(c => ({ name: c, code: undefined }))
                  : [];

                return colorOptions.length > 0 ? (
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-xs font-semibold mb-2">
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
                              "flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs transition-colors cursor-pointer",
                              isOutOfStock
                                ? "opacity-50 cursor-not-allowed bg-muted border-border text-muted-foreground"
                                : isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-transparent border-border hover:border-primary"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onChange={() => {
                                setSelectedColors((prevColors) => {
                                  if (prevColors.includes(c)) {
                                    // Remove color if already selected
                                    const newColors = prevColors.filter(color => color !== c);
                                    console.log('Removed color:', c, 'Selected colors:', newColors);
                                    return newColors;
                                  } else {
                                    // Add color if not selected
                                    const newColors = [...prevColors, c];
                                    console.log('Added color:', c, 'Selected colors:', newColors);
                                    return newColors;
                                  }
                                });
                              }}
                              className="sr-only" // Hide the actual checkbox, use the label as the clickable element
                            />
                            <span
                              className="h-3 w-3 rounded-full border border-current"
                              style={{ backgroundColor: colorOpt.code ? colorOpt.code : colorToCss(c) }}
                            />
                            <span>{c}</span>
                            {isOutOfStock && <span className="text-[10px]">Out of Stock</span>}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}

              {(() => {
                // New Quantity Options Selector
                if (product?.quantityOptions && product.quantityOptions.length > 0) {
                  return (
                    <ProductQuantitySelector
                      options={product.quantityOptions}
                      selectedOption={selectedQuantityOption}
                      onSelectionChange={(optionId) => {
                        setSelectedQuantityOption(optionId);
                        setSizeStockError("");
                      }}
                      disabled={outOfStock}
                    />
                  );
                }
                return null;
              })()}

              <div className="mb-3 sm:mb-4">
                <label className="block text-xs font-semibold mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    -
                  </Button>
                  <span className="font-semibold min-w-[30px] text-center text-sm sm:text-base">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity((q) => q + 1)
                    }
                    className="h-8 w-8 sm:h-9 sm:w-9"
                  >
                    +
                  </Button>
                </div>

          <div className="space-y-2 sm:space-y-3 mt-6">
  {(() => {
    console.log('=== Add to Cart Button Render ===', {
      outOfStock,
      selectedColors,
      productColors: product?.colors,
      trackInventoryBySize: product?.trackInventoryBySize
    });
    
    return (
      <Button
        ref={(buttonRef) => {
          if (buttonRef) {
            console.log('Button ref set, current styles:', {
              className: buttonRef.className,
              style: buttonRef.style,
              computedStyle: window.getComputedStyle(buttonRef).backgroundColor,
              computedColor: window.getComputedStyle(buttonRef).color
            });
            
            // Apply styles immediately
            buttonRef.style.setProperty('background-color', 'black', 'important');
            buttonRef.style.setProperty('color', 'white', 'important');
            buttonRef.style.setProperty('background', 'black', 'important');
            
            // Force styles with MutationObserver
            const observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
                  console.log('Button style changed!', {
                    attribute: mutation.attributeName,
                    oldValue: mutation.oldValue,
                    newValue: buttonRef.className,
                    style: buttonRef.style
                  });
                  
                  // Re-apply our styles
                  buttonRef.style.setProperty('background-color', 'black', 'important');
                  buttonRef.style.setProperty('color', 'white', 'important');
                  buttonRef.style.setProperty('background', 'black', 'important');
                }
              });
            });
            
            observer.observe(buttonRef, {
              attributes: true,
              attributeOldValue: true,
              attributeFilter: ['style', 'class']
            });
          }
        }}
        size="lg"
        className="w-full text-xs sm:text-sm h-11 sm:h-12 bg-black hover:bg-gray-800 text-white text-sm font-medium !important"
        disabled={outOfStock}
        style={{ backgroundColor: 'black', color: 'white' }}
        onClick={(e) => {
          console.log('=== Add to Cart Button Clicked ===', {
            outOfStock,
            selectedColors,
            productColors: product?.colors,
            trackInventoryBySize: product?.trackInventoryBySize
          });
          handleAddToCart();
        }}
      >
        <ShoppingCart className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
        Add to Cart
      </Button>
    );
  })()}
  
  {!outOfStock && (
    <Button
      size="lg"
      variant="outline"
      className="w-full text-xs sm:text-sm h-11 sm:h-12 border-primary text-primary hover:bg-primary/5 text-sm font-medium"
      onClick={handleBuyNow}
    >
      Buy Now
    </Button>
  )}
</div>

             {/* {(product?.sizeFit?.fit || product?.sizeFit?.modelWearingSize) && (
                <div className="mb-4 text-sm text-gray-900">
                  <div className="font-bold text-base mb-2">Size &amp; Fit</div>
                  {product?.sizeFit?.fit && (
                    <div className="mb-1">
                      <span className="font-medium">Fit</span> - {product.sizeFit.fit}
                    </div>
                  )}
                  {product?.sizeFit?.modelWearingSize && (
                    <div>
                      <span className="font-medium">Size</span> - {product.sizeFit.modelWearingSize}
                    </div>
                  )}
                </div>
              )} */}
        <SimpleCoupon
                onUseNow={(code) => {
                  navigate(`/cart?coupon=${encodeURIComponent(code)}`);
                }}
                productPrice={Number(product.price ?? 0)}
              />

        
              <div className="border-t border-b border-border py-3 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center justify-center text-center">
                  <Banknote className="w-5 h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-xs font-medium">CASH ON DELIVERY</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <Truck className="w-5 h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-xs font-medium">FREE SHIPPING</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <RefreshCcw className="w-5 h-5 text-primary mb-1" />
                  <span className="text-[10px] sm:text-xs font-medium">EASY RETURNS</span>
                </div>
              </div>
            </div>

           
          </div>
        </div>

       

        <div className="max-w-7xl mx-auto w-full mt-6 sm:mt-8">
          {/* Mobile Accordion Layout */}
          <div className="md:hidden bg-white rounded-lg shadow">
            {/* Description Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "description" ? "" : "description")}
                className="w-full text-left py-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">Description</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeTab === "description" ? "rotate-180" : ""}`} />
              </button>
              {activeTab === "description" && (
                <div className="px-4 pb-4 animate-in fade-in duration-300" style={{ border: 'none !important', outline: 'none !important' }}>
                  {product?.longDescription ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-700 leading-relaxed space-y-3 p-4 shadow-sm" style={{ border: 'none !important', outline: 'none !important', background: 'white !important', borderRadius: '0 !important' }}>
                        <p className="whitespace-pre-wrap break-words text-xs leading-6 text-gray-600 overflow-wrap-break-word px-1" style={{ border: 'none !important', outline: 'none !important', boxShadow: 'none !important' }}>
                          {escapeHtml(product.longDescription)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-white rounded-xl">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-xs font-medium">No detailed description available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Details Accordion */}
            {(product?.highlights?.length || product?.specs?.length) > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "additional" ? "" : "additional")}
                  className="w-full text-left py-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Product Details</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeTab === "additional" ? "rotate-180" : ""}`} />
                </button>
                {activeTab === "additional" && (
                  <div className="px-4 pb-4 animate-in fade-in duration-300">
                    {product?.highlights && product.highlights.length > 0 && (
                      <div className="min-w-0 mb-6">
                        <h4 className="text-base font-bold mb-3 text-gray-900 flex items-center gap-1.5">
                          <span className="w-1 h-4 bg-primary rounded-full"></span>
                          Key Features
                        </h4>
                        <ul className="space-y-2">
                          {product.highlights.map((highlight, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed">
                              <span className="text-primary font-bold mt-0.5">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {product?.specs && product.specs.length > 0 && (
                      <div className="min-w-0">
                        <h4 className="text-base font-bold mb-3 text-gray-900 flex items-center gap-1.5">
                          <span className="w-1 h-4 bg-primary rounded-full"></span>
                          Specifications
                        </h4>
                        <div className="space-y-2">
                          {product.specs.map((spec, idx) => (
                            <div key={idx} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                              <span className="text-xs font-medium text-gray-900 min-w-0 flex-1">{spec.key}</span>
                              <span className="text-xs text-gray-600 min-w-0 flex-1 text-right">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FAQ Accordion */}
            {product?.faq && product.faq.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === "faq" ? "" : "faq")}
                  className="w-full text-left py-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">FAQ ({product.faq.length})</span>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeTab === "faq" ? "rotate-180" : ""}`} />
                </button>
                {activeTab === "faq" && (
                  <div className="px-4 pb-4 animate-in fade-in duration-300">
                    <div className="space-y-3">
                      {product.faq.map((faq, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                            className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                          >
                            <span className="text-xs font-medium text-gray-900 pr-2">{faq.question}</span>
                            <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform flex-shrink-0 ${openFaqIndex === idx ? "rotate-180" : ""}`} />
                          </button>
                          {openFaqIndex === idx && (
                            <div className="px-4 py-3 bg-white border-t border-gray-200">
                              <p className="text-xs text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Accordion */}
            <div>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === "reviews" ? "" : "reviews")}
                className="w-full text-left py-3 px-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900">Reviews ({product?.reviewCount || 0})</span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${activeTab === "reviews" ? "rotate-180" : ""}`} />
              </button>
              {activeTab === "reviews" && (
                <div className="px-4 pb-4 animate-in fade-in duration-300">
                  <ReviewsList
                    productId={String(product?._id || product?.id)}
                    reviewKey={reviewKey}
                    isVerifiedBuyer={isVerifiedBuyer}
                    onReviewSubmitted={() => {
                      setReviewKey((prev) => prev + 1);
                      refetchProduct();
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Desktop Tab Layout */}
          <div className="hidden md:flex bg-white rounded-lg shadow">
            <div className="md:w-1/4 lg:w-1/5 p-3 sm:p-4 md:p-6">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={cn(
                  "w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors mb-1.5 flex items-center justify-between",
                  activeTab === "description"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Description
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </button>
              {(product?.highlights?.length || product?.specs?.length) > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("additional")}
                  className={cn(
                    "w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors mb-1.5 flex items-center justify-between",
                    activeTab === "additional"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                 Product Details
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                </button>
              )}
              {product?.faq && product.faq.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("faq")}
                  className={cn(
                    "w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors mb-1.5 flex items-center justify-between",
                    activeTab === "faq"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  FAQ ({product.faq.length})
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "w-full text-left py-1.5 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center justify-between",
                  activeTab === "reviews"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Reviews ({product?.reviewCount || 0})
                <ArrowRight className="h-3 w-3 text-gray-400" />
              </button>
            </div>
            <div className="md:w-3/4 lg:w-4/5 p-4 sm:p-5 md:p-8">
              {/* Desktop Content */}
              {activeTab === "description" && (
                <div ref={descriptionRef} className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Product Description
                    </h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                  
                  {product?.longDescription ? (
                    <div className="prose prose-sm sm:prose-base max-w-none">
                      <div className="text-gray-700 leading-relaxed space-y-3 bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
                        <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-6 text-gray-600 overflow-wrap-break-word px-1">
                          {escapeHtml(product.longDescription)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className="max-w-md mx-auto">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">No detailed description available</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "additional" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Additional Information
                    </h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                  
                  {product?.highlights && product.highlights.length > 0 && (
                    <div className="min-w-0">
                      <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-900 flex items-center gap-1.5">
                        <span className="w-1 h-4 bg-primary rounded-full"></span>
                        Key Features
                      </h4>
                      <ul className="space-y-3">
                        {product.highlights.map((highlight, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 leading-relaxed">
                            <span className="text-primary font-bold mt-1">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {product?.specs && product.specs.length > 0 && (
                    <div className="min-w-0">
                      <h4 className="text-base sm:text-lg font-bold mb-4 text-gray-900 flex items-center gap-1.5">
                        <span className="w-0.5 h-5 bg-primary rounded-full"></span>
                        Technical Specifications
                      </h4>
                      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                        <table className="w-full">
                          <tbody className="divide-y divide-gray-100">
                            {product.specs.map((spec, idx) => (
                              <tr
                                key={idx}
                                className={cn(
                                  "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200",
                                  idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                                )}
                              >
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold text-gray-900 w-2/5">
                                  {spec.key}
                                </td>
                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 font-medium">
                                  {spec.value}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  
                  {(!product?.highlights?.length && !product?.specs?.length) && (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
                      <div className="max-w-md mx-auto">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-xs font-medium">No additional information available</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "faq" && product?.faq && product.faq.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      Frequently Asked Questions
                    </h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                  
                  <div className="space-y-3">
                    {product.faq.map((item, index) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                            className="w-full text-left p-4 sm:p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <h4 className="text-sm sm:text-base font-semibold text-gray-900 pr-4">
                              {item.question}
                            </h4>
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-300",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                          <div
                            className={cn(
                              "transition-all duration-300 ease-in-out overflow-hidden",
                              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                              <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                      Customer Reviews
                      {product?.reviewCount > 0 && (
                        <span className="text-base font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                          {product.reviewCount}
                        </span>
                      )}
                    </h3>
                    <div className="h-1 w-16 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-xl border border-gray-100">
                    <ReviewsList 
                      key={product?._id || product?.id || ""} 
                      productId={product?._id || product?.id || ""} 
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

         <div className="max-w-7xl mx-auto w-full mt-6 sm:mt-8">
          <RecentlyViewed
            excludeProductId={product?._id || product?.id || ""}
          />
          <RelatedProducts productId={product?._id || product?.id || ""} />
        </div>
      </div>
    </section>

      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        productId={product?._id || product?.id || ""}
        onSuccess={() => {
          setReviewKey((prev) => prev + 1);
        }}
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
        title={
          product?.sizeChart?.title ||
          `${title} • Size Chart`
        }
        rows={product?.sizeChart?.rows}
        guidelines={product?.sizeChart?.guidelines}
        diagramUrl={product?.sizeChart?.diagramUrl}
        fieldLabels={product?.sizeChart?.fieldLabels}
      />

      <Footer />
    </div>
    </>
  );
};

export default ProductDetail;