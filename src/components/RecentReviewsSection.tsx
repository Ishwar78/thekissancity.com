import { useEffect, useState, useRef } from 'react';
import { Star, Loader2, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { api } from '@/lib/api';

const BRAND = {
  cream:     '#F5F0E8',
  green:     '#2d6a4f',
  greenSoft: '#d8f3dc',
  brown:     '#6b4423',
  brownMid:  '#ba8c5c',
  gold:      '#c8973a',
  text:      '#3b2410',
  textMuted: '#7a5c3a',
  border:    '#e8ddd0',
};

interface Review {
  _id: string;
  text: string;
  rating: number;
  productId: { _id: string; title: string; slug: string; images?: string[]; };
  userId: { _id: string; name?: string; email?: string; };
  username?: string;
  createdAt: string;
}

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={13}
        style={{ fill: i < Math.floor(rating) ? BRAND.gold : '#e5d9c8', color: 'transparent' }}
      />
    ))}
    <span className="ml-1 text-xs font-bold" style={{ color: BRAND.gold }}>{rating.toFixed(1)}</span>
  </div>
);

const ReviewCard = ({
  review, index, isExpanded, onToggleExpand, visible
}: {
  review: Review; index: number; isExpanded: boolean;
  onToggleExpand: () => void; visible: boolean;
}) => {
  const needsTruncation = review.text?.length > 150;
  const userName = review.username || review.userId?.name || 'Anonymous';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className="rr-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      <div className="rr-top-bar" />
      <div className="rr-glow" />

      <div className="rr-card-inner">
        <div className="rr-quote-wrap">
          <Quote size={18} className="rr-quote-icon" style={{ transform: 'rotate(180deg)' }} />
        </div>

        <p className={`rr-text ${!isExpanded && needsTruncation ? 'rr-clamped' : ''}`}>
          "{review.text}"
        </p>

        {needsTruncation && (
          <button onClick={onToggleExpand} className="rr-expand-btn sm:hidden">
            {isExpanded
              ? <><span>Read Less</span><ChevronUp size={12} /></>
              : <><span>Read More</span><ChevronDown size={12} /></>}
          </button>
        )}

        <div className="rr-divider" />

        <div className="rr-footer">
          <div className="rr-avatar">
            {initials}
            <div className="rr-avatar-ring" />
          </div>
          <div className="rr-user-info">
            <p className="rr-username">{userName}</p>
            <StarRating rating={review.rating} />
          </div>
          <div className="rr-verified">✓ Verified</div>
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
  // ✅ Start as true — so cards are visible even if observer doesn't fire
  const [visible, setVisible] = useState(true);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Still use observer for the animation, but default is visible
    const node = sectionRef.current;
    if (!node) return;
    // If already in viewport on mount, stay visible
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setVisible(true);
      return;
    }
    // Otherwise animate in on scroll
    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        const { ok, json } = await api('/api/reviews/recent?limit=6');
        console.log('[Reviews] API response:', { ok, json }); // ← debug log
        if (ok) {
          // Handle both { data: [] } and direct array responses
          const data = Array.isArray(json) ? json : (json?.data || json?.reviews || []);
          console.log('[Reviews] Parsed data:', data.length, 'items');
          setReviews(data);
        } else {
          setError(json?.message || 'Failed to fetch reviews.');
        }
      } catch (err: any) {
        console.error('[Reviews] Fetch error:', err);
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
          <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: BRAND.green }} />
          <p className="mt-3 text-sm" style={{ color: BRAND.textMuted }}>Loading reviews…</p>
        </div>
      </section>
    );
  }

  // ✅ Show error instead of silently returning null
  if (error) {
    return (
      <section className="py-12" style={{ backgroundColor: BRAND.cream }}>
        <div className="container mx-auto text-center text-sm" style={{ color: '#a0a0a0' }}>
          Could not load reviews: {error}
        </div>
      </section>
    );
  }

  // ✅ Show empty state instead of silently returning null
  if (reviews.length === 0) {
    return (
      <section className="py-12" style={{ backgroundColor: BRAND.cream }}>
        <div className="container mx-auto text-center text-sm" style={{ color: '#a0a0a0' }}>
          No reviews yet — be the first to leave one!
        </div>
      </section>
    );
  }

  return (
    <section className="rr-root py-16 sm:py-20 relative overflow-hidden" style={{ backgroundColor: BRAND.cream }}>
      <style>{`
        .rr-root::before {
          content: '';
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(200,151,58,0.12) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none; z-index: 0;
        }

        /* ── Card base ── */
        .rr-card {
          position: relative;
          background: #fff;
          border-radius: 22px;
          border: 1.5px solid #e8ddd0;
          box-shadow: 0 4px 18px rgba(45,106,79,0.06);
          overflow: hidden;
          height: 100%;
          display: flex; flex-direction: column;
          transition: opacity 0.6s ease, transform 0.6s ease,
                      box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .rr-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 48px rgba(45,106,79,0.14) !important;
          border-color: rgba(45,106,79,0.22) !important;
        }

        /* Top sweep bar */
        .rr-top-bar {
          height: 3px;
          background: linear-gradient(90deg, #2d6a4f, #c8973a);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.4s ease;
        }
        .rr-card:hover .rr-top-bar { transform: scaleX(1); }

        /* Glow overlay */
        .rr-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 50% 0%, rgba(45,106,79,0.05) 0%, transparent 65%);
          opacity: 0; transition: opacity 0.4s ease; z-index: 0;
        }
        .rr-card:hover .rr-glow { opacity: 1; }

        .rr-card-inner {
          padding: 20px 20px 18px;
          display: flex; flex-direction: column; flex: 1;
          position: relative; z-index: 1;
        }

        /* Quote icon */
        .rr-quote-wrap {
          width: 36px; height: 36px; border-radius: 50%;
          background: #d8f3dc;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          transition: background 0.3s, transform 0.3s;
          flex-shrink: 0;
        }
        .rr-card:hover .rr-quote-wrap { background: #2d6a4f; transform: rotate(-8deg) scale(1.08); }
        .rr-quote-icon { color: #2d6a4f; transition: color 0.3s; }
        .rr-card:hover .rr-quote-icon { color: #fff !important; }

        /* Text */
        .rr-text {
          flex: 1; font-size: 13px; line-height: 1.7;
          color: #7a5c3a; font-style: italic; margin-bottom: 14px;
        }
        .rr-clamped {
          display: -webkit-box; -webkit-line-clamp: 4;
          -webkit-box-orient: vertical; overflow: hidden;
        }

        .rr-expand-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700;
          color: #2d6a4f; border: none; background: none;
          cursor: pointer; margin-bottom: 12px; padding: 0;
        }

        .rr-divider {
          height: 1px;
          background: linear-gradient(90deg, #e8ddd0, transparent);
          margin-bottom: 14px;
          transition: background 0.3s;
        }
        .rr-card:hover .rr-divider {
          background: linear-gradient(90deg, rgba(45,106,79,0.2), transparent);
        }

        .rr-footer { display: flex; align-items: center; gap: 10px; }

        /* Avatar */
        .rr-avatar {
          position: relative; flex-shrink: 0;
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #2d6a4f, #c8973a);
          color: #fff; font-size: 12px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.3s;
        }
        .rr-card:hover .rr-avatar { transform: scale(1.1); }

        @keyframes rr-pulse {
          0%   { transform: scale(1); opacity: 0.4; }
          70%  { transform: scale(1.65); opacity: 0; }
          100% { transform: scale(1.65); opacity: 0; }
        }
        .rr-avatar-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid #2d6a4f; opacity: 0;
          animation: rr-pulse 2.4s ease-out infinite;
        }
        .rr-card:hover .rr-avatar-ring { opacity: 0.4; }

        .rr-user-info { flex: 1; min-width: 0; }
        .rr-username {
          font-size: 13px; font-weight: 700; color: #3b2410;
          margin-bottom: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .rr-verified {
          flex-shrink: 0; font-size: 10px; font-weight: 700;
          background: #d8f3dc; color: #2d6a4f;
          border: 1px solid #c3e6b0;
          padding: 2px 8px; border-radius: 20px;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .rr-card:hover .rr-verified { background: #2d6a4f; color: #fff; border-color: #2d6a4f; }

        /* Nav buttons */
        .rr-nav-btn {
          width: 40px !important; height: 40px !important;
          border-radius: 50% !important;
          border: 1.5px solid #e8ddd0 !important;
          background: #fff !important;
          box-shadow: 0 2px 10px rgba(45,106,79,0.08) !important;
          transition: all 0.2s ease !important;
          position: static !important; transform: none !important;
        }
        .rr-nav-btn:hover {
          border-color: #2d6a4f !important;
          box-shadow: 0 4px 18px rgba(45,106,79,0.2) !important;
          transform: scale(1.07) !important;
        }
        .rr-nav-btn:active  { transform: scale(0.92) !important; }
        .rr-nav-btn:focus   { outline: none !important; }

        /* Header */
        .rr-eyebrow {
          display: inline-block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #ba8c5c; background: rgba(107,68,35,0.08);
          padding: 4px 14px; border-radius: 20px; margin-bottom: 10px;
        }
        .rr-title {
          font-size: clamp(1.5rem,4vw,3rem);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1;
          color: #6b4423; margin-bottom: 10px;
        }
        .rr-title span { color: #2d6a4f; }
        .rr-underline {
          height: 4px; width: 60px; border-radius: 4px;
          background: linear-gradient(90deg, #2d6a4f, #ba8c5c);
          margin: 0 auto 14px;
        }
        .rr-summary {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid #e8ddd0;
          padding: 6px 16px; border-radius: 30px;
          box-shadow: 0 2px 10px rgba(107,68,35,0.07);
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 relative z-10" ref={sectionRef}>

        {/* Header */}
        <div className="text-center mb-12">
          <span className="rr-eyebrow">Trusted by Thousands</span>
          <h2 className="rr-title">What Our <span>Customers</span> Say</h2>
          <div className="rr-underline" />
          <div className="rr-summary">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} style={{ fill: BRAND.gold, color: 'transparent' }} />
              ))}
            </div>
            <span className="text-sm font-bold" style={{ color: BRAND.text }}>4.9/5</span>
            <span className="text-xs font-semibold" style={{ color: BRAND.textMuted }}>
              · {reviews.length}+ verified reviews
            </span>
          </div>
        </div>

        {/* Carousel */}
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-6xl mx-auto">

          <div className="hidden sm:flex justify-end gap-2 mb-5">
            <CarouselPrevious className="rr-nav-btn"
              onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)} />
            <CarouselNext className="rr-nav-btn"
              onMouseDown={(e) => setTimeout(() => e.currentTarget.blur(), 150)} />
          </div>

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
                <CarouselItem key={review._id}
                  className="pl-4 md:pl-5 basis-full sm:basis-1/2 lg:basis-1/3">
                  <ReviewCard
                    review={review} index={index}
                    isExpanded={isExpanded} onToggleExpand={toggleExpand}
                    visible={visible}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <div className="flex sm:hidden justify-center gap-3 mt-6">
            <CarouselPrevious className="rr-nav-btn"
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)} />
            <CarouselNext className="rr-nav-btn"
              onTouchEnd={(e) => setTimeout(() => e.currentTarget.blur(), 150)} />
          </div>

        </Carousel>
      </div>
    </section>
  );
}