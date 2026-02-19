import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/database.types';
import { apiFetch } from '../utils/api';
import { ENDPOINTS } from '../utils/constants';

export const useProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productList = await apiFetch<Product[]>(ENDPOINTS.products);
      setProducts(Array.isArray(productList) ? productList : []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refreshProducts: fetchProducts };
};

