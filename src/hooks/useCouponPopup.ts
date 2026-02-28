import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchLatestCoupons = async () => {
      try {
        setLoading(true);
        const response = await api('/api/coupons/latest');
        
        if (response.ok && response.json && response.json.data && response.json.data.length > 0) {
          setCoupons(response.json.data);
          // Show popup only if there are coupons
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to fetch latest coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestCoupons();
  }, []);

  const closePopup = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    closePopup,
    coupons,
    loading
  };
};
