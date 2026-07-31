import React, { useEffect, useRef, useState } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';

const AUTO_SCROLL_TIME = 5000; // 4 seconds

function VideoCard({ video, isCenter, isSectionInView }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  const API_URL = (import.meta.env.VITE_API_URL || 'https://thekissancity.com').replace(/\/$/, '');

  const videoSrc = video.videoUrl?.startsWith('http')
    ? video.videoUrl
    : `${API_URL}${video.videoUrl?.startsWith('/') ? '' : '/'}${video.videoUrl}`;

  const posterSrc = video.posterUrl
    ? (video.posterUrl.startsWith('http')
        ? video.posterUrl
        : `${API_URL}${video.posterUrl.startsWith('/') ? '' : '/'}${video.posterUrl}`)
    : '';

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isCenter && isSectionInView) {
      videoEl.currentTime = 0;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log('Video autoplay interrupted:', err);
        });
      }
    } else {
      videoEl.pause();
    }
  }, [isCenter, isSectionInView]);

  return (
    <div
      className={`spotlight-card${
        isCenter ? ' spotlight-card--active' : ''
      }`}
      id={`spotlight-${video._id}`}
    >
      {/* Phone Frame Top Notch */}
      <div className="spotlight-card__notch" />

      {/* Video */}
      <div className="spotlight-card__media">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          className="spotlight-card__video"
          loop
          muted={muted}
          playsInline
          preload="auto"
        />

        {/* Video Gradient Overlay */}
        <div className="spotlight-card__gradient" />
      </div>

      {/* Top Controls */}
      <div className="spotlight-card__top">
        <button
          type="button"
          className="spotlight-card__mute-btn"
          onClick={(event) => {
            event.stopPropagation();
            setMuted((previousMuted) => !previousMuted);
          }}
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        {video.tag && (
          <span className="spotlight-card__tag">
            {video.tag}
          </span>
        )}
      </div>

      {/* Bottom Information */}
      <div className="spotlight-card__bottom">
        <p className="spotlight-card__product-name">
          {video.productName}
        </p>

        {video.productSlug && (
          <Link
            to={`/product/${video.productSlug}`}
            className="spotlight-card__view-btn"
            id={`spotlight-view-${video._id}`}
            onClick={(event) => event.stopPropagation()}
          >
            VIEW PRODUCT
            <ExternalLink size={11} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VideoSection() {
  const [current, setCurrent] = useState(0);
  const [videos, setVideos] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSectionInView, setIsSectionInView] = useState(true);

  const sectionRef = useRef(null);
  const intervalRef = useRef(null);

  /*
   * Intersection Observer to auto-play when section enters viewport
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting);
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  /*
   * Fetch Videos
   */
  useEffect(() => {
    let isMounted = true;

    const fetchVideos = async () => {
      try {
        setIsLoading(true);

        const data = await api('/api/videos');

        if (!isMounted) return;

        const fetchedVideos = Array.isArray(data?.videos)
          ? data.videos
          : [];

        setVideos(fetchedVideos);

        // Three or more cards hone par second card ko center mein rakhega.
        setCurrent(fetchedVideos.length >= 3 ? 1 : 0);
      } catch (error) {
        console.error(
          'Failed to fetch influencer videos:',
          error
        );

        if (isMounted) {
          setVideos([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchVideos();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Auto Scroll Every 4 Seconds
   */
  useEffect(() => {
    if (videos.length <= 1 || isPaused || !isSectionInView) {
      return undefined;
    }

    intervalRef.current = window.setInterval(() => {
      setCurrent((previousCurrent) => {
        return (previousCurrent + 1) % videos.length;
      });
    }, AUTO_SCROLL_TIME);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [videos.length, isPaused, isSectionInView]);

  /*
   * Previous Slide
   */
  const handlePrevious = () => {
    if (videos.length <= 1) return;

    setCurrent((previousCurrent) =>
      previousCurrent === 0
        ? videos.length - 1
        : previousCurrent - 1
    );
  };

  /*
   * Next Slide
   */
  const handleNext = () => {
    if (videos.length <= 1) return;

    setCurrent(
      (previousCurrent) =>
        (previousCurrent + 1) % videos.length
    );
  };

  /*
   * Dot Click
   */
  const handleDotClick = (index) => {
    setCurrent(index);
  };

  if (isLoading) {
    return null;
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className="spotlight-section"
      id="influencer-spotlight"
    >
      <div className="container">
        {/* Section Header */}
        <div className="spotlight-section__header">
          <h2 className="spotlight-section__title">
            Influencer <span>Spotlight</span>
          </h2>

          <div className="spotlight-section__divider" />

          <p
            className="section-subtitle"
            style={{ margin: '0.5rem auto 0' }}
          >
            Real people, real farms, real results — watch how
            our products make a difference.
          </p>
        </div>

        {/* Cards Slider */}
        <div
          className="spotlight-track-wrapper"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Previous Arrow */}
          {videos.length > 1 && (
            <button
              type="button"
              className="spotlight-arrow spotlight-arrow--left"
              onClick={handlePrevious}
              aria-label="Previous video"
              id="spotlight-prev"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div className="spotlight-track">
            {videos.map((video, index) => {
              let offset = index - current;

              if (videos.length > 2) {
                if (offset > videos.length / 2) {
                  offset -= videos.length;
                } else if (offset < -videos.length / 2) {
                  offset += videos.length;
                }
              }

              if (Math.abs(offset) > 2) {
                return null;
              }

              const absoluteOffset = Math.abs(offset);

              const scale =
                absoluteOffset === 0
                  ? 1
                  : absoluteOffset === 1
                    ? 0.88
                    : 0.76;

              const opacity =
                absoluteOffset === 0
                  ? 1
                  : absoluteOffset === 1
                    ? 0.75
                    : 0.4;

              return (
                <div
                  key={video._id || index}
                  className="spotlight-card-wrap"
                  style={{
                    '--offset': offset,
                    zIndex: 10 - absoluteOffset,
                    opacity,
                    transform: `
                      translateX(calc(var(--offset) * 260px))
                      scale(${scale})
                    `,
                    transition:
                      'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents:
                      offset === 0 ? 'auto' : 'none',
                  }}
                  onClick={() => {
                    if (offset !== 0) {
                      setCurrent(index);
                    }
                  }}
                >
                  <VideoCard
                    video={video}
                    isCenter={offset === 0}
                    isSectionInView={isSectionInView}
                  />
                </div>
              );
            })}
          </div>

          {/* Next Arrow */}
          {videos.length > 1 && (
            <button
              type="button"
              className="spotlight-arrow spotlight-arrow--right"
              onClick={handleNext}
              aria-label="Next video"
              id="spotlight-next"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Slider Dots */}
        {videos.length > 1 && (
          <div className="spotlight-dots">
            {videos.map((video, index) => (
              <button
                type="button"
                key={video._id || index}
                className={`spotlight-dot${
                  index === current ? ' active' : ''
                }`}
                onClick={() => handleDotClick(index)}
                aria-label={`Go to video ${index + 1}`}
                aria-current={
                  index === current ? 'true' : undefined
                }
                id={`spotlight-dot-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}