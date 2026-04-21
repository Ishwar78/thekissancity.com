import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductSlider } from '@/components/ProductSlider';
import { useCart } from '@/contexts/CartContext';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/components/ProductCard';
import { Navbar } from '@/components/Navbar';
import FarmersSection from '@/components/farmerSection';
import ExpertSection from '@/components/ExpertSection';
import InfoSection from '@/components/infoSection';
import { Footer } from '@/components/Footer';
import FarmerStatsSection from '@/components/farmerstatSection';
// Types
interface ProductRow {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  image?: string;
  images?: string[];
  price?: number;
  originalPrice?: number;
  slug?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  inStock?: boolean;
  description?: string;
  shortDescription?: string;
}

// Helper to map product row to ProductCard props
const mapToCard = (p: ProductRow) => {
  const id = String(p._id || p.id || "");
  const title = p.title || p.name || "";
  const rawImg =
    Array.isArray(p.images) && p.images.length > 0
      ? p.images[0]
      : p.image || "";
  const image = rawImg.startsWith("http")
    ? rawImg
    : `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://thekissancity.com" : "http://localhost:5000")}/uploads/${rawImg}`;
  const price = Number(p.price) || 0;
  const originalPrice = Number(p.originalPrice) || undefined;
  const slug = p.slug || title.toLowerCase().replace(/\s+/g, "-");
  const category = p.category || "general";
  const rating = Number(p.rating) || 0;
  const reviews = Number(p.reviews) || 0;
  const badge = p.badge || (originalPrice && originalPrice > price ? "Sale" : undefined);
  const inStock = p.inStock !== false;

  return {
    id,
    title,
    name: title,
    image,
    price,
    originalPrice,
    slug,
    category,
    rating,
    reviews,
    badge,
    inStock,
  };
};

const About = () => {
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);

        // Fetch featured products
        const featuredResponse = await fetch('/api/products?featured=true&limit=8');
        const featuredResult = await featuredResponse.json();
        
        // Fetch new arrivals
        const newArrivalsResponse = await fetch('/api/products?sort=newest&limit=8');
        const newArrivalsResult = await newArrivalsResponse.json();

        if (featuredResult.ok && Array.isArray(featuredResult.data)) {
          setFeaturedProducts(featuredResult.data);
        }

        if (newArrivalsResult.ok && Array.isArray(newArrivalsResult.data)) {
          setNewArrivals(newArrivalsResult.data);
        }

      } catch (error) {
        console.error('Failed to fetch products:', error);
        setFeaturedError('Failed to load products');
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar/>

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
            font-size: clamp(2rem, 5vw, 3.5rem);
            font-weight: 900;
            letter-spacing: -0.03em;
            line-height: 1;
            color: var(--brown);
            margin-bottom: 10px;
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

       

        <FarmersSection/>
        <ExpertSection/>

         <div className="coll-section container mx-auto px-4 sm:px-6">

          {featuredLoading ? (
            <>
              {/* Static header during loading */}
              <div className="mb-10 sm:mb-12 text-center">
                <span className="coll-eyebrow">Our Products</span>
                <h2 className="coll-title">Latest <span>Collection</span></h2>
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
                <h2 className="coll-title">Latest <span>Collection</span></h2>
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

        <InfoSection/>
        <FarmerStatsSection/>
       
      </section>

       <Footer/>
    </div>
  );
};

export default About;
