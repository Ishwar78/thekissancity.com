import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Film,
  Image as ImageIcon,
  Link2,
  Loader2,
  Plus,
  PlayCircle,
  Tag,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { api } from "../../utils/api";
import "./AdminVideos.css";

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [tag, setTag] = useState("");

  const [videoFile, setVideoFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [posterPreview, setPosterPreview] = useState("");

  const videoInputRef = useRef(null);
  const posterInputRef = useRef(null);

  const baseUrl = (
    import.meta.env.VITE_API_URL || "https://thekissancity.com"
  ).replace(/\/$/, "");

  const getMediaUrl = (mediaUrl) => {
    if (!mediaUrl) return "";

    if (/^https?:\/\//i.test(mediaUrl) || mediaUrl.startsWith("blob:")) {
      return mediaUrl;
    }

    return `${baseUrl}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
  };

  const fetchVideos = async () => {
    try {
      setFetching(true);

      const data = await api("/api/videos");

      setVideos(Array.isArray(data?.videos) ? data.videos : []);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    return () => {
      if (videoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreview);
      }

      if (posterPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(posterPreview);
      }
    };
  }, [videoPreview, posterPreview]);

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file.");
      event.target.value = "";
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      alert("Video size should be less than 100 MB.");
      event.target.value = "";
      return;
    }

    if (videoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }

    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handlePosterChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Poster image should be less than 5 MB.");
      event.target.value = "";
      return;
    }

    if (posterPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(posterPreview);
    }

    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    if (videoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreview);
    }

    if (posterPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(posterPreview);
    }

    setProductName("");
    setProductSlug("");
    setTag("");
    setVideoFile(null);
    setPosterFile(null);
    setVideoPreview("");
    setPosterPreview("");

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }

    if (posterInputRef.current) {
      posterInputRef.current.value = "";
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${baseUrl}/api/videos/${id}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to delete video");
      }

      await fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert(error.message || "Unable to delete video.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = productName.trim();
    const trimmedSlug = productSlug.trim();
    const trimmedTag = tag.trim();

    if (!trimmedName || !trimmedSlug || !trimmedTag || !videoFile) {
      alert("Product Name, Slug, Tag and Video file are required.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("productName", trimmedName);
      formData.append("productSlug", trimmedSlug);
      formData.append("tag", trimmedTag);
      formData.append("video", videoFile);

      if (posterFile) {
        formData.append("poster", posterFile);
      }

      const token = localStorage.getItem("adminToken");

      const response = await fetch(`${baseUrl}/api/videos`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || "Failed to save video");
      }

      resetForm();
      await fetchVideos();
    } catch (error) {
      console.error("Error saving video:", error);
      alert(error.message || "An error occurred while saving the video.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-videos-page">
      <div className="admin-videos-heading">
        <div>
          <span className="admin-videos-eyebrow">
            <Video size={15} />
            Video Management
          </span>

          <h1>Manage Influencer Videos</h1>

          <p>
            Upload product-focused videos, poster images and promotional tags.
          </p>
        </div>

        <div className="admin-videos-summary">
          <div className="admin-videos-summary-icon">
            <Film size={22} />
          </div>

          <div>
            <span>Total Videos</span>
            <strong>{videos.length}</strong>
          </div>
        </div>
      </div>

      <div className="admin-videos-layout">
        <section className="admin-video-form-card">
          <div className="admin-video-card-header">
            <div>
              <span>Create video</span>
              <h2>Add New Video</h2>
            </div>
          </div>

          <form className="admin-video-form" onSubmit={handleSubmit}>
            <div className="admin-video-field">
              <label htmlFor="video-product-name">
                Product Name <span>*</span>
              </label>

              <input
                id="video-product-name"
                type="text"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="e.g. A2 Desi Cow Ghee"
                required
              />
            </div>

            <div className="admin-video-field">
              <label htmlFor="video-product-slug">
                Product Slug <span>*</span>
              </label>

              <input
                id="video-product-slug"
                type="text"
                value={productSlug}
                onChange={(event) => setProductSlug(event.target.value)}
                placeholder="e.g. a2-desi-cow-ghee"
                required
              />
            </div>

            <div className="admin-video-field">
              <label htmlFor="video-tag">
                Video Tag <span>*</span>
              </label>

              <input
                id="video-tag"
                type="text"
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                placeholder="e.g. 100% Natural"
                required
              />
            </div>

            <div className="admin-video-field">
              <label>
                Video File <span>*</span>
              </label>

              <button
                type="button"
                className={`admin-video-upload ${
                  videoPreview ? "has-preview" : ""
                }`}
                onClick={() => videoInputRef.current?.click()}
              >
                {videoPreview ? (
                  <span className="admin-video-selected">
                    <span className="admin-video-selected-icon">
                      <CheckCircle2 size={23} />
                    </span>

                    <strong>Video selected</strong>

                    <small>{videoFile?.name || "Selected video file"}</small>
                  </span>
                ) : (
                  <span className="admin-video-upload-placeholder">
                    <span className="admin-video-upload-icon">
                      <Film size={27} />
                    </span>

                    <strong>Select video file</strong>
                    <small>MP4 or WEBM up to 100 MB</small>
                  </span>
                )}
              </button>

              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleVideoChange}
                hidden
              />
            </div>

            <div className="admin-video-field">
              <label>
                Poster Image <small>Optional thumbnail</small>
              </label>

              <button
                type="button"
                className={`admin-poster-upload ${
                  posterPreview ? "has-preview" : ""
                }`}
                onClick={() => posterInputRef.current?.click()}
              >
                {posterPreview ? (
                  <>
                    <img src={posterPreview} alt="Poster preview" />

                    <span className="admin-poster-upload-overlay">
                      <Upload size={18} />
                      Change Poster
                    </span>
                  </>
                ) : (
                  <span className="admin-poster-upload-placeholder">
                    <span className="admin-poster-upload-icon">
                      <ImageIcon size={25} />
                    </span>

                    <strong>Upload poster image</strong>
                    <small>PNG, JPG or WEBP up to 5 MB</small>
                  </span>
                )}
              </button>

              <input
                ref={posterInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handlePosterChange}
                hidden
              />
            </div>

            <button
              type="submit"
              className="admin-video-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="admin-video-spin" />
                  Saving Video...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Video
                </>
              )}
            </button>
          </form>
        </section>

        <section className="admin-video-list-card">
          <div className="admin-video-card-header admin-video-list-header">
            <div>
              <span>Store media</span>
              <h2>Uploaded Videos</h2>
            </div>

            <span className="admin-video-count">{videos.length} videos</span>
          </div>

          {fetching ? (
            <div className="admin-video-state">
              <span className="admin-video-state-icon">
                <Loader2 size={30} className="admin-video-spin" />
              </span>

              <h3>Loading videos</h3>
              <p>Please wait while the uploaded videos are being fetched.</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="admin-video-state">
              <span className="admin-video-state-icon">
                <Film size={31} />
              </span>

              <h3>No videos found</h3>
              <p>Upload your first product video using the form.</p>
            </div>
          ) : (
            <div className="admin-video-grid">
              {videos.map((video) => (
                <article className="admin-video-card" key={video._id}>
                  <div className="admin-video-media">
                    <video
                      src={getMediaUrl(video.videoUrl)}
                      poster={getMediaUrl(video.posterUrl)}
                      controls
                      preload="metadata"
                      playsInline
                    />

                    <span className="admin-video-play-badge">
                      <PlayCircle size={16} />
                      Product Video
                    </span>

                    <button
                      type="button"
                      className="admin-video-delete-btn"
                      onClick={() => handleDelete(video._id)}
                      aria-label={`Delete ${video.productName}`}
                      title="Delete video"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="admin-video-card-body">
                    <h3 title={video.productName}>{video.productName}</h3>

                    <div className="admin-video-meta-row">
                      <span className="admin-video-tag">
                        <Tag size={13} />
                        {video.tag}
                      </span>

                      <span
                        className="admin-video-slug"
                        title={video.productSlug}
                      >
                        <Link2 size={13} />
                        {video.productSlug}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}