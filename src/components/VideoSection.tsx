import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { api } from '@/lib/api';

interface VideoItem {
  _id: string;
  title?: string;
  videoUrl?: string;
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

const VideoPlayer: React.FC<{ video: VideoItem; isActive: boolean }> = ({ video, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const src = resolveUrl(video.videoUrl);
  const thumb = resolveUrl(video.thumbnailUrl);

  useEffect(() => {
    if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, [isActive]);


  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isActive) {
      v.play();
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
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    v.currentTime = ratio * v.duration;
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer group"
      style={{
        background: '#0d0d0d',
        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        border: '1px solid rgba(200,151,58,0.15)',
      }}
      onClick={togglePlay}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={thumb || undefined}
        autoPlay
        loop
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        className="w-full object-cover"
        style={{ maxHeight: '340px', minHeight: '200px', display: 'block' }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: playing
            ? 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)'
            : 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 100%)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Center play button */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
            style={{
              width: 52,
              height: 52,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(6px)',
              border: '2px solid rgba(255,255,255,0.5)',
            }}
          >
            <Play fill="white" className="h-5 w-5 text-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div
        className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 flex flex-col gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          className="w-full h-1 rounded-full cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.25)' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #c8973a, #e8b84b)',
            }}
          />
        </div>

        {/* Title + controls row */}
        <div className="flex items-center justify-between gap-2">
          {video.title && (
            <p
              className="text-white font-semibold line-clamp-1 flex-1 min-w-0"
              style={{ fontSize: 'clamp(0.7rem, 2vw, 0.85rem)', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {video.title}
            </p>
          )}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={togglePlay}
              className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" fill="white" />}
            </button>
            <button
              onClick={toggleMute}
              className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VideoSection() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { ok, json } = await api('/api/videos?limit=4&active=true');
        if (ok) {
          const list: VideoItem[] = (json?.videos || json?.data || []).filter(
            (v: VideoItem) => v.videoUrl
          );
          setVideos(list.slice(0, 4));
        }
      } catch {
        // silent fail — section is hidden if no videos
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || videos.length === 0) return null;

  return (
    <section
      style={{ backgroundColor: '#F5F0E8' }}
      className="py-8 sm:py-10"
    >
      <div className="w-full px-3 sm:px-4">

        {/* Section Header — matches BestSellerSection style */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 max-w-5xl mx-auto">
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to right, transparent, #c8973a)' }}
          />
          <h2
            className="font-bold whitespace-nowrap px-2"
            style={{
              color: '#6b4423',
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 'clamp(1.2rem, 5vw, 2.25rem)',
            }}
          >
            · Watch &amp; Discover ·
          </h2>
          <div
            className="flex-1 h-px"
            style={{ background: 'linear-gradient(to left, transparent, #c8973a)' }}
          />
        </div>

        {/* Videos Grid */}
        {videos.length === 1 ? (
          <div className="max-w-4xl mx-auto">
            <VideoPlayer video={videos[0]} isActive={activeIdx === 0} />
          </div>
        ) : (
          <div
            className={`grid gap-3 sm:gap-4 ${videos.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : videos.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
              }`}
            onClick={(e) => {
              // detect which child was clicked to set activeIdx
              const el = (e.target as HTMLElement).closest('[data-vidx]') as HTMLElement | null;
              if (el) setActiveIdx(Number(el.dataset.vidx));
            }}
          >
            {videos.map((v, i) => (
              <div key={v._id} data-vidx={i} onClick={() => setActiveIdx(i)}>
                <VideoPlayer video={v} isActive={activeIdx === i} />
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
