import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp, ShoppingBag } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
interface Product {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  price: number;
  images?: string[];
  image_url?: string;
  slug?: string;
  category?: string;
  orderCount?: number;
  lastOrderedAt?: string;
  rating?: number;
  reviewCount?: number;
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

export default function BestSellerSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api('/api/products?isBestSeller=true&limit=12&active=true');
        if (!res.ok) {
          throw new Error(res.json?.message || 'Failed to fetch best sellers');
        }
        const data = res.json.data || [];
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading best sellers...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 text-center text-destructive">
          <p>Error loading best sellers: {error}</p>
        </div>
      </section>
    );
  }

  if (!products.length) {
    return null;
  }

  // Map products to ProductCard format
  const mapToCard = (product: Product) => {
    const id = product._id || product.id || '';
    const title = product.title || product.name || 'Product';
    const price = product.price || 0;
    const image = product.images?.[0] || product.image_url || '/placeholder.svg';
    const slug = product.slug || id;
    const rating = 5.0; // Default 5-star rating for all products

    return {
      id,
      name: title,
      category: product.category || '',
      price,
      image,
      slug,
      rating: Number(rating), // Generate random rating like other sections
      quantityOptions: product.quantityOptions || [],
    };
  };

  return (
    <section className="pb-8 pt-4 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full mb-2">
            <TrendingUp className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Best Sellers</span>
          </div> */}
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground"
          style={{ color: '#6b4423' }}>
            Best Seller
          </h2>
          {/* <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our most popular products loved by our customers
          </p> */}
        </div>

        {/* Products Carousel */}
        <div className="relative">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4 sm:-ml-6">
              {products.map((product) => {
                const card = mapToCard(product);
                const to = `/products/${card.slug}`;
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
              <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-orange-600 transition-all" />
              <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-orange-600 transition-all" />
            </div>
          </Carousel>
        </div>

        {/* View All Link */}
       <div className="text-center mt-10 md:mt-16">
                     <Link
                       to="/best-sellers"
                       className="inline-flex items-center text-sm font-medium text-primary hover:text-gray-900 transition-colors group"
                     >
                       View All Best Seller 
                       <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                     </Link>
                   </div>
      </div>
    </section>
  );
}
