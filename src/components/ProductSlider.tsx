import * as React from "react";
import { ChevronLeft, ChevronRight, ShoppingBag, BookOpen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { productSliderService } from "@/services/productSliderService";
import { ProductSliderItem } from "@/types/productSlider";
import { products } from "@/data/products";

export const ProductSlider = ({ className }: { className?: string }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [sliderItems, setSliderItems] = React.useState<ProductSliderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);
  const autoPlayRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    const fetchSliderData = async () => {
      try {
        const items = await productSliderService.getActiveSliders();
        if (items.length > 0) setSliderItems(items);
      } catch (err) {
        console.error("[PRODUCT SLIDER] Error fetching slider data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSliderData();
  }, []);

  const slides = sliderItems.length > 0 ? sliderItems : products;
  const total = slides.length;

  const goTo = React.useCallback(
    (index: number) => {
      setCurrentSlide((index + total) % total);
    },
    [total]
  );

  // Auto-play
  React.useEffect(() => {
    if (loading || total === 0 || isHovered) return;
    autoPlayRef.current = setInterval(() => goTo(currentSlide + 1), 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentSlide, loading, total, isHovered, goTo]);

  const handleAboutUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname !== "/") {
      navigate("/#about-us");
      return;
    }
    document.getElementById("about-us")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleButtonClick = (link: string) => {
    if (!link) return;
    if (link.startsWith("/")) navigate(link);
    else if (link.startsWith("http")) window.open(link, "_blank");
    else navigate(`/${link}`);
  };

  return (
    <div
      className={`relative w-full overflow-hidden ${className ?? ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Lato:wght@300;400;700&display=swap');

        .kc-slider {
          position: relative;
          width: 100%;
          overflow: hidden;
          background: #0d0a04;
          font-family: 'Lato', sans-serif;
        }

        /* ── TRACK ── */
        .kc-track {
          display: flex;
          transition: transform 0.75s cubic-bezier(0.77, 0, 0.18, 1);
          will-change: transform;
        }

        /* ── SLIDE ── */
        .kc-slide {
          min-width: 100%;
          position: relative;
          height: clamp(220px, 38vw, 440px);
          overflow: hidden;
          background: #0d0a04;
        }

        /* ── IMAGE ── */
        .kc-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 20%;
          display: block;
          transform: scale(1.02);
          transition: transform 6s ease-out;
        }

        .kc-slide.active .kc-img {
          transform: scale(1);
        }

        /* ── SLIDE CONTENT ── */
        .kc-content {
          position: absolute;
          top: 50%;
          left: clamp(20px, 5%, 64px);
          transform: translateY(-50%) translateX(-20px);
          z-index: 2;
          max-width: min(440px, 52%);
          opacity: 0;
          transition: opacity 0.55s 0.35s ease, transform 0.55s 0.35s ease;
        }

        .kc-slide.active .kc-content {
          opacity: 1;
          transform: translateY(-50%) translateX(0);
        }

        /* Tag pill */
        .kc-tag {
          display: inline-block;
          background: #c8821a;
          color: #fff8ee;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          padding: 4px 13px;
          border-radius: 2px;
          margin-bottom: 12px;
        }

        /* Title */
        .kc-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(18px, 2.8vw, 36px);
          font-weight: 700;
          color: #fff8ee;
          line-height: 1.18;
          margin-bottom: 10px;
          text-shadow: 0 2px 16px rgba(0,0,0,0.55);
        }

        /* Subtitle */
        .kc-subtitle {
          font-size: clamp(11px, 1vw, 14px);
          color: rgba(255, 248, 238, 0.78);
          line-height: 1.6;
          font-weight: 300;
          margin-bottom: 18px;
        }

        /* CTA buttons */
        .kc-cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .kc-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          border-radius: 3px;
          cursor: pointer;
          font-size: clamp(10px, 0.9vw, 12px);
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          transition: background 0.22s, transform 0.2s, box-shadow 0.2s;
          border: none;
          font-family: 'Lato', sans-serif;
        }

        .kc-btn-primary {
          background: #c8821a;
          color: #fff8ee;
          box-shadow: 0 4px 18px rgba(200,130,26,0.35);
        }
        .kc-btn-primary:hover {
          background: #a06512;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(200,130,26,0.45);
        }

        .kc-btn-secondary {
          background: rgba(0,0,0,0.5);
          border: 1.5px solid rgba(255,248,238,0.55);
          color: #fff8ee;
          backdrop-filter: blur(6px);
        }
        .kc-btn-secondary:hover {
          background: rgba(0,0,0,0.7);
          transform: translateY(-2px);
        }

        /* ── SLIDE COUNTER (top-right) ── */
        .kc-counter {
          position: absolute;
          top: 16px;
          right: 60px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          color: rgba(255,248,238,0.9);
          padding: 5px 14px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          border: 0.5px solid rgba(255,248,238,0.18);
        }
        .kc-counter-current { color: #c8821a; font-size: 14px; }

        /* ── DOTS ── */
        .kc-dots {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 7px;
          z-index: 10;
        }

        .kc-dot {
          height: 6px;
          border-radius: 3px;
          background: rgba(255,248,238,0.35);
          border: none;
          cursor: pointer;
          transition: width 0.35s ease, background 0.3s;
          padding: 0;
          width: 6px;
        }
        .kc-dot.active {
          width: 28px;
          background: #c8821a;
        }
        .kc-dot:hover:not(.active) {
          background: rgba(255,248,238,0.65);
        }

        /* ── NAV ARROWS ── */
        .kc-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0,0,0,0.50);
          backdrop-filter: blur(5px);
          border: 1px solid rgba(255,248,238,0.22);
          color: #fff8ee;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.22s, border-color 0.22s, transform 0.22s;
        }
        .kc-nav:hover {
          background: #c8821a;
          border-color: #c8821a;
          transform: translateY(-50%) scale(1.08);
        }
        .kc-nav-prev { left: 14px; }
        .kc-nav-next { right: 14px; }

        /* ── THUMBNAIL STRIP ── */
        .kc-thumbs {
          display: flex;
          background: #080500;
          border-top: 1px solid rgba(200,130,26,0.2);
        }

        .kc-thumb {
          flex: 1;
          height: 50px;
          position: relative;
          cursor: pointer;
          overflow: hidden;
          border-top: 2px solid transparent;
          transition: border-color 0.3s;
        }
        .kc-thumb.active { border-color: #c8821a; }

        .kc-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.45) saturate(0.7);
          transition: filter 0.3s;
        }
        .kc-thumb.active img,
        .kc-thumb:hover img {
          filter: brightness(0.75) saturate(1);
        }

        .kc-thumb-label {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,248,238,0.75);
          transition: color 0.3s;
        }
        .kc-thumb.active .kc-thumb-label { color: #c8821a; }

        /* ── LOADING ── */
        .kc-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 60px 20px;
          background: #0d0a04;
          color: rgba(255,248,238,0.6);
          font-size: 14px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 640px) {
          .kc-slide { height: clamp(160px, 48vw, 260px); }
          .kc-content { max-width: 70%; }
          .kc-thumbs { display: none; }
          .kc-nav { width: 30px; height: 30px; }
          .kc-nav-prev { left: 8px; }
          .kc-nav-next { right: 8px; }
          .kc-counter { right: 46px; top: 10px; }
        }
      `}</style>

      <div className="kc-slider">
        {loading ? (
          <div className="kc-loading">
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                border: "2px solid #c8821a",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Loading…
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            {/* ── TRACK ── */}
            <div
              className="kc-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((item: any, i: number) => (
                <div
                  key={item.id}
                  className={`kc-slide${i === currentSlide ? " active" : ""}`}
                >
                  <img
                    className="kc-img"
                    src={item.image}
                    alt={item.title || item.name || "The Kissan City"}
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />

                  {/* Text content */}
                  <div className="kc-content">
                    {item.tag && (
                      <span className="kc-tag">{item.tag}</span>
                    )}
                    {(item.title || item.name) && (
                      <h2 className="kc-title">
                        {item.title || item.name}
                      </h2>
                    )}
                    {item.subtitle && (
                      <p className="kc-subtitle">{item.subtitle}</p>
                    )}
                    {item.buttonText && (
                      <div className="kc-cta-row">
                        <button
                          className="kc-btn kc-btn-primary"
                          onClick={() => handleButtonClick(item.buttonLink)}
                        >
                          <ShoppingBag size={14} />
                          {item.buttonText}
                        </button>
                        <button
                          className="kc-btn kc-btn-secondary"
                          onClick={handleAboutUsClick}
                        >
                          <BookOpen size={14} />
                          Our Story
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Nav arrows */}
            <button
              className="kc-nav kc-nav-prev"
              onClick={() => goTo(currentSlide - 1)}
              aria-label="Previous slide"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              className="kc-nav kc-nav-next"
              onClick={() => goTo(currentSlide + 1)}
              aria-label="Next slide"
            >
              <ChevronRight size={17} />
            </button>

            {/* Dots */}
            <div className="kc-dots">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  className={`kc-dot${i === currentSlide ? " active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};