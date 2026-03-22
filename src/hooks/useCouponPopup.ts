import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '@/lib/api';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiryDate: string;
  offerText: string;
  description: string;
  termsAndConditions: string;
}

export const useCouponPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Check if coupon has been shown in this browser session
  const hasPopupBeenShown = () => {
    try {
      return localStorage.getItem('coupon_popup_shown') === 'true';
    } catch {
      return false;
    }
  };

  const markPopupAsShown = () => {
    try {
      localStorage.setItem('coupon_popup_shown', 'true');
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  useEffect(() => {
    console.log('🎫 [COUPON POPUP] Checking conditions:', {
      pathname: location.pathname,
      hash: location.hash,
      shouldShow: location.pathname === '/' && location.hash === '',
      popupShown: hasPopupBeenShown()
    });

    // Only show popup on home page and when there's no hash in the URL
    if (location.pathname !== '/' || location.hash !== '') {
      console.log('🎫 [COUPON POPUP] Conditions not met, closing popup');
      setIsOpen(false);
      return;
    }

    const fetchLatestCoupons = async () => {
      try {
        setLoading(true);
        console.log('🎫 [COUPON POPUP] Fetching latest coupons...');
        const response = await api('/api/coupons/latest');
        
        console.log('🎫 [COUPON POPUP] API Response:', {
          ok: response.ok,
          json: response.json
        });
        
        if (response.ok && response.json && response.json.data && response.json.data.length > 0) {
          setCoupons(response.json.data);
          console.log('🎫 [COUPON POPUP] Coupons found:', response.json.data.length);
          // Show popup only if there are coupons, we're on home page with no hash, and popup hasn't been shown yet
          if (location.pathname === '/' && location.hash === '' && !hasPopupBeenShown()) {
            console.log('🎫 [COUPON POPUP] Opening popup');
            setIsOpen(true);
            markPopupAsShown(); // Mark as shown in this session
          } else if (hasPopupBeenShown()) {
            console.log('🎫 [COUPON POPUP] Popup already shown in this session');
          }
        } else {
          console.log('🎫 [COUPON POPUP] No active coupons found');
        }
      } catch (error) {
        console.error('🎫 [COUPON POPUP] Failed to fetch latest coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCoupons();
  }, [location.pathname, location.hash]);

  const closePopup = () => {
    console.log('🎫 [COUPON POPUP] Closing popup');
    setIsOpen(false);
  };

  return {
    isOpen,
    closePopup,
    coupons,
    loading
  };
};
