import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner'; // Assuming you have a toast notification library
import { api } from '@/lib/api';

interface Product {
  _id: string;
  title: string;
}

interface InfluencerImageItem {
  _id: string;
  imageUrl: string;
  influencerName: string;
  productId: Product;
  updatedAt: string;
}

interface AdminAddInfluencerImageProps {
  onImageAdded: () => void;
  editingItem?: InfluencerImageItem | null;
}


export const AdminAddInfluencerImage: React.FC<AdminAddInfluencerImageProps> = ({ onImageAdded, editingItem }) => {
  const [influencerName, setInfluencerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Initialize form with editing item data
  useEffect(() => {
    if (editingItem) {
      setInfluencerName(editingItem.influencerName);
      setSelectedProductId(editingItem.productId?._id || '');
    } else {
      // Reset form for adding new item
      setInfluencerName('');
      setSelectedProductId('');
      setImageFile(null);
    }
  }, [editingItem]);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await api('/api/products');
        if (!res.ok) {
          throw new Error(res.json?.message || 'Failed to fetch products');
        }
        setProducts(res.json.data);
      } catch (err: any) {
        setProductsError(err.message);
        toast.error('Error fetching products:', err.message);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For editing, image is optional (only update if new image is provided)
    if (!influencerName || !selectedProductId || (!editingItem && !imageFile)) {
      toast.error('Please fill in all required fields and select an image.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('influencerName', influencerName);
    formData.append('productId', selectedProductId);
    
    // Only append image if it's a new one (for editing, image is optional)
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const isEditing = !!editingItem;
      const url = isEditing 
        ? `/api/admin/influencer-images/${editingItem._id}`
        : '/api/admin/influencer-images';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await api(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        throw new Error(res.json?.message || `Failed to ${isEditing ? 'update' : 'add'} influencer image`);
      }

      toast.success(`Influencer image ${isEditing ? 'updated' : 'added'} successfully!`);
      
      // Reset form
      setInfluencerName('');
      setSelectedProductId('');
      setImageFile(null);
      
      onImageAdded(); // Notify parent component to refresh
    } catch (err: any) {
      toast.error(`Error ${editingItem ? 'updating' : 'adding'} image:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{editingItem ? 'Edit Influencer Image' : 'Add New Influencer Image'}</CardTitle>
        <CardDescription>
          {editingItem 
            ? 'Update influencer details and link to a product. Image is optional - only upload if you want to change it.'
            : 'Upload an image, enter influencer details, and link to a product.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="influencerName">Influencer Name</Label>
            <Input
              id="influencerName"
              value={influencerName}
              onChange={(e) => setInfluencerName(e.target.value)}
              placeholder="Enter influencer's name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="productId">Select Product</Label>
            {productsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
              </div>
            ) : productsError ? (
              <div className="text-red-500 text-sm">Error: {productsError}</div>
            ) : products.length === 0 ? (
              <div className="text-gray-500 text-sm">No products found.</div>
            ) : (
              <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                <SelectTrigger id="productId" className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageFile">
              Influencer Image {editingItem && <span className="text-gray-500 font-normal">(optional - leave empty to keep current)</span>}
            </Label>
            
            {/* Show current image when editing */}
            {editingItem && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Current image:</p>
                <img 
                  src={editingItem.imageUrl} 
                  alt={editingItem.influencerName}
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              required={!editingItem}
            />
            {imageFile && <p className="text-sm text-gray-500">Selected: {imageFile.name}</p>}
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <PlusCircle className="mr-2 h-4 w-4" /> {editingItem ? 'Update Influencer Image' : 'Add Influencer Image'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

