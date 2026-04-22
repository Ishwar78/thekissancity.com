import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ImageUploader } from '@/components/ImageUploader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface Blog {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  isActive: boolean;
  date: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

const DEFAULT_FORM: Omit<Blog, '_id' | 'date'> = {
  title: '',
  slug: '',
  content: '',
  image: '',
  author: 'KissanCity Admin',
  isActive: true,
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
};

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean'],
  ],
};
const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'link', 'list', 'bullet'];

export const BlogManager = () => {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const { ok, json } = await api('/api/blogs?all=true');
      if (ok) setBlogs(json.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load blogs', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }
    try {
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = editingId ? 'PUT' : 'POST';
      const payload = { ...formData, slug: formData.slug || generateSlug(formData.title) };
      console.log('[BLOG SUBMIT] Payload sending:', payload);

      const { ok, json } = await api(url, { method, body: JSON.stringify(payload) });
      
      if (!ok) throw new Error(json.message);
      
      toast({ title: 'Success', description: `Blog ${editingId ? 'updated' : 'added'} successfully` });
      setShowForm(false);
      loadBlogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (blog: Blog) => {
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      image: blog.image || '',
      author: blog.author || '',
      isActive: blog.isActive,
      seoTitle: blog.seoTitle || '',
      seoDescription: blog.seoDescription || '',
      seoKeywords: blog.seoKeywords || '',
    });
    setEditingId(blog._id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const { ok } = await api(`/api/blogs/${id}`, { method: 'DELETE' });
      if (!ok) throw new Error('Failed to delete blog');
      toast({ title: 'Success', description: 'Blog deleted successfully' });
      loadBlogs();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleImageUpload = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    try {
      const urls = await Promise.all(files.map(async file => {
        const fd = new FormData();
        fd.append('image', file);
        const res = await fetch('/api/uploads/single', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        return data.url;
      }));
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">Blog Management</h1>
        <Button 
          onClick={() => { setFormData(DEFAULT_FORM); setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#6B4E3B] hover:bg-[#5D4037] text-white rounded-xl"
        >
          <Plus className="w-4 h-4" /> Add Blog Post
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {blogs.map((blog) => (
          <div key={blog._id} className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border items-center">
            {blog.image && (
              <img src={blog.image.startsWith('http') ? blog.image : `/uploads/${blog.image}`} alt={blog.title} className="w-24 h-24 object-cover rounded-md" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg">{blog.title}</h3>
              <p className="text-sm text-gray-500">Slug: {blog.slug}</p>
              <p className="text-xs text-gray-400 mt-1">Written by {blog.author} on {new Date(blog.date).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${blog.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {blog.isActive ? 'Active' : 'Hidden'}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}><Edit className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(blog._id!)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && <div className="py-8 text-center text-gray-500">No blog posts found.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Blog Post' : 'Add Blog Post'}</h2>
              <Button variant="ghost" onClick={() => setShowForm(false)}><X className="w-5 h-5"/></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({...p, title: e.target.value}))} required /></div>
                <div><Label>Slug (auto-generates if empty)</Label><Input value={formData.slug} onChange={e => setFormData(p => ({...p, slug: e.target.value}))} /></div>
                <div><Label>Author</Label><Input value={formData.author} onChange={e => setFormData(p => ({...p, author: e.target.value}))} /></div>
              </div>

              <div>
                <Label>Cover Image</Label>
                <div className="mt-2">
                  <ImageUploader 
                    images={formData.image ? [formData.image] : []} 
                    onImagesChange={urls => urls.length && setFormData(p => ({...p, image: urls[0]}))} 
                    onUpload={handleImageUpload} 
                    maxImages={1} isLoading={isUploading} 
                  />
                </div>
              </div>

              <div>
                <Label>Content *</Label>
                <div className="mt-2" style={{ minHeight: 250 }}>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={val => setFormData(p => ({...p, content: val}))}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    style={{ background: '#fff', borderRadius: 8 }}
                  />
                </div>
              </div>

              {/* SEO Data Section */}
              <div className="border border-gray-200 rounded-lg p-4 mt-6 bg-gray-50/50">
                <h3 className="text-lg font-semibold mb-4 text-[#2d6a4f]">SEO Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>SEO Title</Label>
                    <Input 
                      value={formData.seoTitle} 
                      onChange={e => setFormData(p => ({...p, seoTitle: e.target.value}))} 
                      placeholder="Title for search engines"
                    />
                  </div>
                  <div>
                    <Label>SEO Keywords</Label>
                    <Input 
                      value={formData.seoKeywords} 
                      onChange={e => setFormData(p => ({...p, seoKeywords: e.target.value}))} 
                      placeholder="e.g. organic farming, raw honey, healthy"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>SEO Description</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.seoDescription} 
                      onChange={e => setFormData(p => ({...p, seoDescription: e.target.value}))} 
                      placeholder="A short description for search engine results..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-12">
                <Switch checked={formData.isActive} onCheckedChange={c => setFormData(p => ({...p, isActive: c}))} />
                <Label>Publish post to website</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#6B4E3B] hover:bg-[#5D4037]"><Save className="w-4 h-4 mr-2"/> {editingId ? 'Update' : 'Save'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
