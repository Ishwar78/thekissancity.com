import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, Heart, Search, X, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Dropdown } from "@/components/Dropdown";
import { MobileDropdown } from "@/components/MobileDropdown";
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
  const desktopSearchRef = useRef<HTMLInputElement>(null);
 
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch categories and products on component mount
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        const categoriesResult = await categoriesResponse.json();
        const categoriesList = categoriesResult.ok && Array.isArray(categoriesResult.data) ? categoriesResult.data : [];
        
        // Fetch products to determine category genders
        const productsResponse = await fetch('/api/products?limit=200');
        const productsResult = await productsResponse.json();
        const productsList = productsResult.ok && Array.isArray(productsResult.data) ? productsResult.data : [];
        
        console.log('📋 Categories fetched:', categoriesList.map(c => ({ name: c.name, slug: c.slug })));
        console.log('📦 Products fetched:', productsList.length);
        
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

  // safe cart context
  const cart = (() => {
    try {
      return useCart();
    } catch {
      return null as any;
    }
  })();

  const liveCount = cart ? cart.count : cartItemCount;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      // Close mobile menu after search
      setIsMenuOpen(false);
      // Collapse search if expanded
      setIsSearchExpanded(false);
      // Blur the desktop search input
      if (desktopSearchRef.current) {
        desktopSearchRef.current.blur();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  const handleSearchFocus = () => {
    setIsSearchExpanded(true);
  };

  const handleSearchCollapse = () => {
    setIsSearchExpanded(false);
    setSearchQuery("");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-6"
            aria-label="UNI10 Home"
          >
            <img
              src="/logo.jpeg"
              alt="UNI10 CREATE YOUR IDENTITY"
              className="h-14 md:h-16 lg:h-[60px] w-auto select-none max-w-[260px]"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Mobile Search Bar - Only visible on mobile */}
          <div className={`md:hidden transition-all duration-300 ease-in-out ${
            isSearchExpanded 
              ? 'absolute inset-0 z-50 bg-black px-4' 
              : 'hidden'
          }`}>
            {isSearchExpanded && (
              // Expanded search bar
              <div className="flex items-center h-full">
                <Button
                  type="button"
                  variant="link"
                  size="icon"
                  onClick={handleSearchCollapse}
                  className="text-gray-900 hover:text-gray-700 hover:bg-gray-100 mr-2 p-2 min-w-[44px] min-h-[44px] no-underline"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-900" />
                </Button>
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoFocus
                      style={{ 
                        color: '#374151',
                        backgroundColor: '#f9fafb',
                        borderColor: '#d1d5db'
                      }}
                      className="w-full pl-10 pr-8 h-9 text-sm border-gray-300 placeholder:text-gray-500 focus-visible:ring-gray-400 focus-visible:bg-white focus-visible:border-gray-400 focus-visible:ring-1"
                      placeholder="Search for Products, Brands and More"
                    />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="link"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-500 hover:text-gray-700 no-underline"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4 text-gray-500" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center gap-8 flex-1 max-w-4xl mx-8">
            <div className="flex items-center gap-3">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/shop/new-arrivals", label: "New Arrivals", isNew: true },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-semibold px-3 py-2 rounded-full hover:bg-amber-50 transition relative`}
                  style={{ color: '#6b4423' }}
                >
                  {item.isNew && (
                    <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400 animate-pulse" />
                  )}
                  {item.label}
                </Link>
              ))}
              
              {/* Men Dropdown */}
              {/* <Dropdown title="Men" gender="male">
                {(() => {
                  // Get categories that have men's products
                  const menCategories = categories.filter(category => {
                    const hasMenProducts = products.some(product => 
                      product.category === category.name && 
                      product.gender === 'male'
                    );
                    console.log('🔍 Checking category for Men:', { 
                      categoryName: category.name, 
                      hasMenProducts,
                      menProductsCount: products.filter(p => p.category === category.name && p.gender === 'male').length
                    });
                    return hasMenProducts;
                  });
                  console.log('👨 Men categories found:', menCategories.map(c => c.name));
                  return menCategories;
                })().map((category) => (
                  <Link
                    key={category.slug || category.name}
                    to={`/collection/${category.slug || category.name}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </Dropdown> */}
              
              {/* Women Dropdown */}
              {/* <Dropdown title="Women" gender="female">
                {(() => {
                  // Get categories that have women's products
                  const womenCategories = categories.filter(category => {
                    const hasWomenProducts = products.some(product => 
                      product.category === category.name && 
                      product.gender === 'female'
                    );
                    console.log('🔍 Checking category for Women:', { 
                      categoryName: category.name, 
                      hasWomenProducts,
                      womenProductsCount: products.filter(p => p.category === category.name && p.gender === 'female').length
                    });
                    return hasWomenProducts;
                  });
                  console.log('👩 Women categories found:', womenCategories.map(c => c.name));
                  return womenCategories;
                })().map((category) => (
                  <Link
                    key={category.slug || category.name}
                    to={`/collection/${category.slug || category.name}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                  >
                    {category.name}
                  </Link>
                ))}
              </Dropdown> */}
              
              <Link
                to="/wishlist"
                className="text-sm font-semibold px-3 py-2 rounded-full hover:bg-amber-50 transition"
                style={{ color: '#6b4423' }}
              >
                Wishlist
              </Link>
            </div>
            
            {/* Search Bar - Desktop - Increased Size */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  ref={desktopSearchRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 pr-12 h-11 text-base bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus-visible:ring-gray-400 focus-visible:bg-white focus-visible:border-gray-400 focus-visible:ring-2"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Actions */}
         <div className="flex items-center -space-x-2 md:space-x-2 md:gap-4">
  {/* Mobile Search Icon - Only visible on mobile */}
  <Button
    type="button"
    variant="link"
    size="icon"
    onClick={handleSearchFocus}
    className="md:hidden text-gray-900 hover:text-gray-700 hover:bg-gray-100 no-underline"
    aria-label="Search"
  >
    <Search className="h-5 w-5 text-gray-900" />
  </Button>
  
  {user ? (
    <>
      {/* Support: pehle se hi sirf md+ pe dikh raha tha */}
      <Link to="/account/support" className="hidden md:block">
        <Button
          variant="link"
          size="sm"
          className=" hover:text-gray-700 hover:bg-gray-100 no-underline px-3 py-2 transition-colors"
           style={{ color: '#6b4423' }}
        >
          Support
        </Button>
      </Link>
      {/* Dashboard / User Profile */}
      <Link to="/dashboard">
        <Button
          variant="link"
          size="icon"
          className="text-gray-900 md:hover:text-gray-700 hover:bg-gray-100 md:hover:bg-gray-100 no-underline transition-colors"
        >
          <User className="h-5 w-5 md:hover:text-gray-700" 
           style={{ color: '#6b4423' }}/>
        </Button>
      </Link>
    </>
  ) : (
    <Link to="/auth">
      <Button
        variant="link"
        size="icon"
        className="text-gray-900 md:hover:text-gray-700 hover:bg-gray-100 md:hover:bg-gray-100 no-underline transition-colors"
      >
        <User className="h-5 w-5 "  style={{ color: '#6b4423' }} />
      </Button>
    </Link>
  )}
  {/* Cart (same desktop + mobile) */}
  <Link to="/cart">
    <Button
      variant="link"
      size="icon"
      className="relative md:hover:text-gray-700 hover:bg-gray-100 md:hover:bg-gray-100 no-underline transition-colors"
       style={{ color: '#6b4423' }}
    >
      <ShoppingCart className="h-5 w-5 md:inherit-color" />
      {liveCount > 0 && (
        <span className="absolute -top-1 -right-1 rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold text-white"
              style={{ backgroundColor: '#6b4423' }}
        >
          {liveCount}
        </span>
      )}
    </Button>
  </Link>
  {/* Mobile Menu Toggle (only mobile) */}
  <Button
    variant="link"
    size="icon"
    className="md:hidden text-gray-900 hover:text-gray-700 hover:bg-gray-100 no-underline"
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    aria-label="Toggle menu"
  >
    <Menu className="h-5 w-5 text-gray-900" />
  </Button>
</div>
        </div>

        {/* Mobile Menu (sirf md:hidden, desktop untouched) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white mt-4">
            <div className="flex flex-col gap-1">
              
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/shop/new-arrivals", label: "New Arrivals", isNew: true },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors relative`}
                  style={{ color: '#907258' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.isNew && (
                    <Sparkles className="absolute top-2 right-2 h-5 w-5 text-yellow-400 animate-pulse" />
                  )}
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Men Dropdown */}
              <MobileDropdown 
                title="Men" 
                gender="male" 
                categories={categories}
                products={products}
                onClose={() => setIsMenuOpen(false)}
              />
              
              {/* Mobile Women Dropdown */}
              <MobileDropdown 
                title="Women" 
                gender="female" 
                categories={categories}
                products={products}
                onClose={() => setIsMenuOpen(false)}
              />
              
              <Link
                to="/wishlist"
                className="text-base font-semibold px-3 py-3 rounded-md hover:bg-amber-50 transition-colors"
                style={{ color: '#907258' }}
                onClick={() => setIsMenuOpen(false)}
              >
                Wishlist
              </Link>
              
              {(user ? [{ to: "/account/support", label: "Support Tickets" }] : []).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-base font-semibold px-3 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
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
