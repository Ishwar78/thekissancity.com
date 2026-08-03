import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

import './AboutBanner.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://thekissancity.com'
).replace(/\/$/, '');

const fallbackAbout = {
  badge: '🌱 Our Story',

  title:
    'Bringing the Goodness of Kissan Directly to Your Home',

  content:
    '<p>The Kissan City was born from a simple belief — every Indian family deserves pure, unadulterated food. We cut out the middlemen and connect you directly with our network of trusted farmers who grow with love, tradition, and zero shortcuts.</p>',

  bullets: [
    'Partnered with 500+ certified kissan farmers across 18 states',
    'Zero pesticides, zero chemicals — 100% naturally grown',
    'Traditional farming methods preserved for authentic nutrition',
    'Fair prices directly from farm to your doorstep',
  ],

  stats: [
    {
      number: '500+',
      label: 'Kissan Farmers',
    },
    {
      number: '2L+',
      label: 'Happy Families',
    },
    {
      number: '200+',
      label: 'Products',
    },
    {
      number: '18',
      label: 'States',
    },
  ],

  imageUrl: '/hero_banner.png',

  imageAlt: 'Kissan farmer in field',

  buttonText: 'Explore Our Story',

  buttonLink: '#',
};

/*
  Backend image path in formats ko support karega:

  /uploads/image.png
  uploads/image.png
  image.png
  https://thekissancity.com/uploads/image.png
*/
const makeImageUrl = (url) => {
  if (!url) {
    return fallbackAbout.imageUrl;
  }

  const normalizedUrl = String(url)
    .trim()
    .replace(/\\/g, '/');

  if (
    /^https?:\/\//i.test(normalizedUrl) ||
    normalizedUrl.startsWith('data:') ||
    normalizedUrl.startsWith('blob:')
  ) {
    return normalizedUrl;
  }

  if (normalizedUrl.startsWith('/uploads/')) {
    return `${API_BASE_URL}${normalizedUrl}`;
  }

  if (normalizedUrl.startsWith('uploads/')) {
    return `${API_BASE_URL}/${normalizedUrl}`;
  }

  /*
    Public folder image jaise:
    /hero_banner.png
  */
  if (normalizedUrl.startsWith('/')) {
    return normalizedUrl;
  }

  /*
    Backend sirf filename bhej de:
    about-home-123.png
  */
  return `${API_BASE_URL}/uploads/${normalizedUrl}`;
};

/*
  React Quill ke saved HTML me agar white text ya
  white background inline save ho gaya ho to remove karega.
*/
const cleanQuillHtml = (html) => {
  if (!html) {
    return '';
  }

  if (
    typeof window === 'undefined' ||
    typeof DOMParser === 'undefined'
  ) {
    return html;
  }

  try {
    const parser = new DOMParser();

    const documentData = parser.parseFromString(
      `<div id="about-content-root">${html}</div>`,
      'text/html'
    );

    const root = documentData.getElementById(
      'about-content-root'
    );

    if (!root) {
      return html;
    }

    root.querySelectorAll('*').forEach((element) => {
      if (element.hasAttribute('style')) {
        element.style.removeProperty('color');
        element.style.removeProperty('background');
        element.style.removeProperty('background-color');

        if (!element.getAttribute('style')?.trim()) {
          element.removeAttribute('style');
        }
      }

      Array.from(element.classList).forEach((className) => {
        if (
          className.startsWith('ql-color-') ||
          className.startsWith('ql-bg-')
        ) {
          element.classList.remove(className);
        }
      });

      if (!element.className) {
        element.removeAttribute('class');
      }
    });

    return root.innerHTML;
  } catch (error) {
    console.error(
      'About content clean error:',
      error
    );

    return html;
  }
};

const hasVisibleHtmlContent = (html) => {
  if (!html) {
    return false;
  }

  const plainText = html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > 0;
};

