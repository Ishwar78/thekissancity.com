import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';
import { ALL_PRODUCTS } from '../data/products';
import { fetchAllStoreProducts } from '../utils/productUtils';

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [allStoreProds, setAllStoreProds] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const dbProducts = await fetchAllStoreProducts();
      if (isMounted) {
        setAllStoreProds(dbProducts || []);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const results = query.trim()
    ? allStoreProds.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        (p.shortDesc && p.shortDesc.toLowerCase().includes(query.toLowerCase()))
      )
    : allStoreProds;

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh' }}>
        {/* Header */}
        <div style={{
          background: 'var(--gray-900)', padding: '40px 0 30px',
        }}>
          <div className="container">
            <nav style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.5)' }}>Home</Link>
              <span>›</span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>Search</span>
            </nav>
            {query ? (
              <>
                <h1 style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, marginBottom: 6 }}>
                  🔍 Results for "{query}"
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                  {results.length} product{results.length !== 1 ? 's' : ''} found
                </p>
              </>
            ) : (
              <h1 style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900 }}>
                🌾 All Products
              </h1>
            )}
          </div>
        </div>

        <div className="container">
          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16, opacity: 0.3 }}>😕</div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 10 }}>
                No results for "{query}"
              </h2>
              <p style={{ color: 'var(--gray-400)', marginBottom: 24 }}>Try searching with different keywords.</p>
              <Link to="/" className="btn-primary">Browse All Products</Link>
            </div>
          ) : (
            <ProductGrid products={results} sidebarType="both" />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
