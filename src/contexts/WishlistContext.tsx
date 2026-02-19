import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const WISHLIST_STORAGE_KEY = 'uni_wishlist_ids';

type WishlistContextType = {
  wishlistIds: Set<string>;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType>({} as any);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      console.log('Loading from storage, stored value:', stored);
      if (stored) {
        const ids = new Set(JSON.parse(stored)) as Set<string>;
        console.log('Parsed IDs from storage:', Array.from(ids));
        setWishlistIds(ids);
      } else {
        console.log('No stored wishlist found');
        setWishlistIds(new Set());
      }
    } catch (e) {
      console.warn('Failed to load wishlist from localStorage', e);
      setWishlistIds(new Set());
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.id) {
        console.log('Refreshing wishlist from server for user:', user.id);
        const result = await api('/api/wishlist');
        console.log('Server response:', result);
        if (result?.ok && Array.isArray(result?.json?.data)) {
          const ids = new Set(
            result.json.data.map((item: any) => String(item.productId || item.product_id || ''))
          ) as Set<string>;
          console.log('Server wishlist IDs:', Array.from(ids));
          setWishlistIds(ids);
          try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(ids)));
            console.log('Saved to localStorage:', Array.from(ids));
          } catch (e) {
            // Silently fail on localStorage
          }
        } else {
          console.log('Server response invalid, falling back to localStorage');
          loadFromStorage();
        }
      } else {
        console.log('User not authenticated, loading from localStorage');
        loadFromStorage();
      }
    } catch (e) {
      console.error('Error in refreshWishlist:', e);
      loadFromStorage();
    } finally {
      setLoading(false);
    }
  }, [user?.id, loadFromStorage]);

  // Load wishlist on mount and when user changes
  useEffect(() => {
    loadFromStorage();
  }, [user?.id]);

  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistIds.has(String(productId));
  }, [wishlistIds]);

  const addToWishlist = useCallback(async (productId: string) => {
    const id = String(productId);
    
    console.log('🌐 Adding to wishlist:', id, 'Current wishlist:', Array.from(wishlistIds));
    
    if (wishlistIds.has(id)) {
      toast.error('Already in wishlist');
      return;
    }

    try {
      if (user?.id) {
        try {
          const result = await api('/api/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId: id }),
          });
          if (result?.ok) {
            console.log('Server add successful, updating local state');
            setWishlistIds((prev) => {
              const newSet = new Set(prev);
              newSet.add(id);
              console.log('Updated wishlistIds:', Array.from(newSet));
              // Save to localStorage immediately with the updated set
              try {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
                console.log('Saved to localStorage after server add:', Array.from(newSet));
              } catch (e) {
                console.warn('Failed to save to localStorage', e);
              }
              return newSet;
            });
            toast.success('Added to wishlist');
          } else {
            throw new Error(result?.json?.message || 'Failed to add');
          }
        } catch (e: any) {
          console.log('Server add failed, using localStorage fallback:', e);
          setWishlistIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(id);
            console.log('Fallback updated wishlist:', Array.from(newSet));
            // Save to localStorage immediately with the updated set
            try {
              localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
              console.log('Saved to localStorage in fallback:', Array.from(newSet));
            } catch (e2) {
              // Silently fail
            }
            return newSet;
          });
          toast.success('Added to wishlist');
        }
      } else {
        console.log('User not authenticated, adding to localStorage only');
        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(id);
          console.log('LocalStorage updated wishlist:', Array.from(newSet));
          // Save to localStorage immediately with the updated set
          try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
            console.log('Saved to localStorage:', Array.from(newSet));
          } catch (e) {
            console.warn('Failed to save to localStorage', e);
          }
          return newSet;
        });
        toast.success('Added to wishlist');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to add to wishlist');
    }
  }, [user?.id, wishlistIds]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    const id = String(productId);
    
    if (!wishlistIds.has(id)) {
      return;
    }

    try {
      if (user?.id) {
        try {
          const result = await api(`/api/wishlist/${id}`, {
            method: 'DELETE',
          });
          if (result?.ok) {
            setWishlistIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(id);
              try {
                localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
              } catch (e) {
                console.warn('Failed to save to localStorage', e);
              }
              return newSet;
            });
            toast.success('Removed from wishlist');
          } else {
            throw new Error(result?.json?.message || 'Failed to remove');
          }
        } catch (e: any) {
          setWishlistIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(id);
            try {
              localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
            } catch (e2) {
              // Silently fail
            }
            return newSet;
          });
          toast.success('Removed from wishlist');
        }
      } else {
        setWishlistIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          try {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
          } catch (e) {
            console.warn('Failed to save to localStorage', e);
          }
          return newSet;
        });
        toast.success('Removed from wishlist');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to remove from wishlist');
    }
  }, [user?.id, wishlistIds]);

  const toggleWishlist = useCallback(async (productId: string) => {
    const id = String(productId);
    if (wishlistIds.has(id)) {
      await removeFromWishlist(id);
    } else {
      await addToWishlist(id);
    }
  }, [wishlistIds, addToWishlist, removeFromWishlist]);

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      loading,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
