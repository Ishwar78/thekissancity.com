import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Zap, Star, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchAllStoreProducts } from '../utils/productUtils';

const tabs = ['All Products', 'New Arrivals', 'Bestsellers'];

function StarRating({ rating }) {
  return (
    <span className="product-card__stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? 'currentColor' : 'none'}
          style={{ display: 'inline' }}
        />
      ))}
    </span>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);

  const slug = product.slug || 'a2-desi-cow-ghee';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/checkout', { state: { buyNowItem: product } });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  const inWishlist = isWishlisted(product.id);
  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card" id={`product-${product.id}`}>
      {/* Image area — click goes to product detail */}
      <Link to={`/product/${slug}`} className="product-card__image-wrap" style={{ display: 'block', textDecoration: 'none' }}>
        <img src={product.img} alt={product.name} className="product-card__img" />

        {product.badge && (
          <span className={`product-card__badge ${product.badge}`}>
            {product.badge === 'bestseller' ? 'Bestseller' :
             product.badge === 'new' ? 'New' : 'Sale'}
          </span>
        )}

        {discount > 0 && (
          <span className="product-card__discount-badge">-{discount}%</span>
        )}

        {/* Wishlist */}
        <button
          className="product-card__wishlist"
          onClick={handleWishlist}
          id={`wishlist-${product.id}`}
          aria-label="Add to wishlist"
          style={{ color: inWishlist ? '#ef4444' : undefined }}
        >
          <Heart size={16} fill={inWishlist ? '#ef4444' : 'none'} />
        </button>
      </Link>

      <div className="product-card__body">
        <div className="product-card__category">{product.category}</div>

        {/* Product name — click goes to detail */}
        <Link to={`/product/${slug}`} className="product-card__name" style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}>
          {product.name}
        </Link>

        <div className="product-card__rating">
          <StarRating rating={product.rating} />
          <span className="product-card__rating-count">
            {product.rating} ({product.reviews.toLocaleString()})
          </span>
        </div>

        <div className="product-card__prices" style={{ marginBottom: '12px' }}>
          <span className="product-card__price">₹{product.price}</span>
          {product.originalPrice > product.price && (
            <span className="product-card__price-original">₹{product.originalPrice}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-card__actions">
          <button
            className={`product-card__add-to-cart-btn${addedToCart ? ' added' : ''}`}
            onClick={handleAddToCart}
            id={`add-to-cart-${product.id}`}
            aria-label="Add to cart"
          >
            {addedToCart ? (
              <><Check size={14} /> Added!</>
            ) : (
              <><ShoppingCart size={14} /> Add to Cart</>
            )}
          </button>

          <button
            className="product-card__buy-now-btn"
            onClick={handleBuyNow}
            id={`buy-now-${product.id}`}
            aria-label="Buy now"
          >
            <Zap size={14} /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [activeTab, setActiveTab] = useState('All Products');
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadDynamicProducts = async () => {
      const dbProducts = await fetchAllStoreProducts();
      if (isMounted) {
        setProductList(dbProducts || []);
      }
    };
    loadDynamicProducts();
    return () => { isMounted = false; };
  }, []);

  const filtered = productList.filter((p) => p.tab && p.tab.includes(activeTab));

  return (
    <section className="products" id="products">
      <div className="container">
        <div className="products__header">
          <div>
            <div className="section-badge">🛒 Fresh from the Farm</div>
            <h2 className="section-title">
              Our <span>Farm Store</span>
            </h2>
          </div>

          {/* Tabs */}
          <div className="products__tabs">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`products__tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="products__grid">
          {filtered.length > 0 ? (
            filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              No products found in "{activeTab}".
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
          <Link to="/new-arrivals" className="btn-primary" id="view-all-products-btn">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
