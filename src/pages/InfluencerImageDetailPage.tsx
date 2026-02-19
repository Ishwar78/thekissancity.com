import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Heart, ShoppingCart, Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
}

interface InfluencerImageItem {
  _id: string;
  imageUrl: string;
  influencerName: string;
  productId: Product;
  updatedAt: string;
}

export default function InfluencerImageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<InfluencerImageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencerImage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api(`/api/influencer-images/public/${id}`);
      if (!res.ok) {
        throw new Error(res.json?.message || 'Failed to fetch influencer image details');
      }
      const data = res.json.data;
      setItem(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchInfluencerImage();
  }, [fetchInfluencerImage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-12">
        Error loading details: {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-gray-500 text-center py-12">
        Item not found.
      </div>
    );
  }

  const { imageUrl, influencerName, productId } = item;

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 ">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="relative rounded-lg overflow-hidden shadow-lg">
          <img
            src={imageUrl}
            alt={influencerName}
            className="w-full h-full object-cover"
          />
          {productId?.images && productId.images.length > 0 && (
            <div className="absolute bottom-4 left-4 flex space-x-2">
              {productId.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product view ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md border-2 border-white cursor-pointer hover:border-amber-700 transition-colors"
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-start">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {productId?.title || 'Collection Item'}
          </h1>
          <p className="text-xl text-gray-700 mb-6">
            Styled by <span className="font-semibold text-amber-700">{influencerName}</span>
          </p>

          <p className="text-gray-600 mb-8 leading-relaxed">
            {productId?.description || 'No description available for this item.'}
          </p>

          <div className="flex items-center justify-between mb-8">
            <span className="text-3xl font-bold text-gray-900">
              ${productId?.price?.toFixed(2) || 'N/A'}
            </span>
            <div className="flex space-x-4">
              <button className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-700 hover:bg-amber-800 transition-colors">
                <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart
              </button>
              <button className="flex items-center justify-center p-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Details</h2>
            <ul className="text-gray-600 space-y-2">
              <li><strong className="font-semibold">Category:</strong> {productId?.category || 'N/A'}</li>
              <li><strong className="font-semibold">Brand:</strong> {productId?.brand || 'N/A'}</li>
              <li><strong className="font-semibold">Influencer:</strong> {influencerName}</li>
              <li><strong className="font-semibold">Last Updated:</strong> {new Date(item.updatedAt).toLocaleDateString()}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

