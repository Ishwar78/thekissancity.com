import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { products } from "@/data/products";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ProductSlider = ({ className }: { className?: string }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  
  React.useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollPrev = React.useCallback(() => {
    if (api) api.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    if (api) api.scrollNext();
  }, [api]);

  return (
    <div className={`relative w-full ${className}`}>
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={product.id}>
              <div className="relative w-full flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-auto object-contain"
                />
                
                {/* Mobile Navigation Buttons - Positioned on Image */}
                <div className="md:hidden absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    onClick={(e) => {
                      scrollPrev();
                      setTimeout(() => e.currentTarget.blur(), 150);
                    }}
                    className="h-12 w-12 flex items-center justify-center text-white/95 hover:text-white pointer-events-auto focus:outline-none active:scale-90 transition-all"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-10 w-10 drop-shadow-lg" strokeWidth={2.5} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      scrollNext();
                      setTimeout(() => e.currentTarget.blur(), 150);
                    }}
                    className="h-12 w-12 flex items-center justify-center text-white/95 hover:text-white pointer-events-auto focus:outline-none active:scale-90 transition-all"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-10 w-10 drop-shadow-lg" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Hide the default buttons */}
        <style>
          {`
            [data-carousel="previous"],
            [data-carousel="next"] {
              display: none !important;
            }
          `}
        </style>
      </Carousel>
      
      {/* Desktop Navigation Buttons */}
      <div className="hidden md:flex absolute inset-0 items-center justify-between p-4 pointer-events-none">
        <button
          onClick={(e) => {
            scrollPrev();
            setTimeout(() => e.currentTarget.blur(), 150);
          }}
          className="h-12 w-12 flex items-center justify-center bg-transparent text-white hover:text-[#283e74] pointer-events-auto transition-all duration-300 focus:outline-none"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={(e) => {
            scrollNext();
            setTimeout(() => e.currentTarget.blur(), 150);
          }}
          className="h-12 w-12 flex items-center justify-center bg-transparent text-white hover:text-[#283e74] pointer-events-auto transition-all duration-300 focus:outline-none"
          aria-label="Next slide"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};