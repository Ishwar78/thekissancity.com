import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, Search, X, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Dropdown } from "@/components/Dropdown";
import { MobileDropdown } from "@/components/MobileDropdown";
import { api } from '../lib/api';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface NavbarProps {
  cartItemCount?: number;
}

export const Navbar = ({ cartItemCount = 0 }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [logoFailed, setLogoFailed] = useState(false);
  const desktopSearchRef = useRef<HTMLInputElement>(null);

  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const categoriesResponse = await api('/api/categories');
        const categoriesResult = categoriesResponse.json;
        const categoriesList = categoriesResult.ok && Array.isArray(categoriesResult.data) ? categoriesResult.data : [];

        const productsResponse = await api('/api/products?limit=10&skipReviews=true&active=true');
        const productsResult = productsResponse.json;
        const productsList = productsResult.ok && Array.isArray(productsResult.data) ? productsResult.data : [];

        if (!ignore) {
          setCategories(categoriesList);
          setProducts(productsList);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        if (!ignore) {
          setCategories([]);
          setProducts([]);
        }
      }
    })();
    return () => { ignore = true; };
  }, []);

  const cart = (() => {
    try { return useCart(); } catch { return null as any; }
  })();

  const liveCount = cart ? cart.count : cartItemCount;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
      setIsSearchExpanded(false);
      if (desktopSearchRef.current) desktopSearchRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch(e);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto pl-1 md:px-8 pr-2 md:pr-8">
          <div className="flex items-center justify-between h-24">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 md:gap-6 -mt-1 ml-3 md:ml-0" aria-label="The Kissan City Home">
              {logoFailed ? (
                <div className="h-8 md:h-16 lg:h-[60px] w-auto select-none max-w-[150px] md:max-w-[200px] flex items-center justify-center bg-gray-100 rounded-lg">
                  <span className="text-gray-600 font-bold text-lg">The Kissan City</span>
                </div>
              ) : (
                <img
                  src="/kissancitylogo1.jpg"
                  //  src="/NAVLOGO.JPG"
                  alt="The Kissan City"
                  className="h-18 md:h-22 lg:h-[60px] w-auto select-none max-w-[150px] md:max-w-[200px]"
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    if (!logoFailed) {
                      console.error('Logo failed to load:', e.currentTarget.src);
                      setLogoFailed(true);
                    }
                  }}
                />
              )}
            </Link>

            {/* Mobile expanded search overlay */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${isSearchExpanded ? 'absolute inset-0 z-50 bg-[#2d2117] px-4' : 'hidden'
              }`}>
              {isSearchExpanded && (
                <div className="flex items-center h-full">
                  <Button
                    type="button"
                    variant="link"
                    size="icon"
                    onClick={() => { setIsSearchExpanded(false); setSearchQuery(""); }}
                    className="text-white hover:text-gray-200 mr-2 p-2 min-w-[44px] min-h-[44px] no-underline"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        placeholder="Search for Products, Brands and More"
                        inputMode="search"
                        autoComplete="off"
                        style={{
                          width: '100%',
                          paddingLeft: '2.5rem',
                          paddingRight: '2rem',
                          height: '36px',
                          fontSize: '14px',
                          color: '#000000 !important',
                          backgroundColor: '#ffffff !important',
                          border: '1px solid #6b4423',
                          borderRadius: '8px',
                          outline: 'none',
                        }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Desktop Navigation + Search */}
            <div className="hidden md:flex items-center gap-4 flex-1 mx-6">

              {/* Nav links */}
              <div className="flex items-center gap-1 shrink-0">
                {[
                  { to: "/", label: "Home" },
                  { to: "/shop/new-arrivals", label: "New Arrivals", isNew: true },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-sm font-semibold px-3 py-2 rounded-full hover:bg-amber-50 transition relative whitespace-nowrap"
                    style={{ color: '#6b4423' }}
                  >
                    {item.isNew && (
                      <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
                    )}
                    {item.label}
                  </Link>
                ))}

                <Link
                  to="/#us"
                  className="text-sm font-semibold px-3 py-2 rounded-full hover:bg-amber-50 transition whitespace-nowrap"
                  style={{ color: '#6b4423' }}
                >
                  Explore Our Story
                </Link>

                <Link
                  to="/wishlist"
                  className="text-sm font-semibold px-3 py-2 rounded-full hover:bg-amber-50 transition whitespace-nowrap"
                  style={{ color: '#6b4423' }}
                >
                  Wishlist
                </Link>

                <Dropdown title="Food Products" gender="unisex">
                  {categories.filter(cat =>
                    ['Honey', 'Ghee', 'Dry fruit', 'Mushroom'].includes(cat.name)
                  ).map((category) => (
                    <Link
                      key={category.slug || category.name}
                      to={`/collection/${category.slug || category.name}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors border-l-2 border-transparent hover:border-green-500"
                    >
                      {category.name}
                    </Link>
                  ))}
                </Dropdown>

                <Dropdown title="Wellness Products" gender="unisex">
                  {categories.filter(cat =>
                    ['Pahadi Wellness'].includes(cat.name)
                  ).map((category) => (
                    <Link
                      key={category.slug || category.name}
                      to={`/collection/${category.slug || category.name}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-700 transition-colors border-l-2 border-transparent hover:border-amber-500"
                    >
                      {category.name}
                    </Link>
                  ))}
                </Dropdown>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex-1">
                <div style={{ position: 'relative' }}>
                  <Search
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#9ca3af',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                  <input
                    ref={desktopSearchRef}
                    type="text"

                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    inputMode="search"
                    autoComplete="off"
                    style={{
                      width: '100%',
                      paddingLeft: '44px',
                      paddingRight: searchQuery ? '44px' : '16px',
                      height: '44px',
                      fontSize: '15px',
                      color: '#000000 !important',
                      backgroundColor: '#ffffff !important',
                      border: '2px solid #d1d5db',
                      borderRadius: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#f59e0b';
                      e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.15)';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = '#ffffff';
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#9ca3af',
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 -ml-2">

              {/* SEARCH - mobile only */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsSearchExpanded(true)}
                onKeyDown={(e) => e.key === 'Enter' && setIsSearchExpanded(true)}
                className="md:hidden flex items-center justify-center"
                style={{
                  position: 'relative',
                  width: '40px', height: '40px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.85)', border: '1.5px solid #e6d3a3',
                  boxShadow: '0 4px 15px rgba(200,151,58,0.25)',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Search size={20} style={{ color: '#c8973a', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
              </div>

              {/* USER */}
              <Link
                to={user ? "/dashboard" : "/auth"}
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.85)', border: '1.5px solid #e6d3a3',
                  boxShadow: '0 4px 15px rgba(200,151,58,0.25)',
                  flexShrink: 0,
                }}
              >
                <User size={20} style={{ color: '#c8973a', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
              </Link>

              {/* CART */}
              <Link
                to="/cart"
                style={{
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.85)', border: '1.5px solid #e6d3a3',
                  boxShadow: '0 4px 15px rgba(200,151,58,0.25)',
                  flexShrink: 0,
                }}
              >
                <ShoppingCart size={20} style={{ color: '#c8973a', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
                {liveCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#6b4423', color: 'white',
                    fontSize: '10px', width: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '9999px', fontWeight: 700,
                  }}>{liveCount}</span>
                )}
              </Link>

              {/* MENU - mobile only */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                onKeyDown={(e) => e.key === 'Enter' && setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center"
                style={{
                  position: 'relative',
                  width: '40px', height: '40px', borderRadius: '9999px',
                  background: 'rgba(255,255,255,0.85)', border: '1.5px solid #e6d3a3',
                  boxShadow: '0 4px 15px rgba(200,151,58,0.25)',
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                <Menu size={20} style={{ color: '#c8973a', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }} />
              </div>

            </div>

          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col gap-1">
                {[
                  { to: "/", label: "Home" },
                  { to: "/shop/new-arrivals", label: "New Arrivals", isNew: true },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors relative"
                    style={{ color: '#6b4423' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.isNew && (
                      <Sparkles className="absolute top-2 right-2 h-5 w-5 text-yellow-400 animate-pulse" />
                    )}
                    {item.label}
                  </Link>
                ))}

                <Link
                  to="/about#about-us"
                  className="text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors"
                  style={{ color: '#6b4423' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Explore Our Story
                </Link>

                <MobileDropdown title="Men" gender="male" categories={categories} products={products} onClose={() => setIsMenuOpen(false)} />
                <MobileDropdown title="Women" gender="female" categories={categories} products={products} onClose={() => setIsMenuOpen(false)} />

                <Link
                  to="/wishlist"
                  className="text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors"
                  style={{ color: '#6b4423' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>

                <MobileDropdown
                  title="Food Products"
                  gender="unisex"
                  categories={categories.filter(cat => ['Honey', 'Ghee', 'Dry fruit', 'Mushroom'].includes(cat.name))}
                  products={products}
                  onClose={() => setIsMenuOpen(false)}
                />

                <MobileDropdown
                  title="Wellness Products"
                  gender="unisex"
                  categories={categories.filter(cat => ['Pahadi Wellness'].includes(cat.name))}
                  products={products}
                  onClose={() => setIsMenuOpen(false)}
                />

                {(user ? [{ to: "/account/support", label: "Support Tickets" }] : []).map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors"
                    style={{ color: '#6b4423' }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};