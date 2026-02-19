import React, { createContext, useContext, useState, useCallback } from 'react';

interface CouponRefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const CouponRefreshContext = createContext<CouponRefreshContextType | undefined>(undefined);

export const CouponRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <CouponRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </CouponRefreshContext.Provider>
  );
};

export const useCouponRefresh = () => {
  const context = useContext(CouponRefreshContext);
  if (context === undefined) {
    throw new Error('useCouponRefresh must be used within a CouponRefreshProvider');
  }
  return context;
};

