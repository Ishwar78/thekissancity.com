export interface ProductSliderItem {
  _id?: string;
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonLink?: string;
  order?: number;
  isActive?: boolean;
  stats: {
    products: string;
    customers: string;
    quality: string;
    rating: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductSliderResponse {
  success: boolean;
  data: ProductSliderItem[];
  message?: string;
}

export interface CreateProductSliderRequest {
  title: string;
  subtitle?: string;
  description?: string;
  image: File | string;
  buttonText?: string;
  buttonLink?: string;
  order?: number;
  isActive?: boolean;
  stats: {
    products: string;
    customers: string;
    quality: string;
    rating: string;
  };
}

export interface UpdateProductSliderRequest extends Partial<CreateProductSliderRequest> {
  id: string;
}
