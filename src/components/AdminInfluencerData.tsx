import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Trash2, Edit, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoUploader } from '@/components/VideoUploader';

interface Product { 
  _id: string; 
  title: string; 
  images: string[];
}

interface InfluencerDataItem {
  _id: string;
  videoUrl: string;
  productId: Product;
  createdAt: string;
  updatedAt: string;
}

export const AdminInfluencerData = () => {
  const [influencerData, setInfluencerData] = useState<InfluencerDataItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InfluencerDataItem | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const uploadVideo = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api('/api/uploads/admin/video', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error(res.json?.message || 'Video upload failed');
      return res.json.url; // Assuming the backend returns { url: '...' }
    } catch (err: any) {
      toast.error(err.message);
      throw err; // Re-throw to be caught by VideoUploader
    }
  };

  useEffect(() => {
    fetchInfluencerData();
    fetchProducts();
  }, []);

  const fetchInfluencerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/api/admin/influencer-data');
      if (!res.ok) throw new Error(res.json?.message || 'Failed to fetch influencer data');
      setInfluencerData(res.json.data);
      console.log('Frontend Influencer Data:', res.json.data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api('/api/products?limit=1000'); // Fetch all products for selection
      if (!res.ok) throw new Error(res.json?.message || 'Failed to fetch products');
      setProducts(res.json.data);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddEdit = async () => {
    if (!newVideoUrl || !newProductId) {
      toast.error('Video URL and Product are required.');
      return;
    }

    try {
      let res;
      const data = { videoUrl: newVideoUrl, productId: newProductId };

      if (editingItem) {
        res = await api(`/api/admin/influencer-data/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      } else {
        res = await api('/api/admin/influencer-data', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }

      if (!res.ok) throw new Error(res.json?.message || 'Failed to save influencer data');
      toast.success(editingItem ? 'Influencer data updated!' : 'Influencer data added!');
      setIsFormOpen(false);
      setNewVideoUrl('');
      setNewProductId('');
      setEditingItem(null);

      if (editingItem) {
        // Update existing item in state
        setInfluencerData(prevData => prevData.map(item => {
          if (item._id === res.json.data._id) {
            const updatedProduct = products.find(p => p._id === res.json.data.productId);
            return { ...res.json.data, productId: updatedProduct || item.productId };
          }
          return item;
        }));
      } else {
        // Add new item to state
        setInfluencerData(prevData => [...prevData, res.json.data]);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const res = await api(`/api/admin/influencer-data/${itemToDelete}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(res.json?.message || 'Failed to delete influencer data');
      toast.success('Influencer data deleted!');
      setIsDeleteConfirmOpen(false);
      setItemToDelete(null);
      setInfluencerData(prevData => prevData.filter(item => item._id !== itemToDelete));
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEditModal = (item: InfluencerDataItem) => {
    setEditingItem(item);
    setNewVideoUrl(item.videoUrl);
    setNewProductId(item.productId._id);
    setIsFormOpen(true);
  };

  const openDeleteConfirm = (id: string) => {
    setItemToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Influencer Data</CardTitle>
        <CardDescription>Manage influencer videos and associated products.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          setEditingItem(null);
          setNewVideoUrl('');
          setNewProductId('');
          setIsFormOpen(true);
        }} className="mb-4">
          <Plus className="mr-2 h-4 w-4" /> Add New Influencer Data
        </Button>

        {loading && (
          <div className="flex items-center space-x-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading influencer data...
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        <h3 className="text-lg font-semibold mt-6 mb-4">Existing Influencer Data</h3>
        <div className="space-y-4">
          {influencerData.map((item) => (
            <Card key={item._id} className="flex items-center justify-between p-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <video src={item.videoUrl} controls width="120" height="80" className="rounded-md object-cover"></video>
                <div className="flex flex-col">
                  <p className="font-medium">Product: {item.productId?.title}</p>
                  <p className="text-sm text-muted-foreground">Video URL: {item.videoUrl}</p>
                  <p className="text-sm text-muted-foreground">Created: {new Date(item.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Updated: {new Date(item.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteConfirm(item._id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Influencer Data' : 'Add New Influencer Data'}</DialogTitle>
              <DialogDescription>Enter the video URL and select the associated product.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="videoUrl" className="text-right">Video</Label>
                <div className="col-span-3">
                  <VideoUploader videoUrl={newVideoUrl} onVideoUrlChange={setNewVideoUrl} onUpload={uploadVideo} />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="productId" className="text-right">Product</Label>
                <Select value={newProductId} onValueChange={setNewProductId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product._id} value={product._id}>{product.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <Button onClick={handleAddEdit}>{editingItem ? 'Save Changes' : 'Add Data'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>Are you sure you want to delete this influencer data entry?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
      </CardContent>
    </Card>
  );
};
