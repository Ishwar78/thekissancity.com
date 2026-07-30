import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ALL_PRODUCTS } from '../data/products';
import { fetchAllStoreProducts } from '../utils/productUtils';
import { api } from '../utils/api';

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(() => {
    try {
      const saved = localStorage.getItem('kissan_recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [allStoreProds, setAllStoreProds] = useState([]);
  const [categories, setCategories] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const [dbProducts, dbCategories] = await Promise.all([
        fetchAllStoreProducts(),
        api('/api/categories')
      ]);
      if (isMounted) {
        setAllStoreProds(dbProducts || []);
        if (dbCategories && Array.isArray(dbCategories)) {
          setCategories(dbCategories.filter(c => c.active !== false));
        }
      }
    };
    if (open) {
      loadData();
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => { document.body.style.overflow = ''; isMounted = false; };
  }, [open]);

  // Derive dynamic trending items from store products
  const trendingItems = useMemo(() => {
    if (!allStoreProds || allStoreProds.length === 0) return [];
    const bestsellers = allStoreProds.filter(p => p.badge === 'bestseller' || p.isBestSeller || p.badge === 'new' || p.isNewArrival);
    const pool = bestsellers.length > 0 ? bestsellers : allStoreProds;
    return pool.slice(0, 6);
  }, [allStoreProds]);

  const results = query.trim().length > 1
    ? allStoreProds.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 6)
    : [];

  const handleSearch = (q) => {
    const term = q || query;
    if (!term.trim()) return;
    const updated = [term, ...recent.filter(r => r !== term)].slice(0, 5);
    setRecent(updated);
    try {
      localStorage.setItem('kissan_recent_searches', JSON.stringify(updated));
    } catch (e) {}
    navigate(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  const goToProduct = (slug) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: '80px', padding: '80px 16px 20px',
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 680,
        background: 'white', borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.3)',
        animation: 'slideDown 0.25s ease',
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--gray-100)',
        }}>
          <Search size={22} color="var(--green-600)" style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search for ghee, honey, spices, wellness products..."
            id="search-overlay-input"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '1.05rem', color: 'var(--gray-800)',
              background: 'transparent', fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gray-100)', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} color="var(--gray-500)" />
            </button>
          )}
          <button onClick={onClose} id="search-close-btn" style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--gray-100)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--gray-600)',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Results or suggestions */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>

          {/* Live Results */}
          {results.length > 0 && (
            <div style={{ padding: '12px 20px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Products Found ({results.length})
              </div>
              {results.map(p => (
                <div
                  key={p.id}
                  onClick={() => goToProduct(p.slug)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-100)' }}>
                    <img src={p.img} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{p.category}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green-700)', flexShrink: 0 }}>₹{p.price}</div>
                  <ArrowRight size={14} color="var(--gray-300)" />
                </div>
              ))}
              <button
                onClick={() => handleSearch()}
                style={{
                  width: '100%', marginTop: 10, padding: '10px',
                  background: 'var(--green-50)', color: 'var(--green-700)',
                  border: '1px solid var(--green-200)', borderRadius: 10,
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                View all results for "{query}" →
              </button>
            </div>
          )}

          {/* No results */}
          {query.trim().length > 1 && results.length === 0 && (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No products found for "{query}"</div>
              <div style={{ fontSize: '0.85rem' }}>Try different keywords</div>
            </div>
          )}

          {/* Suggestions when no query */}
          {query.trim().length <= 1 && (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Recent */}
              {recent.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    <Clock size={12} /> Recent Searches
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {recent.map(r => (
                      <button key={r} onClick={() => { setQuery(r); handleSearch(r); }} style={{
                        padding: '6px 14px', background: 'var(--gray-100)', color: 'var(--gray-700)',
                        border: '1px solid var(--gray-200)', borderRadius: 99,
                        fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                      }}>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending */}
              {trendingItems.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    <TrendingUp size={12} color="var(--green-500)" /> Trending Now
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {trendingItems.map(item => (
                      <button key={item.id || item._id} onClick={() => goToProduct(item.slug)} style={{
                        padding: '6px 14px', background: 'var(--green-50)', color: 'var(--green-700)',
                        border: '1px solid var(--green-200)', borderRadius: 99,
                        fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
                      }}>
                        🔥 {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular categories */}
              {categories.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                    Popular Categories
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                    {categories.slice(0, 4).map((cat) => (
                      <button key={cat._id || cat.id} onClick={() => { navigate(`/category/${cat.slug}`); onClose(); }} style={{
                        padding: '12px 8px', background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                        borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--green-50)'; e.currentTarget.style.borderColor = 'var(--green-300)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.borderColor = 'var(--gray-200)'; }}
                      >
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} style={{ width: 32, height: 32, objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: '1.5rem' }}>🌿</span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-700)', textAlign: 'center' }}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
