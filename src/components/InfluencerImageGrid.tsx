import React, { useState, useEffect, useCallback } from 'react';
import { User, Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// You need to define or import the api function
// If api is imported from '@/lib/api', make sure the path is correct
// If not, you might need to define it or import it properly
import { api } from '@/lib/api';

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

  const fetchInfluencerImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/api/influencer-images/public');
      if (!res.ok) throw new Error(res.json?.message || 'Failed to fetch');
      setInfluencerImages(res.json.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInfluencerImages(); }, [fetchInfluencerImages]);

  return (
    <section className="iig-root w-full py-14 sm:py-20" style={{ backgroundColor: '#F5F0E8' }}>
      <style>{`
        .iig-root {
          --green:      #2d6a4f;
          --green-dark: #1b4332;
          --green-soft: #d8f3dc;
          --brown:      #6b4423;
          --brown-mid:  #ba8c5c;
          --cream:      #faf3eb;
        }

        /* ── Header ── */
        .iig-eyebrow {
          display: inline-block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--brown-mid);
          background: rgba(107,68,35,0.08);
          padding: 4px 14px; border-radius: 20px;
          margin-bottom: 10px;
        }
        .iig-title {
          font-size: clamp(1.9rem, 4.5vw, 3.2rem);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1;
          color: var(--brown); margin-bottom: 10px;
        }
        .iig-title span { color: var(--green); }
        .iig-underline {
          height: 4px; width: 60px; border-radius: 4px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          margin: 0 auto;
        }

        /* ── Grid ── */
        .iig-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 768px) {
          .iig-grid { grid-template-columns: repeat(4, 1fr); gap: 12px; }
        }

        /* ── Card ── */
        .iig-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          cursor: pointer;
          background: #111;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .iig-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 16px 40px rgba(0,0,0,0.18);
        }

        /* Tall cards span 2 rows */
        .iig-card.tall {
          grid-row: span 2;
        }

        /* Image */
        .iig-card img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.65s ease;
        }
        .iig-card:hover img { transform: scale(1.08); }

        /* Overlay */
        .iig-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 55%, transparent 100%);
          opacity: 0;
          transition: opacity 0.35s ease;
        }
        .iig-card:hover .iig-overlay { opacity: 1; }

        /* Info */
        .iig-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 14px 14px 16px;
          z-index: 3;
          transform: translateY(8px);
          opacity: 0;
          transition: transform 0.35s ease, opacity 0.35s ease;
        }
        .iig-card:hover .iig-info { transform: translateY(0); opacity: 1; }

        .iig-prod-title {
          font-size: 13px; font-weight: 700; color: #fff;
          line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          text-shadow: 0 1px 4px rgba(0,0,0,0.4);
          margin-bottom: 5px;
        }
        .iig-influencer {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(6px);
          color: #fff; font-size: 10px; font-weight: 600;
          padding: 3px 9px; border-radius: 20px;
          max-width: 100%;
        }
        .iig-influencer span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Corner tag */
        .iig-corner-tag {
          position: absolute; top: 10px; right: 10px; z-index: 4;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          opacity: 0; transform: scale(0.7);
          transition: opacity 0.25s ease, transform 0.25s ease;
        }
        .iig-card:hover .iig-corner-tag { opacity: 1; transform: scale(1); }

        /* Number badge (always visible) */
        .iig-num {
          position: absolute; top: 10px; left: 10px; z-index: 4;
          font-size: 10px; font-weight: 800; color: #fff;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(4px);
          padding: 2px 8px; border-radius: 20px;
          letter-spacing: 0.3px;
        }

        /* ── Skeleton ── */
        @keyframes iig-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .iig-shimmer {
          background: linear-gradient(90deg,#ede8e0 25%,#f5f0e8 50%,#ede8e0 75%);
          background-size: 200% 100%;
          animation: iig-shimmer 1.4s infinite;
          border-radius: 16px;
        }

        /* ── View all button ── */
        .iig-view-all {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700;
          color: var(--green);
          text-decoration: none;
          padding: 10px 22px; border-radius: 30px;
          border: 1.5px solid rgba(45,106,79,0.3);
          background: rgba(45,106,79,0.05);
          transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .iig-view-all:hover {
          background: var(--green);
          color: #fff;
          border-color: var(--green);
          transform: translateY(-2px);
        }
        .iig-view-all svg { transition: transform 0.2s; }
        .iig-view-all:hover svg { transform: translateX(3px); }
      `}</style>

      <div className="container px-4 sm:px-6 -mt-14">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="iig-eyebrow">As Seen On</span>
          <h2 className="iig-title">Featured <span>Collections</span></h2>
          <div className="iig-underline" />
        </div>

        {loading ? (
          <div className="iig-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`iig-shimmer ${i % 3 === 0 ? 'iig-card tall' : ''}`}
                style={{ minHeight: i % 3 === 0 ? 320 : 160 }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-sm" style={{ color: '#a0a0a0' }}>
            Error loading images. Please try again.
          </div>
        ) : influencerImages.length === 0 ? (
          <div className="text-center py-12 text-sm" style={{ color: '#a0a0a0' }}>
            No images available at the moment.
          </div>
        ) : (
          <div className="iig-grid">
            {influencerImages.slice(0, 8).map((item, index) => {
              const isTall = index % 3 === 0;
              return (
                <div
                  key={item._id}
                  className={`iig-card ${isTall ? 'tall' : ''}`}
                  style={{ minHeight: isTall ? 320 : 160 }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.influencerName}
                    loading="lazy"
                  />

                  <div className="iig-overlay" />

                  {/* Index badge */}
                  <div className="iig-num">#{String(index + 1).padStart(2, '0')}</div>

                  {/* Corner icon */}
                  <div className="iig-corner-tag">
                    <Package size={12} color="#2d6a4f" />
                  </div>

                  {/* Info */}
                  <div className="iig-info">
                    <div className="iig-prod-title">
                      {item.productId?.title || 'Exclusive Collection'}
                    </div>
                    <div className="iig-influencer">
                      <User size={9} />
                      <span>{item.influencerName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View all */}
        <div className="text-center mt-10 sm:mt-14">
          <Link to="/all-influencers" className="iig-view-all">
            View All Influencers
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}