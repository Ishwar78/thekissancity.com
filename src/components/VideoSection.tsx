import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from 'react-router-dom';

import Autoplay from 'embla-carousel-autoplay';

interface PromoItem {
  _id: string;
  title?: string;
  type: 'video' | 'image';
  videoUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  thumbnailUrl?: string;
  description?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function resolveUrl(src?: string) {
  const s = String(src || '');
  if (!s) return '';
  if (s.startsWith('http')) return s;
  if (s.startsWith('/uploads') || s.startsWith('uploads')) {
    if (API_BASE) {
      const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
    }
  }
  return s;
}

const VideoSlide: React.FC<{ video: PromoItem; isActive: boolean }> = ({ video, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const src = resolveUrl(video.videoUrl);
  const thumb = resolveUrl(video.thumbnailUrl);

  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    } else if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => { });
      setPlaying(true);
    }
  }, [isActive]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        poster={thumb || undefined}
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/20" />

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white border border-white/10"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
};

export default function VideoSection() {
  const [items, setItems] = useState<PromoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<any>();

  const [current, setCurrent] = useState(0);
  const autoplay = useRef(Autoplay({ delay: 4000, stopOnInteraction: true }));

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/videos?active=true');
        const json = await res.json();
        if (json.ok) {
          setItems(json.data || []);
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (loading || items.length === 0) return null;

  return (
    <section className="w-full bg-[#f8f5f0] py-6 sm:py-10">
      <div className="max-w-[1400px] mx-auto px-0 sm:px-4">

        {/* Optional Header */}
        <div className="flex items-center justify-center gap-4 mb-4 sm:mb-8 px-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#c8973a]/30" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#6b4423] font-serif italic">
            Featured Highlights
          </h2>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#c8973a]/30" />
        </div>

        <div className="relative group">
          <Carousel
            setApi={setApi}
            plugins={[autoplay.current]}
            opts={{ loop: true, align: "start" }}
            className="w-full overflow-hidden sm:rounded-2xl"
          >
            <CarouselContent>
              {items.map((item, i) => (
                <CarouselItem key={item._id} className="basis-full">
                  <div className="relative aspect-[16/7] sm:aspect-[21/9] lg:aspect-[25/9] w-full overflow-hidden bg-stone-200">
                    {item.type === 'image' ? (
                      <Link
                        to={item.linkUrl || '/solar-drying'}
                        className="block w-full h-full"
                      >
                        <img
                          src={resolveUrl(item.imageUrl)}
                          alt={item.title || "Promo banner"}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                        />
                        {item.linkUrl && (
                          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </Link>
                    ) : (
                      <VideoSlide video={item} isActive={current === i} />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {items.length > 1 && (
              <>
                <CarouselPrevious className="hidden sm:flex -left-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 border-none shadow-lg hover:bg-white" />
                <CarouselNext className="hidden sm:flex -right-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 border-none shadow-lg hover:bg-white" />
              </>
            )}

            {/* Custom Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${current === i ? 'w-8 bg-[#c8973a]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </Carousel>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .aspect-mobile {
            aspect-ratio: 16 / 10;
          }
        }
      `}</style>
    </section>
  );
}
