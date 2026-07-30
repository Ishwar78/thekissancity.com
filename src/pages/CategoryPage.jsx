import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Leaf,
  Sprout,
  Wheat,
} from 'lucide-react';

import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';

import {
  ALL_PRODUCTS,
  CATEGORIES,
} from '../data/products';

import { fetchAllStoreProducts } from '../utils/productUtils';

import './CategoryPage.css';

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const normalizeSlug = (value) =>
  normalizeText(value).replace(/\s+/g, '-');

const getProductTags = (product) => {
  if (!Array.isArray(product?.tags)) {
    return [];
  }

  return product.tags.map((tag) => normalizeText(tag));
};

const productHasTag = (product, tag) => {
  return getProductTags(product).includes(normalizeText(tag));
};

const categorySlugIncludes = (product, value) => {
  return normalizeText(product?.categorySlug).includes(
    normalizeText(value)
  );
};

const matchesCategory = (product, categorySlug, categoryName) => {
  const productSlug = normalizeSlug(product?.categorySlug);
  const productCategory = normalizeSlug(product?.category);

  return (
    productSlug === normalizeSlug(categorySlug) ||
    productCategory === normalizeSlug(categoryName)
  );
};

export default function CategoryPage() {
  const { slug } = useParams();

  const [allStoreProducts, setAllStoreProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);

  /* ============================================================
     FETCH DATABASE PRODUCTS AND CATEGORIES
     ============================================================ */

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const databaseProducts = await fetchAllStoreProducts();
        if (isMounted) {
          setAllStoreProducts(databaseProducts || []);
        }

        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const catRes = await fetch(`${baseUrl}/api/categories`);
        const catData = await catRes.json();
        if (isMounted && catData.success && Array.isArray(catData.categories)) {
          setDbCategories(catData.categories);
        }
      } catch (error) {
        console.error('Failed to load category page data:', error);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ============================================================
     FIND CURRENT CATEGORY FROM DB OR SLUG
     ============================================================ */

  const currentCategory = useMemo(() => {
    return dbCategories.find(
      (category) =>
        normalizeSlug(category.slug || category.name) === normalizeSlug(slug)
    );
  }, [slug, dbCategories]);

  /* ============================================================
     PAGE DATA AND FILTERED PRODUCTS
     ============================================================ */

  const pageData = useMemo(() => {
    let filteredProducts = [];
    let title = 'All Products';
    let subtitle =
      'Browse our complete collection of natural and farm-fresh products.';
    let type = 'both';
    let breadcrumb = 'All Products';

    /* Food Category */
    if (slug === 'food') {
      filteredProducts = allStoreProducts;

      title = 'Food Products';
      subtitle =
        'Pure, organic and farm-fresh food products sourced directly from trusted Indian farmers.';
      type = 'food';
      breadcrumb = 'Food Products';
    }

    /* Wellness Category */
    else if (slug === 'wellness') {
      filteredProducts = allStoreProducts.filter((product) => {
        return (
          productHasTag(product, 'wellness') ||
          categorySlugIncludes(product, 'wellness') ||
          categorySlugIncludes(product, 'superfood') ||
          categorySlugIncludes(product, 'ayurvedic') ||
          categorySlugIncludes(product, 'tea')
        );
      });

      title = 'Wellness Products';
      subtitle =
        'Natural Ayurvedic and herbal products carefully selected for your everyday wellness.';
      type = 'wellness';
      breadcrumb = 'Wellness Products';
    }

    /* Health Category */
    else if (slug?.startsWith('health')) {
      const healthId = slug.split('/')[1] || slug;

      filteredProducts = allStoreProducts.filter((product) => {
        if (!Array.isArray(product?.healthRegions)) {
          return false;
        }

        return product.healthRegions.some((region) => {
          const regionId =
            typeof region === 'object'
              ? region?._id
              : region;

          return String(regionId) === String(healthId);
        });
      });

      title = 'Health Concern';
      subtitle =
        'Products specially curated to support your health and wellness needs.';
      type = 'both';
      breadcrumb = 'Health Concern';
    }

    /* Existing / Admin Category */
    else if (currentCategory) {
      filteredProducts = allStoreProducts.filter((product) =>
        matchesCategory(
          product,
          currentCategory.slug || currentCategory.name,
          currentCategory.name
        )
      );

      title = currentCategory.name;
      subtitle = `Explore our complete collection of ${currentCategory.name.toLowerCase()} products sourced with care and quality.`;
      type = 'both';
      breadcrumb = currentCategory.name;
    }

    /* Dynamic or Fallback Category */
    else {
      filteredProducts = allStoreProducts.filter((product) => {
        return (
          normalizeSlug(product?.categorySlug) === normalizeSlug(slug) ||
          normalizeSlug(product?.category) === normalizeSlug(slug)
        );
      });

      const formattedTitle = slug
        ? slug
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (letter) =>
              letter.toUpperCase()
            )
        : 'All Products';

      title = formattedTitle;
      subtitle =
        'Browse our complete collection of natural and farm-fresh products.';
      type = 'both';
      breadcrumb = formattedTitle;
    }

    return {
      products: filteredProducts,
      title,
      subtitle,
      type: ['food', 'wellness', 'both'].includes(type)
        ? type
        : 'both',
      breadcrumb,
    };
  }, [slug, currentCategory, allStoreProducts]);

  /* ============================================================
     SUBCATEGORIES (ADMIN CREATED CATEGORIES)
     ============================================================ */

  const showSubCategories =
    slug === 'food' || slug === 'wellness' || !slug;

  const subCategories = useMemo(() => {
    if (!showSubCategories) {
      return [];
    }

    return dbCategories.map(c => ({
      slug: normalizeSlug(c.slug || c.name),
      label: c.name,
      _id: c._id
    }));
  }, [dbCategories, showSubCategories]);

  return (
    <>
      <Navbar />

      <main className="kcp-page">
        {/* =====================================================
            FARM HERO
        ====================================================== */}

        <section
          className={`kcp-hero kcp-hero--${pageData.type}`}
        >
          {/* Decorative farm design */}
          <div className="kcp-farm-art" aria-hidden="true">
            <div className="kcp-sun" />

            <div className="kcp-cloud kcp-cloud--one">
              <span />
              <span />
              <span />
            </div>

            <div className="kcp-cloud kcp-cloud--two">
              <span />
              <span />
              <span />
            </div>

            <div className="kcp-hill kcp-hill--back" />
            <div className="kcp-hill kcp-hill--middle" />
            <div className="kcp-hill kcp-hill--front" />

            {/* Farm house */}
            <div className="kcp-house">
              <div className="kcp-house__roof" />

              <div className="kcp-house__body">
                <span className="kcp-house__window" />
                <span className="kcp-house__door" />
              </div>

              <div className="kcp-house__chimney" />

              <div className="kcp-house__smoke">
                <span />
                <span />
                <span />
              </div>
            </div>

            {/* Trees */}
            <div className="kcp-tree kcp-tree--one">
              <span className="kcp-tree__top" />
              <span className="kcp-tree__trunk" />
            </div>

            <div className="kcp-tree kcp-tree--two">
              <span className="kcp-tree__top" />
              <span className="kcp-tree__trunk" />
            </div>

            {/* Tractor */}
            <div className="kcp-tractor">
              <span className="kcp-tractor__emoji">
                🚜
              </span>
            </div>

            {/* Field */}
            <div className="kcp-field">
              <div className="kcp-field__rows" />

              <div className="kcp-field__crop kcp-field__crop--one">
                🌱
              </div>

              <div className="kcp-field__crop kcp-field__crop--two">
                🌾
              </div>

              <div className="kcp-field__crop kcp-field__crop--three">
                🌱
              </div>

              <div className="kcp-field__crop kcp-field__crop--four">
                🌻
              </div>
            </div>

            {/* Small controlled decorations */}
            <div className="kcp-floating kcp-floating--mushroom">
              🍄
            </div>

            <div className="kcp-floating kcp-floating--flower">
              🌻
            </div>

            <div className="kcp-floating kcp-floating--leaf">
              🌿
            </div>
          </div>

          <div className="container kcp-hero__container">
            <div className="kcp-hero__content">
              {/* Breadcrumb */}
              <nav
                className="kcp-breadcrumb"
                aria-label="Breadcrumb"
              >
                <Link
                  to="/"
                  className="kcp-breadcrumb__link"
                >
                  Home
                </Link>

                <ChevronRight
                  size={15}
                  className="kcp-breadcrumb__arrow"
                />

                <span className="kcp-breadcrumb__current">
                  {pageData.breadcrumb}
                </span>
              </nav>

              {/* Badge */}
              <div className="kcp-hero__badge">
                <Sprout size={16} />

                <span>
                  Fresh from trusted Indian farms
                </span>
              </div>

              {/* Important:
                  category.icon is not rendered here because it
                  may contain a full-size image. */}
              <h1 className="kcp-hero__title">
                {pageData.title}
              </h1>

              <p className="kcp-hero__subtitle">
                {pageData.subtitle}
              </p>

              {/* Features */}
              <div className="kcp-hero__features">
                <span>
                  <Sprout size={15} />
                  Farm Fresh
                </span>

                <span>
                  <Leaf size={15} />
                  Naturally Sourced
                </span>

                <span>
                  <Wheat size={15} />
                  Farmer Supported
                </span>
              </div>

              {/* Subcategory pills */}
              {showSubCategories &&
                subCategories.length > 0 && (
                  <div className="kcp-pills">
                    {subCategories.map((category) => (
                      <Link
                        key={category.slug}
                        to={`/category/${category.slug}`}
                        className="kcp-pill"
                      >
                        <Sprout size={14} />

                        <span>{category.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* =====================================================
            PRODUCTS SECTION
        ====================================================== */}

        <section className="kcp-products">
          <div className="container">
            <div className="kcp-products__header">
              <div>
                <span className="kcp-products__eyebrow">
                  Natural Farm Collection
                </span>

                <h2 className="kcp-products__title">
                  Explore {pageData.title}
                </h2>
              </div>

              <div className="kcp-products__count">
                <Sprout size={17} />

                <span>
                  {pageData.products.length}{' '}
                  {pageData.products.length === 1
                    ? 'Product'
                    : 'Products'}
                </span>
              </div>
            </div>

            <ProductGrid
              products={pageData.products}
              sidebarType={pageData.type}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}