import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, Save, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { ImageUploader } from '@/components/ImageUploader';

interface AboutUsData {
  _id?: string;
  eyebrow: {
    text: string;
    icon: string;
  };
  title: {
    main: string;
    highlighted: string;
  };
  content: {
    main: { text: string }[];
    expanded: { text: string }[];
  };
  image: {
    src: string;
    alt: string;
    badge: {
      text: string;
      icon: string;
    };
    banner: {
      text: string;
    };
  };
  icons: {
    text: string;
    icon: string;
  }[];
  stats: {
    value: string;
    label: string;
  }[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ICON_OPTIONS = [
  { value: 'Leaf', label: 'Leaf' },
  { value: 'Mountain', label: 'Mountain' },
  { value: 'Heart', label: 'Heart' },
];

const DEFAULT_FORM_DATA: Omit<AboutUsData, '_id' | 'createdAt' | 'updatedAt'> = {
  eyebrow: {
    text: 'Kissan City',
    icon: 'Mountain'
  },
  title: {
    main: 'Our Story',
    highlighted: 'Story'
  },
  content: {
    main: [{ text: '' }],
    expanded: [{ text: '' }]
  },
  image: {
    src: '/Capture.PNG',
    alt: 'Direct from source',
    badge: {
      text: '100% Organic',
      icon: 'Leaf'
    },
    banner: {
      text: 'Perfect for all occasions'
    }
  },
  icons: [
    { text: 'Organic', icon: 'Leaf' },
    { text: 'Hill Fresh', icon: 'Mountain' },
    { text: 'Farmer-first', icon: 'Heart' }
  ],
  stats: [
    { value: '500+', label: 'Partner Farmers' },
    { value: '100%', label: 'Organic Certified' },
    { value: '50+', label: 'Hill Products' },
    { value: '10K+', label: 'Happy Homes' }
  ],
  isActive: true
};

export const AboutUsManager = () => {
  const { toast } = useToast();
  const [aboutUsEntries, setAboutUsEntries] = useState<AboutUsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<AboutUsData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadAboutUsEntries();
  }, []);

