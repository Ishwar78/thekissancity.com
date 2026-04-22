import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Upload, Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Video {
  _id: string;
  title: string;
  videoUrl: string;
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
    videoUrl: '',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);

      // Using the existing video upload endpoint
      const response = await fetch('/api/uploads/admin/video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: fd,
      });

      const result = await response.json();
      if (result.ok && result.url) {
        setFormData(prev => ({ ...prev, videoUrl: result.url }));
        toast.success('Video uploaded successfully');
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.videoUrl) {
      toast.error('Please upload a video first');
      return;
    }

    try {
      setSaving(true);
      const res = await api('/api/videos/admin/create', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Video entry created');
        setShowAddForm(false);
        setFormData({ title: '', videoUrl: '', thumbnailUrl: '', active: true, sortOrder: 0 });
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
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      const res = await api(`/api/videos/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVideos(prev => prev.filter(v => v._id !== id));
        toast.success('Video deleted');
      }
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Home Page Video Manager</CardTitle>
          <CardDescription>Upload and manage videos shown on the homepage.</CardDescription>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} variant={showAddForm ? "outline" : "default"}>
          {showAddForm ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> Add New Video</>}
        </Button>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-muted/30 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Healthy Cooking"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video">Upload Video File</Label>
                <div className="flex gap-2">
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin mt-3" />}
                </div>
                {formData.videoUrl && (
                  <p className="text-xs text-green-600 font-medium">Video ready: {formData.videoUrl.split('/').pop()}</p>
                )}
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
              <div className="flex items-center space-x-2 pt-8">
                <Switch
                  id="active-mode"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="active-mode">Active and visible</Label>
              </div>
            </div>
            <Button type="submit" disabled={saving || uploading} className="w-full md:w-auto">
              {(saving || uploading) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Video Section Entry
            </Button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">No videos added yet. Click "Add New Video" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video._id}>
                  <TableCell>
                    <div className="relative h-16 w-16 bg-black rounded overflow-hidden flex items-center justify-center">
                      <Play className="h-6 w-6 text-white opacity-50" />
                      {/* We could use a video tag here for small thumbnail if needed */}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{video.title || 'Untitled'}</TableCell>
                  <TableCell>{video.sortOrder}</TableCell>
                  <TableCell>
                    <Switch
                      checked={video.active}
                      onCheckedChange={() => toggleStatus(video)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(video._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
