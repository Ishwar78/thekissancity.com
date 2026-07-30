import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../utils/api';
import './Categories.css';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/* ============================================================
   CREATE CATEGORY SLUG
   ============================================================ */

const createCategorySlug = (name = '') => {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/* ============================================================
   CATEGORY IMAGE URL
   ============================================================ */

const getCategoryImageUrl = (imageUrl = '') => {
  if (!imageUrl) {
    return '/placeholder-category.png';
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  const cleanImagePath = String(imageUrl).replace(/^\/+/, '');

  return API_URL
    ? `${API_URL}/${cleanImagePath}`
    : `/${cleanImagePath}`;
};

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ============================================================
     FETCH CATEGORIES
     ============================================================ */

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        setIsLoading(true);

        const data = await api('/api/categories');

        if (!isMounted) return;

        if (data?.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);

        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ============================================================
     GRID MODE

     Desktop:
     1–6 categories = center
     7+ categories = horizontal scroll

     Mobile:
     CSS se hamesha horizontal scroll
     ============================================================ */

  const gridClassName = useMemo(() => {
    if (categories.length >= 7) {
      return 'categories__grid categories__grid--scrollable';
    }

    return 'categories__grid categories__grid--centered';
  }, [categories.length]);

  /* ============================================================
     OPEN CATEGORY
     ============================================================ */

  const openCategory = (categoryName) => {
    const categorySlug = createCategorySlug(categoryName);

    if (!categorySlug) return;

    navigate(`/category/${categorySlug}`);
  };

  /* ============================================================
     KEYBOARD ACCESSIBILITY
     ============================================================ */

  const handleCategoryKeyDown = (event, categoryName) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCategory(categoryName);
    }
  };

  return (
    <section className="categories" id="categories">
      {/* ======================================================
          FULL-WIDTH CSS FARM BACKGROUND

          Is section mein koi background image use nahi ho rahi.
          Saara design CSS elements aur emojis se ban raha hai.
      ======================================================= */}

      <div
        className="categories__farm-background"
        aria-hidden="true"
      >
        {/* Sun */}
        <div className="categories__sun">
          <span />
        </div>

        {/* Clouds */}
        <div className="categories__cloud categories__cloud--one">
          <span />
          <span />
          <span />
        </div>

        <div className="categories__cloud categories__cloud--two">
          <span />
          <span />
          <span />
        </div>

        {/* Full-width Hills */}
        <div className="categories__hill categories__hill--back" />
        <div className="categories__hill categories__hill--front" />

        {/* Full-width Farm Field */}
        <div className="categories__farm-field">
          <div className="categories__field-lines" />

          <span className="categories__crop categories__crop--one">
            🌱
          </span>

          <span className="categories__crop categories__crop--two">
            🌾
          </span>

          <span className="categories__crop categories__crop--three">
            🌱
          </span>

          <span className="categories__crop categories__crop--four">
            🌻
          </span>
        </div>

        {/* Farmhouse */}
        <div className="categories__farmhouse">
          <div className="categories__farmhouse-roof" />

          <div className="categories__farmhouse-body">
            <span className="categories__farmhouse-window" />
            <span className="categories__farmhouse-door" />
          </div>

          <div className="categories__chimney" />

          <div className="categories__smoke">
            <span />
            <span />
            <span />
          </div>
        </div>

        {/* Bullock Cart */}
        <div className="categories__bullock-cart">
          <div className="categories__cart-body" />

          <div className="categories__cart-handle" />

          <span className="categories__cart-wheel categories__cart-wheel--left" />

          <span className="categories__cart-wheel categories__cart-wheel--right" />
        </div>

        {/* 
          Farmer emoji remove kar diya hai.
          Latest CSS is empty element ko realistic tree banayegi.
        */}
        <div className="categories__farm-item categories__farmer" />

        {/* 
          Buffalo ke neeche grass aur shadow CSS ke
          ::before aur ::after elements se banegi.
        */}
        {/* <div className="categories__farm-item categories__buffalo">
          🐃
        </div> */}

        {/* Mushrooms */}
        <div className="categories__farm-item categories__mushroom categories__mushroom--one">
          🍄
        </div>

        <div className="categories__farm-item categories__mushroom categories__mushroom--two">
          🍄
        </div>

        {/* Flowers */}
        <div className="categories__farm-item categories__flower categories__flower--one">
          🌻
        </div>

        <div className="categories__farm-item categories__flower categories__flower--two">
          🌼
        </div>

        <div className="categories__farm-item categories__flower categories__flower--three">
          🌷
        </div>

        {/* Butterflies */}
        <div className="categories__butterfly categories__butterfly--one">
          🦋
        </div>

        <div className="categories__butterfly categories__butterfly--two">
          🦋
        </div>

        <div className="categories__butterfly categories__butterfly--three">
          🦋
        </div>

        {/* Bee */}
        <div className="categories__bee">
          🐝
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <div className="container categories__container">
        {/* Header */}
        <div className="categories__header">
          <div className="categories__badge">
            <span aria-hidden="true">🌿</span>
            <span>Explore</span>
          </div>

          <h2 className="categories__title">
            Shop by <span>Categories</span>
          </h2>

          {/* <p className="categories__subtitle">
            Explore natural, farm-fresh and traditionally sourced
            products from trusted Indian farmers.
          </p> */}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="categories__loading">
            <span className="categories__loader" />
            <p>Loading farm categories...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && categories.length === 0 && (
          <div className="categories__empty">
            <span aria-hidden="true">🌱</span>
            <p>No categories are available right now.</p>
          </div>
        )}

        {/* Categories */}
        {!isLoading && categories.length > 0 && (
          <div className={gridClassName}>
            {categories.map((category, index) => {
              const categoryName =
                category?.name || `Category ${index + 1}`;

              const categorySlug =
                createCategorySlug(categoryName);

              const categoryKey =
                category?._id ||
                category?.id ||
                `${categorySlug}-${index}`;

              return (
                <button
                  type="button"
                  key={categoryKey}
                  className="category-card"
                  id={`cat-${categorySlug}`}
                  onClick={() => openCategory(categoryName)}
                  onKeyDown={(event) =>
                    handleCategoryKeyDown(event, categoryName)
                  }
                  aria-label={`Open ${categoryName} category`}
                >
                  {/* Category Image Ring */}
                  <span className="category-card__ring">
                    <span className="category-card__icon">
                      <img
                        src={getCategoryImageUrl(
                          category?.imageUrl
                        )}
                        alt={categoryName}
                        loading="lazy"
                        draggable="false"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src =
                            '/placeholder-category.png';
                        }}
                      />
                    </span>
                  </span>

                  {/* Category Name */}
                  <span className="category-card__name">
                    {categoryName}
                  </span>

                  {/* Hover Decoration */}
                  <span
                    className="category-card__small-leaf"
                    aria-hidden="true"
                  >
                    🌿
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}