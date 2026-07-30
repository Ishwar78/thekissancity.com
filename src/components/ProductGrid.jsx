import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Zap, Star, SlidersHorizontal, ArrowUpDown, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import FilterSidebar from './FilterSidebar';
import { PRICE_RANGES } from '../data/products';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest First' },
];

function applyFilters(products, filters) {
  let result = [...products];

  if (filters.categories?.length) {
    result = result.filter(p => filters.categories.includes(p.categorySlug));
  }

  if (filters.priceRanges?.length) {
    result = result.filter(p =>
      filters.priceRanges.some(label => {
        const range = PRICE_RANGES.find(r => r.label === label);
        return range && p.price >= range.min && p.price <= range.max;
      })
    );
  }

  if (filters.ratings?.length) {
    const minRating = Math.min(...filters.ratings.map(Number));
    result = result.filter(p => p.rating >= minRating);
  }

  if (filters.brands?.length) {
    result = result.filter(p => filters.brands.includes(p.brand));
  }

  if (filters.tags?.length) {
    result = result.filter(p =>
      filters.tags.some(t => {
        if (t === 'bestseller') return p.badge === 'bestseller';
        if (t === 'new') return p.badge === 'new';
        if (t === 'sale') return p.badge === 'sale';
        return true;
      })
    );
  }

  return result;
}

function applySort(products, sort) {
  const result = [...products];
  switch (sort) {
    case 'price-asc': return result.sort((a, b) => a.price - b.price);
    case 'price-desc': return result.sort((a, b) => b.price - a.price);
    case 'rating': return result.sort((a, b) => b.rating - a.rating);
    default: return result;
  }
}

export default function ProductGrid({ products, sidebarType = 'both', title, subtitle }) {
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedId, setAddedId] = useState(null);

  const filtered = applySort(applyFilters(products, filters), sort);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const handleBuyNow = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', { state: { buyNowItem: product } });
  };

  const hasFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v);

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', padding: '24px 0' }}>

      {/* Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters({})}
        type={sidebarType}
        mobileOpen={mobileFilterOpen}
        onMobileClose={() => setMobileFilterOpen(false)}
      />

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
          padding: '14px 18px',
          background: 'white',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-100)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="filter-mobile-toggle"
              style={{
                display: 'none', alignItems: 'center', gap: 6,
                padding: '7px 14px', background: 'var(--green-50)',
                border: '1.5px solid var(--green-200)', borderRadius: 99,
                fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-700)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <SlidersHorizontal size={14} /> Filter
              {hasFilters && <span style={{ background: 'var(--green-500)', color: 'white', borderRadius: 99, fontSize: '0.7rem', padding: '0 5px', fontWeight: 700 }}>
                {Object.values(filters).flat().length}
              </span>}
            </button>

            <span style={{ fontSize: '0.88rem', color: 'var(--gray-500)' }}>
              <strong style={{ color: 'var(--gray-800)' }}>{filtered.length}</strong> products found
              {hasFilters && <span style={{ color: 'var(--green-600)', marginLeft: 6, fontWeight: 600 }}>(filtered)</span>}
            </span>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowUpDown size={14} color="var(--gray-400)" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              id="product-sort-select"
              style={{
                border: '1.5px solid var(--gray-200)', borderRadius: 8,
                padding: '6px 10px', fontSize: '0.85rem', color: 'var(--gray-700)',
                background: 'white', cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
              }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {Object.entries(filters).flatMap(([key, vals]) =>
              (vals || []).map(v => (
                <div key={`${key}-${v}`} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 12px', background: 'var(--green-50)',
                  border: '1px solid var(--green-200)', borderRadius: 99,
                  fontSize: '0.8rem', fontWeight: 600, color: 'var(--green-700)',
                }}>
                  {v}
                  <button
                    onClick={() => {
                      const newVals = filters[key].filter(i => i !== v);
                      setFilters({ ...filters, [key]: newVals });
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'var(--green-600)', fontSize: '0.9rem' }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            <button onClick={() => setFilters({})} style={{
              padding: '4px 12px', background: 'none',
              border: '1px solid #fecaca', borderRadius: 99,
              fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Clear All
            </button>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔍</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: 'var(--gray-600)' }}>No products match your filters</div>
            <div style={{ fontSize: '0.9rem', marginBottom: 20 }}>Try adjusting or clearing filters</div>
            <button onClick={() => setFilters({})} className="btn-primary">Clear Filters</button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 18,
          }} className="product-responsive-grid">
            {filtered.map(product => {
              const itemImg = product.img || (product.imgs && product.imgs[0]) || '/product_ghee.png';
              const pId = product.id || product._id;
              const inWishlist = isWishlisted(pId);

              return (
                <div key={pId} className="product-card" id={`pg-product-${pId}`}>
                  <Link to={`/product/${product.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
                    <div className="product-card__image-wrap">
                      <img src={itemImg} alt={product.name} className="product-card__img" />
                      {product.badge && (
                        <span className={`product-card__badge ${product.badge}`}>
                          {product.badge === 'bestseller' ? '🏆 Bestseller' : product.badge === 'new' ? '✨ New' : '💥 Sale'}
                        </span>
                      )}
                      <button
                        className="product-card__wishlist"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
                        id={`pg-wishlist-${pId}`}
                        aria-label="Add to wishlist"
                        style={{ color: inWishlist ? '#ef4444' : undefined }}
                      >
                        <Heart size={16} fill={inWishlist ? '#ef4444' : 'none'} />
                      </button>
                    </div>
                  </Link>

                <div className="product-card__body">
                  <div className="product-card__category">{product.category}</div>
                  <Link
                    to={`/product/${product.slug}`}
                    className="product-card__name"
                    style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
                  >
                    {product.name}
                  </Link>

                  <div className="product-card__rating">
                    <span className="product-card__stars" style={{ color: 'var(--gold-400)', fontSize: '0.78rem' }}>
                      {'★'.repeat(Math.round(product.rating))}
                    </span>
                    <span className="product-card__rating-count">
                      {product.rating} ({product.reviews.toLocaleString()})
                    </span>
                  </div>

                  <div className="product-card__prices" style={{ marginBottom: 12 }}>
                    <span className="product-card__price">₹{product.price}</span>
                    <span className="product-card__price-original">₹{product.originalPrice}</span>
                  </div>

                  <div className="product-card__actions">
                    <button
                      className={`product-card__add-to-cart-btn${addedId === product.id ? ' added' : ''}`}
                      onClick={e => handleAddToCart(product, e)}
                      id={`pg-add-${product.id}`}
                      aria-label="Add to cart"
                    >
                      {addedId === product.id ? <><Check size={14} /> Added!</> : <><ShoppingCart size={14} /> Add to Cart</>}
                    </button>
                    <button
                      className="product-card__buy-now-btn"
                      onClick={e => handleBuyNow(product, e)}
                      id={`pg-buynow-${product.id}`}
                      aria-label="Buy now"
                    >
                      <Zap size={14} /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .filter-mobile-toggle { display: flex !important; }
        }
        @media (max-width: 700px) {
          .product-responsive-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          .product-responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
