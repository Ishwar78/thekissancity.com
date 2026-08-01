import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ open, onClose }) {
  const { items, removeFromCart, updateQty, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const getImageUrl = (item) => {
    const img = item.image || item.img || (item.imgs && item.imgs[0]);
    if (!img) return '/product_ghee.png';
    if (img.startsWith('http')) return img;
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5005').replace(/\/$/, '');
    return `${baseUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  return (
    <div className="cart-drawer-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
      zIndex: 99999, display: 'flex', justifyContent: 'flex-end',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '420px', height: '100%',
          backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#16a34a" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>
              Your Cart ({totalItems})
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: '50%',
              width: '32px', height: '32px', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#64748b', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {items.length === 0 ? (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '16px',
              textAlign: 'center', color: '#64748b'
            }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: '#f0fdf4', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#16a34a'
              }}>
                <ShoppingBag size={32} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.1rem' }}>Your cart is empty</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8' }}>Explore our farm products and add them to your cart.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => {
                const itemId = item.id || item._id;
                return (
                  <div key={itemId} style={{
                    display: 'flex', gap: '14px', padding: '14px',
                    borderRadius: '12px', border: '1px solid #f1f5f9',
                    background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}>
                    <img 
                      src={getImageUrl(item)} 
                      alt={item.name} 
                      onError={(e) => { e.currentTarget.src = '/product_ghee.png'; }}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: 600 }}>{item.name}</h4>
                          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Pack: {item.size || 'Standard'}</span>
                        </div>
                        <button 
                          onClick={() => removeFromCart(itemId)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                          title="Remove Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#16a34a' }}>₹{item.price}</strong>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 6px'
                        }}>
                          <button 
                            onClick={() => updateQty(itemId, item.qty - 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button 
                            onClick={() => updateQty(itemId, item.qty + 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Subtotal & Checkout */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px', borderTop: '1px solid #e2e8f0',
            background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Subtotal</span>
              <strong style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>₹{totalPrice}</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={handleCheckout}
              style={{
                width: '100%', padding: '14px', background: '#16a34a',
                color: '#ffffff', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)', transition: 'background 0.2s'
              }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}