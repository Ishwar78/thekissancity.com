import { api } from '@/lib/api';
import { ProductSliderItem, ProductSliderResponse, CreateProductSliderRequest, UpdateProductSliderRequest } from '@/types/productSlider';

class ProductSliderService {
  // Get all active slider items
  async getActiveSliders(): Promise<ProductSliderItem[]> {
    try {
      const response = await api('/api/product-slider/active');
      
      if (response.ok && response.json?.data && Array.isArray(response.json.data)) {
        const sliders = response.json.data.map((slider: any) => ({
          ...slider,
          id: slider._id || slider.id // Ensure we have an id field
        })).sort((a: ProductSliderItem, b: ProductSliderItem) => 
          (a.order || 0) - (b.order || 0)
        );
        
        return sliders;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch active sliders:', error);
      return [];
    }
  }

  // Get all slider items (including inactive ones) for admin
  async getAllSliders(): Promise<ProductSliderItem[]> {
    try {
      const response = await api('/api/product-slider');
      if (response.ok && response.json?.data && Array.isArray(response.json.data)) {
        return response.json.data.map((slider: any) => ({
          ...slider,
          id: slider._id || slider.id // Ensure we have an id field
        })).sort((a: ProductSliderItem, b: ProductSliderItem) => 
          (a.order || 0) - (b.order || 0)
        );
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch all sliders:', error);
      return [];
    }
  }

  // Get single slider item by ID
  async getSliderById(id: string): Promise<ProductSliderItem | null> {
    if (!id || id === 'undefined') {
      console.warn('getSliderById called with invalid ID:', id);
      return null;
    }
    
    try {
      const response = await api(`/api/product-slider/${id}`);
      if (response.ok && response.json?.data) {
        return response.json.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch slider:', error);
      return null;
    }
  }

  // Create new slider item
  async createSlider(data: CreateProductSliderRequest): Promise<ProductSliderItem | null> {
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(data).forEach(key => {
        const value = data[key as keyof CreateProductSliderRequest];
        if (value !== undefined && value !== null) {
          if (key === 'stats' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api('/api/product-slider', {
        method: 'POST',
        body: formData,
      });

      if (response.ok && response.json?.data) {
        return response.json.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to create slider:', error);
      return null;
    }
  }

  // Update existing slider item
  async updateSlider(id: string, data: UpdateProductSliderRequest): Promise<ProductSliderItem | null> {
    try {
      const formData = new FormData();
      
      // Add all fields to FormData
      Object.keys(data).forEach(key => {
        const value = data[key as keyof UpdateProductSliderRequest];
        if (value !== undefined && value !== null && key !== 'id') {
          if (key === 'stats' && typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await api(`/api/product-slider/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok && response.json?.data) {
        return response.json.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to update slider:', error);
      return null;
    }
  }

  // Delete slider item
  async deleteSlider(id: string): Promise<boolean> {
    if (!id || id === 'undefined') {
      console.warn('deleteSlider called with invalid ID:', id);
      return false;
    }
    
    try {
      const response = await api(`/api/product-slider/${id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to delete slider:', error);
      return false;
    }
  }

  // Toggle slider active status
  async toggleSliderStatus(id: string, isActive: boolean): Promise<ProductSliderItem | null> {
    try {
      const response = await api(`/api/product-slider/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      
      if (response.ok && response.json?.data) {
        return response.json.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to toggle slider status:', error);
      return null;
    }
  }

  // Reorder slider items
  async reorderSliders(sliders: { id: string; order: number }[]): Promise<boolean> {
    try {
      const response = await api('/api/product-slider/reorder', {
        method: 'POST',
        body: JSON.stringify({ sliders }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to reorder sliders:', error);
      return false;
    }
  }
}

export const productSliderService = new ProductSliderService();
