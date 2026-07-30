import React, { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const pId = action.product.id || action.product._id;
      const formattedPrice = Math.round(Number(action.product.price) || 0);
      const formattedOriginalPrice = Math.round(Number(action.product.originalPrice) || formattedPrice);
      
      const exists = state.items.find(i => (i.id || i._id) === pId);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            (i.id || i._id) === pId
              ? { ...i, qty: i.qty + (action.qty || 1), price: formattedPrice, originalPrice: formattedOriginalPrice }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            ...action.product,
            price: formattedPrice,
            originalPrice: formattedOriginalPrice,
            qty: action.qty || 1,
          },
        ],
      };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(i => (i.id || i._id) !== action.id) };
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          (i.id || i._id) === action.id ? { ...i, qty: Math.max(1, action.qty) } : i
        ),
      };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  const addToCart = (product, qty = 1) => dispatch({ type: 'ADD', product, qty });
  const removeFromCart = (id) => dispatch({ type: 'REMOVE', id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totalItems = state.items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = Math.round(
    state.items.reduce((s, i) => s + Math.round(Number(i.price) || 0) * i.qty, 0)
  );

  return (
    <CartContext.Provider value={{ items: state.items, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
