import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductQuantitySelector } from "@/components/ProductQuantitySelector";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart, ArrowLeft, ChevronDown, ArrowRight,
  Banknote, Truck, RefreshCcw, Leaf, ShieldCheck, Star,
} from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { SizeChartModal } from "@/components/SizeChartModal";
import { SizeChartTableModal } from "@/components/SizeChartTableModal";
import { ReviewModal } from "@/components/ReviewModal";
import ReviewsList from "@/components/ReviewsList";
import { SimpleCoupon } from "@/components/SimpleCoupon";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { useCouponRefresh } from "@/hooks/useCouponRefresh";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useWishlist } from "@/hooks/useWishlist";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;
  const isLocalBase = (() => { try { return API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1"); } catch { return false; } })();
  const isHttpsPage = (() => { try { return location.protocol === "https:"; } catch { return false; } })();
  if (s.startsWith("/uploads") || s.startsWith("uploads")) {
    if (API_BASE && !(isLocalBase && isHttpsPage)) {
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    } else {
      return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
    }
  }
  return s;
};

type P = {
  _id?: string; id?: string; name: string; title?: string; price: number;
  category: string; image: string; images?: string[]; image_url?: string;
  stock?: number; description?: string; paragraph1?: string; paragraph2?: string;
  longDescription?: string; highlights?: string[]; specs?: Array<{ key: string; value: string }>;
  createdAt?: string; updatedAt?: string;
  quantityOptions?: Array<{
    id?: string; code?: string; quantity?: number; unit?: string; packSize?: number;
    displayLabel?: string; price?: number; originalPrice?: number; stock?: number; qty?: number;
  }>;
  discount?: { type: 'percentage' | 'flat'; value: number };
  sku?: string; slug?: string; tags?: string[];
  seo?: { title?: string; description?: string; keywords?: string };
  averageRating?: number; reviewCount?: number;
  faq?: Array<{ question: string; answer: string }>;
  sizeFit?: { fit?: string; modelWearingSize?: string };
  originalPrice?: number;
  sizeChartTitle?: string; sizeChartUrl?: string;
  sizeChart?: { title?: string; rows?: any; guidelines?: any; diagramUrl?: string; fieldLabels?: any };
};

export default function ProductDetail() {
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
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [stockError, setStockError] = useState<string>("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    typeof window !== "undefined" && window.innerWidth >= 768 ? "description" : ""
  );
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [actualReviewCount, setActualReviewCount] = useState<number>(0);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showSizeChartTable, setShowSizeChartTable] = useState(false);

  const quantityOptions = useMemo(() => {
    const src = product?.quantityOptions || [];
    if (!src.length) return [];
    return src.map((item, i) => {
      const displayLabel = item.displayLabel || item.code || `${item.quantity || 1}${item.unit || "g"}`;
      const bp = item.price || Number(product?.price) || 0;
      const bop = item.originalPrice || Number((product as any)?.originalPrice) || bp;
      const stock = item.stock || item.qty || 999;
      return {
        id: item.id || item.code || `option-${i}`,
        quantity: item.quantity || parseInt(item.code as string) || 1,
        unit: (item.unit || "g") as "g" | "ml" | "kg" | "l" | "oz" | "lb" | "piece",
        packSize: item.packSize || 1, displayLabel,
        price: bp, originalPrice: bop > bp ? bop : undefined,
        stock, isActive: stock > 0, sortOrder: i,
      };
    });
  }, [product]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        if (!slug) throw new Error("Missing product identifier");
        const { ok, json } = await api(`/api/products/${slug}?_t=${Date.now()}`);
        if (!ok) throw new Error(json?.message || "Failed to load product");
        if (!ignore) {
          const d = json?.data as P;
          setProduct(d);
          const pid = d._id || d.id;
          if (pid) addRecentlyViewed({ id: String(pid), slug: d.slug });
          setSelectedOption(""); setQuantity(1);
        }
      } catch (e: any) {
        if (!ignore) toast({ title: e?.message || "Failed to load product", variant: "destructive" });
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [slug, toast, addRecentlyViewed]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }, [slug]);
  useEffect(() => { if (product) document.title = product.seo?.title || `${product.title || product.name} | Kissan City`; }, [product]);

  useEffect(() => {
    const check = async () => {
      if (!user || (!product?._id && !product?.id)) { setIsVerifiedBuyer(false); return; }
      try {
        const { ok, json } = await api("/api/orders/mine");
        if (!ok || !Array.isArray(json?.data)) { setIsVerifiedBuyer(false); return; }
        const pid = product._id || product.id;
        setIsVerifiedBuyer(json.data.some((o: any) =>
          Array.isArray(o.items) && o.items.some((it: any) => String(it.productId || it.id) === String(pid))
        ));
      } catch { setIsVerifiedBuyer(false); }
    };
    if (product) check();
  }, [user, product]);

  const img = useMemo(() => resolveImage(product?.image_url || product?.images?.[0] || ""), [product]);
  const title = useMemo(() => product?.title || product?.name || "", [product]);

  const selOpt = quantityOptions.find(o => o.id === selectedOption);
  const basePrice = selOpt?.price || Number(product?.price || 0);
  const baseOrig = selOpt?.originalPrice || Number((product as any)?.originalPrice || basePrice);

  let discountedPrice = basePrice, discountPct = 0;
  if (product?.discount?.value > 0 && !selOpt?.originalPrice) {
    if (product.discount.type === "percentage") { discountPct = product.discount.value; discountedPrice = basePrice - (basePrice * discountPct) / 100; }
    else { discountedPrice = Math.max(0, basePrice - product.discount.value); discountPct = Math.round(((basePrice - discountedPrice) / basePrice) * 100); }
  }
  const price = discountedPrice;
  const originalPrice = baseOrig > discountedPrice ? baseOrig : undefined;
  const discountBadge = discountPct > 0 ? discountPct : 0;

  const getCurrentStock = useCallback(() => {
    if (quantityOptions.length > 0 && selectedOption) return quantityOptions.find(o => o.id === selectedOption)?.stock ?? 0;
    return Number(product?.stock ?? 0);
  }, [product, selectedOption, quantityOptions]);

  const stockNum = useMemo(() => getCurrentStock(), [getCurrentStock]);
  const outOfStock = stockNum === 0;

  const refetchProduct = useCallback(async () => {
    try {
      const pid = product?._id || product?.id;
      if (!pid) return;
      const { ok, json } = await api(`/api/products/${pid}?_t=${Date.now()}`);
      if (ok) setProduct(json?.data as P);
    } catch {}
  }, [product]);

  useEffect(() => {
    const h = () => refetchProduct();
    window.addEventListener("order:placed", h); window.addEventListener("productCreated", h);
    return () => { window.removeEventListener("order:placed", h); window.removeEventListener("productCreated", h); };
  }, [refetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    if (quantityOptions.length > 0 && !selectedOption) { toast({ title: "Select an option", description: "Please choose a quantity option.", variant: "destructive" }); return; }
    let stock = Number(product.stock ?? 0), optData = null;
    if (quantityOptions.length > 0 && selectedOption) { optData = quantityOptions.find(o => o.id === selectedOption); stock = optData?.stock ?? 0; }
    if (stock === 0) { setStockError("Out of stock"); toast({ title: "Out of stock", variant: "destructive" }); return; }
    if (quantity > stock) { const m = `Only ${stock} available`; setStockError(m); toast({ title: "Insufficient stock", description: m, variant: "destructive" }); return; }
    setStockError("");
    const item: any = { id: String(product._id || product.id), title, price, originalPrice, image: img, meta: {} };
    if (optData) { item.meta.option = optData.displayLabel; item.meta.optionId = optData.id; }
    if (!user) { try { localStorage.setItem("uni_add_intent", JSON.stringify({ items: [item], qty: quantity })); } catch {} navigate("/auth"); return; }
    addToCart(item, quantity);
    toast({ title: "Added to cart!", description: `${title} added to your cart.` });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (quantityOptions.length > 0 && !selectedOption) { toast({ title: "Select an option", variant: "destructive" }); return; }
    let stock = Number(product.stock ?? 0), optData = null;
    if (quantityOptions.length > 0 && selectedOption) { optData = quantityOptions.find(o => o.id === selectedOption); stock = optData?.stock ?? 0; }
    if (stock === 0) { setStockError("Out of stock"); toast({ title: "Out of stock", variant: "destructive" }); return; }
    const item: any = { id: String(product._id || product.id), title, price, originalPrice, image: img, meta: {} };
    if (optData) { item.meta.option = optData.displayLabel; item.meta.optionId = optData.id; }
    if (!user) { try { localStorage.setItem("uni_add_intent", JSON.stringify({ items: [item], qty: 1 })); } catch {} navigate("/auth"); return; }
    addToCart(item, 1);
    navigate("/dashboard?checkout=true");
  };

  const tabs = [
    { id: "description", label: "Description" },
    ...((product?.highlights?.length || product?.specs?.length) ? [{ id: "additional", label: "Details" }] : []),
    ...(product?.faq?.length > 0 ? [{ id: "faq", label: `FAQ (${product.faq.length})` }] : []),
    { id: "reviews", label: `Reviews (${actualReviewCount})` },
  ];

  if (loading) return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <style>{CSS}</style>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <div className="h-4 w-28 pd-skel mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square pd-skel" style={{ borderRadius: 24 }} />
          <div className="space-y-4 pt-2">
            {[3, 8, 5, "full", "full"].map((w, i) => (
              <div key={i} className="pd-skel" style={{ height: i > 2 ? 52 : 12, width: i > 2 ? "100%" : `${w === "full" ? 100 : Number(w) * 10}%` }} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F0E8" }}>
      <style>{CSS}</style>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-16 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-8xl mb-5">🌿</div>
          <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: "#6b4423" }}>Product Not Found</h1>
          <p className="text-sm mb-7" style={{ color: "#ba8c5c" }}>This product may have been removed.</p>
          <Link to="/shop"><button className="pd-btn-primary" style={{ width: "auto", padding: "0 28px" }}>
            <ArrowLeft size={15} /> Back to Shop
          </button></Link>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F0E8" }}>
        <Navbar />
        <section className="w-full px-3 sm:px-5 md:px-6 pt-20 sm:pt-24 pb-14">
          <div className="max-w-7xl mx-auto w-full">

            {/* Breadcrumb */}
            <Link to="/shop" className="pd-breadcrumb">
              <ArrowLeft size={13} /> Back to Shop
            </Link>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-14 mb-6">

              {/* Gallery */}
              <div className="order-1">
                <div className="sticky top-24 relative">
                  {discountBadge > 0 && <div className="pd-discount-badge">{discountBadge}% OFF</div>}
                  <ProductImageGallery
                    images={product?.images || []}
                    productTitle={title}
                    productId={String(product?._id || product?.id)}
                    showWishlistButton showShareButton
                    onWishlistClick={() => toggleWishlist(String(product?._id || product?.id))}
                    onShareClick={() => {
                      if (navigator.share) navigator.share({ title, url: window.location.href });
                      else { navigator.clipboard.writeText(window.location.href); toast({ title: "Link copied!" }); }
                    }}
                    isInWishlist={isInWishlist(String(product?._id || product?.id))}
                  />
                </div>
              </div>

              {/* Info Panel */}
              <div className="order-2 min-w-0">
                <div className="pd-card">

                  {/* Meta row */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="pd-eyebrow">{product.category}</span>
                    {product.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="pd-tag"><Leaf size={9} />{tag}</span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug mb-4"
                    style={{ color: "#2d1f10" }}>
                    {title}
                  </h1>

                  {/* Price + Rating */}
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="pd-price">₹{price.toLocaleString("en-IN")}</span>
                        {originalPrice && <span className="pd-price-orig">₹{originalPrice.toLocaleString("en-IN")}</span>}
                      </div>
                      {discountBadge > 0 && originalPrice && (
                        <span className="pd-save">Save ₹{(originalPrice - price).toLocaleString("en-IN")}</span>
                      )}
                    </div>
                     
                     <div className="flex flex-col items-center shrink-0">
  {/* Rating Badge */}
  <div className="inline-flex items-center gap-1.5 
                  bg-[#E8F5E9] 
                  border border-[#C8E6C9] 
                  px-4 py-1.5 
                  rounded-full">
    
    <span className="text-lg font-semibold text-gray-800 leading-none">
      {product?.averageRating || 4.2}
    </span>

    <Star
      size={16}
      className="text-emerald-600 fill-emerald-600"
    />
  </div>

  {/* Ratings Count */}
  <span className="text-sm text-gray-400 mt-2 font-medium">
    {(product?.reviewCount || 4500) >= 1000
      ? `${((product?.reviewCount || 4500) / 1000).toFixed(1)}k`
      : product?.reviewCount || 4500}{" "}
    ratings
  </span>
</div>
                  </div>

                  {/* Notices */}
                  {product.paragraph1 && (
                    <div className="pd-notice-red">
                      <ShieldCheck size={12} className="mt-0.5 shrink-0 text-red-600" />
                      <p className="text-xs font-medium text-red-700">{product.paragraph1}</p>
                    </div>
                  )}
                  {product.paragraph2 && (
                    <div className="pd-notice-green">
                      <ShoppingCart size={12} className=" shrink-0" style={{ color: "#2d6a4f" }} />
                      <p className="text-xs font-medium" style={{ color: "#2d6a4f" }}>{product.paragraph2}</p>
                    </div>
                  )}

                  {/* Qty Options */}
                  {quantityOptions.length > 0 && (
                    <div className="mb-4">
                      <ProductQuantitySelector
                        options={quantityOptions}
                        selectedOption={selectedOption}
                        onSelectionChange={(id) => { setSelectedOption(id); setStockError(""); }}
                        disabled={false}
                      />
                    </div>
                  )}

                  {/* Stock (no options) */}
                  {!quantityOptions.length && product.stock !== undefined && (
                    <div className="mb-3">
                      <span className={outOfStock ? "pd-stock-out" : "pd-stock-in"}>
                        {outOfStock ? "✕ Out of Stock" : `✓ In Stock (${product.stock} left)`}
                      </span>
                    </div>
                  )}

                  {/* Qty stepper */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#aaa" }}>Quantity</label>
                    <div className="pd-qty-wrap">
                      <button type="button" className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                      <span className="pd-qty-num">{quantity}</span>
                      <button type="button" className="pd-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                    </div>
                  </div>

                  {stockError && <p className="text-xs text-red-500 mb-3 font-medium">{stockError}</p>}


    {/* Coupon */}
                  <div className="mt-4">
                    <SimpleCoupon
                      onUseNow={(code) => navigate(`/cart?coupon=${encodeURIComponent(code)}`)}
                      productPrice={Number(product.price ?? 0)}
                    />
                  </div>
                  {/* CTAs */}
                  <div className="space-y-2.5">
                    <button className="pd-btn-primary" disabled={outOfStock} onClick={handleAddToCart}>
                      <ShoppingCart size={16} />
                      {outOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                    {!outOfStock && (
                      <button className="pd-btn-secondary" onClick={handleBuyNow}>Buy Now</button>
                    )}
                  </div>

                

                  {/* Trust badges */}
                  <div className="pd-trust-grid">
                    {[
                      { icon: <Banknote size={16} style={{ color: "#2d6a4f" }} />, label: "Cash on\nDelivery" },
                      { icon: <Truck size={16} style={{ color: "#2d6a4f" }} />, label: "Free\nShipping" },
                      { icon: <RefreshCcw size={16} style={{ color: "#2d6a4f" }} />, label: "Easy\nReturns" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="pd-trust-item">
                        <div className="pd-trust-icon">{icon}</div>
                        <span className="pd-trust-label whitespace-pre-line">{label}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="pd-tabs-wrap">
              {/* Mobile accordion */}
              <div className="md:hidden divide-y" style={{ borderColor: "rgba(107,68,35,0.08)" }}>
                {tabs.map(({ id, label }) => (
                  <div key={id}>
                    <button type="button" className="pd-accord-btn"
                      onClick={() => setActiveTab(activeTab === id ? "" : id)}>
                      <span>{label}</span>
                      <ChevronDown size={15} className={cn("text-gray-400 transition-transform duration-200", activeTab === id && "rotate-180")} />
                    </button>
                    {activeTab === id && (
                      <div className="px-5 pb-6">
                        <TabContent id={id} product={product} openFaqIndex={openFaqIndex}
                          setOpenFaqIndex={setOpenFaqIndex} reviewKey={reviewKey}
                          isVerifiedBuyer={isVerifiedBuyer}
                          onReviewSubmitted={() => { setReviewKey(p => p + 1); refetchProduct(); }}
                          onReviewCountChange={setActualReviewCount} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden md:flex">
                <div className="pd-tab-nav">
                  <div className="space-y-0.5 sticky top-28">
                    {tabs.map(({ id, label }) => (
                      <button key={id} type="button"
                        className={cn("pd-tab-btn", activeTab === id && "pd-tab-active")}
                        onClick={() => setActiveTab(id)}>
                        {label}
                        <ArrowRight size={11} className={cn("opacity-0 transition-opacity", activeTab === id && "opacity-100")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="pd-tab-content">
                  <TabContent id={activeTab} product={product} openFaqIndex={openFaqIndex}
                    setOpenFaqIndex={setOpenFaqIndex} reviewKey={reviewKey}
                    isVerifiedBuyer={isVerifiedBuyer}
                    onReviewSubmitted={() => { setReviewKey(p => p + 1); refetchProduct(); }}
                    onReviewCountChange={setActualReviewCount} />
                </div>
              </div>
            </div>

            {/* Related / Recently Viewed */}
            <div className="mt-8 space-y-8">
              <RecentlyViewed excludeProductId={product?._id || product?.id || ""} />
              <RelatedProducts productId={product?._id || product?.id || ""} />
            </div>

          </div>
        </section>

        <ReviewModal open={showReviewModal} onOpenChange={setShowReviewModal}
          productId={product?._id || product?.id || ""}
          onSuccess={() => setReviewKey(p => p + 1)} />
        <SizeChartModal open={showSizeChart} onOpenChange={setShowSizeChart}
          title={product?.sizeChartTitle || "Size Chart"} chartUrl={product?.sizeChartUrl} />
        <SizeChartTableModal open={showSizeChartTable} onOpenChange={setShowSizeChartTable}
          title={product?.sizeChart?.title || `${title} • Size Chart`}
          rows={product?.sizeChart?.rows} guidelines={product?.sizeChart?.guidelines}
          diagramUrl={product?.sizeChart?.diagramUrl} fieldLabels={product?.sizeChart?.fieldLabels} />

        <Footer />
      </div>
    </>
  );
}

// ── Tab Content ───────────────────────────────────────────────────────────────
function TabContent({ id, product, openFaqIndex, setOpenFaqIndex, reviewKey, isVerifiedBuyer, onReviewSubmitted, onReviewCountChange }: {
  id: string; product: P; openFaqIndex: number | null; setOpenFaqIndex: (i: number | null) => void;
  reviewKey: number; isVerifiedBuyer: boolean; onReviewSubmitted: () => void; onReviewCountChange: (n: number) => void;
}) {
  if (id === "description") return (
    <div>
      <div className="pd-content-title">Product Description</div>
      <div className="pd-content-bar" />
      {product?.longDescription
        ? <p className="text-sm leading-8 whitespace-pre-wrap break-words max-w-2xl" style={{ color: "#555" }}>{product.longDescription}</p>
        : <p className="text-sm text-center py-10" style={{ color: "#ccc" }}>No description available.</p>}
    </div>
  );
  if (id === "additional") return (
    <div className="space-y-8">
      <div><div className="pd-content-title">Product Details</div><div className="pd-content-bar" /></div>
      {product?.highlights?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#bbb" }}>Key Features</h4>
          <ul className="space-y-2.5">
            {product.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: "#444" }}>
                <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "#2d6a4f" }} />{h}
              </li>
            ))}
          </ul>
        </div>
      )}
      {product?.specs?.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#bbb" }}>Specifications</h4>
          <div className="pd-spec-table">
            {product.specs.map((s, i) => (
              <div key={i} className="pd-spec-row">
                <div className="pd-spec-key">{s.key}</div>
                <div className="pd-spec-val">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  if (id === "faq" && product?.faq?.length > 0) return (
    <div>
      <div className="pd-content-title">Frequently Asked Questions</div>
      <div className="pd-content-bar" />
      <div className="max-w-2xl">
        {product.faq.map((item, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div key={idx} className="pd-faq-item">
              <button type="button" className="pd-faq-btn" onClick={() => setOpenFaqIndex(isOpen ? null : idx)}>
                <span className="text-sm font-semibold" style={{ color: "#333" }}>{item.question}</span>
                <ChevronDown size={14} className={cn("shrink-0 transition-transform duration-200 text-gray-400", isOpen && "rotate-180")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-96" : "max-h-0")}>
                <div className="px-4 pb-4 pt-0" style={{ borderTop: "1px solid rgba(107,68,35,0.08)" }}>
                  <p className="text-sm leading-relaxed pt-3" style={{ color: "#666" }}>{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
  if (id === "reviews") return (
    <div>
      <div className="pd-content-title">Customer Reviews</div>
      <div className="pd-content-bar" />
      <ReviewsList
        key={product?._id || product?.id || ""}
        productId={product?._id || product?.id || ""}
        reviewKey={reviewKey}
        isVerifiedBuyer={isVerifiedBuyer}
        onReviewSubmitted={onReviewSubmitted}
        onReviewCountChange={onReviewCountChange}
      />
    </div>
  );
  return null;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const CSS = `
  @keyframes pd-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .pd-skel {
    background: linear-gradient(90deg,#ede8e0 25%,#f5f0e8 50%,#ede8e0 75%);
    background-size: 200% 100%;
    animation: pd-shimmer 1.4s infinite;
    border-radius: 12px;
  }

  /* Card */
  .pd-card {
    background: #fff;
    border: 1.5px solid rgba(107,68,35,0.11);
    border-radius: 24px;
    box-shadow: 0 6px 28px rgba(107,68,35,0.09);
    padding: 24px 20px 20px;
  }

  /* Breadcrumb */
  .pd-breadcrumb {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 600; color: #ba8c5c;
    text-decoration: none; margin-bottom: 22px;
    transition: color 0.15s;
  }
  .pd-breadcrumb:hover { color: #6b4423; }
  .pd-breadcrumb:hover svg { transform: translateX(-2px); }
  .pd-breadcrumb svg { transition: transform 0.15s; }

  /* Eyebrow + tag */
  .pd-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #ba8c5c; }
  .pd-tag {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 600;
    background: #d8f3dc; color: #2d6a4f;
    border: 1px solid rgba(45,106,79,0.18);
    padding: 3px 9px; border-radius: 20px;
  }

  /* Price */
  .pd-price { font-size: 26px; font-weight: 900; letter-spacing: -0.04em; color: #2d6a4f; line-height: 1; }
  .pd-price-orig { font-size: 14px; font-weight: 400; color: #bbb; text-decoration: line-through; margin-left: 4px; }
  .pd-save { font-size: 11px; font-weight: 700; color: #2d6a4f; display: block; margin-top: 2px; }

  /* Rating */
  .pd-rating {
    display: inline-flex; align-items: center; gap: 5px;
    background: #fffbeb; border: 1px solid #fde68a;
    padding: 5px 12px; border-radius: 30px;
  }

  /* Discount badge */
  .pd-discount-badge {
    position: absolute; top: 14px; left: 14px; z-index: 20;
    background: #6b4423; color: #fff;
    font-size: 11px; font-weight: 800; letter-spacing: 0.3px;
    padding: 4px 12px; border-radius: 20px;
    box-shadow: 0 3px 10px rgba(107,68,35,0.3);
  }

  /* Notices */
  .pd-notice-red {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 10px 12px; margin-bottom: 4px;
  }
  .pd-notice-green {
    display: flex; align-items: flex-start; gap: 8px;
    padding: 1px 12px; margin-bottom: 8px;
  }

  /* Qty stepper */
  .pd-qty-wrap {
    display: flex; align-items: center;
    border: 1.5px solid rgba(107,68,35,0.12); border-radius: 14px;
    overflow: hidden; width: fit-content;
  }
  .pd-qty-btn {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    font-size: 20px; font-weight: 300; color: #666;
    transition: background 0.15s, color 0.15s;
  }
  .pd-qty-btn:hover { background: rgba(45,106,79,0.07); color: #2d6a4f; }
  .pd-qty-num {
    width: 44px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #222;
    border-left: 1.5px solid rgba(107,68,35,0.12);
    border-right: 1.5px solid rgba(107,68,35,0.12);
  }

  /* CTAs */
  .pd-btn-primary {
    width: 100%; height: 52px; border: none; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-size: 14px; font-weight: 800; letter-spacing: 0.2px;
    background: #2d6a4f; color: #fff;
    box-shadow: 0 5px 20px rgba(45,106,79,0.28);
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative; overflow: hidden;
  }
  .pd-btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent);
    transform: translateX(-100%); transition: transform 0.5s;
  }
  .pd-btn-primary:hover::after { transform: translateX(100%); }
  .pd-btn-primary:hover:not(:disabled) { background: #1b4332; transform: translateY(-1px); box-shadow: 0 8px 28px rgba(45,106,79,0.32); }
  .pd-btn-primary:active:not(:disabled) { transform: scale(0.98); }
  .pd-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .pd-btn-secondary {
    width: 100%; height: 52px;
    border: 2px solid #2d6a4f; border-radius: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    font-size: 14px; font-weight: 800; letter-spacing: 0.2px;
    background: transparent; color: #2d6a4f;
    transition: background 0.2s, transform 0.15s;
  }
  .pd-btn-secondary:hover { background: rgba(45,106,79,0.06); transform: translateY(-1px); }
  .pd-btn-secondary:active { transform: scale(0.98); }

  /* Trust badges */
  .pd-trust-grid {
    display: flex; justify-content: space-around;
    padding-top: 16px; margin-top: 16px;
    border-top: 1px solid rgba(107,68,35,0.1);
  }
  .pd-trust-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .pd-trust-icon {
    width: 40px; height: 40px; border-radius: 50%;
    background: #d8f3dc;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, transform 0.2s;
  }
  .pd-trust-item:hover .pd-trust-icon { background: #2d6a4f; transform: scale(1.08); }
  .pd-trust-item:hover .pd-trust-icon svg { color: #fff !important; }
  .pd-trust-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #aaa; text-align: center; line-height: 1.3;
  }

  /* Stock */
  .pd-stock-in  { font-size: 11px; font-weight: 700; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 3px 10px; border-radius: 20px; }
  .pd-stock-out { font-size: 11px; font-weight: 700; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; padding: 3px 10px; border-radius: 20px; }

  /* Tabs wrap */
  .pd-tabs-wrap {
    background: #fff;
    border: 1.5px solid rgba(107,68,35,0.1);
    border-radius: 24px;
    box-shadow: 0 2px 12px rgba(107,68,35,0.07);
    overflow: hidden;
  }

  /* Tab nav (desktop) */
  .pd-tab-nav { width: 176px; flex-shrink: 0; padding: 16px 10px; border-right: 1.5px solid rgba(107,68,35,0.08); }
  .pd-tab-btn {
    width: 100%; text-align: left;
    padding: 9px 12px; border-radius: 12px;
    font-size: 12px; font-weight: 600; color: #999;
    border: none; background: none; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    transition: all 0.18s; margin-bottom: 2px;
  }
  .pd-tab-btn:hover { background: rgba(45,106,79,0.06); color: #2d6a4f; }
  .pd-tab-active { background: #2d6a4f !important; color: #fff !important; }

  /* Tab content */
  .pd-tab-content { flex: 1; min-width: 0; padding: 26px 28px 30px; }
  .pd-content-title { font-size: 18px; font-weight: 900; letter-spacing: -0.02em; color: #2d1f10; margin-bottom: 6px; }
  .pd-content-bar { height: 3px; width: 36px; border-radius: 3px; background: #2d6a4f; margin-bottom: 20px; }

  /* Mobile accordion */
  .pd-accord-btn {
    width: 100%; text-align: left; background: none; border: none;
    padding: 15px 18px; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between;
    font-size: 13px; font-weight: 700; color: #333;
    transition: background 0.15s;
  }
  .pd-accord-btn:hover { background: rgba(45,106,79,0.03); }

  /* FAQ */
  .pd-faq-item {
    border: 1.5px solid rgba(107,68,35,0.1); border-radius: 14px;
    overflow: hidden; margin-bottom: 8px;
    transition: border-color 0.2s;
  }
  .pd-faq-item:hover { border-color: rgba(45,106,79,0.25); }
  .pd-faq-btn {
    width: 100%; text-align: left; background: none; border: none;
    padding: 12px 16px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    cursor: pointer; transition: background 0.15s;
  }
  .pd-faq-btn:hover { background: rgba(45,106,79,0.03); }

  /* Spec table */
  .pd-spec-table { border: 1.5px solid rgba(107,68,35,0.1); border-radius: 14px; overflow: hidden; }
  .pd-spec-row { display: flex; }
  .pd-spec-row:not(:last-child) { border-bottom: 1px solid rgba(107,68,35,0.08); }
  .pd-spec-key { padding: 10px 14px; font-size: 12px; font-weight: 600; color: #555; width: 38%; background: rgba(245,240,232,0.5); }
  .pd-spec-val { padding: 10px 14px; font-size: 12px; color: #333; flex: 1; }
`;