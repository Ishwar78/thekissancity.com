import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import { api } from '../utils/api';
import { formatProduct } from '../utils/productUtils';
import { HeartPulse, ChevronRight, Package } from 'lucide-react';
import './HealthConcernPage.css';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');

export default function HealthConcernPage() {
  const { id } = useParams();
  const [healthCategory, setHealthCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadHealthPageData = async () => {
      try {
        const [healthRes, prodRes] = await Promise.all([
          api('/api/health'),
          api('/api/products')
        ]);

        if (isMounted) {
          // Find target health category
          const categoriesList = healthRes.healthCategories || [];
          const matchedHealth = categoriesList.find(h => h._id === id || h.name.toLowerCase().replace(/\s+/g, '-') === id);
          setHealthCategory(matchedHealth || null);

          // Filter products mapped to this health region
          const rawProds = prodRes.products || [];
          const matchedProds = rawProds.filter(p => {
            if (!p.healthRegions || p.healthRegions.length === 0) return false;
            return p.healthRegions.some(h => {
              const hId = typeof h === 'object' ? h._id : h;
              return hId === id || (matchedHealth && hId === matchedHealth._id);
            });
          }).map(formatProduct);

          setProducts(matchedProds);
        }
      } catch (err) {
        console.error('Error fetching health category products:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHealthPageData();
    return () => { isMounted = false; };
  }, [id]);

  const healthName = healthCategory ? healthCategory.name : 'Health Concern';
  const healthImg = healthCategory?.imageUrl
    ? (healthCategory.imageUrl.startsWith('http') ? healthCategory.imageUrl : `${BASE_URL}${healthCategory.imageUrl.startsWith('/') ? '' : '/'}${healthCategory.imageUrl}`)
    : null;

  return (
    <>
      <Navbar />
      <main>
        {/* Health Concern Hero */}
        <div className="health-hero">
          <div className="health-hero__bg-pattern" />
          <div className="container health-hero__container">
            {healthImg && (
              <div className="health-hero__icon-box">
                <img src={healthImg} alt={healthName} />
              </div>
            )}
            <div>
              <nav className="health-breadcrumb">
                <Link to="/">Home</Link>
                <span>›</span>
                <Link to="/">Health Needs</Link>
                <span>›</span>
                <span>{healthName}</span>
              </nav>

              <div className="health-hero__badge">
                <HeartPulse size={14} /> Health Specialized
              </div>

              <h1 className="health-hero__title">
                {healthName} 🌿
              </h1>
              <p className="health-hero__subtitle">
                Explore natural farm-fresh organic products specifically selected for {healthName}.
              </p>
            </div>
          </div>
        </div>

        {/* Product Grid / List */}
        <div className="container health-page__content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280', fontSize: '1.1rem' }}>
              Loading products for {healthName}...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af' }}>
              <Package size={56} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.3rem', color: '#374151', marginBottom: '8px' }}>
                No products found for "{healthName}"
              </h3>
              <p style={{ fontSize: '0.95rem', color: '#6b7280', marginBottom: '24px' }}>
                Products associated with this health concern will appear here as soon as they are added by the admin.
              </p>
              <Link to="/" className="btn-primary">Browse All Products</Link>
            </div>
          ) : (
            <ProductGrid products={products} sidebarType="both" />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
