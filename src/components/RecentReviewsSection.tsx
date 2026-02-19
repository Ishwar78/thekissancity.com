import { useEffect, useState } from 'react';
import { Star, Loader2, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Add this type for the API utility
declare const api: (url: string) => Promise<{ok: boolean, json: any}>;

interface Review {
  _id: string;
  text: string;
  rating: number;
  productId: {
    _id: string;
    title: string;
    slug: string;
    images?: string[];
  };
  userId: {
    _id: string;
    name?: string;
    email?: string;
    profileImage?: string;
  };
  username?: string;
  email?: string;
  createdAt: string;
  images?: string[];
}

interface ReviewCardProps {
  review: Review;
  color: 'footer-dark' | 'footer-light';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ReviewCard = ({ review, color, isExpanded, onToggleExpand }: ReviewCardProps) => {
  const needsTruncation = review.text.length > 150;

  return (
    <div className="group relative bg-white backdrop-blur-md rounded-3xl p-8 sm:p-10 h-full min-h-[340px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.15)] transition-all duration-500 hover:-translate-y-1 border border-gray-200">
      {/* Decorative overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/[0.02] to-gray-900/[0.02] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Top Quote Icon */}
      <Quote className="absolute top-7 left-7 h-9 w-9 text-gray-200 group-hover:text-gray-300 transition-colors duration-300" />

      {/* Review Text */}
      <div className="relative z-10 flex-1 flex flex-col mb-7 pt-10">
        <p className={`text-gray-700 text-[15.5px] leading-[1.75] font-normal tracking-wide ${
          !isExpanded && needsTruncation 
            ? 'line-clamp-4 sm:line-clamp-5' 
            : ''
        }`}>
          <span className="text-gray-400 text-lg leading-none">"</span>
          {review.text}
          <span className="text-gray-400 text-lg leading-none">"</span>
        </p>
        
        {needsTruncation && (
          <button
            onClick={onToggleExpand}
            className="sm:hidden mt-4 flex items-center gap-1.5 text-black hover:text-gray-700 text-sm font-semibold transition-all duration-200 self-start group/btn"
          >
            {isExpanded ? (
              <>
                <span>Read Less</span>
                <ChevronUp className="h-3.5 w-3.5 group-hover/btn:transform group-hover/btn:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>Read More</span>
                <ChevronDown className="h-3.5 w-3.5 group-hover/btn:transform group-hover/btn:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        )}
      </div>

      {/* User Info Section */}
      <div className="relative z-10 space-y-3 pt-4 border-t border-gray-200">
        <p className="text-gray-900 font-bold text-base tracking-wide">
          {review.username || review.userId?.name || 'Anonymous'}
        </p>
        
        {/* Rating Stars - Black & White */}
        <div className="flex items-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-[18px] w-[18px] transition-all duration-200 ${
                i < Math.floor(review.rating)
                  ? 'fill-black text-black' 
                  : 'fill-gray-200 text-gray-200'
              } group-hover:scale-110`}
              style={{ transitionDelay: `${i * 50}ms` }}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600 font-semibold">
            {review.rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Bottom Quote Icon */}
      <Quote className="absolute bottom-7 right-7 h-9 w-9 text-gray-200 transform rotate-180 group-hover:text-gray-300 transition-colors duration-300" />
      
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-black/5 to-transparent rounded-tr-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default function RecentReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching recent reviews from:', '/api/reviews/recent?limit=6');
        
        if (typeof api === 'function') {
          console.log('Using api() function...');
          const { ok, json } = await api('/api/reviews/recent?limit=6');
          console.log('📊 API Response:', { ok, json });
          
          if (ok) {
            console.log('✅ Reviews received:', json.data?.length || 0);
            setReviews(json.data || []);
          } else {
            console.log('❌ API Error:', json?.message);
            setError(json?.message || 'Failed to fetch recent reviews.');
          }
        } else {
          console.log('Using fetch()...');
          const response = await fetch('/api/reviews/recent?limit=6');
          
          // Check content type before parsing
          const contentType = response.headers.get('content-type');
          console.log('📋 Response Status:', response.status);
          console.log('📋 Content-Type:', contentType);
          
          if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('❌ Server returned non-JSON response');
            console.log('Response preview:', text.substring(0, 200));
            throw new Error('API endpoint not found or not returning JSON.');
          }
          
          const json = await response.json();
          console.log('📊 Parsed JSON:', json);
          
          if (response.ok) {
            console.log('✅ Reviews received:', json.data?.length || 0);
            setReviews(json.data || []);
          } else {
            console.log('❌ API Error:', json?.message);
            setError(json?.message || 'Failed to fetch recent reviews.');
          }
        }
      } catch (err: any) {
        console.error('💥 Fetch Exception:', err);
        setError(err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#FFF8E1] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        
        <div className="container mx-auto text-center relative z-10">
          <div className="inline-flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-black" />
            <p className="text-sm font-medium text-gray-600 animate-pulse">Loading customer reviews...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-[#FFF8E1]">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white border-2 border-gray-300 rounded-2xl p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
                <span className="text-black text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-black mb-2">
                  API Not Connected
                </h3>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">{error}</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  This component is ready to use! Just copy it to your project and ensure your backend API is set up.
                </p>
              </div>
            </div>
            
            <details className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <summary className="cursor-pointer font-bold text-black text-sm mb-3 hover:text-gray-700 transition-colors">
                📋 Backend Setup Instructions
              </summary>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-2">1. Create API Endpoint:</p>
                  <code className="block bg-white p-3 rounded-lg text-xs font-mono border border-gray-300">
                    GET /api/reviews/recent?limit=6
                  </code>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-gray-900 mb-2">2. Return JSON Response:</p>
                  <pre className="bg-white p-3 rounded-lg text-xs overflow-x-auto border border-gray-300">
{`{
  "data": [
    {
      "_id": "123",
      "text": "Great product!",
      "rating": 5,
      "username": "John Doe",
      "userId": {
        "_id": "456",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15"
    }
  ]
}`}
                  </pre>
                </div>
                
                <p className="text-xs text-gray-500 pt-3 border-t border-gray-300">
                  💡 Once your API is configured, this component will automatically fetch and display reviews dynamically.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-20 bg-[#FFF8E1]">
        <div className="container mx-auto text-center">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-10 border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-gray-200">
              <Star className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-black mb-3">No Reviews Yet</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Be the first to share your experience!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-[#FFF8E1] relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-full mb-3 shadow-lg">
            <Star className="h-4 w-4 fill-white text-white" />
            <span className="text-sm font-semibold tracking-wide">TESTIMONIALS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black tracking-tight">
            Our clients always love us
          </h2>
          
         
        </div>

        {/* Reviews Slider */}
        <div className="relative max-w-7xl mx-auto mb-16">
          <Carousel opts={{ 
            align: "start", 
            loop: true,
            dragFree: false,
            containScroll: false,
            skipSnaps: false
          }} className="w-full touch-pan-y">
            <CarouselContent className="-ml-4 md:-ml-6">
              {reviews.map((review, index) => {
                const color = index % 2 === 0 ? 'footer-dark' : 'footer-light';
                const isExpanded = expandedReviews.has(review._id);
                const toggleExpand = () => {
                  setExpandedReviews(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(review._id)) {
                      newSet.delete(review._id);
                    } else {
                      newSet.add(review._id);
                    }
                    return newSet;
                  });
                };
                return (
                  <CarouselItem 
                    key={review._id} 
                    className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3"
                    style={{ 
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` 
                    }}
                  >
                    <ReviewCard 
                      review={review} 
                      color={color} 
                      isExpanded={isExpanded}
                      onToggleExpand={toggleExpand}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Navigation Buttons - Desktop */}
            <div className="hidden sm:flex gap-3 absolute -top-20 right-0">
              <CarouselPrevious 
                className="static translate-y-0 h-12 w-12 rounded-full border-2 border-gray-300 bg-white text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" 
                style={{ backgroundColor: 'white', color: 'black' }}
              />
              <CarouselNext 
                className="static translate-y-0 h-12 w-12 rounded-full border-2 border-gray-300 bg-white text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" 
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            
            {/* Navigation Buttons - Mobile */}
            <div className="flex sm:hidden justify-center gap-3 mt-8">
              <CarouselPrevious 
                className="static translate-y-0 h-12 w-12 rounded-full border-2 border-gray-300 bg-white text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" 
                style={{ backgroundColor: 'white', color: 'black' }}
              />
              <CarouselNext 
                className="static translate-y-0 h-12 w-12 rounded-full border-2 border-gray-300 bg-white text-black hover:border-black hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg" 
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600 mb-5 tracking-wide">
            Join thousands of satisfied customers worldwide
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-5 w-5 fill-black text-black" 
                  />
                ))}
              </div>
              <span className="font-bold text-black text-lg">4.9/5</span>
            </div>
            <div className="hidden sm:block h-6 w-px bg-gray-400" />
            <span className="text-gray-700 font-medium">
              Based on {reviews.length}+ verified reviews
            </span>
          </div>
        </div>
      </div>
      
      {/* Add keyframes animation */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Force reset carousel button states */
        button[class*="CarouselPrevious"],
        button[class*="CarouselNext"] {
          background-color: white !important;
          color: black !important;
          border-color: #d1d5db !important;
        }
        
        button[class*="CarouselPrevious"]:hover,
        button[class*="CarouselNext"]:hover {
          background-color: black !important;
          color: white !important;
          border-color: black !important;
        }
        
        button[class*="CarouselPrevious"]:active,
        button[class*="CarouselNext"]:active {
          transform: scale(0.95) !important;
          background-color: black !important;
          color: white !important;
          border-color: black !important;
        }
      `}</style>
    </section>
  );
} 