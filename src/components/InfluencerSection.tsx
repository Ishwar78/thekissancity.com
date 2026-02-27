import React, { useState, useEffect, useRef } from 'react';
import { Loader2, ArrowRight, ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  _id: string;
  title: string;
  images: string[];
}

interface InfluencerDataItem {
  _id: string;
  videoUrl: string;
  productId: Product;
  createdAt: string;
  updatedAt: string;
}

declare const api: (url: string) => Promise<{ ok: boolean; json: any }>;

export default function InfluencerSection() {
  const [influencerData, setInfluencerData] = useState<InfluencerDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<InfluencerDataItem | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart) setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrevious();
    setTouchStart(null); setTouchEnd(null);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    const fetchInfluencerData = async () => {
      setLoading(true); setError(null);
      try {
        let data;
        if (typeof api === 'function') {
          const res = await api('/api/influencer-data/public');
          if (!res.ok) throw new Error(res.json?.message || 'Failed to fetch');
          data = res.json.data;
        } else {
          const response = await fetch('/api/influencer-data/public');
          const json = await response.json();
          if (!response.ok) throw new Error(json?.message || 'Failed to fetch');
          data = json.data;
        }
        setInfluencerData(data);
        if (data.length > 0) { setSelectedVideo(data[0]); setCurrentVideoIndex(0); }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencerData();
  }, []);

  const handlePrevious = () => {
    const newIndex = currentVideoIndex === 0 ? influencerData.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(newIndex); setSelectedVideo(influencerData[newIndex]);
  };
  const handleNext = () => {
    const newIndex = currentVideoIndex === influencerData.length - 1 ? 0 : currentVideoIndex + 1;
    setCurrentVideoIndex(newIndex); setSelectedVideo(influencerData[newIndex]);
  };
  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index); setSelectedVideo(influencerData[index]);
  };

  if (loading) {
    return (
      <section className="py-20 bg-[#F5F0E8]">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" style={{ color: '#2d6a4f' }} />
          <p className="mt-4 text-sm" style={{ color: '#6b4423' }}>Loading content…</p>
        </div>
      </section>
    );
  }

  if (error || !influencerData.length) return null;

  const otherVideos = influencerData.filter(item => item._id !== selectedVideo?._id);

  return (
    <section className="is-root py-14 sm:py-20 bg-[#F5F0E8] overflow-hidden">
      <style>{`
        .is-root {
          --green:      #2d6a4f;
          --green-dark: #1b4332;
          --green-soft: #d8f3dc;
          --brown:      #6b4423;
          --brown-mid:  #ba8c5c;
          --cream:      #faf3eb;
        }

        /* ── Header ── */
        .is-eyebrow {
          display: inline-block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--brown-mid);
          background: rgba(107,68,35,0.08);
          padding: 4px 14px; border-radius: 20px;
          margin-bottom: 10px;
        }
        .is-title {
          font-size: clamp(1.9rem, 4.5vw, 3.2rem);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1;
          color: var(--brown); margin-bottom: 10px;
        }
        .is-title span { color: var(--green); }
        .is-underline {
          height: 4px; width: 60px; border-radius: 4px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          margin: 0 auto;
        }

        /* ── Main video card ── */
        .is-main-card {
          position: relative;
          background: #111;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.3);
        }
        .is-main-card video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }

        /* Bottom gradient */
        .is-vid-gradient {
          position: absolute; bottom: 0; left: 0; right: 0; height: 45%;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          pointer-events: none; z-index: 2;
        }

        /* Video info overlay */
        .is-vid-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 18px;
          z-index: 3;
        }
        .is-vid-title {
          font-size: 15px; font-weight: 700; color: #fff;
          line-height: 1.35; text-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }

        /* Counter pill */
        .is-counter {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(6px);
          color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 0.4px;
          padding: 4px 11px; border-radius: 20px;
        }

        /* Mute button */
        .is-mute-btn {
          position: absolute; top: 14px; left: 14px; z-index: 10;
          width: 34px; height: 34px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(6px);
          color: #fff;
          transition: background 0.2s, transform 0.2s;
        }
        .is-mute-btn:hover { background: rgba(0,0,0,0.65); transform: scale(1.08); }
        .is-mute-btn:focus { outline: none; }

        /* Mobile nav buttons */
        .is-nav-btn {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
          width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          color: #fff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.2);
          transition: background 0.2s, transform 0.2s;
        }
        .is-nav-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-50%) scale(1.08); }
        .is-nav-btn:active { transform: translateY(-50%) scale(0.92) !important; }
        .is-nav-btn:focus { outline: none; }
        .is-nav-btn:disabled { opacity: 0.3; cursor: default; }
        .is-nav-prev { left: 10px; }
        .is-nav-next { right: 10px; }

        /* Dot indicators */
        .is-dots {
          display: flex; justify-content: center; align-items: center; gap: 6px;
          margin-top: 16px;
        }
        .is-dot {
          border: none; cursor: pointer; padding: 0;
          height: 5px; width: 5px; border-radius: 20px;
          background: rgba(107,68,35,0.25);
          transition: width 0.3s, background 0.3s;
        }
        .is-dot.active { background: var(--green); width: 20px; }
        .is-dot:focus { outline: none; }

        /* ── Desktop sidebar thumbnails ── */
        .is-thumb-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
          max-height: 580px; overflow-y: auto;
          padding-right: 4px;
          scrollbar-width: thin;
          scrollbar-color: rgba(107,68,35,0.2) transparent;
        }
        .is-thumb-grid::-webkit-scrollbar { width: 4px; }
        .is-thumb-grid::-webkit-scrollbar-thumb { background: rgba(107,68,35,0.2); border-radius: 4px; }

        .is-thumb {
          position: relative;
          border-radius: 16px; overflow: hidden;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          background: #111;
        }
        .is-thumb:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
        }
        .is-thumb.active {
          ring: 2px solid var(--green);
          outline: 2.5px solid var(--green);
          outline-offset: 2px;
        }
        .is-thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .is-thumb-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%);
          pointer-events: none;
        }
        .is-thumb-label {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 10px;
          z-index: 2;
        }
        .is-thumb-label span {
          font-size: 11px; font-weight: 700; color: #fff;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          line-height: 1.3; text-shadow: 0 1px 3px rgba(0,0,0,0.5);
        }

        /* Play icon on thumb hover */
        .is-thumb-play {
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%) scale(0.8);
          opacity: 0; z-index: 3;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.9);
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
          pointer-events: none;
        }
        .is-thumb:hover .is-thumb-play {
          opacity: 1; transform: translate(-50%, -50%) scale(1);
        }

        /* View all link */
        .is-view-all {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 700;
          color: var(--green);
          text-decoration: none;
          padding: 9px 20px; border-radius: 30px;
          border: 1.5px solid rgba(45,106,79,0.3);
          background: rgba(45,106,79,0.05);
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .is-view-all:hover {
          background: var(--green);
          color: #fff;
          border-color: var(--green);
          transform: translateY(-1px);
        }
        .is-view-all svg { transition: transform 0.2s; }
        .is-view-all:hover svg { transform: translateX(3px); }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <span className="is-eyebrow">Creator Content</span>
          <h2 className="is-title">Influencer <span>Spotlight</span></h2>
          <div className="is-underline" />
        </div>

        {/* ── MOBILE ── */}
        <div className="lg:hidden">
          <div className="is-main-card" style={{ aspectRatio: '9/16', maxHeight: 520 }}>
            <video
              ref={videoRef}
              src={selectedVideo?.videoUrl}
              controls
              muted={false}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={(e) => {
                const v = e.currentTarget;
                if (v.paused) v.play().catch(() => {});
                v.muted = false; v.volume = 1.0; setIsMuted(false);
              }}
              onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
              onPlay={(e) => { setIsMuted(e.currentTarget.muted); setHasVideoEnded(false); }}
              onEnded={() => setHasVideoEnded(true)}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget;
                if (v.duration > 0 && v.readyState >= 2) v.currentTime = 0.1;
              }}
              className="w-full h-full object-cover"
              preload="metadata"
              style={{ borderRadius: 24 }}
            />

            <div className="is-vid-gradient" />

            {/* Counter */}
            <div className="is-counter">{currentVideoIndex + 1} / {influencerData.length}</div>

            {/* Mute toggle */}
            <button className="is-mute-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Video title */}
            <div className="is-vid-info">
              <div className="is-vid-title">{selectedVideo?.productId?.title || 'Featured Product'}</div>
            </div>

            {/* Nav */}
            <button className="is-nav-btn is-nav-prev" onClick={handlePrevious} disabled={influencerData.length <= 1} aria-label="Previous">
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <button className="is-nav-btn is-nav-next" onClick={handleNext} disabled={influencerData.length <= 1} aria-label="Next">
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* Dots */}
          <div className="is-dots">
            {influencerData.map((_, i) => (
              <button key={i} className={`is-dot ${i === currentVideoIndex ? 'active' : ''}`}
                onClick={() => handleVideoSelect(i)} aria-label={`Video ${i + 1}`} />
            ))}
          </div>
        </div>

        {/* ── DESKTOP ── */}
        <div className="hidden lg:flex gap-8 items-start max-w-6xl mx-auto">

          {/* Main feature video */}
          <div className="w-[42%] flex-shrink-0">
            <div className="is-main-card" style={{ aspectRatio: '9/16', maxHeight: 600 }}>
              {selectedVideo && (
                <video
                  key={selectedVideo._id}
                  src={selectedVideo.videoUrl}
                  controls
                  muted={false}
                  onVolumeChange={(e) => setIsMuted(e.currentTarget.muted)}
                  onPlay={(e) => { setIsMuted(e.currentTarget.muted); setHasVideoEnded(false); }}
                  onEnded={() => setHasVideoEnded(true)}
                  onLoadedMetadata={(e) => {
                    const v = e.currentTarget;
                    if (v.duration > 0 && v.readyState >= 2) v.currentTime = 0.1;
                  }}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  style={{ borderRadius: 24 }}
                />
              )}
              <div className="is-vid-gradient" />
              <button className="is-mute-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <div className="is-vid-info">
                <div className="is-vid-title">{selectedVideo?.productId?.title || 'Featured Product'}</div>
              </div>
            </div>
          </div>

          {/* Thumbnail grid */}
          <div className="flex-1">
            <div className="is-thumb-grid">
              {otherVideos.map((item, i) => {
                const globalIndex = influencerData.findIndex(v => v._id === item._id);
                return (
                  <div
                    key={item._id}
                    className={`is-thumb ${selectedVideo?._id === item._id ? 'active' : ''}`}
                    style={{ aspectRatio: '9/16' }}
                    onClick={() => handleVideoSelect(globalIndex)}
                  >
                    <video
                      src={item.videoUrl}
                      muted playsInline preload="metadata"
                      className="w-full h-full object-cover"
                      onLoadedMetadata={(e) => {
                        const v = e.currentTarget;
                        if (v.duration > 0 && v.readyState >= 2) v.currentTime = 0.1;
                      }}
                      onLoadedData={(e) => {
                        const v = e.currentTarget;
                        if (v.readyState >= 2) v.currentTime = 0.1;
                      }}
                    />
                    <div className="is-thumb-overlay" />
                    <div className="is-thumb-play">
                      <Play size={14} fill="#2d6a4f" color="#2d6a4f" />
                    </div>
                    <div className="is-thumb-label">
                      <span>{item.productId?.title || 'Product Review'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* View all */}
        <div className="text-center mt-10 sm:mt-14">
          <Link to="/videos" className="is-view-all">
            View All Videos
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </section>
  );
}