import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingCart, ChevronDown, Menu, X, Leaf, Heart, LogOut, Package, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useUser } from '../context/UserContext';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import UserAuthModal from './UserAuthModal';


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState('login');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  
  const [dynamicCategories, setDynamicCategories] = useState([]);

  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, logoutUser } = useUser();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch dynamic categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/categories`);
        const data = await res.json();
        if (data.success && data.categories) {
          setDynamicCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const [tickers, setTickers] = useState([]);

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/tickers`);
        const data = await res.json();
        if (data.success && data.tickers && data.tickers.length > 0) {
          setTickers(data.tickers);
        }
      } catch (err) {
        console.error('Error fetching tickers:', err);
      }
    };
    fetchTickers();
  }, []);

  // Keyboard shortcut Ctrl+K for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCartOpen(false);
        setMobileOpen(false);
        setUserMenuOpen(false);
        setAuthOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const closeMobile = () => { setMobileOpen(false); setMobileExpanded(null); };

  const handleUserClick = () => {
    if (user) {
      setUserMenuOpen(prev => !prev);
    } else {
      setAuthDefaultTab('login');
      setAuthOpen(true);
    }
  };

  const getUserInitial = () => {
    if (!user || !user.name) return 'K';
    return user.name.trim().charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="announcement-bar">
        <div className="announcement-bar__ticker">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              {tickers.length > 0 ? (
                tickers.map(ticker => (
                  <span key={ticker._id} className="announcement-bar__item">
                    <span className="dot" />{ticker.text}
                  </span>
                ))
              ) : (
                <>
                  <span className="announcement-bar__item"><span className="dot" />🌾 Free Delivery on Orders Above ₹499</span>
                  <span className="announcement-bar__item"><span className="dot" />🥛 100% Pure A2 Desi Cow Ghee — Farm to Table</span>
                  <span className="announcement-bar__item"><span className="dot" />🌿 Certified Organic — No Chemicals, No Shortcuts</span>
                  <span className="announcement-bar__item"><span className="dot" />🚜 Directly from 500+ Kissan Farmers Across India</span>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <header className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <nav className="navbar__inner">

            {/* Logo */}
            <Link to="/" className="navbar__logo">
              <img src="/kissancitylogo.jpg" alt="The Kissan City" className="navbar__logo-img"
                onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
              <div style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
                <Leaf size={28} color="var(--green-600)" />
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800, fontSize: '1.15rem', color: 'var(--green-700)' }}>
                  The Kissan City
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <ul className="navbar__links">

              {/* Home */}
              <li>
                <Link to="/" className="navbar__link">Home</Link>
              </li>

              {/* New Arrivals */}
              <li>
                <Link to="/new-arrivals" className="navbar__link navbar__link--badge">
                  New Arrivals
                  <span className="badge">✦</span>
                </Link>
              </li>

              {/* Explore Our Story */}
              <li>
                <Link to="/#about" className="navbar__link" onClick={e => {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}>
                  Explore Our Story
                </Link>
              </li>

              {/* Wishlist */}
              <li>
                <Link to="/wishlist" className="navbar__link" style={{ position: 'relative' }}>
                  Wishlist
                  {wishlistCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: '#ef4444', color: 'white',
                      fontSize: '0.6rem', fontWeight: 700, width: 16, height: 16,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{wishlistCount}</span>
                  )}
                </Link>
              </li>

              {/* Food Products dropdown */}
              <li className="navbar__dropdown">
                <Link to="/category/food" className="navbar__link">
                  Food Products <ChevronDown size={14} />
                </Link>
                <div className="navbar__dropdown-menu" style={{ minWidth: 220 }}>
                  <Link to="/category/food" className="navbar__dropdown-item" style={{ fontWeight: 700, color: 'var(--green-600)', borderBottom: '1px solid var(--gray-100)', marginBottom: 4 }}>
                    🌾 All Food Products
                  </Link>
                  {dynamicCategories.map(c => {
                    const slug = (c.slug || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <Link key={c._id || slug} to={`/category/${slug}`} className="navbar__dropdown-item">
                        <span>{c.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </li>

              {/* Solar Dryer Link */}
              <li>
                <Link to="/solar-dryer" className="navbar__link">
                  Solar Dryer
                </Link>
              </li>
            </ul>

            {/* Right Actions */}
            <div className="navbar__actions">
              {/* Search */}
              <button
                className="navbar__search-wrap"
                onClick={() => setSearchOpen(true)}
                id="navbar-search-btn"
                style={{ cursor: 'pointer', textAlign: 'left' }}
              >
                <Search size={15} color="var(--gray-400)" />
                <span style={{ fontSize: '0.88rem', color: 'var(--gray-400)', flex: 1 }}>Search products...</span>
                <span style={{
                  fontSize: '0.68rem', color: 'var(--gray-400)',
                  background: 'var(--gray-100)', padding: '2px 6px',
                  borderRadius: 4, fontWeight: 600,
                }}>⌘K</span>
              </button>

              {/* Wishlist icon */}
              <Link to="/wishlist" className="navbar__icon-btn" id="navbar-wishlist-btn" aria-label="Wishlist" style={{ position: 'relative' }}>
                <Heart size={18} fill={wishlistCount > 0 ? '#ef4444' : 'none'} color={wishlistCount > 0 ? '#ef4444' : undefined} />
                {wishlistCount > 0 && <span className="cart-count" style={{ background: '#ef4444' }}>{wishlistCount}</span>}
              </Link>

              {/* Cart */}
              <button
                className="navbar__icon-btn"
                id="navbar-cart-btn"
                onClick={() => setCartOpen(true)}
                aria-label="Cart"
                style={{ position: 'relative' }}
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
              </button>

              {/* User Account Button with Dropdown */}
              <div style={{ position: 'relative' }} ref={userMenuRef}>
                <button
                  className="navbar__icon-btn"
                  id="navbar-user-btn"
                  onClick={handleUserClick}
                  aria-label="Account"
                  style={user ? { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' } : {}}
                >
                  {user ? (
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getUserInitial()}
                    </span>
                  ) : (
                    <User size={18} />
                  )}
                </button>

                {/* User Logged-in Dropdown Menu */}
                {user && userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 230,
                    backgroundColor: 'white', borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    border: '1px solid #e5e7eb', padding: '8px', zIndex: 1200, animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#111827' }}>{user.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>+91 {user.mobile}</div>
                    </div>

                    <Link
                      to="/user/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        fontSize: '0.88rem', fontWeight: 600, color: '#16a34a', textDecoration: 'none',
                        borderRadius: 8, transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <User size={16} color="#16a34a" /> My Dashboard
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        fontSize: '0.88rem', fontWeight: 600, color: '#374151', textDecoration: 'none',
                        borderRadius: 8, transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Heart size={16} color="#ef4444" /> My Wishlist ({wishlistCount})
                    </Link>

                    <button
                      onClick={() => { setUserMenuOpen(false); setCartOpen(true); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        fontSize: '0.88rem', fontWeight: 600, color: '#374151', background: 'none',
                        border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <ShoppingCart size={16} color="#16a34a" /> My Cart ({totalItems})
                    </button>

                    <div style={{ borderTop: '1px solid #f3f4f6', margin: '4px 0' }} />

                    <button
                      onClick={() => { setUserMenuOpen(false); logoutUser(); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                        fontSize: '0.88rem', fontWeight: 600, color: '#dc2626', background: 'none',
                        border: 'none', borderRadius: 8, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <LogOut size={16} color="#dc2626" /> Log Out
                    </button>
                  </div>
                )}
              </div>

              {/* Hamburger */}
              <button
                className="navbar__hamburger"
                id="navbar-menu-btn"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── User Authentication Modal ── */}
      <UserAuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authDefaultTab}
      />

      {/* ── Cart Drawer ── */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* ── Search Overlay ── */}
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Mobile Nav Drawer ── */}
      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`}>
        <div className="mobile-nav__overlay" onClick={closeMobile} />
        <div className="mobile-nav__drawer">
          <div className="mobile-nav__close">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={20} color="var(--green-600)" />
              <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--green-700)' }}>The Kissan City</span>
            </div>
            <button onClick={closeMobile} style={{ padding: '6px', borderRadius: '8px', color: 'var(--gray-600)', background: 'var(--gray-100)', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Mobile search */}
          <button onClick={() => { closeMobile(); setSearchOpen(true); }} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', background: 'var(--gray-50)', border: '1.5px solid var(--gray-200)',
            borderRadius: 10, marginBottom: 16, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--gray-400)', fontSize: '0.9rem',
          }}>
            <Search size={16} /> Search products...
          </button>

          <div className="mobile-nav__links">
            <Link to="/" className="mobile-nav__link" onClick={closeMobile}>🏠 Home</Link>
            <Link to="/new-arrivals" className="mobile-nav__link" onClick={closeMobile}>✨ New Arrivals</Link>
            <Link to="/wishlist" className="mobile-nav__link" onClick={closeMobile}>
              💚 Wishlist {wishlistCount > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 99, marginLeft: 4 }}>{wishlistCount}</span>}
            </Link>

            {/* Food dropdown */}
            <div>
              <button onClick={() => setMobileExpanded(e => e === 'food' ? null : 'food')} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', fontSize: '1rem', fontWeight: 500, color: 'var(--gray-700)',
                borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                🌾 Food Products
                <ChevronDown size={16} style={{ transform: mobileExpanded === 'food' ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {mobileExpanded === 'food' && (
                <div style={{ paddingLeft: 16, borderLeft: '2px solid var(--green-100)', marginLeft: 16, marginBottom: 4 }}>
                  <Link to="/category/food" className="mobile-nav__link" onClick={closeMobile} style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--green-700)' }}>All Food Products</Link>
                  {dynamicCategories.map(c => {
                    const slug = (c.slug || c.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <Link key={c._id || slug} to={`/category/${slug}`} className="mobile-nav__link" onClick={closeMobile} style={{ fontSize: '0.88rem' }}>
                        <span>{c.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Solar Dryer Link */}
            <Link to="/solar-dryer" className="mobile-nav__link" onClick={closeMobile}>☀️ Solar Dryer</Link>

            <button onClick={() => { closeMobile(); setCartOpen(true); }} className="mobile-nav__link" style={{
              textAlign: 'left', fontFamily: 'inherit', background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            }}>
              🛒 Cart {totalItems > 0 && `(${totalItems} items)`}
            </button>
          </div>

          {/* Mobile CTAs */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--gray-100)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {user ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 12 }}>
                <div style={{ fontWeight: 700, color: '#16a34a', fontSize: '0.95rem' }}>Hello, {user.name} 👋</div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 10 }}>+91 {user.mobile}</div>
                <button
                  onClick={() => { closeMobile(); logoutUser(); }}
                  style={{
                    width: '100%', padding: '8px', background: '#fef2f2', color: '#dc2626',
                    border: '1px solid #fecaca', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-primary"
                  onClick={() => { closeMobile(); setAuthDefaultTab('login'); setAuthOpen(true); }}
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { closeMobile(); setAuthDefaultTab('signup'); setAuthOpen(true); }}
                  style={{
                    flex: 1, textAlign: 'center', background: '#f3f4f6', color: '#374151',
                    border: '1px solid #d1d5db', borderRadius: 50, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer'
                  }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

