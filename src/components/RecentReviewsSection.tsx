import { useEffect, useState } from 'react';
import { Star, Loader2, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { api } from '@/lib/api';

// ── Brand tokens matching Kissan City palette ──────────────────────
const BRAND = {
  cream:      '#F5F0E8',
  creamLight: '#FAF6EF',
  green:      '#2d5a1b',
  greenDark:  '#1e3d12',
  brown:      '#6b4423',
  brownLight: '#8b5e3c',
  gold:       '#c8973a',
  goldLight:  '#e8b84b',
  text:       '#3b2410',
  textMuted:  '#7a5c3a',
  border:     '#ddd0bc',
  cardBg:     '#ffffff',
};

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
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className="h-4 w-4 transition-all duration-200"
        style={{
          fill: i < Math.floor(rating) ? BRAND.gold : '#e5d9c8',
          color: i < Math.floor(rating) ? BRAND.gold : '#e5d9c8',
        }}
      />
    ))}
    <span
      className="ml-1.5 text-xs font-bold"
      style={{ color: BRAND.gold }}
    >
      {rating.toFixed(1)}
    </span>
  </div>
);

const ReviewCard = ({ review, index, isExpanded, onToggleExpand }: ReviewCardProps) => {
  const needsTruncation = review.text.length > 150;
  const userName = review.username || review.userId?.name || 'Anonymous';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className="group relative flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-1"
      style={{
        backgroundColor: BRAND.cardBg,
        border: `1px solid ${BRAND.border}`,
        boxShadow: '0 2px 16px rgba(107,68,35,0.08)',
        minHeight: '280px',
      }}
    >
      {/* Top green accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${BRAND.green}, ${BRAND.gold})`,
        }}
      />

      <div className="flex flex-col flex-1 p-6">
        {/* Quote icon */}
        <Quote
          className="h-8 w-8 mb-4 opacity-20"
          style={{ color: BRAND.brown }}
        />

        {/* Review text */}
        <p
          className={`flex-1 text-sm leading-relaxed mb-5 ${
            !isExpanded && needsTruncation ? 'line-clamp-4' : ''
          }`}
          style={{
            color: BRAND.textMuted,
            fontFamily: "'Georgia', serif",
            fontStyle: 'italic',
          }}
        >
          "{review.text}"
        </p>

        {needsTruncation && (
          <button
            onClick={onToggleExpand}
            className="sm:hidden mb-4 flex items-center gap-1 text-xs font-semibold transition-colors self-start"
            style={{ color: BRAND.green }}
          >
            {isExpanded ? (
              <><span>Read Less</span><ChevronUp className="h-3 w-3" /></>
            ) : (
              <><span>Read More</span><ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        )}

        {/* Divider */}
        <div className="h-px mb-4" style={{ backgroundColor: BRAND.border }} />

        {/* User row */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
            style={{
              background: `linear-gradient(135deg, ${BRAND.green}, ${BRAND.gold})`,
              color: '#fff',
            }}
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-bold truncate"
              style={{ color: BRAND.text, fontFamily: "'Georgia', serif" }}
            >
              {userName}
            </p>
            <StarRating rating={review.rating} />
          </div>

          {/* Verified badge */}
          <div
            className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: '#e8f5e1',
              color: BRAND.green,
              border: `1px solid #c3e6b0`,
            }}
          >
            ✓ Verified
          </div>
        </div>
      </div>
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
        const { ok, json } = await api('/api/reviews/recent?limit=6');
        if (ok) {
          setReviews(json.data || []);
        } else {
          setError(json?.message || 'Failed to fetch reviews.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecentReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-20" style={{ backgroundColor: BRAND.cream }}>
        <div className="container mx-auto text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto" style={{ color: BRAND.green }} />
          <p className="mt-3 text-sm" style={{ color: BRAND.textMuted }}>Loading reviews...</p>
        </div>
      </section>
    );
  }

  if (error || reviews.length === 0) return null;

  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: BRAND.cream }}
    >
      {/* Subtle dot pattern background */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${BRAND.gold}22 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section Header ── */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div
            className="flex-1 h-px max-w-[120px]"
            style={{ background: `linear-gradient(to right, transparent, ${BRAND.gold})` }}
          />
          <div className="text-center">
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{
                color: BRAND.brown,
                fontFamily: "'Georgia', 'Times New Roman', serif",
              }}
            >
              · What Our Customers Say ·
            </h2>
            {/* Star summary row */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4" style={{ fill: BRAND.gold, color: BRAND.gold }} />
                ))}
              </div>
              <span className="text-sm font-bold" style={{ color: BRAND.text }}>4.9/5</span>
              <span className="text-sm" style={{ color: BRAND.textMuted }}>
                · {reviews.length}+ verified reviews
              </span>
            </div>
          </div>
          <div
            className="flex-1 h-px max-w-[120px]"
            style={{ background: `linear-gradient(to left, transparent, ${BRAND.gold})` }}
          />
        </div>

        {/* ── Reviews Carousel ── */}
        <div className="relative max-w-6xl mx-auto">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 md:-ml-5">
              {reviews.map((review, index) => {
                const isExpanded = expandedReviews.has(review._id);
                const toggleExpand = () => {
                  setExpandedReviews(prev => {
                    const next = new Set(prev);
                    next.has(review._id) ? next.delete(review._id) : next.add(review._id);
                    return next;
                  });
                };
                return (
                  <CarouselItem
                    key={review._id}
                    className="pl-4 md:pl-5 basis-full sm:basis-1/2 lg:basis-1/3"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.08}s both` }}
                  >
                    <ReviewCard
                      review={review}
                      index={index}
                      isExpanded={isExpanded}
                      onToggleExpand={toggleExpand}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Desktop nav buttons */}
            <div className="hidden sm:flex gap-3 absolute -top-16 right-0">
              <CarouselPrevious
                className="static translate-y-0 h-10 w-10 rounded-full border-2 transition-all duration-200"
                style={{
                  borderColor: BRAND.border,
                  backgroundColor: '#fff',
                  color: BRAND.brown,
                }}
              />
              <CarouselNext
                className="static translate-y-0 h-10 w-10 rounded-full border-2 transition-all duration-200"
                style={{
                  borderColor: BRAND.border,
                  backgroundColor: '#fff',
                  color: BRAND.brown,
                }}
              />
            </div>

            {/* Mobile nav buttons */}
            <div className="flex sm:hidden justify-center gap-3 mt-6">
              <CarouselPrevious
                className="static translate-y-0 h-10 w-10 rounded-full border-2"
                style={{
                  borderColor: BRAND.border,
                  backgroundColor: '#fff',
                  color: BRAND.brown,
                }}
              />
              <CarouselNext
                className="static translate-y-0 h-10 w-10 rounded-full border-2"
                style={{
                  borderColor: BRAND.border,
                  backgroundColor: '#fff',
                  color: BRAND.brown,
                }}
              />
            </div>
          </Carousel>
        </div>

      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}