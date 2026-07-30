import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import { ALL_PRODUCTS } from '../data/products';
import { fetchAllStoreProducts } from '../utils/productUtils';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const dbProducts = await fetchAllStoreProducts();
      if (isMounted) {
        const allList = dbProducts || [];
        const newArrivalsList = allList.filter(p => p.tags?.includes('new-arrivals') || p.badge === 'new');
        setProducts(newArrivalsList.length > 0 ? newArrivalsList : allList);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-700) 0%, var(--green-500) 60%, #56c156 100%)',
          padding: '60px 0 40px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.07,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M30 0L60 30L30 60L0 30z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)', color: 'var(--gold-400)',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '6px 16px', borderRadius: 99, marginBottom: 16,
            }}>
              ✦ Just Arrived
            </div>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 12,
            }}>
              New Arrivals 🌿
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.82)', maxWidth: 480, margin: '0 auto' }}>
              Freshly added from our kissan farms. Be the first to try our newest organic products!
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="container">
          <nav className="breadcrumb">
            <a href="/">Home</a>
            <span className="breadcrumb__sep">›</span>
            <span className="breadcrumb__current">New Arrivals</span>
          </nav>

          <ProductGrid products={products} sidebarType="both" />
        </div>
      </main>
      <Footer />
    </>
  );
}
