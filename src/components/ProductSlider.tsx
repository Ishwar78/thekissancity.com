import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { products } from "@/data/products";
import { ChevronLeft, ChevronRight, ShoppingBag, BookOpen } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Autoplay from "embla-carousel-autoplay";

export const ProductSlider = ({ className }: { className?: string }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const total = products.length;
  const navigate = useNavigate();
  const location = useLocation();

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  React.useEffect(() => {
    if (!api) return;
    api.on("select", () => setCurrentSlide(api.selectedScrollSnap()));
  }, [api]);

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);
  const scrollTo   = React.useCallback((i: number) => api?.scrollTo(i), [api]);

  const handleAboutUsClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // If not on home page, navigate to home with hash
    if (location.pathname !== '/') {
      navigate('/#about-us');
      return;
    }
    
    // If already on home page, scroll directly to the element
    const aboutUsElement = document.getElementById('about-us');
    if (aboutUsElement) {
      aboutUsElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [navigate, location.pathname]);

  return (
    <div className={`relative w-full group ${className ?? ""}`}>
      <style>{`
        .ps-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        /* Side vignette */
        .ps-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.22) 0%, transparent 20%,
            transparent 80%, rgba(0,0,0,0.22) 100%
          );
          pointer-events: none;
          z-index: 2;
        }

        /* Bottom gradient for CTA readability */
        .ps-bottom-gradient {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 48%;
          background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* Nav buttons */
        .ps-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 48px; height: 48px;
          border-radius: 50%;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #fff;
          box-shadow: 0 4px 20px rgba(0,0,0,0.25);
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s, opacity 0.25s;
          opacity: 0;
        }
        .group:hover .ps-btn { opacity: 1; }
        .ps-btn:hover {
          background: rgba(255,255,255,0.95);
          color: #2d6a4f;
          box-shadow: 0 6px 28px rgba(0,0,0,0.3);
          transform: translateY(-50%) scale(1.08);
        }
        .ps-btn:active { transform: translateY(-50%) scale(0.92) !important; }
        .ps-btn:focus  { outline: none; }
        .ps-btn-prev   { left: 14px; }
        .ps-btn-next   { right: 14px; }

        @media (max-width: 767px) {
          .ps-btn      { opacity: 1; width: 38px; height: 38px; }
          .ps-btn-prev { left: 8px; }
          .ps-btn-next { right: 8px; }
        }

        /* Counter */
        .ps-counter {
          position: absolute;
          top: 14px; right: 14px;
          z-index: 10;
          background: rgba(0,0,0,0.32);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
          padding: 4px 11px;
          border-radius: 20px;
        }

        /* Dots */
        .ps-dots {
          position: absolute;
          bottom: 88px; left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex; align-items: center; gap: 6px;
        }
        @media (max-width: 639px) { .ps-dots { bottom: 74px; } }

        .ps-dot {
          border: none; cursor: pointer;
          border-radius: 20px;
          background: rgba(255,255,255,0.4);
          height: 5px; width: 5px; padding: 0;
          transition: width 0.3s, background 0.3s;
        }
        .ps-dot.active { background: #fff; width: 20px; }
        .ps-dot:hover:not(.active) { background: rgba(255,255,255,0.75); }
        .ps-dot:focus { outline: none; }

        /* CTA bar */
        .ps-cta-bar {
          position: absolute;
          bottom: 22px; left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex; align-items: center; gap: 12px;
          white-space: nowrap;
        }
        @media (max-width: 480px) { .ps-cta-bar { gap: 8px; bottom: 14px; } }

        /* Shop Now — solid green */
        .ps-shop-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #2d6a4f;
          color: #fff;
          font-size: 13px; font-weight: 700; letter-spacing: 0.3px;
          padding: 10px 24px;
          border-radius: 30px;
          border: none; cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(45,106,79,0.45);
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .ps-shop-btn:hover {
          background: #1b4332;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(45,106,79,0.5);
        }
        .ps-shop-btn:active { transform: scale(0.96); }

        /* Explore Our Story — ghost */
        .ps-story-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-size: 13px; font-weight: 700; letter-spacing: 0.3px;
          padding: 10px 24px;
          border-radius: 30px;
          border: 1.5px solid rgba(255,255,255,0.6);
          cursor: pointer;
          text-decoration: none;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.2s, transform 0.2s, border-color 0.2s;
        }
        .ps-story-btn:hover {
          background: rgba(255,255,255,0.28);
          border-color: #fff;
          transform: translateY(-2px);
        }
        .ps-story-btn:active { transform: scale(0.96); }

        @media (max-width: 480px) {
          .ps-shop-btn, .ps-story-btn {
            font-size: 11px; padding: 8px 15px; gap: 5px;
          }
        }

        /* Ken Burns effect */
        .ps-img {
          width: 100%; height: auto; display: block; object-fit: cover;
          transition: transform 6s ease;
        }
        .ps-img.active { transform: scale(1.04); }
      `}</style>

      <div className="ps-wrap">
        <Carousel
          setApi={setApi}
          opts={{ loop: true }}
          plugins={[autoplayPlugin.current]}
        >
          <CarouselContent>
            {products.map((product, index) => (
              <CarouselItem key={product.id}>
                <div className="relative w-full overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className={`ps-img ${index === currentSlide ? "active" : ""}`}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Bottom gradient overlay */}
        <div className="ps-bottom-gradient" />

        {/* Slide counter */}
        <div className="ps-counter">{currentSlide + 1} / {total}</div>

        {/* Prev */}
        <button
          className="ps-btn ps-btn-prev"
          onClick={(e) => { scrollPrev(); setTimeout(() => e.currentTarget.blur(), 150); }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>

        {/* Next */}
        <button
          className="ps-btn ps-btn-next"
          onClick={(e) => { scrollNext(); setTimeout(() => e.currentTarget.blur(), 150); }}
          aria-label="Next slide"
        >
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>

        {/* Dots */}
        <div className="ps-dots">
          {products.map((_, i) => (
            <button
              key={i}
              className={`ps-dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="ps-cta-bar">
          <Link to="/products" className="ps-shop-btn">
            <ShoppingBag size={14} />
            Shop Now
          </Link>
          <button onClick={handleAboutUsClick} className="ps-story-btn">
            <BookOpen size={14} />
            Explore Our Story
          </button>
        </div>
      </div>
    </div>
  );
};