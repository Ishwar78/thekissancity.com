import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import ReactQuill from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';

import {
  BarChart3,
  BookOpenText,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import './AdminAboutHome.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5005'
).replace(/\/$/, '');

const defaultForm = {
  badge: '🌱 Our Story',

  title:
    'Bringing the Goodness of Kissan Directly to Your Home',

  content: '',

  imageAlt: 'Kissan farmer in field',

  buttonText: 'Explore Our Story',

  buttonLink: '#',

  bullets: [''],

  stats: [
    {
      number: '',
      label: '',
    },
  ],
};

const makeImageUrl = (url) => {
  if (!url) {
    return '';
  }

  if (
    /^https?:\/\//i.test(url) ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url;
  }

  return `${API_BASE_URL}${
    url.startsWith('/') ? url : `/${url}`
  }`;
};

export default function AdminAboutHome() {
  const [formData, setFormData] = useState(defaultForm);

  const [currentImage, setCurrentImage] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);

  const [previewUrl, setPreviewUrl] = useState('');

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: '',
    text: '',
  });

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [
          {
            header: [2, 3, 4, false],
          },
        ],
        ['bold', 'italic', 'underline', 'strike'],
        [
          {
            color: [],
          },
          {
            background: [],
          },
        ],
        [
          {
            list: 'ordered',
          },
          {
            list: 'bullet',
          },
        ],
        [
          {
            align: [],
          },
        ],
        ['blockquote', 'link'],
        ['clean'],
      ],
    }),
    []
  );

  useEffect(() => {
    let isMounted = true;

    const fetchAboutHome = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_BASE_URL}/api/about-home`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              'About Home content load nahi ho paya.'
          );
        }

        if (!isMounted) {
          return;
        }

        const about = data.aboutHome || {};

        setFormData({
          badge: about.badge || '',

          title: about.title || '',

          content: about.content || '',

          imageAlt: about.imageAlt || '',

          buttonText: about.buttonText || '',

          buttonLink: about.buttonLink || '#',

          bullets:
            Array.isArray(about.bullets) &&
            about.bullets.length > 0
              ? about.bullets
              : [''],

          stats:
            Array.isArray(about.stats) &&
            about.stats.length > 0
              ? about.stats
              : [
                  {
                    number: '',
                    label: '',
                  },
                ],
        });

        setCurrentImage(about.imageUrl || '');
      } catch (error) {
        if (isMounted) {
          setMessage({
            type: 'error',
            text:
              error.message ||
              'About Home content load nahi ho paya.',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAboutHome();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: 'Please sirf image file select karein.',
      });

      event.target.value = '';

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setMessage({
        type: 'error',
        text: 'Image size 10 MB se kam honi chahiye.',
      });

      event.target.value = '';

      return;
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const localPreview = URL.createObjectURL(file);

    setSelectedImage(file);
    setPreviewUrl(localPreview);

    setMessage({
      type: '',
      text: '',
    });
  };

  const updateBullet = (index, value) => {
    setFormData((previous) => ({
      ...previous,

      bullets: previous.bullets.map(
        (bullet, bulletIndex) =>
          bulletIndex === index ? value : bullet
      ),
    }));
  };

  const addBullet = () => {
    setFormData((previous) => ({
      ...previous,
      bullets: [...previous.bullets, ''],
    }));
  };

  const removeBullet = (index) => {
    setFormData((previous) => ({
      ...previous,

      bullets:
        previous.bullets.length === 1
          ? ['']
          : previous.bullets.filter(
              (_, bulletIndex) => bulletIndex !== index
            ),
    }));
  };

  const updateStat = (index, key, value) => {
    setFormData((previous) => ({
      ...previous,

      stats: previous.stats.map((stat, statIndex) =>
        statIndex === index
          ? {
              ...stat,
              [key]: value,
            }
          : stat
      ),
    }));
  };

  const addStat = () => {
    setFormData((previous) => ({
      ...previous,

      stats: [
        ...previous.stats,
        {
          number: '',
          label: '',
        },
      ],
    }));
  };

  const removeStat = (index) => {
    setFormData((previous) => ({
      ...previous,

      stats:
        previous.stats.length === 1
          ? [
              {
                number: '',
                label: '',
              },
            ]
          : previous.stats.filter(
              (_, statIndex) => statIndex !== index
            ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage({
      type: '',
      text: '',
    });

    if (!formData.title.trim()) {
      setMessage({
        type: 'error',
        text: 'Section title required hai.',
      });

      return;
    }

    const cleanedBullets = formData.bullets
      .map((item) => item.trim())
      .filter(Boolean);

    const cleanedStats = formData.stats
      .map((item) => ({
        number: item.number.trim(),
        label: item.label.trim(),
      }))
      .filter((item) => item.number || item.label);

    const body = new FormData();

    body.append('badge', formData.badge);
    body.append('title', formData.title);
    body.append('content', formData.content);
    body.append('imageAlt', formData.imageAlt);
    body.append('buttonText', formData.buttonText);
    body.append('buttonLink', formData.buttonLink || '#');

    body.append(
      'bullets',
      JSON.stringify(cleanedBullets)
    );

    body.append(
      'stats',
      JSON.stringify(cleanedStats)
    );

    if (selectedImage) {
      body.append('image', selectedImage);
    }

    try {
      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/about-home`,
        {
          method: 'PUT',
          body,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Content save nahi ho paya.'
        );
      }

      const about = data.aboutHome || {};

      setCurrentImage(about.imageUrl || '');

      setSelectedImage(null);

      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl('');

      setMessage({
        type: 'success',
        text: 'About Home content successfully update ho gaya.',
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text:
          error.message ||
          'About Home content save nahi ho paya.',
      });
    } finally {
      setSaving(false);
    }
  };

  const displayedImage =
    previewUrl || makeImageUrl(currentImage);

  return (
    <main className="about-home-admin">
      <header className="about-home-admin__header">
        <div>
          <span className="about-home-admin__eyebrow">
            Homepage Management
          </span>

          <h1>About Home</h1>

          <p>
            Our Story section ka content, image, points aur stats
            yahan se manage karein.
          </p>
        </div>

        <div
          className="about-home-admin__header-icon"
          aria-hidden="true"
        >
          <BookOpenText size={30} />
        </div>
      </header>

      {message.text && (
        <div
          className={`about-home-admin__alert is-${message.type}`}
          role="alert"
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={19} />
          ) : (
            <span>!</span>
          )}

          {message.text}
        </div>
      )}

      {loading ? (
        <div className="about-home-admin__loading">
          <Loader2 className="spin" size={28} />

          <span>Content loading...</span>
        </div>
      ) : (
        <form
          className="about-home-admin__form"
          onSubmit={handleSubmit}
        >
          {/* Story Content */}
          <section className="about-home-card">
            <div className="about-home-card__heading">
              <div className="about-home-card__icon">
                <BookOpenText size={20} />
              </div>

              <div>
                <h2>Story Content</h2>

                <p>
                  Badge, heading aur rich text description update
                  karein.
                </p>
              </div>
            </div>

            <div className="about-home-grid two-columns">
              <label className="about-home-field">
                <span>Small Badge</span>

                <input
                  type="text"
                  name="badge"
                  value={formData.badge}
                  onChange={handleFieldChange}
                  placeholder="🌱 Our Story"
                />
              </label>

              <label className="about-home-field">
                <span>Section Heading *</span>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFieldChange}
                  placeholder="Enter section heading"
                  required
                />
              </label>
            </div>

            <div className="about-home-field about-home-editor-field">
              <span>Our Story Content</span>

              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) =>
                  setFormData((previous) => ({
                    ...previous,
                    content,
                  }))
                }
                modules={quillModules}
                placeholder="Write complete Our Story content..."
              />
            </div>
          </section>

          {/* Image */}
          <section className="about-home-card">
            <div className="about-home-card__heading">
              <div className="about-home-card__icon">
                <ImageIcon size={20} />
              </div>

              <div>
                <h2>Section Image</h2>

                <p>
                  Image crop nahi hogi. Original aspect ratio ke
                  saath complete show hogi.
                </p>
              </div>
            </div>

            <div className="about-home-image-grid">
              <label className="about-home-upload">
                <UploadCloud size={34} />

                <strong>
                  {selectedImage
                    ? selectedImage.name
                    : 'Choose About Image'}
                </strong>

                <span>
                  JPG, PNG, WEBP, GIF ya AVIF · maximum 10 MB
                </span>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  onChange={handleImageChange}
                />
              </label>

              <div className="about-home-preview">
                {displayedImage ? (
                  <img
                    src={displayedImage}
                    alt={
                      formData.imageAlt || 'About Home preview'
                    }
                  />
                ) : (
                  <div className="about-home-preview__empty">
                    <ImageIcon size={38} />

                    <span>No image selected</span>
                  </div>
                )}
              </div>
            </div>

            <label className="about-home-field">
              <span>Image Alt Text</span>

              <input
                type="text"
                name="imageAlt"
                value={formData.imageAlt}
                onChange={handleFieldChange}
                placeholder="Describe the image"
              />
            </label>
          </section>

          {/* Story Points */}
          <section className="about-home-card">
            <div className="about-home-card__heading about-home-card__heading--actions">
              <div className="about-home-card__heading-main">
                <div className="about-home-card__icon">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <h2>Story Points</h2>

                  <p>
                    Points add, update aur remove kar sakte ho.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="about-home-secondary-btn"
                onClick={addBullet}
              >
                <Plus size={17} />

                Add Point
              </button>
            </div>

            <div className="about-home-repeat-list">
              {formData.bullets.map((bullet, index) => (
                <div
                  className="about-home-repeat-row"
                  key={`bullet-${index}`}
                >
                  <span className="about-home-repeat-index">
                    {index + 1}
                  </span>

                  <input
                    type="text"
                    value={bullet}
                    onChange={(event) =>
                      updateBullet(index, event.target.value)
                    }
                    placeholder="Enter story point"
                  />

                  <button
                    type="button"
                    className="about-home-icon-btn"
                    onClick={() => removeBullet(index)}
                    aria-label={`Remove point ${index + 1}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="about-home-card">
            <div className="about-home-card__heading about-home-card__heading--actions">
              <div className="about-home-card__heading-main">
                <div className="about-home-card__icon">
                  <BarChart3 size={20} />
                </div>

                <div>
                  <h2>Stats</h2>

                  <p>
                    Number aur label dono admin panel se edit
                    honge.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="about-home-secondary-btn"
                onClick={addStat}
              >
                <Plus size={17} />

                Add Stat
              </button>
            </div>

            <div className="about-home-stats-editor">
              {formData.stats.map((stat, index) => (
                <div
                  className="about-home-stat-editor"
                  key={`stat-${index}`}
                >
                  <span className="about-home-stat-editor__number">
                    Stat {index + 1}
                  </span>

                  <label className="about-home-field">
                    <span>Number</span>

                    <input
                      type="text"
                      value={stat.number}
                      onChange={(event) =>
                        updateStat(
                          index,
                          'number',
                          event.target.value
                        )
                      }
                      placeholder="500+"
                    />
                  </label>

                  <label className="about-home-field">
                    <span>Label</span>

                    <input
                      type="text"
                      value={stat.label}
                      onChange={(event) =>
                        updateStat(
                          index,
                          'label',
                          event.target.value
                        )
                      }
                      placeholder="Kissan Farmers"
                    />
                  </label>

                  <button
                    type="button"
                    className="about-home-icon-btn"
                    onClick={() => removeStat(index)}
                    aria-label={`Remove stat ${index + 1}`}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Button Settings */}
          <section className="about-home-card">
            <div className="about-home-card__heading">
              <div className="about-home-card__icon">
                <Save size={20} />
              </div>

              <div>
                <h2>Button Settings</h2>

                <p>
                  Homepage button text aur link manage karein.
                </p>
              </div>
            </div>

            <div className="about-home-grid two-columns">
              <label className="about-home-field">
                <span>Button Text</span>

                <input
                  type="text"
                  name="buttonText"
                  value={formData.buttonText}
                  onChange={handleFieldChange}
                  placeholder="Explore Our Story"
                />
              </label>

              <label className="about-home-field">
                <span>Button Link</span>

                <input
                  type="text"
                  name="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleFieldChange}
                  placeholder="/about or #about"
                />
              </label>
            </div>
          </section>

          <div className="about-home-admin__save-bar">
            <div>
              <strong>Ready to publish?</strong>

              <span>
                Save karte hi homepage par updated data show hoga.
              </span>
            </div>

            <button
              type="submit"
              className="about-home-primary-btn"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="spin" size={19} />
              ) : (
                <Save size={19} />
              )}

              {saving ? 'Saving...' : 'Save About Home'}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}