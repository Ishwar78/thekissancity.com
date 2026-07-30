import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './UserWishlistTab.css';

export default function UserWishlistTab() {
  const { items, remove } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="wishlist-tab-container">
      <div>
        <h3 className="wishlist-tab-title">My Saved Wishlist ({items.length})</h3>
        <p className="wishlist-tab-desc">Items you have saved to purchase later</p>
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7280' }}>
          <Heart size={48} style={{ opacity: 0.3, margin: '0 auto 12px', color: '#ef4444' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#374151' }}>Your wishlist is empty</h4>
          <p style={{ fontSize: '0.88rem', margin: '0 0 16px 0' }}>Explore our organic farm products and tap the heart icon to save items.</p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Explore Farm Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="wishlist-tab-grid">
          {items.map((prod) => {
            const prodImg = prod.img || (prod.imgs && prod.imgs[0]) || '/product_ghee.png';
            const prodId = prod.id || prod._id;

            return (
              <div key={prodId} className="wishlist-card">
                <div className="wishlist-img-wrap">
                  <img src={prodImg} alt={prod.name} className="wishlist-img" />
                  <button
                    onClick={() => remove(prodId)}
                    style={{
                      position: 'absolute', top: 10, right: 10, width: 30, height: 30,
                      borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444',
                      cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="wishlist-card-body">
                  <div className="wishlist-prod-name">{prod.name}</div>
                  <div className="wishlist-prod-price">₹{prod.price}</div>

                  <button
                    onClick={() => addToCart(prod)}
                    style={{
                      width: '100%', padding: '9px', background: '#16a34a', color: 'white',
                      border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      marginTop: 'auto'
                    }}
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
