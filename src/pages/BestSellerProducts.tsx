import React, { useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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

export default function BestSellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api('/api/products?isBestSeller=true&active=true');
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
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading best sellers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container mx-auto px-4 py-16 text-center text-destructive">
          <p>Error loading best sellers: {error}</p>
        </div>
      </div>
    );
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
      rating: Number(rating),
      quantityOptions: product.quantityOptions || [],
    };
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center space-y-4">
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Best Seller Products
            </h1>
            
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No best seller products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => {
                const card = mapToCard(product);
                const to = `/products/${card.slug}`;
                return (
                  <ProductCard key={String(product._id || product.id)} {...card} to={to} />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
