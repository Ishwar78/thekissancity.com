import React, { useState, useEffect, useRef } from 'react';

import { Loader2, Star, TrendingUp, Clock, Play, ArrowRight, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';

import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';



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



// API utility type

declare const api: (url: string) => Promise<{ok: boolean, json: any}>;



export default function InfluencerSection() {

  const [influencerData, setInfluencerData] = useState<InfluencerDataItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<InfluencerDataItem | null>(null);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const [hasAudioTrack, setHasAudioTrack] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      if (hasVideoEnded) {
        setHasVideoEnded(false);
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    }
  };

  // Touch handlers for swipe functionality - iOS optimized
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Prevent iOS zoom on double tap
    if (e.touches.length === 1) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Prevent scrolling during swipe on iOS
    if (touchStart) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };



  useEffect(() => {

    const fetchInfluencerData = async () => {

      setLoading(true);

      setError(null);

      console.log('=== INFLUENCER SECTION INIT ===');

      try {

        // Check if api utility is available

        if (typeof api === 'function') {

          const res = await api('/api/influencer-data/public');

          if (!res.ok) {

            throw new Error(res.json?.message || 'Failed to fetch influencer data');

          }

          const data = res.json.data;

          setInfluencerData(data);
          
          console.log('Influencer data loaded:', data.length, 'videos');
          data.forEach((video, index) => {
            console.log(`Video ${index}:`, video.videoUrl);
          });

          if (data.length > 0) {

            setSelectedVideo(data[0]);

            setCurrentVideoIndex(0);
            
            console.log('Selected first video:', data[0].videoUrl);

          }

        } else {

          // Fallback to fetch

          const response = await fetch('/api/influencer-data/public');

          const json = await response.json();

          if (!response.ok) {

            throw new Error(json?.message || 'Failed to fetch influencer data');

          }

          setInfluencerData(json.data);
          
          console.log('Influencer data loaded (fallback):', json.data.length, 'videos');
          json.data.forEach((video, index) => {
            console.log(`Video ${index}:`, video.videoUrl);
          });

          if (json.data.length > 0) {

            setSelectedVideo(json.data[0]);

            setCurrentVideoIndex(0);
            
            console.log('Selected first video (fallback):', json.data[0].videoUrl);

          }

        }

      } catch (err: any) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchInfluencerData();

  }, []);



  if (loading) {

    return (

      <section className="py-16 bg-white">

        <div className="container mx-auto px-4 text-center">

          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />

          <p className="mt-4 text-gray-600">Loading influencer content...</p>

        </div>

      </section>

    );

  }



  if (error) {

    return (

      <section className="py-16">

        <div className="container mx-auto px-4 text-center text-red-500">

          <p>Error loading influencer data: {error}</p>

        </div>

      </section>

    );

  }



  if (!influencerData.length) {

    return null;

  }



  const otherVideos = influencerData.filter(item => item._id !== selectedVideo?._id);

  const handlePrevious = () => {
    const newIndex = currentVideoIndex === 0 ? influencerData.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(influencerData[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentVideoIndex === influencerData.length - 1 ? 0 : currentVideoIndex + 1;
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(influencerData[newIndex]);
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setSelectedVideo(influencerData[index]);
  };

  return (
    <section className="py-8 bg-[#faf3eb]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Featured Content</span>
          </div> */}

         
           <div className="text-center mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                      <div className="flex-1"></div>
                      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
                        Influencer Spotlight
                      </h2>
                      <div className="flex-1"></div>
                    </div>
                    {/* <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                     Watch real reviews from our community of creators and  influencer.
                    </p> */}
                  </div>
        </div>

     
        {/* Mobile View - Carousel */}
<div className="lg:hidden mb-6">
  {/* Main Video Display with Navigation */}
  <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6" style={{ minHeight: '400px' }}>
    {/* Left Navigation Button Container */}
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
      <button
        onClick={(e) => {
          handlePrevious();
          setTimeout(() => {
            if (e.currentTarget && e.currentTarget.blur) {
              e.currentTarget.blur();
            }
          }, 150);
        }}
        className="p-2.5 bg-transparent   "
        disabled={influencerData.length <= 1}
      >
        <ChevronLeft className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
      </button>
    </div>
    
    {/* Right Navigation Button Container */}
    <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
      <button
        onClick={(e) => {
          handleNext();
          setTimeout(() => {
            if (e.currentTarget && e.currentTarget.blur) {
              e.currentTarget.blur();
            }
          }, 150);
        }}
        className="p-2.5 bg-transparent "
        disabled={influencerData.length <= 1}
      >
        <ChevronRight className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={2.5} />
      </button>
    </div>
    
    {/* Video Counter */}
    <div className="absolute top-2 right-2 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
      {currentVideoIndex + 1} / {influencerData.length}
    </div>
    
        
        
    <div className="relative aspect-[9/16] w-full bg-gray-900 overflow-hidden" style={{ minHeight: '400px' }}>
      <video
                ref={videoRef}
                src={selectedVideo?.videoUrl}
                controls
                muted={false}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => {
                  // iOS-compatible video interaction
                  const video = e.currentTarget;
                  console.log('Video clicked - Current muted state:', video.muted);
                  
                  // iOS requires user gesture for audio
                  if (video.paused) {
                    video.play().catch(err => {
                      console.log('Autoplay prevented:', err);
                    });
                  }
                  
                  // Gentle unmute for iOS compatibility
                  video.muted = false;
                  video.volume = 1.0;
                  setIsMuted(false);
                  
                  console.log('After click - muted:', video.muted, 'volume:', video.volume);
                }}
                onVolumeChange={(e) => {
                  const video = e.currentTarget;
                  console.log('Volume change event - muted:', video.muted, 'volume:', video.volume);
                  setIsMuted(video.muted);
                }}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget as HTMLVideoElement;
                  console.log('Video metadata loaded');
                  console.log('Video duration:', video.duration);
                  console.log('Video readyState:', video.readyState);
                  console.log('Video muted:', video.muted);
                  console.log('Video volume:', video.volume);
                  
                  // Better audio detection
                  let hasAudio = false;
                  
                  // Method 1: Check if video has audio tracks (modern browsers)
                  if ('audioTracks' in video) {
                    hasAudio = (video as any).audioTracks.length > 0;
                    console.log('Audio tracks method:', hasAudio);
                  }
                  
                  // Method 2: Check webkitAudioDecodedByteCount (Chrome/Safari)
                  if ('webkitAudioDecodedByteCount' in video) {
                    hasAudio = (video as any).webkitAudioDecodedByteCount > 0;
                    console.log('Webkit audio bytes method:', hasAudio);
                  }
                  
                  // Method 3: Try to detect by playing briefly and checking audio context
                  if (!hasAudio && video.duration > 0) {
                    // Assume videos under 6 seconds might be muted WhatsApp videos
                    hasAudio = video.duration > 6;
                    console.log('Duration-based detection:', hasAudio, 'duration:', video.duration);
                  }
                  
                  setHasAudioTrack(hasAudio);
                  console.log('Final audio detection result:', hasAudio);
                  
                  if (video.duration > 0 && video.readyState >= 2) {
                    video.currentTime = 0.1;
                  }
                }}
                onPlay={(e) => {
                  // iOS-compatible play handling
                  const video = e.currentTarget;
                  console.log('Video play event triggered');
                  
                  // Don't force unmute on iOS - let user control
                  video.volume = Math.min(video.volume, 1.0);
                  setIsMuted(video.muted);
                  setHasVideoEnded(false);
                  
                  console.log('Play - muted after:', video.muted, 'volume:', video.volume);
                }}
                onEnded={() => {
                  setHasVideoEnded(true);
                }}
                className="w-full h-full object-cover"
                preload="metadata"
              />
    </div>
  </div>
