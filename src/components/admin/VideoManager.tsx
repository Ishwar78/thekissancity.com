import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Trash2, Plus, Upload, Loader2, Play, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Video {
  _id: string;
  title: string;
  type: 'video' | 'image';
  videoUrl?: string;
  imageUrl?: string;
  linkUrl?: string;
  thumbnailUrl?: string;
  active: boolean;
  sortOrder: number;
  createdAt: string;
}

export function VideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'image' as 'video' | 'image',
    videoUrl: '',
    imageUrl: '',
    linkUrl: '',
    thumbnailUrl: '',
    active: true,
    sortOrder: 0,
  });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api('/api/videos/admin/list');
      if (res.ok) {
        setVideos(res.json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch videos:', err);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileType === 'video' && !file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);

      // Using the generic upload endpoint if possible, or specific ones
      const endpoint = fileType === 'video' ? '/api/uploads/admin/video' : '/api/uploads';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: fd,
      });

      const result = await response.json();
      if (result.ok && result.url) {
        if (fileType === 'video') {
          setFormData(prev => ({ ...prev, videoUrl: result.url }));
        } else {
          setFormData(prev => ({ ...prev, imageUrl: result.url }));
        }
        toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded successfully`);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || `Failed to upload ${fileType}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.type === 'video' && !formData.videoUrl) {
      toast.error('Please upload a video first');
      return;
    }
    if (formData.type === 'image' && !formData.imageUrl) {
      toast.error('Please upload an image first');
      return;
    }

    try {
      setSaving(true);
      const res = await api('/api/videos/admin/create', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(`${formData.type === 'video' ? 'Video' : 'Image'} entry created`);
        setShowAddForm(false);
        setFormData({ 
          title: '', 
          type: 'image', 
          videoUrl: '', 
          imageUrl: '', 
          linkUrl: '', 
          thumbnailUrl: '', 
          active: true, 
          sortOrder: 0 
        });
        fetchVideos();
      } else {
        toast.error(res.json?.message || 'Failed to create');
      }
    } catch (err) {
      toast.error('Store error');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (video: Video) => {
    try {
      const res = await api(`/api/videos/admin/update/${video._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...video, active: !video.active }),
      });
      if (res.ok) {
        setVideos(prev => prev.map(v => v._id === video._id ? { ...v, active: !v.active } : v));
        toast.success('Status updated');
      }
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await api(`/api/videos/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v._id !== id));
        toast.success('Entry deleted');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const resolveUrl = (src?: string) => {
    if (!src) return '';
    if (src.startsWith('http')) return src;
    const base = import.meta.env.VITE_API_BASE_URL || '';
    return `${base.endsWith('/') ? base.slice(0, -1) : base}${src.startsWith('/') ? src : '/' + src}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Home Page Slider Manager</CardTitle>
          <CardDescription>Upload and manage both images and videos shown on the homepage.</CardDescription>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? "outline" : "default"}>
          {showAddForm ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add New Entry</>}
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border rounded-xl bg-muted/30 space-y-6">
            <Tabs value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as 'video' | 'image' })}>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Select Content Type</Label>
                <TabsList className="grid w-[200px] grid-cols-2">
                  {/* <TabsTrigger value="video">Video</TabsTrigger> */}
                  <TabsTrigger value="image" className="col-span-2">Image</TabsTrigger>
                </TabsList>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Entry Title (Internal use)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Summer Promo Banner"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Sort Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {/* <TabsContent value="video" className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="video">Upload Video File</Label>
                    <div className="flex gap-2">
                      <Input
                        id="video"
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'video')}
                        className="cursor-pointer"
                      />
                      {uploading && <Loader2 className="h-4 w-4 animate-spin mt-3" />}
                    </div>
                    {formData.videoUrl && (
                      <p className="text-xs text-green-600 font-medium">Video uploaded: {formData.videoUrl.split('/').pop()}</p>
                    )}
                  </div>
                </TabsContent> */}

                <TabsContent value="image" className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
                  <div className="space-y-2">
                    <Label htmlFor="image">Upload Banner Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'image')}
                        className="cursor-pointer"
                      />
                      {uploading && <Loader2 className="h-4 w-4 animate-spin mt-3" />}
                    </div>
                    {formData.imageUrl && (
                      <p className="text-xs text-green-600 font-medium">Image uploaded: {formData.imageUrl.split('/').pop()}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkUrl">Redirect Link (URL)</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="e.g. /shop or https://example.com"
                    />
                    <p className="text-[10px] text-muted-foreground">User will go here when they click the image.</p>
                  </div>
                </TabsContent>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="active-mode"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active-mode">Visible correctly on Homepage</Label>
                </div>
              </div>
            </Tabs>
            
            <Button type="submit" disabled={saving || uploading} className="w-full">
              {(saving || uploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Save to Homepage Slider
            </Button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No entries added yet. Click "Add New Entry" to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Preview</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>
                      <div className="relative h-12 w-20 bg-muted rounded overflow-hidden flex items-center justify-center border">
                        {item.type === 'video' ? (
                          <Play className="h-5 w-5 text-muted-foreground opacity-50" />
                        ) : (
                          <img 
                            src={resolveUrl(item.imageUrl)} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${item.type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate">{item.title || 'Untitled'}</TableCell>
                    <TableCell className="max-w-[150px] truncate italic text-xs">
                      {item.linkUrl ? (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> {item.linkUrl}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{item.sortOrder}</TableCell>
                    <TableCell>
                      <Switch
                        checked={item.active}
                        onCheckedChange={() => toggleStatus(item)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
