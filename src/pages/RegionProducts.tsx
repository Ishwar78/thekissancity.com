import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Pagination } from "@/components/Pagination";
import { api } from "@/lib/api";
import { toast } from "sonner";

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
  region?: string;
};

type Region = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
};

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
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
  }
  return s;
};

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
    id,
    name: title,
    price: finalPrice,
    originalPrice: p?.discount?.value ? basePrice : undefined,
    discountedPrice: p?.discount?.value ? finalPrice : undefined,
    discountPercentage: p?.discount?.type === 'percentage' ? p.discount.value : undefined,
    discountAmount: p?.discount?.type === 'flat' ? p.discount.value : undefined,
    image: img,
    category: p.category || "",
    slug: p.slug || "",
    images: Array.isArray(p.images) ? p.images : [],
    rating: Number(rating),
    isBestSeller: p.isBestSeller || false,
    quantityOptions: p.quantityOptions || [],
  };
};

const RegionProducts = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const PRODUCTS_PER_PAGE = 16;

  useEffect(() => {
    if (slug) {
      fetchRegionData();
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchProducts();
    }
  }, [slug]);

  const fetchRegionData = async () => {
    try {
      const { ok, json } = await api(`/api/regions`);
      if (ok && json?.data) {
        const regionData = json.data.find((r: Region) => r.slug === slug);
        setRegion(regionData || null);
      }
    } catch (error) {
      console.error("Failed to fetch region:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append("region", slug || "");
      params.append("active", "all");
      params.append("limit", "200");

      const url = `/api/products?${params.toString()}`;
      console.log('Fetching products from URL:', url);
      
      const { ok, json } = await api(url);
      console.log('API response:', { ok, json });
      
      if (!ok) throw new Error(json?.message || json?.error || "Failed to load");

      const list = Array.isArray(json?.data) ? (json.data as ProductRow[]) : [];
      console.log('Products fetched:', list.length, list.map(p => ({ id: p._id, title: p.title, region: p.region })));

      setProducts(list);
      setLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast.error(error.message || "Failed to load products");
      setProducts([]);
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = products.slice(startIdx, startIdx + PRODUCTS_PER_PAGE);

  if (!region) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-3 sm:px-4 pt-32 pb-12 md:pt-36 lg:pt-40">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-3">
              Region Not Found
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              The region you're looking for doesn't exist or is not available.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 pt-32 pb-12 md:pt-36 lg:pt-40">
        {/* Region Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white/80 flex items-center justify-center border-2 border-amber-300 shadow-sm">
              <img
                src={resolveImage(region.imageUrl || "/placeholder.svg")}
                alt={region.name}
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-3">
            {region.name}
          </h1>
          {region.description && (
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              {region.description}
            </p>
          )}
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {products.length} Products Available
          </p>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">
              No products available in this region yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {paginatedProducts.map((product) => (
                <ProductCard key={String(product._id || product.id)} {...mapToCard(product)} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default RegionProducts;