  const loadAboutUsEntries = async () => {
    try {
      setLoading(true);
      const { ok, json } = await api('/api/about-us/all');
      if (!ok) throw new Error('Failed to fetch About Us entries');
      const data = json;
      setAboutUsEntries(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load About Us entries',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEntry 
        ? `/api/about-us/${editingEntry._id}`
        : '/api/about-us';
      
      const method = editingEntry ? 'PUT' : 'POST';
      
      const { ok, json } = await api(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (!ok) {
        // Handle validation errors gracefully
        if (json?.missingFields && json?.message) {
          toast({
            title: 'Missing Information',
            description: json.message,
            variant: 'destructive'
          });
          return;
        }
        throw new Error(json?.error || 'Failed to save About Us content');
      }
      
      toast({
        title: 'Success',
        description: `About Us content ${editingEntry ? 'updated' : 'created'} successfully`
      });
      
      setShowForm(false);
      setEditingEntry(null);
      setFormData(DEFAULT_FORM_DATA);
      loadAboutUsEntries();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || `Failed to ${editingEntry ? 'update' : 'create'} About Us content`,
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (entry: AboutUsData) => {
    setEditingEntry(entry);
    setFormData(entry);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this About Us entry?')) return;
    
    try {
      const { ok } = await api(`/api/about-us/${id}`, {
        method: 'DELETE'
      });
      
      if (!ok) throw new Error('Failed to delete About Us entry');
      
      toast({
        title: 'Success',
        description: 'About Us entry deleted successfully'
      });
      
      loadAboutUsEntries();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete About Us entry',
        variant: 'destructive'
      });
    }
  };

  const addMainContent = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        main: [...prev.content.main, { text: '' }]
      }
    }));
  };

  const removeMainContent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        main: prev.content.main.filter((_, i) => i !== index)
      }
    }));
  };

  const addExpandedContent = () => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        expanded: [...prev.content.expanded, { text: '' }]
      }
    }));
  };

  const removeExpandedContent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        expanded: prev.content.expanded.filter((_, i) => i !== index)
      }
    }));
  };

  const addIcon = () => {
    setFormData(prev => ({
      ...prev,
      icons: [...prev.icons, { text: '', icon: 'Leaf' }]
    }));
  };

  const removeIcon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      icons: prev.icons.filter((_, i) => i !== index)
    }));
  };

  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, { value: '', label: '' }]
    }));
  };

  const removeStat = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index)
    }));
  };

  const updateMainContent = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        main: prev.content.main.map((item, i) => 
          i === index ? { text } : item
        )
      }
    }));
  };

  const updateExpandedContent = (index: number, text: string) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        expanded: prev.content.expanded.map((item, i) => 
          i === index ? { text } : item
        )
      }
    }));
  };

  const updateIcon = (index: number, field: 'text' | 'icon', value: string) => {
    setFormData(prev => ({
      ...prev,
      icons: prev.icons.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateStat = (index: number, field: 'value' | 'label', value: string) => {
    setFormData(prev => ({
      ...prev,
      stats: prev.stats.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/uploads/single', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      return result.url;
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setIsUploading(false);
      return urls;
    } catch (error) {
      setIsUploading(false);
      throw error;
    }
  };

  if (loading) {
    return <div className="p-6">Loading About Us entries...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">About Us Management</h1>
        <Button onClick={() => { setShowForm(true); setEditingEntry(null); setFormData(DEFAULT_FORM_DATA); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Entry
        </Button>
      </div>

      {/* Existing Entries */}
      <div className="grid gap-4">
        {aboutUsEntries.map((entry) => (
          <Card key={entry._id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{entry.title.main}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={entry.isActive ? 'default' : 'secondary'}>
                      {entry.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(entry.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(entry._id!)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 line-clamp-2">
                {entry.content.main[0]?.text}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingEntry ? 'Edit About Us Entry' : 'Create About Us Entry'}
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button variant="outline" onClick={() => { setShowForm(false); setEditingEntry(null); }}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Eyebrow */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eyebrow-text">Eyebrow Text</Label>
                  <Input
                    id="eyebrow-text"
                    value={formData.eyebrow.text}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      eyebrow: { ...prev.eyebrow, text: e.target.value }
                    }))}
                    placeholder="Kissan City"
                  />
                </div>
                <div>
                  <Label htmlFor="eyebrow-icon">Eyebrow Icon</Label>
                  <Select
                    value={formData.eyebrow.icon}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      eyebrow: { ...prev.eyebrow, icon: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title-main">Main Title</Label>
                  <Input
                    id="title-main"
                    value={formData.title.main}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, main: e.target.value }
                    }))}
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <Label htmlFor="title-highlighted">Highlighted Title</Label>
                  <Input
                    id="title-highlighted"
                    value={formData.title.highlighted}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, highlighted: e.target.value }
                    }))}
                    placeholder="Story"
                  />
                </div>
              </div>

              {/* Main Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Main Content</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMainContent}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Paragraph
                  </Button>
                </div>
                {formData.content.main.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={paragraph.text}
                      onChange={(e) => updateMainContent(index, e.target.value)}
                      placeholder="Enter main content paragraph..."
                      rows={3}
                    />
                    {formData.content.main.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMainContent(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Expanded Content */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Expanded Content (Read More)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addExpandedContent}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Paragraph
                  </Button>
                </div>
                {formData.content.expanded.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={paragraph.text}
                      onChange={(e) => updateExpandedContent(index, e.target.value)}
                      placeholder="Enter expanded content paragraph..."
                      rows={3}
                    />
                    {formData.content.expanded.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeExpandedContent(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Image Settings */}
              <div className="space-y-4">
                <Label>Image Settings</Label>
                
                {/* Image Upload */}
                <div>
                  <Label>Upload Image</Label>
                  <ImageUploader
                    images={formData.image.src ? [formData.image.src] : []}
                    onImagesChange={(urls) => {
                      if (urls.length > 0) {
                        setFormData(prev => ({
                          ...prev,
                          image: { ...prev.image, src: urls[0] }
                        }));
                      }
                    }}
                    onUpload={handleImageUpload}
                    maxImages={1}
                    isLoading={isUploading}
                  />
                </div>

                {/* Alt Text */}
                <div>
                  <Label htmlFor="image-alt">Image Alt Text</Label>
                  <Input
                    id="image-alt"
                    value={formData.image.alt}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      image: { ...prev.image, alt: e.target.value }
                    }))}
                    placeholder="Direct from source"
                  />
                </div>

                {/* Badge Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge-text">Badge Text</Label>
                    <Input
                      id="badge-text"
                      value={formData.image.badge.text}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        image: { 
                          ...prev.image, 
                          badge: { ...prev.image.badge, text: e.target.value }
                        }
                      }))}
                      placeholder="100% Organic"
                    />
                  </div>
                  <div>
                    <Label htmlFor="badge-icon">Badge Icon</Label>
                    <Select
                      value={formData.image.badge.icon}
                      onValueChange={(value) => setFormData(prev => ({
                        ...prev,
                        image: { 
                          ...prev.image, 
                          badge: { ...prev.image.badge, icon: value }
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Banner Text */}
                <div>
                  <Label htmlFor="banner-text">Banner Text</Label>
                  <Input
                    id="banner-text"
                    value={formData.image.banner.text}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      image: { ...prev.image, banner: { ...prev.image.banner, text: e.target.value } }
                    }))}
                    placeholder="Perfect for all occasions"
                  />
                </div>
              </div>

              {/* Icons */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Feature Icons</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addIcon}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Icon
                  </Button>
                </div>
                {formData.icons.map((icon, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={icon.text}
                      onChange={(e) => updateIcon(index, 'text', e.target.value)}
                      placeholder="Icon text"
                    />
                    <Select
                      value={icon.icon}
                      onValueChange={(value) => updateIcon(index, 'icon', value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ICON_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.icons.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIcon(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Statistics</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addStat}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Stat
                  </Button>
                </div>
                {formData.stats.map((stat, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                      placeholder="Value (e.g., 500+)"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      placeholder="Label (e.g., Partner Farmers)"
                    />
                    {formData.stats.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeStat(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="is-active">Active (Only one entry can be active at a time)</Label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingEntry(null); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingEntry ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
