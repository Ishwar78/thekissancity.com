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
import { productSliderService } from "@/services/productSliderService";
import { ProductSliderItem } from "@/types/productSlider";

export const ProductSlider = ({ className }: { className?: string }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  const [sliderItems, setSliderItems] = React.useState<ProductSliderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  // Fetch slider data from API
  React.useEffect(() => {
    const fetchSliderData = async () => {
      try {
        setLoading(true);
        const items = await productSliderService.getActiveSliders();
        
        if (items.length > 0) {
          setSliderItems(items);
        } else {
          console.log('No slider data found, using product fallback');
        }
      } catch (error) {
        console.error('Failed to fetch slider data:', error);
        console.log('Using product fallback due to error');
      } finally {
        setLoading(false);
      }
    };

    fetchSliderData();
  }, []);

  const currentSlideData = sliderItems[currentSlide] || null;
  const total = sliderItems.length > 0 ? sliderItems.length : products.length;

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

  const handleButtonClick = React.useCallback((link: string) => {
    if (!link) return;
    if (link.startsWith('/')) {
      navigate(link);
    } else if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      navigate(`/${link}`);
    }
  }, [navigate]);

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
            100deg,
            rgba(0,0,0,0.72) 0%,
            rgba(0,0,0,0.45) 40%,
            rgba(0,0,0,0.15) 70%,
            rgba(0,0,0,0.05) 100%
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
          top: 45%;
          left: 0;
          transform: translateY(-50%);
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
            max-width: 75%; 
            padding: 0 4%; 
            transform: translateY(-60%);
            top: 44%;
          }
        }

        /* Mobile portrait */
        @media (max-width: 640px) {
          .ps-hero { 
            max-width: 80%; 
            padding: 0 12px; 
            transform: translateY(-62%);
            top: 42%;
          }
        }

        /* Small mobile */
        @media (max-width: 480px) {
          .ps-hero { 
            max-width: 85%; 
            padding: 0 12px; 
            transform: translateY(-60%);
            top: 38%;
          }
        }

        .ps-headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 3.5vw, 48px);
          font-weight: 800;
          line-height: 1.1;
          color: #ffffff;
          letter-spacing: -0.3px;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 16px rgba(0,0,0,0.3);
        }

        @media (max-width: 768px) {
          .ps-headline {
            font-size: clamp(14px, 4vw, 26px);
            margin-bottom: 4px;
          }
        }

        @media (max-width: 640px) {
          .ps-headline {
            font-size: clamp(13px, 4vw, 22px);
            margin-bottom: 3px;
            letter-spacing: -0.1px;
          }
        }

        @media (max-width: 480px) {
          .ps-headline {
            font-size: clamp(12px, 4.5vw, 18px);
            line-height: 1.2;
            margin-bottom: 2px;
          }
        }

        .ps-headline em {
          font-style: italic;
          font-weight: 700;
          color: #ffffff;
        }

        .ps-subtext {
          font-family: 'Inter', sans-serif;
          font-size: clamp(10px, 1.2vw, 14px);
          font-weight: 300;
          color: rgba(255,255,255,0.9);
          line-height: 1.5;
          margin: 0 0 14px 0;
          max-width: 420px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .ps-subtext {
            font-size: 10px;
            margin-bottom: 8px;
            line-height: 1.4;
            -webkit-line-clamp: 2;
          }
        }

        @media (max-width: 640px) {
          .ps-subtext {
            font-size: 9px;
            margin-bottom: 6px;
            -webkit-line-clamp: 2;
          }
        }

        @media (max-width: 480px) {
          .ps-subtext {
            font-size: 8px;
            line-height: 1.3;
            margin-bottom: 5px;
            -webkit-line-clamp: 2;
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

        @media (max-width: 768px) {
          .ps-cta-row {
            gap: 6px;
          }
        }

        @media (max-width: 480px) {
          .ps-cta-row {
            gap: 5px;
            flex-direction: row;
            align-items: center;
          }
        }

        .ps-shop-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #2d6a4f;
          color: #fff;
          font-family: 'Inter', sans-serif;
          font-size: clamp(10px, 1vw, 13px);
          font-weight: 600;
          letter-spacing: 0.2px;
          padding: 7px 18px;
          border-radius: 30px;
          border: none; cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 16px rgba(45,106,79,0.4);
          transition: background 0.2s, transform 0.2s;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .ps-shop-btn {
            padding: 5px 12px;
            font-size: 9px;
            gap: 4px;
          }
        }

        @media (max-width: 640px) {
          .ps-shop-btn {
            padding: 4px 10px;
            font-size: 8px;
          }
        }

        @media (max-width: 480px) {
          .ps-shop-btn {
            padding: 4px 10px;
            font-size: 8px;
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
          font-size: clamp(10px, 1vw, 13px);
          font-weight: 600;
          letter-spacing: 0.2px;
          padding: 7px 18px;
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
            padding: 5px 12px;
            font-size: 9px;
            gap: 4px;
          }
        }

        @media (max-width: 640px) {
          .ps-story-btn {
            padding: 4px 10px;
            font-size: 8px;
          }
        }

        @media (max-width: 480px) {
          .ps-story-btn {
            padding: 4px 10px;
            font-size: 8px;
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
          padding: 7px 3%;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .ps-stats {
            padding: 4px 2%;
          }
        }

        @media (max-width: 640px) {
          .ps-stats {
            padding: 3px 8px;
          }
        }

        @media (max-width: 480px) {
          .ps-stats {
            padding: 3px 6px;
          }
        }

        .ps-stat {
          flex: 1;
          text-align: center;
          position: relative;
        }

        .ps-stat + .ps-stat::before {
          content: '';
          position: absolute;
          left: 0; top: 15%; bottom: 15%;
          width: 1px;
          background: rgba(255,255,255,0.2);
        }

        .ps-stat-num {
          font-family: 'Playfair Display', serif;
          font-size: clamp(13px, 2vw, 24px);
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          display: block;
          margin-bottom: 2px;
        }

        @media (max-width: 768px) {
          .ps-stat-num {
            font-size: 11px;
            margin-bottom: 1px;
          }
        }

        @media (max-width: 640px) {
          .ps-stat-num {
            font-size: 10px;
          }
        }

        @media (max-width: 480px) {
          .ps-stat-num {
            font-size: 9px;
          }
        }

        .ps-stat-label {
          font-family: 'Inter', sans-serif;
          font-size: clamp(7px, 0.7vw, 10px);
          font-weight: 400;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.03em;
          display: block;
          text-transform: uppercase;
        }

        @media (max-width: 768px) {
          .ps-stat-label {
            font-size: 7px;
          }
        }

        @media (max-width: 640px) {
          .ps-stat-label {
            font-size: 6px;
          }
        }

        @media (max-width: 480px) {
          .ps-stat-label {
            font-size: 6px;
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
            width: 24px; 
            height: 24px;
          }
          .ps-btn-prev { left: 6px; }
          .ps-btn-next { right: 6px; }
        }

        @media (max-width: 480px) {
          .ps-btn { 
            width: 22px; 
            height: 22px;
          }
          .ps-btn-prev { left: 4px; }
          .ps-btn-next { right: 4px; }
        }

        /* Dots */
        .ps-dots {
          position: absolute;
          bottom: 55px; left: 50%;
          transform: translateX(-50%);
          z-index: 10;
          display: flex; align-items: center; gap: 5px;
        }

        @media (max-width: 1024px) {
          .ps-dots { 
            bottom: 50px; 
          }
        }

        @media (max-width: 768px) {
          .ps-dots { 
            bottom: 30px; 
            gap: 3px;
          }
        }

        @media (max-width: 640px) {
          .ps-dots { 
            bottom: 28px; 
          }
        }

        @media (max-width: 480px) {
          .ps-dots { 
            bottom: 26px; 
            gap: 3px;
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

        @media (max-width: 768px) {
          .ps-dot { height: 3px; width: 3px; }
          .ps-dot.active { width: 10px; }
        }

        @media (max-width: 480px) {
          .ps-dot { height: 3px; width: 3px; }
          .ps-dot.active { width: 8px; }
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

        @media (max-width: 768px) {
          .ps-counter {
            top: 6px;
            right: 6px;
            font-size: 7px;
            padding: 2px 6px;
          }
        }

        @media (max-width: 480px) {
          .ps-counter {
            top: 5px;
            right: 5px;
            font-size: 7px;
            padding: 2px 5px;
          }
        }

        /* Image container - fixed height, full width — INCREASED */
        .ps-img-container {
          position: relative;
          width: 100%;
          height: 420px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .ps-img-container {
            height: 240px;
          }
        }

        @media (max-width: 480px) {
          .ps-img-container {
            height: 210px;
          }
        }

        /* Ken Burns effect */
        .ps-img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center center;
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
            {sliderItems.length > 0 ? (
              sliderItems.map((item, index) => (
                <CarouselItem key={item.id}>
                  <div className="ps-img-container">
                    <img
                      src={item.image}
                      alt={item.title}
                      className={`ps-img ${index === currentSlide ? "active" : ""}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/api/uploads/placeholder-slider.jpg";
                      }}
                    />
                  </div>
                </CarouselItem>
              ))
            ) : (
              products.map((product, index) => (
                <CarouselItem key={product.id}>
                  <div className="ps-img-container">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`ps-img ${index === currentSlide ? "active" : ""}`}
                    />
                  </div>
                </CarouselItem>
              ))
            )}
          </CarouselContent>
        </Carousel>

        {/* Overlays */}
        <div className="ps-overlay" />
        <div className="ps-bottom-gradient" />

        {/* ── HERO TEXT ── */}
        <div className="ps-hero">
          <h1 className="ps-headline">
            {currentSlideData?.title || "Farm Fresh<br />Goodness"}
          </h1>
          <p className="ps-subtext">
            {currentSlideData?.subtitle || "KissanCity brings you handcrafted pickles, chutneys & murabbas — made from farm-fresh organic ingredients, delivered to your doorstep."}
          </p>
          {currentSlideData?.buttonText && currentSlideData?.buttonLink && (
            <div className="ps-cta-row">
              <button 
                onClick={() => handleButtonClick(currentSlideData.buttonLink!)}
                className="ps-shop-btn"
              >
                <ShoppingBag size={window.innerWidth <= 768 ? 10 : 13} />
                {currentSlideData.buttonText}
              </button>
              <button onClick={handleAboutUsClick} className="ps-story-btn">
                <BookOpen size={window.innerWidth <= 768 ? 10 : 13} />
                Explore Our Story
              </button>
            </div>
          )}
        </div>

        {/* Slide counter */}
        <div className="ps-counter">{currentSlide + 1} / {total}</div>

        {/* Prev */}
        <button
          className="ps-btn ps-btn-prev"
          onClick={(e) => { scrollPrev(); setTimeout(() => e.currentTarget.blur(), 150); }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={window.innerWidth <= 768 ? 12 : 18} strokeWidth={2.5} />
        </button>

        {/* Next */}
        <button
          className="ps-btn ps-btn-next"
          onClick={(e) => { scrollNext(); setTimeout(() => e.currentTarget.blur(), 150); }}
          aria-label="Next slide"
        >
          <ChevronRight size={window.innerWidth <= 768 ? 12 : 18} strokeWidth={2.5} />
        </button>

        {/* Dots */}
        <div className="ps-dots">
          {(sliderItems.length > 0 ? sliderItems : products).map((_, i) => (
            <button
              key={i}
              className={`ps-dot ${i === currentSlide ? "active" : ""}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* ── STATS BAR ── */}
        {/* <div className="ps-stats">
          <div className="ps-stat">
            <span className="ps-stat-num">{currentSlideData?.stats?.products || "200+"}</span>
            <span className="ps-stat-label">Products</span>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-num">{currentSlideData?.stats?.customers || "50K+"}</span>
            <span className="ps-stat-label">Happy Customers</span>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-num">{currentSlideData?.stats?.quality || "100%"}</span>
            <span className="ps-stat-label">Premium Quality</span>
          </div>
          <div className="ps-stat">
            <span className="ps-stat-num">{currentSlideData?.stats?.rating || "4.8★"}</span>
            <span className="ps-stat-label">Avg. Rating</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};