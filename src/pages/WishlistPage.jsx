import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    remove(product.id);
  };

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh', background: 'var(--gray-50)', paddingBottom: 64 }}>
        {/* Hero */}
        <div style={{
          background: 'linear-gradient(135deg, var(--green-700), var(--green-500))',
          padding: '50px 0 36px',
        }}>
          <div className="container">
            <nav className="breadcrumb" style={{ '--bc-color': 'rgba(255,255,255,0.7)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>›</span>
              <span style={{ color: 'white' }}>My Wishlist</span>
            </nav>
            <h1 style={{
              fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              fontWeight: 900, color: 'white', marginTop: 8,
            }}>
              💚 My Wishlist
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
              {items.length} item{items.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        <div className="container" style={{ paddingTop: 32 }}>
          {items.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'white', borderRadius: 24, border: '1px solid var(--gray-100)',
            }}>
              <div style={{ fontSize: '5rem', marginBottom: 16, opacity: 0.3 }}>💔</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--gray-700)', marginBottom: 10 }}>
                Your wishlist is empty
              </h2>
              <p style={{ color: 'var(--gray-400)', marginBottom: 28, fontSize: '0.95rem' }}>
                Save products you love for later. Browse our farm store and add items!
              </p>
              <Link to="/" className="btn-primary">
                Start Exploring <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}>
              {items.map(product => (
                <div key={product.id} style={{
                  background: 'white', borderRadius: 20,
                  overflow: 'hidden', border: '1px solid var(--gray-100)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.25s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {/* Image */}
                  <Link to={`/product/${product.slug}`} style={{ display: 'block', position: 'relative', height: 200, overflow: 'hidden', background: 'var(--gray-50)' }}>
                    <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {product.badge && (
                      <span style={{
                        position: 'absolute', top: 12, left: 12,
                        background: product.badge === 'bestseller' ? 'var(--gold-500)' : product.badge === 'new' ? 'var(--green-500)' : '#ef4444',
                        color: product.badge === 'bestseller' ? 'var(--gray-900)' : 'white',
                        fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {product.badge}
                      </span>
                    )}
                    {/* Remove from wishlist */}
                    <button
                      onClick={(e) => { e.preventDefault(); remove(product.id); }}
                      id={`wl-remove-${product.id}`}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'white', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-md)', color: '#ef4444',
                      }}
                    >
                      <Heart size={15} fill="#ef4444" />
                    </button>
                  </Link>

                  {/* Info */}
                  <div style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                      {product.category}
                    </div>
                    <Link to={`/product/${product.slug}`} style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.35, display: 'block', marginBottom: 10 }}>
                      {product.name}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                      <span style={{ color: 'var(--gold-400)', fontSize: '0.82rem' }}>{'★'.repeat(Math.round(product.rating))}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{product.rating}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-700)' }}>₹{product.price}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--gray-400)', textDecoration: 'line-through', marginLeft: 6 }}>₹{product.originalPrice}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>
                        {Math.round((product.originalPrice - product.price) / product.originalPrice * 100)}% OFF
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => handleAddToCart(product)}
                        id={`wl-cart-${product.id}`}
                        style={{
                          flex: 1, padding: '9px', background: 'linear-gradient(135deg, var(--green-500), var(--green-700))',
                          color: 'white', border: 'none', borderRadius: 10,
                          fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          boxShadow: 'var(--shadow-green)',
                        }}
                      >
                        <ShoppingCart size={15} /> Move to Cart
                      </button>
                      <button
                        onClick={() => remove(product.id)}
                        id={`wl-delete-${product.id}`}
                        style={{
                          width: 38, height: 38, background: '#fef2f2',
                          border: '1px solid #fecaca', borderRadius: 10,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#ef4444',
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
