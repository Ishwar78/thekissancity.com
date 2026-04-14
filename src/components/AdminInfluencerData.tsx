import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
import { ScrollArea } from '@/components/ui/scroll-area';

interface Product {
  _id: string;
  title: string;
  slug?: string;
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
        <button 
          onClick={() => {
            setEditingItem(null);
            setNewVideoUrl('');
            setNewProductId('');
            setIsFormOpen(true);
          }} 
          className="mb-8 flex items-center gap-2 px-6 py-2.5 bg-[#6B4E3B] hover:bg-[#5D4037] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 group"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <Plus className="h-4 w-4" />
          </div>
          Add New Influencer Data
        </button>

        {loading && (
          <div className="flex items-center space-x-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading influencer data...
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        <h3 className="text-lg font-bold mt-10 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          Existing Influencer Data
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {influencerData.map((item) => (
            <Card key={item._id} className="group relative flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all duration-300 bg-card rounded-2xl">
              {/* Video Preview */}
              <Link 
                to={item.productId?.slug ? `/products/${item.productId.slug}` : '#'} 
                className="relative aspect-[9/16] bg-black overflow-hidden group/video block"
              >
                <video
                  src={item.videoUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                ></video>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <p className="text-white text-sm font-medium line-clamp-2 drop-shadow-md hover:underline decoration-white/50 underline-offset-4">
                    {item.productId?.title || 'No Product Linked'}
                  </p>
                </div>
                {/* Actions Overlay for Desktop */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-4 group-hover:translate-x-0">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEditModal(item);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-10 w-10 rounded-full shadow-lg hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDeleteConfirm(item._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Link>

              {/* Info Details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded">
                    Created at
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="pt-2 border-t flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-medium break-all text-muted-foreground">
                      {item.videoUrl.split('/').pop()?.slice(0, 20)}...
                    </p>
                  </div>
                </div>

                {/* Mobile-only actions */}
                <div className="flex gap-2 pt-2 md:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openEditModal(item)}
                  >
                    <Edit className="h-3 w-3 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openDeleteConfirm(item._id)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {influencerData.length === 0 && !loading && (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <VideoUploader videoUrl="" onVideoUrlChange={() => { }} isLoading={false} />
            <p className="text-muted-foreground mt-4">Start by adding your first influencer video.</p>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl max-h-[90vh] flex flex-col">
            <DialogHeader className="p-6 pb-0 flex-shrink-0">
              <DialogTitle className="text-2xl font-bold">{editingItem ? 'Edit' : 'Add'} Influencer Content</DialogTitle>
              <DialogDescription>
                Sync a product with a video showcase.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="videoUrl" className="text-sm font-semibold">Showcase Video</Label>
                  <VideoUploader videoUrl={newVideoUrl} onVideoUrlChange={setNewVideoUrl} onUpload={uploadVideo} />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="productId" className="text-sm font-semibold">Linked Product</Label>
                  <Select value={newProductId} onValueChange={setNewProductId}>
                    <SelectTrigger className="w-full rounded-xl border-2 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {products.map((product) => (
                        <SelectItem key={product._id} value={product._id} className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-medium">{product.title}</span>
                            <span className="text-[10px] text-muted-foreground uppercase">{product.slug || 'No Slug'}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 bg-muted/30 flex-col sm:flex-row gap-3 flex-shrink-0">
              <Button variant="outline" className="rounded-xl px-8" onClick={() => setIsFormOpen(false)}>Cancel</Button>
              <button
                className="rounded-xl px-8 py-2 font-bold bg-[#6B4E3B] hover:bg-[#5D4037] text-white transition-all shadow-md active:scale-95"
                onClick={handleAddEdit}
              >
                {editingItem ? 'Update Video' : 'Add to Collection'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <DialogContent className="max-w-[400px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Delete Entry?</DialogTitle>
              <DialogDescription>
                This will permanently remove the influencer content from the website.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-3">
              <Button variant="outline" className="rounded-xl" onClick={() => setIsDeleteConfirmOpen(false)}>Keep it</Button>
              <Button variant="destructive" className="rounded-xl px-8" onClick={handleDelete}>Yes, Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </CardContent>
    </Card>
  );
};