</div>

        {/* Desktop View - Original Layout */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side: Large Featured Video */}
              <div className="lg:w-1/2">
                {selectedVideo && (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4">
                    <div className="relative aspect-[3/4] w-full max-h-[600px] bg-gray-900 overflow-hidden">
                      <video
                        key={selectedVideo._id}
                        src={selectedVideo.videoUrl}
                        controls
                        muted={false}
                        onVolumeChange={(e) => {
                          const video = e.currentTarget;
                          console.log('Desktop volume change - muted:', video.muted, 'volume:', video.volume);
                          setIsMuted(video.muted);
                        }}
                        onPlay={(e) => {
                          // iOS-compatible desktop video play
                          const video = e.currentTarget;
                          console.log('Desktop video play event');
                          
                          video.volume = Math.min(video.volume, 1.0);
                          setIsMuted(video.muted);
                          setHasVideoEnded(false);
                          
                          console.log('Desktop - muted after:', video.muted, 'volume:', video.volume);
                        }}
                        onEnded={() => {
                          setHasVideoEnded(true);
                        }}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          const videoElement = e.currentTarget;
                          console.log('Desktop video metadata loaded');
                          console.log('Desktop duration:', videoElement.duration);
                          console.log('Desktop readyState:', videoElement.readyState);
                          console.log('Desktop muted:', videoElement.muted);
                          console.log('Desktop volume:', videoElement.volume);
                          
                          if (videoElement.duration > 0 && videoElement.readyState >= 2) {
                            videoElement.currentTime = 0.1;
                          }
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedVideo.productId?.title || 'Featured Product'}
                        </h3>
                        <button
                          onClick={toggleMute}
                          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          aria-label={isMuted ? "Unmute" : "Mute"}
                        >
                          {isMuted ? (
                            <VolumeX className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Scrollable Grid */}
              <div className="lg:w-1/2">
                <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {otherVideos.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedVideo(item)}
                        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                      >
                        <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                          <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              // Seek to first frame to show preview
                              const videoElement = e.currentTarget;
                              if (videoElement.duration > 0 && videoElement.readyState >= 2) {
                                videoElement.currentTime = 0.1;
                              }
                            }}
                            onLoadedData={(e) => {
                              // Ensure first frame is shown
                              const videoElement = e.currentTarget;
                              if (videoElement.readyState >= 2) {
                                videoElement.currentTime = 0.1;
                              }
                            }}
                            onCanPlay={(e) => {
                              // Show first frame when video can play
                              const videoElement = e.currentTarget;
                              if (videoElement.currentTime === 0) {
                                videoElement.currentTime = 0.1;
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                            <h4 className="font-bold text-white text-sm mb-1 line-clamp-2 drop-shadow-lg">
                              {item.productId?.title || 'Product Review'}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show all videos button at the end */}
        <div className="text-center mt-10 md:mt-16">
                            <Link
                              to="/videos"
                              className="inline-flex items-center text-sm font-medium text-primary hover:text-gray-900 transition-colors group"
                            >
                              View All Videos
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>

       

      </div>
    </section>
  );

}