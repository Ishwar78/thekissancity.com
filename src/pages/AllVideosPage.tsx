import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Loader2, Play, Video, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Footer } from '@/components/Footer';
interface Product {
  _id: string;
  title: string;
  images: string[];
  slug?: string;
}

interface InfluencerDataItem {
  _id: string;
  videoUrl: string;
  productId: Product;
  createdAt: string;
  updatedAt: string;
}

export default function AllVideosPage() {
  const [videos, setVideos] = useState<InfluencerDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<InfluencerDataItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api('/api/influencer-data/public');
        if (!res.ok) {
          throw new Error(res.json?.message || 'Failed to fetch videos');
        }
        const data = res.json.data;
        setVideos(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-12 md:pt-36 lg:pt-40">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-purple-600" />
              <p className="mt-4 text-gray-600">Loading videos...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 mt-6">
        <Navbar />
        <main className="container mx-auto px-4 pt-26 pb-12">
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Video className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Video Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All <span className="text-purple-600">Videos</span>
            </h1>
            <p className="text-red-500">Error loading videos: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-12 md:pt-36 lg:pt-40">
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Video className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-600">Video Collection</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              All Videos
            </h1>
            <p className="text-gray-600">No videos available at the moment.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-32 pb-12 md:pt-36 lg:pt-40">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 space-y-4">
         
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
            All Videos
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
            Watch all product reviews and influencer content from our community
          </p>
          {videos.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <TrendingUp className="h-4 w-4" />
              <span>
                {videos.length} {videos.length === 1 ? 'video' : 'videos'} available
              </span>
            </div>
          )}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => setSelectedVideo(video)}
              className="bg-card rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                <video
                  src={video.videoUrl}
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
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 drop-shadow-lg">
                    {video.productId?.title || 'Product Review'}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Modal/Dialog */}
        {selectedVideo && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="bg-card rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[9/16] w-full max-w-md mx-auto bg-gray-900">
                <video
                  ref={videoRef}
                  key={selectedVideo._id}
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  muted={false}
                  className="w-full h-full object-cover rounded-t-2xl"
                  onPlay={(e) => {
                    // Force unmute when video plays
                    const video = e.currentTarget;
                    video.muted = false;
                  }}
                />
              </div>
              <div className="p-6 bg-gradient-to-b from-card to-card/95">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {selectedVideo.productId?.title || 'Featured Product'}
                    </h3>
                    {selectedVideo.productId?.slug && (
                      <Link
                        to={`/products/${selectedVideo.productId.slug}`}
                        className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                      >
                        View Product →
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors text-2xl font-light leading-none ml-4 p-1 hover:bg-muted rounded-full w-8 h-8 flex items-center justify-center"
                    aria-label="Close video"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
