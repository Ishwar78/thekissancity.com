import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user, token } = useUser();
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kissanWishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/$/, "");
  };

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('kissanWishlist', JSON.stringify(items));
    } catch (e) {
      console.error('Error saving wishlist to localStorage:', e);
    }
  }, [items]);

  // Sync from/to backend when user logs in or mounts
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    const fetchServerWishlist = async () => {
      try {
        const res = await fetch(`${getBaseUrl()}/api/user/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && Array.isArray(data.wishlist)) {
          // Merge server wishlist with local guest items (unique by id/_id)
          const localItems = items;
          const mergedMap = new Map();
          
          data.wishlist.forEach(item => {
            const key = String(item.id || item._id);
            if (key) mergedMap.set(key, item);
          });

          localItems.forEach(item => {
            const key = String(item.id || item._id);
            if (key && !mergedMap.has(key)) mergedMap.set(key, item);
          });

          const mergedArray = Array.from(mergedMap.values());
          setItems(mergedArray);

          // Save merged array back to server
          await fetch(`${getBaseUrl()}/api/user/wishlist`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ wishlist: mergedArray })
          }).catch(() => {});
        }
      } catch (err) {
        console.error('Error syncing wishlist with server:', err);
      }
    };

    fetchServerWishlist();
  }, [token, user?.id]);

  // Sync update to server
  const syncWithServer = async (updatedItems) => {
    if (!token) return;
    try {
      await fetch(`${getBaseUrl()}/api/user/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ wishlist: updatedItems })
      });
    } catch (err) {
      console.error('Error updating server wishlist:', err);
    }
  };

  const toggle = (product) => {
    const prodId = String(product.id || product._id || product.slug);
    setItems((prev) => {
      const exists = prev.some(i => String(i.id || i._id || i.slug) === prodId);
      const updated = exists
        ? prev.filter(i => String(i.id || i._id || i.slug) !== prodId)
        : [...prev, product];
      
      syncWithServer(updated);
      return updated;
    });
  };

  const isWishlisted = (id) => {
    if (!id) return false;
    const targetId = String(id);
    return items.some(i => String(i.id || i._id || i.slug) === targetId);
  };

  const remove = (id) => {
    const targetId = String(id);
    setItems((prev) => {
      const updated = prev.filter(i => String(i.id || i._id || i.slug) !== targetId);
      syncWithServer(updated);
      return updated;
    });
  };

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, remove, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
