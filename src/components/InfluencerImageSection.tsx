import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AdminAddInfluencerImage } from './AdminAddInfluencerImage';
import { Image, User, Package, Loader2, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api'; // Assuming @/lib/api is the correct path for your API utility

interface Product {
  _id: string;
  title: string;
  images: string[];
}

interface InfluencerImageItem {
  _id: string;
  imageUrl: string;
  influencerName: string;
  productId: Product;
  updatedAt: string;
}


export default function InfluencerImageSection() {
  const [showAddForm, setShowAddForm] = useState(false); // New state
  const [influencerImages, setInfluencerImages] = useState<InfluencerImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InfluencerImageItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchInfluencerImages = useCallback(async () => {
    console.log('🔄 fetchInfluencerImages called');
    setLoading(true);
    setError(null);
    try {
      // Add cache-busting to force fresh data
      const cacheBuster = Date.now();
      console.log('📡 Fetching influencer images with cache-buster:', cacheBuster);
      const res = await api(`/api/influencer-images/public?_t=${cacheBuster}`);
      if (!res.ok) {
        throw new Error(res.json?.message || 'Failed to fetch influencer images');
      }
      const data = res.json.data;
      console.log('📊 Influencer images fetched:', {
        count: data.length,
        items: data.map(item => ({
          id: item._id,
          influencerName: item.influencerName,
          imageUrl: item.imageUrl,
          updatedAt: item.updatedAt
        }))
      });
      setInfluencerImages(data);
    } catch (err: any) {
      console.error('❌ Error fetching influencer images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    console.log('🗑️ FRONTEND: Deleting influencer image:', id);
    try {
      const res = await api(`/api/admin/influencer-images/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        throw new Error(res.json?.message || 'Failed to delete influencer image');
      }
      console.log('✅ FRONTEND: Influencer image deleted successfully');
      setInfluencerImages(influencerImages.filter(item => item._id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error('❌ FRONTEND: Error deleting influencer image:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchInfluencerImages();
  }, [fetchInfluencerImages]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Influencer Image Spotlight</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-full">
          {showAddForm ? (editingItem ? 'Cancel Edit' : 'Cancel Add') : 'Add New Image'}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <AdminAddInfluencerImage 
            editingItem={editingItem}
            onImageAdded={() => { 
              fetchInfluencerImages(); 
              setShowAddForm(false); 
              setEditingItem(null);
            }} 
          />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3 text-gray-600">Loading influencer images...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      ) : influencerImages.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No influencer images found.
        </div>
      ) : (
        <div className="masonry-grid" style={{ columnCount: 3, columnGap: '1.5rem' }}>
          {influencerImages.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 relative group" style={{ breakInside: 'avoid-column', marginBottom: '1.5rem' }}>
              {/* Action buttons */}
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 hover:bg-white text-blue-600 hover:text-blue-700 shadow-md"
                  onClick={() => {
                    setEditingItem(item);
                    setShowAddForm(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-500/90 hover:bg-red-600 text-white shadow-md"
                  onClick={() => setDeleteConfirm(item._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Delete confirmation overlay */}
              {deleteConfirm === item._id && (
                <div className="absolute inset-0 bg-black/70 z-20 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 max-w-xs mx-4">
                    <p className="text-sm font-medium mb-3">Delete this influencer image?</p>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <img 
                src={(() => {
                  const timestamp = Date.now();
                  const cacheBustedUrl = item.imageUrl.includes('?') ? `${item.imageUrl}&_t=${timestamp}` : `${item.imageUrl}?_t=${timestamp}`;
                  console.log('🖼️ Rendering influencer image:', {
                    id: item._id,
                    influencerName: item.influencerName,
                    originalUrl: item.imageUrl,
                    cacheBustedUrl,
                    timestamp
                  });
                  return cacheBustedUrl;
                })()} 
                alt={item.influencerName} 
                className="w-full h-auto object-cover" 
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{item.productId?.title || 'Product'}</h3>
                <p className="text-sm text-gray-600 flex items-center mb-1">
                  <User className="h-4 w-4 mr-2 text-blue-500" />
                  {item.influencerName}
                </p>
                <p className="text-xs text-gray-500 flex items-center">
                  <Package className="h-4 w-4 mr-2 text-green-500" />
                  Product: {item.productId?.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

