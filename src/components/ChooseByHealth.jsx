import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../utils/api';
import './ChooseByHealth.css';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://thekissancity.com'
).replace(/\/+$/, '');

const getImageUrl = (imageUrl = '') => {
  if (!imageUrl) {
    return '/placeholder.png';
  }

  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:')
  ) {
    return imageUrl;
  }

  const cleanImagePath = String(imageUrl).replace(/^\/+/, '');

  return API_BASE_URL
    ? `${API_BASE_URL}/${cleanImagePath}`
    : `/${cleanImagePath}`;
};

export default function ChooseByHealth() {
  const [healthCategories, setHealthCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHealthCategories = async () => {
      try {
        setLoading(true);

        const data = await api('/api/health');

        if (!isMounted) return;

        if (
          data?.success &&
          Array.isArray(data.healthCategories)
        ) {
          setHealthCategories(data.healthCategories);
        } else {
          setHealthCategories([]);
        }
      } catch (error) {
        console.error(
          'Error fetching health categories:',
          error
        );

        if (isMounted) {
          setHealthCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHealthCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      className="choose-health"
      id="choose-by-health"
    >
      {/* Pure CSS Health + Farm Background */}
      <div
        className="choose-health__farm-art"
        aria-hidden="true"
      >
        {/* Sun */}
        <div className="choose-health__sun">
          <span />
        </div>

        {/* Clouds */}
        <div className="choose-health__cloud choose-health__cloud--one">
          <span />
          <span />
          <span />
        </div>

        <div className="choose-health__cloud choose-health__cloud--two">
          <span />
          <span />
          <span />
        </div>

        {/* Hills */}
        <div className="choose-health__hill choose-health__hill--back" />
        <div className="choose-health__hill choose-health__hill--front" />

        {/* Left-side mushrooms */}
        <div className="choose-health__mushrooms">
          <div className="choose-health__mushroom choose-health__mushroom--large">
            <span className="choose-health__mushroom-cap" />
            <span className="choose-health__mushroom-stem" />
          </div>

          <div className="choose-health__mushroom choose-health__mushroom--medium">
            <span className="choose-health__mushroom-cap" />
            <span className="choose-health__mushroom-stem" />
          </div>

          <div className="choose-health__mushroom choose-health__mushroom--small">
            <span className="choose-health__mushroom-cap" />
            <span className="choose-health__mushroom-stem" />
          </div>
        </div>

        {/* Grain bowl */}
        <div className="choose-health__grain-bowl">
          <div className="choose-health__grain-top" />
          <div className="choose-health__grain-body" />
        </div>

        {/* Wheat */}
        <div className="choose-health__wheat-bunch">
          <span className="choose-health__wheat choose-health__wheat--one" />
          <span className="choose-health__wheat choose-health__wheat--two" />
          <span className="choose-health__wheat choose-health__wheat--three" />
          <span className="choose-health__wheat choose-health__wheat--four" />
        </div>

        {/* Herbal mortar and pestle */}
        <div className="choose-health__mortar">
          <div className="choose-health__pestle" />

          <div className="choose-health__mortar-bowl">
            <span className="choose-health__mortar-herb choose-health__mortar-herb--one" />
            <span className="choose-health__mortar-herb choose-health__mortar-herb--two" />
          </div>
        </div>

        {/* Herbal health bottle */}
        <div className="choose-health__medicine">
          <div className="choose-health__medicine-cap" />

          <div className="choose-health__medicine-body">
            <span className="choose-health__medicine-cross">
              +
            </span>

            <span className="choose-health__medicine-label">
              HERBAL
            </span>
          </div>

          <span className="choose-health__medicine-leaf choose-health__medicine-leaf--one" />
          <span className="choose-health__medicine-leaf choose-health__medicine-leaf--two" />
        </div>

        {/* Health heart */}
        <div className="choose-health__health-heart">
          <span className="choose-health__heart-icon">
            💚
          </span>

          <span className="choose-health__heart-leaf">
            🌿
          </span>
        </div>

        {/* Farmhouse */}
        <div className="choose-health__farmhouse">
          <div className="choose-health__farmhouse-roof" />

          <div className="choose-health__farmhouse-body">
            <span className="choose-health__farmhouse-window" />
            <span className="choose-health__farmhouse-door" />
          </div>

          <div className="choose-health__farmhouse-chimney" />

          <div className="choose-health__farmhouse-smoke">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Full width field */}
        <div className="choose-health__field">
          <div className="choose-health__field-lines" />

          <span className="choose-health__plant choose-health__plant--one">
            🌱
          </span>

          <span className="choose-health__plant choose-health__plant--two">
            🌿
          </span>

          <span className="choose-health__plant choose-health__plant--three">
            🌾
          </span>

          <span className="choose-health__plant choose-health__plant--four">
            🌻
          </span>
        </div>

        {/* Upper butterflies */}
        <span className="choose-health__butterfly choose-health__butterfly--one">
          🦋
        </span>

        <span className="choose-health__butterfly choose-health__butterfly--two">
          🦋
        </span>

        {/* Lower butterflies */}
        <span className="choose-health__butterfly choose-health__butterfly--bottom-one">
          🦋
        </span>

        <span className="choose-health__butterfly choose-health__butterfly--bottom-two">
          🦋
        </span>

        <span className="choose-health__butterfly choose-health__butterfly--bottom-three">
          🦋
        </span>

        {/* Flying leaves and bee */}
        <span className="choose-health__floating-leaf choose-health__floating-leaf--one">
          🍃
        </span>

        <span className="choose-health__floating-leaf choose-health__floating-leaf--two">
          🌿
        </span>

        <span className="choose-health__bee">
          🐝
        </span>
      </div>

      <div className="container choose-health__container">
        <div className="choose-health__header">
          <span className="choose-health__badge">
            <span aria-hidden="true">🌿</span>
            EXPLORE YOUR HEALTH
          </span>

          <h2 className="choose-health__title">
            Choose by <span>Health</span>
          </h2>

          {/* <p className="choose-health__subtitle">
            Discover natural, herbal and farm-sourced products
            selected for your everyday health and wellness needs.
          </p> */}

          <div className="choose-health__divider" />
        </div>

        {loading && (
          <div className="choose-health__loading">
            <span className="choose-health__loader" />
            <p>Loading health categories...</p>
          </div>
        )}

        {!loading && healthCategories.length > 0 && (
          <div className="choose-health__scroll-wrapper">
            <div className="choose-health__grid">
              {healthCategories.map((category, index) => {
                const categoryId =
                  category?._id ||
                  category?.id ||
                  `health-${index}`;

                const categoryName =
                  category?.name ||
                  `Health Category ${index + 1}`;

                return (
                  <Link
                    to={`/health-concern/${categoryId}`}
                    key={categoryId}
                    className="health-card"
                    aria-label={`View products for ${categoryName}`}
                  >
                    <span className="health-card__ring">
                      <span className="health-card__icon-wrap">
                        <img
                          src={getImageUrl(
                            category?.imageUrl
                          )}
                          alt={categoryName}
                          loading="lazy"
                          draggable="false"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src =
                              '/placeholder.png';
                          }}
                        />
                      </span>
                    </span>

                    <p className="health-card__title">
                      {categoryName}
                    </p>

                    <span
                      className="health-card__leaf"
                      aria-hidden="true"
                    >
                      🌱
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {!loading && healthCategories.length === 0 && (
          <div className="choose-health__empty">
            <span aria-hidden="true">🌿</span>
            <p>No health categories found.</p>
          </div>
        )}
      </div>
    </section>
  );
}