export default function AboutBanner() {
  const [about, setAbout] = useState(fallbackAbout);

  useEffect(() => {
    const controller = new AbortController();

    const loadAboutHome = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/about-home`,
          {
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.success ||
          !data.aboutHome
        ) {
          throw new Error(
            data.message ||
              'About Home content load nahi ho paya.'
          );
        }

        const incomingAbout = data.aboutHome;

        setAbout((previous) => ({
          ...previous,

          badge:
            incomingAbout.badge ||
            previous.badge,

          title:
            incomingAbout.title ||
            previous.title,

          content:
            incomingAbout.content?.trim()
              ? incomingAbout.content
              : previous.content,

          bullets:
            Array.isArray(incomingAbout.bullets) &&
            incomingAbout.bullets.length > 0
              ? incomingAbout.bullets
              : previous.bullets,

          stats:
            Array.isArray(incomingAbout.stats) &&
            incomingAbout.stats.length > 0
              ? incomingAbout.stats
              : previous.stats,

          imageUrl:
            incomingAbout.imageUrl ||
            previous.imageUrl,

          imageAlt:
            incomingAbout.imageAlt ||
            previous.imageAlt,

          buttonText:
            incomingAbout.buttonText ||
            previous.buttonText,

          buttonLink:
            incomingAbout.buttonLink ||
            previous.buttonLink,
        }));
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(
            'About Home content load error:',
            error
          );
        }
      }
    };

    loadAboutHome();

    return () => {
      controller.abort();
    };
  }, []);

  const cleanedContent = useMemo(
    () => cleanQuillHtml(about.content),
    [about.content]
  );

  const imageSrc = useMemo(
    () =>
      makeImageUrl(
        about.imageUrl ||
          fallbackAbout.imageUrl
      ),
    [about.imageUrl]
  );

  const handleImageError = (event) => {
    const imageElement = event.currentTarget;

    /*
      Infinite fallback loop ko prevent karta hai.
    */
    if (
      imageElement.dataset.fallbackApplied === 'true'
    ) {
      return;
    }

    imageElement.dataset.fallbackApplied = 'true';
    imageElement.src = fallbackAbout.imageUrl;
  };

  return (
    <section
      className="about-banner"
      id="about"
    >
      <div className="container">
        <div className="about-banner__grid">
          {/* Left Content */}
          <div className="about-banner__content">
            {about.badge && (
              <div className="about-banner__badge">
                {about.badge}
              </div>
            )}

            {about.title && (
              <h2 className="about-banner__title">
                {about.title}
              </h2>
            )}

            {hasVisibleHtmlContent(cleanedContent) && (
              <div
                className="about-banner__text about-banner__rich-text"
                dangerouslySetInnerHTML={{
                  __html: cleanedContent,
                }}
              />
            )}

            {Array.isArray(about.bullets) &&
              about.bullets.length > 0 && (
                <ul className="about-banner__points">
                  {about.bullets.map(
                    (point, index) => (
                      <li
                        key={`${point}-${index}`}
                      >
                        <CheckCircle
                          className="about-banner__point-icon"
                          size={19}
                        />

                        <span>{point}</span>
                      </li>
                    )
                  )}
                </ul>
              )}

            {Array.isArray(about.stats) &&
              about.stats.length > 0 && (
                <div className="about-banner__stats">
                  {about.stats.map(
                    (stat, index) => (
                      <div
                        className="about-stat"
                        key={`${stat.number}-${stat.label}-${index}`}
                      >
                        <div className="about-stat__number">
                          {stat.number}
                        </div>

                        <div className="about-stat__label">
                          {stat.label}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            {about.buttonText && (
              <a
                href={about.buttonLink || '#'}
                className="btn-gold"
                id="explore-story-btn"
              >
                <span>
                  {about.buttonText}
                </span>

                <ArrowRight size={17} />
              </a>
            )}
          </div>

          {/* Right Image */}
          <div className="about-banner__image-column">
            <div className="about-banner__img-wrap">
              <img
                key={imageSrc}
                src={imageSrc}
                alt={
                  about.imageAlt ||
                  'Our story'
                }
                onError={handleImageError}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}