import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, MoveUp, MoveDown, Image as ImageIcon } from 'lucide-react';
import { productSliderService } from '@/services/productSliderService';
import { ProductSliderItem } from '@/types/productSlider';
import { useToast } from '@/hooks/use-toast';

export const ProductSliderManager = () => {
  const { toast } = useToast();
  const [sliders, setSliders] = useState<ProductSliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSlider, setEditingSlider] = useState<ProductSliderItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    order: 0,
    isActive: true,
    stats: {
      products: '200+',
      customers: '50K+',
      quality: '100%',
      rating: '4.8★'
    }
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      setLoading(true);
      const data = await productSliderService.getAllSliders();
      setSliders(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sliders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Title is now optional
    if (!imageFile && !editingSlider) {
      toast({
        title: 'Error',
        description: 'Image is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const sliderData = {
        ...formData,
        image: imageFile || editingSlider?.image || ''
      };

      if (editingSlider) {
        const updateData = { ...sliderData, id: editingSlider.id };
        const updated = await productSliderService.updateSlider(editingSlider.id, updateData);
        if (updated) {
          toast({
            title: 'Success',
            description: 'Slider updated successfully'
          });
        }
      } else {
        const created = await productSliderService.createSlider(sliderData);
        if (created) {
          toast({
            title: 'Success',
            description: 'Slider created successfully'
          });
        }
      }

      resetForm();
      loadSliders();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save slider',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return;

    try {
      const success = await productSliderService.deleteSlider(id);
      if (success) {
        toast({
          title: 'Success',
          description: 'Slider deleted successfully'
        });
        loadSliders();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete slider',
        variant: 'destructive'
      });
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const updated = await productSliderService.toggleSliderStatus(id, isActive);
      if (updated) {
        toast({
          title: 'Success',
          description: `Slider ${isActive ? 'activated' : 'deactivated'}`
        });
        loadSliders();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update slider status',
        variant: 'destructive'
      });
    }
  };

  const handleReorder = async (direction: 'up' | 'down', index: number) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sliders.length - 1)
    ) {
      return;
    }

    const newSliders = [...sliders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [newSliders[index], newSliders[targetIndex]] = [newSliders[targetIndex], newSliders[index]];
    
    // Update order values
    const reorderData = newSliders.map((slider, idx) => ({
      id: slider.id,
      order: idx
    }));

    try {
      const success = await productSliderService.reorderSliders(reorderData);
      if (success) {
        setSliders(newSliders);
        toast({
          title: 'Success',
          description: 'Sliders reordered successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reorder sliders',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      order: 0,
      isActive: true,
      stats: {
        products: '200+',
        customers: '50K+',
        quality: '100%',
        rating: '4.8★'
      }
    });
    setImageFile(null);
    setImagePreview('');
    setEditingSlider(null);
    setShowForm(false);
  };

  const handleEdit = (slider: ProductSliderItem) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      subtitle: slider.subtitle || '',
      description: slider.description || '',
      buttonText: slider.buttonText || '',
      buttonLink: slider.buttonLink || '',
      order: slider.order || 0,
      isActive: slider.isActive || true,
      stats: slider.stats || {
        products: '200+',
        customers: '50K+',
        quality: '100%',
        rating: '4.8★'
      }
    });
    setImagePreview(slider.image);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div className="p-6">Loading sliders...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Slider Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Slider
        </Button>
      </div>

      {/* Slider Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingSlider ? 'Edit Slider' : 'Add New Slider'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Farm Fresh\nGoodness"
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Brief description..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="buttonText">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <Label htmlFor="buttonLink">Button Link</Label>
                  <Input
                    id="buttonLink"
                    value={formData.buttonLink}
                    onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                    placeholder="/shop"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Image *</Label>
                <div className="mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={!editingSlider}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-auto object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div>
                <Label>Statistics</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <Input
                    placeholder="Products"
                    value={formData.stats.products}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, products: e.target.value || "200+" }
                    })}
                  />
                  <Input
                    placeholder="Customers"
                    value={formData.stats.customers}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, customers: e.target.value || "50K+" }
                    })}
                  />
                  <Input
                    placeholder="Quality"
                    value={formData.stats.quality}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, quality: e.target.value || "100%" }
                    })}
                  />
                  <Input
                    placeholder="Rating"
                    value={formData.stats.rating}
                    onChange={(e) => setFormData({
                      ...formData,
                      stats: { ...formData.stats, rating: e.target.value || "4.8★" }
                    })}
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingSlider ? 'Update' : 'Create'} Slider
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sliders List */}
      <div className="space-y-4">
        {sliders.map((slider, index) => (
          <Card key={slider.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Order: {slider.order}</span>
                      <Badge variant={slider.isActive ? 'default' : 'secondary'}>
                        {slider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{slider.title.replace('\n', ' ')}</h3>
                    <p className="text-sm text-gray-600">{slider.subtitle}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{slider.stats?.products}</span>
                      <span>•</span>
                      <span>{slider.stats?.customers}</span>
                      <span>•</span>
                      <span>{slider.stats?.rating}</span>
                    </div>
                  </div>
                  <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex flex-col space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder('up', index)}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReorder('down', index)}
                      disabled={index === sliders.length - 1}
                    >
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Switch
                    checked={slider.isActive}
                    onCheckedChange={(checked) => handleToggleStatus(slider.id, checked)}
                  />
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(slider)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(slider.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sliders.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No sliders found. Create your first slider!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
