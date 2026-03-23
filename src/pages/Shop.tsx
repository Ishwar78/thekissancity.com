import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { SearchInput } from "@/components/SearchInput";
import { Pagination } from "@/components/Pagination";
import RecentReviewsSection from "@/components/RecentReviewsSection";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Filter, XCircle, ArrowUpDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

type ProductRow = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  discount?: { type: 'percentage' | 'flat'; value: number };
  category?: string;
  gender?: string;
  colors?: string[];
  sizes?: string[];
  trackInventoryBySize?: boolean;
  sizeInventory?: Array<{ code?: string; label?: string; qty?: number }>;
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
  image_url?: string;
  images?: string[];
  slug?: string;
  createdAt?: string;
  isBestSeller?: boolean;
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

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;
  const isLocalBase = (() => {
    try {
      return (API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1"));
    } catch { return false; }
  })();
  const isHttpsPage = (() => {
    try { return location.protocol === "https:"; } catch { return false; }
  })();
  if (s.startsWith("/uploads") || s.startsWith("uploads")) {
    if (API_BASE && !(isLocalBase && isHttpsPage)) {
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
  }
  return s;
};

const normalizeCategory = (value: string) =>
  String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/s$/, "");

function slugify(input: string) {
  return String(input || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const mapToCard = (p: ProductRow) => {
  const id = String(p._id || p.id || "");
  const title = p.title || p.name || "";
  const rawImg =
    p.image_url ||
    (Array.isArray(p.images) ? p.images[0] : "") ||
    (p as any).image ||
    "/placeholder.svg";
  const img = resolveImage(rawImg);
  const basePrice = Number(p.price || 0);
  let finalPrice = basePrice;
  if (p?.discount?.value && p.discount.type === 'percentage') {
    finalPrice = basePrice - (basePrice * p.discount.value / 100);
  } else if (p?.discount?.value && p.discount.type === 'flat') {
    finalPrice = Math.max(0, basePrice - p.discount.value);
  }
  let rating = "0.0";
  if (p.reviews && p.reviews.length > 0) {
    const totalRating = p.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    rating = (totalRating / p.reviews.length).toFixed(1);
  }
  return {
    id, name: title, price: finalPrice,
    originalPrice: p?.discount?.value ? basePrice : undefined,
    discountedPrice: p?.discount?.value ? finalPrice : undefined,
    discountPercentage: p?.discount?.type === 'percentage' ? p.discount.value : undefined,
    discountAmount: p?.discount?.type === 'flat' ? p.discount.value : undefined,
    image: img, category: p.category || "", slug: p.slug || "",
    images: Array.isArray(p.images) ? p.images : [],
    rating: Number(rating), isBestSeller: p.isBestSeller || false,
    quantityOptions: p.quantityOptions || [],
  };
};

interface ShopPageProps {
  sortBy?: "newest" | "all";
  collectionSlug?: string;
}

const Shop = ({ sortBy = "all", collectionSlug }: ShopPageProps = {}) => {
  const location = useLocation();
  const { toast } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [priceSort, setPriceSort] = useState<string>("none");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [productUpdateKey, setProductUpdateKey] = useState(0);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isQuantityOpen, setIsQuantityOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  type CategoryWithParent = { name?: string; slug?: string; parent?: string | null };

  const getProductSizes = (p: ProductRow) => {
    const out = new Set<string>();
    p.sizes?.forEach((s) => { const v = String(s || "").trim(); if (v) out.add(v); });
    p.sizeInventory?.forEach((si) => {
      const qty = typeof si?.qty === "number" ? si.qty : si?.qty == null ? undefined : Number(si.qty);
      if (typeof qty === "number" && qty <= 0) return;
      const label = String(si?.label || "").trim();
      const code = String(si?.code || "").trim();
      if (label) out.add(label);
      if (code && code !== label) out.add(code);
    });
    return Array.from(out);
  };

  const availableQuantities = useMemo(() => {
    return ["All", "80gm", "100gm", "250gm", "300gm", "500gm", "600gm", "1kg" , "300ml" , "500ml"];
  }, []);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catFromUrl = params.get("category");
    if (catFromUrl) { setSelectedCategory(catFromUrl); setCurrentPage(1); }
    else setSelectedCategory("All");
    const searchFromUrl = params.get("q");
    if (searchFromUrl !== null) setSearchQuery(searchFromUrl);
    else setSearchQuery("");
  }, [location.search]);

  const resetFilters = () => {
    setSelectedCategory("All"); setSelectedQuantity("All");
    setPriceRange([0, 5000]); setPriceSort("none"); setCurrentPage(1);
  };

  const PRODUCTS_PER_PAGE = isMobile ? 8 : 16;

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, sortBy, collectionSlug, selectedCategory, selectedQuantity, priceRange, productUpdateKey]);

  useEffect(() => {
    const handleProductCreated = () => setProductUpdateKey(prev => prev + 1);
    window.addEventListener("productCreated", handleProductCreated);
    return () => window.removeEventListener("productCreated", handleProductCreated);
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { ok, json } = await api("/api/categories");
        const list = ok && Array.isArray(json?.data) ? (json.data as Array<CategoryWithParent>) : [];
        const subcategories = list.filter((c) => c.parent !== null && c.parent !== undefined);
        const names = subcategories.map((c) => String(c.name || c.slug || "").trim()).filter(Boolean);
        if (!ignore) setApiCategories(names);
      } catch { if (!ignore) setApiCategories([]); }
    })();
    return () => { ignore = true; };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (collectionSlug) params.append("category", collectionSlug);
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedQuantity !== "All") params.append("quantities", selectedQuantity);
      params.append("minPrice", String(priceRange[0]));
      params.append("maxPrice", String(priceRange[1]));
      params.append("active", "all");
      params.append("limit", "200");
      const query = params.toString();
      const url = query ? `/api/products?${query}` : "/api/products";
      const { ok, json } = await api(url);
      if (!ok) throw new Error(json?.message || json?.error || "Failed to load");
      let list = Array.isArray(json?.data) ? (json.data as ProductRow[]) : [];
      if (sortBy === "newest") {
        list = list.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
      }
      setProducts(list); setLoading(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to load products", variant: "destructive" });
      setProducts([]); setLoading(false);
    }
  };

  const availableCategories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    apiCategories.forEach((n) => { if (n) cats.add(String(n)); });
    products.forEach((p) => {
      if (p.category) {
        const categoryName = String(p.category).trim();
        if (apiCategories.includes(categoryName)) cats.add(categoryName);
      }
    });
    return Array.from(cats);
  }, [products, apiCategories]);

  const filteredProducts = useMemo(() => {
    let result = products;
    const normalizedSelectedCategory = normalizeCategory(selectedCategory);
    if (normalizedSelectedCategory !== "all") {
      result = result.filter((p) => normalizeCategory(p.category || "") === normalizedSelectedCategory);
    }
    if (selectedQuantity !== "All") {
      result = result.filter((p) => p.quantityOptions?.some(q => q.displayLabel === selectedQuantity));
    }
    result = result.filter((p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]);
    if (priceSort === "low-to-high") result = [...result].sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (priceSort === "high-to-low") result = [...result].sort((a, b) => (b.price || 0) - (a.price || 0));
    return result;
  }, [products, selectedCategory, selectedQuantity, priceRange, priceSort]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

  const pageTitle = sortBy === "newest" ? "New Arrivals" : "Shop All";
  const pageSubtitle = sortBy === "newest" ? "Discover our latest additions" : "Browse our complete collection";

  // Banner image: earthy farm/market scene matching KissanCity brand
  const bannerImage = sortBy === "newest"
    ? "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600&q=80&auto=format&fit=crop"
    : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── SHOP HERO BANNER ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(200px, 30vw, 360px)',
          overflow: 'hidden',
          marginTop: '64px', // navbar height offset
        }}
      >
        {/* Background Image */}
        <img
          src={bannerImage}
          alt={pageTitle}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 55%',
          }}
        />

        {/* Rich gradient overlay — dark left, lighter right */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, rgba(107,68,35,0.88) 0%, rgba(107,68,35,0.65) 35%, rgba(30,20,10,0.35) 70%, rgba(0,0,0,0.15) 100%)',
        }} />

        {/* Vignette edges */}
        <div style={{
          position: 'absolute', inset: 0,
          boxShadow: 'inset 0 0 80px rgba(0,0,0,0.4)',
          pointerEvents: 'none',
        }} />

        {/* Bottom fade into page */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '80px',
          background: 'linear-gradient(to top, #faf9f6 0%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 3,
        }} />

        {/* Hero Content */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '0 20px',
          zIndex: 2,
          paddingBottom: '20px', // offset bottom fade
        }}>
          {/* Eyebrow pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: '40px',
            padding: '4px 18px',
            marginBottom: '14px',
          }}>
            <span style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 'clamp(9px, 1.1vw, 12px)',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.92)',
            }}>
              {sortBy === "newest" ? "✦ Just Arrived" : "✦ KissanCity Store"}
            </span>
          </div>

          {/* Main Heading */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 6vw, 80px)',
            fontWeight: 800,
            lineHeight: 1.0,
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: '0 0 12px 0',
            textShadow: '0 3px 24px rgba(0,0,0,0.35)',
          }}>
            {pageTitle}
          </h1>

          {/* Ornamental divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{ width: 'clamp(28px, 4vw, 56px)', height: '1px', background: 'rgba(255,255,255,0.45)' }} />
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.75)',
              boxShadow: '0 0 6px rgba(255,255,255,0.5)',
            }} />
            <div style={{ width: 'clamp(28px, 4vw, 56px)', height: '1px', background: 'rgba(255,255,255,0.45)' }} />
          </div>

          {/* Subtitle */}
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 'clamp(11px, 1.4vw, 17px)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.82)',
            letterSpacing: '0.03em',
            margin: 0,
            textShadow: '0 1px 10px rgba(0,0,0,0.4)',
          }}>
            {pageSubtitle}
          </p>
        </div>
      </div>
      {/* ── END HERO BANNER ── */}

      <main className="container mx-auto px-3 sm:px-4 pb-12" style={{ paddingTop: '24px' }}>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          {/* Left Section: Clear Filters (Desktop) */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="hidden lg:flex items-center shrink-0"
              style={{ borderColor: '#6b4423', color: '#6b4423' }}
            >
              <XCircle className="w-4 h-4 mr-2" /> Clear Filters
            </Button>
          </div>

          {/* Center Section: Search Input */}
          <div className="flex-1 flex justify-center hidden sm:flex">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products…"
              className="w-full max-w-sm"
            />
          </div>

          {/* Right Section: Sort Dropdown and Mobile Filter */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile Sort Dropdown */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Sort:</span>
              </div>
              <Select value={priceSort} onValueChange={(value) => { setPriceSort(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[120px] h-9 border-2 font-medium text-sm" style={{ borderColor: '#6b4423' }}>
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-xl rounded-md" style={{ borderColor: '#6b4423' }}>
                  <SelectItem value="none" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors">Default</SelectItem>
                  <SelectItem value="low-to-high" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors">Price: Low to High</SelectItem>
                  <SelectItem value="high-to-low" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By Price Dropdown - Desktop */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground hidden lg:block">Sort:</span>
              </div>
              <Select value={priceSort} onValueChange={(value) => { setPriceSort(value); setCurrentPage(1); }}>
                <SelectTrigger className="w-[140px] sm:w-[160px] md:w-[200px] h-10 border-2 font-medium" style={{ borderColor: '#6b4423' }}>
                  <SelectValue placeholder="Sort by price" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 shadow-xl rounded-md" style={{ borderColor: '#6b4423' }}>
                  <SelectItem value="none" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors">
                    <span className="sm:hidden">Sort</span>
                    <span className="hidden sm:inline">Default</span>
                  </SelectItem>
                  <SelectItem value="low-to-high" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors">Price: Low to High</SelectItem>
                  <SelectItem value="high-to-low" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filter Trigger */}
            <div className="lg:hidden">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="w-4 h-4 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 sm:w-80 overflow-y-auto pr-12">
                  <SheetHeader className="mb-6 sticky top-0 bg-background z-10 pb-2 pr-10">
                    <SheetTitle>Filter Products</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-6 pb-6">
                    <Button variant="outline" onClick={resetFilters} className="w-full flex items-center" style={{ borderColor: '#6b4423', color: '#6b4423' }}>
                      <XCircle className="w-4 h-4 mr-2" /> Clear Filters
                    </Button>
                    <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                      <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b" style={{ color: '#6b4423', borderColor: '#6b4423' }}>
                        Categories {isCategoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 pb-2 space-y-2">
                        {availableCategories.map((category) => (
                          <Button key={category} variant={selectedCategory === category ? "secondary" : "ghost"}
                            onClick={() => { setSelectedCategory(category); setCurrentPage(1); setIsFilterSheetOpen(false); }}
                            className="w-full justify-start" style={{ color: '#6b4423' }}>
                            {category}
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible open={isQuantityOpen} onOpenChange={setIsQuantityOpen}>
                      <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b" style={{ color: '#6b4423', borderColor: '#6b4423' }}>
                        Quantity {isQuantityOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 pb-2 space-y-2">
                        {availableQuantities.map((quantity) => (
                          <Button key={quantity} variant={selectedQuantity === quantity ? "secondary" : "ghost"}
                            onClick={() => { setSelectedQuantity(quantity); setCurrentPage(1); }}
                            className="w-full justify-start text-gray-900 hover:text-gray-900">
                            {quantity}
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
                      <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b" style={{ color: '#6b4423', borderColor: '#6b4423' }}>
                        Price {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 pb-2">
                        <Slider min={0} max={10000} step={10} value={priceRange}
                          onValueChange={(val: [number, number]) => setPriceRange(val)}
                          className="w-[90%] mx-auto" />
                        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                          <span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    <Collapsible defaultOpen={true}>
                      <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b" style={{ color: '#6b4423', borderColor: '#6b4423' }}>
                        <div className="flex items-center gap-2"><ArrowUpDown className="w-4 h-4 text-muted-foreground" />Sort By Price</div>
                        <ChevronDown className="w-4 h-4" />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4 pb-2">
                        <Select value={priceSort} onValueChange={(value) => { setPriceSort(value); setCurrentPage(1); }}>
                          <SelectTrigger className="w-full h-11 border-2 font-medium" style={{ borderColor: '#6b4423', color: '#6b4423' }}>
                            <SelectValue placeholder="Sort by price" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-2 shadow-xl rounded-md" style={{ borderColor: '#6b4423' }}>
                            <SelectItem value="none" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors" style={{ color: '#6b4423' }}>Default</SelectItem>
                            <SelectItem value="low-to-high" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors" style={{ color: '#6b4423' }}>Price: Low to High</SelectItem>
                            <SelectItem value="high-to-low" className="cursor-pointer hover:bg-[#ba8c5c]/10 focus:bg-[#ba8c5c]/10 transition-colors" style={{ color: '#6b4423' }}>Price: High to Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 pr-8 shrink-0">
            <div className="flex flex-col space-y-6 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-2">
              <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Categories {isCategoriesOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {availableCategories.map((category) => (
                    <Button key={category} variant={selectedCategory === category ? "secondary" : "ghost"}
                      onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                      className="w-full justify-start" style={{ color: '#6b4423' }}>
                      {category}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={isQuantityOpen} onOpenChange={setIsQuantityOpen}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Quantity {isQuantityOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {availableQuantities.map((quantity) => (
                    <Button key={quantity} variant={selectedQuantity === quantity ? "secondary" : "ghost"}
                      onClick={() => { setSelectedQuantity(quantity); setCurrentPage(1); }}
                      className="w-full justify-start" style={{ color: '#6b4423' }}>
                      {quantity}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              <Collapsible open={isPriceOpen} onOpenChange={setIsPriceOpen}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Price {isPriceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2">
                  <Slider min={0} max={5000} step={10} value={priceRange}
                    onValueChange={(val: [number, number]) => setPriceRange(val)}
                    className="w-[90%] mx-auto" />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>₹{priceRange[0]}</span><span>₹{priceRange[1]}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading products...</div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No products found</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedProducts.map((p) => {
                    const card = mapToCard(p);
                    return <ProductCard key={card.id} {...card} />;
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <Pagination currentPage={currentPage} totalPages={totalPages}
                      onPageChange={(page) => { window.scrollTo({ top: 0, behavior: "smooth" }); setCurrentPage(page); }} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <RecentReviewsSection />
      <Footer />
    </div>
  );
};

export default Shop;