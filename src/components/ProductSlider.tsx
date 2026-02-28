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
    if (location.pathname !== '/') {
      navigate('/#about-us');
      return;
    }
    const aboutUsElement = document.getElementById('about-us');
    if (aboutUsElement) {
      aboutUsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [navigate, location.pathname]);

  return (
    <div className={`relative w-full group ${className ?? ""}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=Inter:wght@300;400;500&display=swap');

        .ps-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }

        /* Dark overlay for text readability */
        .ps-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            rgba(0,0,0,0.75) 0%,
            rgba(0,0,0,0.5) 45%,
            rgba(0,0,0,0.2) 100%
          );
          z-index: 2;
          pointer-events: none;
        }

        /* Bottom gradient for stats */
        .ps-bottom-gradient {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 25%;
          background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* ── HERO TEXT ── */
        .ps-hero {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-55%);
          z-index: 5;
          padding: 0 4%;
          max-width: 60%;
          pointer-events: none;
        }

        /* Tablet */
        @media (max-width: 1024px) {
          .ps-hero { 
            max-width: 70%; 
            transform: translateY(-58%); 
          }
        }

        /* Mobile landscape */
        @media (max-width: 768px) {
          .ps-hero { 
            max-width: 85%; 
            padding: 0 5%; 
            transform: translateY(-60%); 
          }
        }

        /* Mobile portrait */
        @media (max-width: 640px) {
          .ps-hero { 
            max-width: 92%; 
            padding: 0 16px; 
            transform: translateY(-62%);
            top: 45%;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .ps-hero { 
            max-width: 100%; 
            padding: 0 16px; 
            transform: translateY(-60%);
            top: 42%;
          }
        }

        .ps-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 5vw, 72px);
          font-weight: 800;
          line-height: 1.1;
          color: #ffffff;
          letter-spacing: -0.3px;
          margin: 0 0 12px 0;
          text-shadow: 0 2px 16px rgba(0,0,0,0.3);
        }

        @media (max-width: 768px) {
          .ps-headline {
            font-size: clamp(22px, 6vw, 48px);
            margin-bottom: 10px;
          }
        }

        @media (max-width: 640px) {
          .ps-headline {
            font-size: clamp(20px, 7vw, 40px);
            margin-bottom: 8px;
            letter-spacing: -0.2px;
          }
        }

        @media (max-width: 480px) {
          .ps-headline {
            font-size: clamp(18px, 8vw, 32px);
            line-height: 1.15;
            margin-bottom: 6px;
          }
        }

        .ps-headline em {
          font-style: italic;
          font-weight: 700;
          color: #ffffff;
        }

        .ps-subtext {
          font-family: 'Inter', sans-serif;
          font-size: clamp(11px, 1.5vw, 17px);
          font-weight: 300;
          color: rgba(255,255,255,0.9);
          line-height: 1.6;
          margin: 0 0 20px 0;
          max-width: 480px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
        }

        @media (max-width: 768px) {
          .ps-subtext {
            font-size: 13px;
            margin-bottom: 18px;
            line-height: 1.5;
          }
        }

        @media (max-width: 640px) {
          .ps-subtext {
            font-size: 12px;
            margin-bottom: 16px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }

        @media (max-width: 480px) {
          .ps-subtext {
            font-size: 11px;
            line-height: 1.4;
            margin-bottom: 14px;
            -webkit-line-clamp: 3;
          }
        }

        /* CTA buttons */
        .ps-cta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: all;
          flex-wrap: wrap;
        }

        @media (max-width: 480px) {
          .ps-cta-row {
            gap: 8px;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;
          }
        }

        .ps-shop-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #2d6a4f;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: clamp(11px, 1.2vw, 14px);
          font-weight: 600;
          letter-spacing: 0.2px;
          padding: 9px 22px;
          border-radius: 30px;
          border: none; cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(45,106,79,0.4);
          transition: background 0.2s, transform 0.2s;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .ps-shop-btn {
            padding: 8px 20px;
            font-size: 12px;
          }
        }

        @media (max-width: 640px) {
          .ps-shop-btn {
            padding: 8px 18px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .ps-shop-btn {
            padding: 10px 20px;
            font-size: 12px;
            white-space: normal;
            width: 100%;
            justify-content: center;
          }
        }

        .ps-shop-btn:hover {
          background: #1b4332;
          transform: translateY(-2px);
        }
        .ps-shop-btn:active { transform: scale(0.96); }

        .ps-story-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.15);
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: clamp(11px, 1.2vw, 14px);
          font-weight: 600;
          letter-spacing: 0.2px;
          padding: 9px 22px;
          border-radius: 30px;
          border: 1.5px solid rgba(255,255,255,0.6);
          cursor: pointer;
          text-decoration: none;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: background 0.2s, transform 0.2s;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .ps-story-btn {
            padding: 8px 20px;
            font-size: 12px;
          }
        }

        @media (max-width: 640px) {
          .ps-story-btn {
            padding: 8px 18px;
            font-size: 11px;
          }
        }

        @media (max-width: 480px) {
          .ps-story-btn {
            padding: 10px 20px;
            font-size: 12px;
            white-space: normal;
            width: 100%;
            justify-content: center;
          }
        }

        .ps-story-btn:hover {
          background: rgba(255,255,255,0.25);
          border-color: #fff;
          transform: translateY(-2px);
        }
        .ps-story-btn:active { transform: scale(0.96); }

        /* ── STATS BAR ── */
        .ps-stats {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          z-index: 6;
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding: 10px 3%;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .ps-stats {
            padding: 8px 2%;
          }
        }

        @media (max-width: 640px) {
          .ps-stats {
            flex-wrap: wrap;
            padding: 8px 12px;
            gap: 6px;
          }
        }

        @media (max-width: 480px) {
          .ps-stats {
            position: relative;
            background: rgba(0,0,0,0.7);
            padding: 10px 8px;
            gap: 4px;
          }
        }

        .ps-stat {
          flex: 1;
          text-align: center;
          position: relative;
        }

        @media (max-width: 640px) {
          .ps-stat {
            flex: 1 1 40%;
          }
        }

        @media (max-width: 480px) {
          .ps-stat {
            flex: 1 1 45%;
          }
        }

        .ps-stat + .ps-stat::before {
          content: '';
          position: absolute;
          left: 0; top: 15%; bottom: 15%;
          width: 1px;
          background: rgba(255,255,255,0.2);
        }

        @media (max-width: 640px) {
          .ps-stat:nth-child(2)::before,
          .ps-stat:nth-child(4)::before {
            display: none;
          }
        }

        .ps-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(14px, 2.5vw, 32px);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          display: block;
          margin-bottom: 2px;
        }

        @media (max-width: 768px) {
          .ps-stat-num {
            font-size: 18px;
          }
        }

        @media (max-width: 640px) {
          .ps-stat-num {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .ps-stat-num {
            font-size: 14px;
          }
        }

        .ps-stat-label {
          font-family: 'Inter', sans-serif;
          font-size: clamp(7px, 0.9vw, 12px);
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.03em;
          display: block;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .ps-stat-label {
            font-size: 10px;
          }
        }

        @media (max-width: 640px) {
          .ps-stat-label {
            font-size: 9px;
          }
        }

        @media (max-width: 480px) {
          .ps-stat-label {
            font-size: 8px;
          }
        }

        /* Nav buttons */
        .ps-btn {
          position: absolute;
          top: 46%;
          transform: translateY(-50%);
          z-index: 10;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #fff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
          transition: background 0.2s, transform 0.2s;
          opacity: 0;
        }
        .group:hover .ps-btn { opacity: 1; }
        .ps-btn:hover {
          background: rgba(255,255,255,0.9);
          color: #2d6a4f;
          transform: translateY(-50%) scale(1.05);
        }
        .ps-btn:active { transform: translateY(-50%) scale(0.95) !important; }
        .ps-btn:focus  { outline: none; }
        .ps-btn-prev   { left: 12px; }
        .ps-btn-next   { right: 12px; }

        @media (max-width: 1024px) {
          .ps-btn { 
            opacity: 0.9; 
            width: 36px; 
            height: 36px;
          }
        }

        @media (max-width: 768px) {
          .ps-btn { 
            width: 32px; 
            height: 32px;
          }
          .ps-btn-prev { left: 8px; }
          .ps-btn-next { right: 8px; }
        }

        @media (max-width: 480px) {
          .ps-btn { 
            width: 28px; 
            height: 28px;
            top: 50%;
          }
          .ps-btn-prev { left: 6px; }
          .ps-btn-next { right: 6px; }
        }

        /* Dots */
        .ps-dots {
          position: absolute;
          bottom: 70px; left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex; align-items: center; gap: 5px;
        }

        @media (max-width: 1024px) {
          .ps-dots { 
            bottom: 60px; 
          }
        }

        @media (max-width: 768px) {
          .ps-dots { 
            bottom: 55px; 
          }
        }

        @media (max-width: 640px) {
          .ps-dots { 
            bottom: 70px; 
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .ps-dots { 
            bottom: 60px; 
            gap: 4px;
          }
        }

        .ps-dot {
          border: none; cursor: pointer;
          border-radius: 20px;
          background: rgba(255,255,255,0.4);
          height: 5px; width: 5px; padding: 0;
          transition: width 0.3s, background 0.3s;
        }
        .ps-dot.active { background: #fff; width: 18px; }

        @media (max-width: 480px) {
          .ps-dot.active { width: 16px; }
        }

        .ps-dot:hover:not(.active) { background: rgba(255,255,255,0.75); }
        .ps-dot:focus { outline: none; }

        /* Counter */
        .ps-counter {
          position: absolute;
          top: 12px; right: 12px;
          z-index: 10;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          color: #fff;
          font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
          padding: 3px 10px;
          border-radius: 20px;
        }

        @media (max-width: 480px) {
          .ps-counter {
            top: 10px;
            right: 10px;
            font-size: 9px;
            padding: 3px 8px;
          }
        }

        /* Ken Burns effect */
        .ps-img {
          width: 100%; 
          height: auto; 
          display: block; 
          object-fit: cover;
          min-height: 280px;
          max-height: 600px;
          transition: transform 6s ease;
        }

        @media (max-width: 768px) {
          .ps-img {
            min-height: 350px;
          }
        }

        @media (max-width: 640px) {
          .ps-img {
            min-height: 400px;
          }
        }

        @media (max-width: 480px) {
          .ps-img {
            min-height: 450px;
          }
        }

        .ps-img.active { transform: scale(1.04); }

        /* Image container */
        .ps-img-container {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
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
                <div className="ps-img-container">
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

        {/* Overlays */}
        <div className="ps-overlay" />
        <div className="ps-bottom-gradient" />

        {/* ── HERO TEXT ── */}
        <div className="ps-hero">
          <h1 className="ps-headline">
            Farm Fresh<br />
            <em>Goodness</em>
          </h1>
          <p className="ps-subtext">
            KissanCity brings you handcrafted pickles, chutneys & murabbas — made from farm-fresh organic ingredients, delivered to your doorstep.
          </p>
          <div className="ps-cta-row">
            <Link to="/products" className="ps-shop-btn">
              <ShoppingBag size={window.innerWidth <= 480 ? 12 : 14} />
              Shop Now
            </Link>
            <button onClick={handleAboutUsClick} className="ps-story-btn">
              <BookOpen size={window.innerWidth <= 480 ? 12 : 14} />
              Explore Our Story
            </button>
          </div>
        </div>

        {/* Slide counter */}
        <div className="ps-counter">{currentSlide + 1} / {total}</div>

        {/* Prev */}
        <button
          className="ps-btn ps-btn-prev"
          onClick={(e) => { scrollPrev(); setTimeout(() => e.currentTarget.blur(), 150); }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={window.innerWidth <= 480 ? 16 : 18} strokeWidth={2.5} />
        </button>

        {/* Next */}
        <button
          className="ps-btn ps-btn-next"
          onClick={(e) => { scrollNext(); setTimeout(() => e.currentTarget.blur(), 150); }}
          aria-label="Next slide"
        >
          <ChevronRight size={window.innerWidth <= 480 ? 16 : 18} strokeWidth={2.5} />
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

        {/* ── STATS BAR ── */}
        <div className="ps-stats">
          <div className="ps-stat">
            <span className="ps-stat-num">200+</span>
            <span className="ps-stat-label">Products</span>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-num">50K+</span>
            <span className="ps-stat-label">Happy Customers</span>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-num">100%</span>
            <span className="ps-stat-label">Premium Quality</span>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-num">4.8★</span>
            <span className="ps-stat-label">Avg. Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};