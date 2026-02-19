import React, { useState, useEffect, useCallback } from 'react';
import { User, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { Link } from 'react-router-dom';
import { ArrowRight } from "lucide-react";
interface Product {
  _id: string;
  title: string;
  images: string[];
}

interface InfluencerImageItem {
  _id: string;
  imageUrl: string;
  influencerName: string;
  productId: Product;
  updatedAt: string;
}

export default function InfluencerImageGrid() {
  const [influencerImages, setInfluencerImages] = useState<InfluencerImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const fetchInfluencerImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/api/influencer-images/public');
      if (!res.ok) {
        throw new Error(res.json?.message || 'Failed to fetch influencer images');
      }
      const data = res.json.data;
      setInfluencerImages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfluencerImages();
  }, [fetchInfluencerImages]);

  return (
    <section className="w-full bg-white py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex-1"></div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
              Featured Collections
            </h2>
            <div className="flex-1"></div>
          </div>
          {/* <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection styled by leading fashion influencers
          </p> */}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-200 rounded-none overflow-hidden" 
                style={{ 
                  gridRow: i % 3 === 0 ? 'span 2' : 'span 1',
                  height: i % 3 === 0 ? '500px' : '250px' 
                }}
              >
                <div className="w-full h-full bg-gray-300" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-12">
            Error loading images. Please try again.
          </div>
        ) : influencerImages.length === 0 ? (
          <div className="text-gray-500 text-center py-12">
            No images available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {influencerImages.slice(0, -2).map((item, index) => (
              <div
                key={item._id}
                className="relative overflow-hidden group cursor-pointer"
                style={{ 
                  gridRow: index % 3 === 0 ? 'span 2' : 'span 1',
                  minHeight: index % 3 === 0 ? '500px' : '250px'
                }}
                onMouseEnter={() => setHoveredId(item._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.influencerName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
                  hoveredId === item._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-semibold text-lg md:text-xl mb-1 line-clamp-2">
                      {item.productId?.title || 'Exclusive Collection'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-200 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {item.influencerName}
                    </p>
                  </div>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
                    <Package className="h-4 w-4 text-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show all influencers button at the end */}
       
         <div className="text-center mt-10 md:mt-16">
                                    <Link
                                      to="/all-influencers"
                                      className="inline-flex items-center text-sm font-medium text-primary hover:text-gray-900 transition-colors group"
                                    >
                                      View All Influencers
                                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                  </div>
      </div>
    </section>
  );
}