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
    <section className="w-full py-6 sm:py-8 lg:py-10" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
            <div className="flex-1"></div>
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ color: '#6b4423' }}
            >
              Featured Collections
            </h2>
            <div className="flex-1"></div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div 
                key={i} 
                className="bg-gray-200 rounded-none overflow-hidden" 
                style={{ 
                  gridRow: i % 3 === 0 ? 'span 2' : 'span 1',
                  height: i % 3 === 0 ? '350px' : '175px',
                  maxHeight: i % 3 === 0 ? '400px' : '200px'
                }}
              >
                <div className="w-full h-full bg-gray-300" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8 sm:py-10">
            Error loading images. Please try again.
          </div>
        ) : influencerImages.length === 0 ? (
          <div className="text-gray-500 text-center py-8 sm:py-10">
            No images available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3">
            {influencerImages.slice(0, -2).map((item, index) => (
              <div
                key={item._id}
                className="relative overflow-hidden group cursor-pointer"
                style={{ 
                  gridRow: index % 3 === 0 ? 'span 2' : 'span 1',
                  minHeight: index % 3 === 0 ? '300px' : '150px',
                  maxHeight: index % 3 === 0 ? '400px' : '200px'
                }}
                onMouseEnter={() => setHoveredId(item._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.influencerName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
                  hoveredId === item._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}>
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 text-white transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-semibold text-xs sm:text-sm md:text-base lg:text-lg mb-0.5 sm:mb-1 line-clamp-2">
                      {item.productId?.title || 'Exclusive Collection'}
                    </h3>
                    <p className="text-[10px] sm:text-xs md:text-sm text-gray-200 flex items-center gap-1">
                      <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4" />
                      <span className="truncate max-w-[80px] sm:max-w-[120px]">{item.influencerName}</span>
                    </p>
                  </div>
                </div>
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg">
                    <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 text-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Show all influencers button */}
        <div className="text-center mt-8 sm:mt-10 md:mt-12">
          <Link
            to="/all-influencers"
            className="inline-flex items-center text-xs sm:text-sm font-medium text-primary hover:text-gray-900 transition-colors group"
            style={{ color: '#6b4423' }}
          >
            View All Influencers
            <ArrowRight className="ml-1.5 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}