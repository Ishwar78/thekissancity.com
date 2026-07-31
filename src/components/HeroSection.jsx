import React, { useState, useEffect, useRef } from 'react';
import { api, getApiUrl } from '../utils/api';

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [mainBanners, setMainBanners] = useState([]);
  const [sideBanners, setSideBanners] = useState([]);
  const timerRef = useRef(null);

  const API_URL = getApiUrl();

  const getFullImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await api('/api/banners');
        if (data.success && data.banners) {
          const main = data.banners.filter(b => b.type === 'main');
          const side = data.banners.filter(b => b.type === 'side');
          setMainBanners(main);
          setSideBanners(side);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };
    fetchBanners();
  }, []);

  const startTimer = () => {
    if (mainBanners.length <= 1) return; // don't cycle if 1 or 0 banners
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % mainBanners.length);
    }, 5000);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [mainBanners]);

  const slide = mainBanners.length > 0 ? mainBanners[current] : null;

  return (
    <section className="hero">
      <div className="container">
        <div className="hero__grid">
          {/* ── Main Slider ── */}
          <div
            className="hero__main"
            style={{ 
              background: 'linear-gradient(135deg, #0e3a0e 0%, #1a6b1a 40%, #2fa62f 100%)', // Default fallback background
              backgroundColor: '#1a6b1a'
            }}
          >
            {slide && (
              <>
                <img
                  src={getFullImageUrl(slide.imageUrl)}
                  alt="Hero"
                  className="hero__main-img"
                  style={{ objectFit: 'cover' }}
                />
                <div 
                  className="hero__main-link" 
                  style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'pointer' }} 
                  onClick={() => window.location.href = slide.link || '#products'} 
                />
              </>
            )}
            {!slide && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.7)' }}>
                No main banners added.
              </div>
            )}
          </div>

          {/* ── Right Promo Cards ── */}
          <div className="hero__right">
            {sideBanners.slice(0, 2).map((card) => ( // Restrict to max 2 side banners to preserve layout
              <div key={card._id} className="hero__promo-card" style={{ overflow: 'hidden' }}>
                <img 
                  src={getFullImageUrl(card.imageUrl)} 
                  alt="Promo Banner" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                <div 
                  style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'pointer' }} 
                  onClick={() => window.location.href = card.link || '#products'} 
                />
              </div>
            ))}
            
            {sideBanners.length === 0 && (
               <div style={{ gridRow: 'span 2', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9ecef', borderRadius: '16px', color: '#6c757d' }}>
                 No side banners added.
               </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
