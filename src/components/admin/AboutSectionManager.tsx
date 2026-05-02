import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Save, X, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { ImageUploader } from '@/components/ImageUploader';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['clean'],
  ],
};

const QUILL_FORMATS = ['header', 'bold', 'italic', 'underline', 'link', 'list', 'bullet', 'align'];

interface TeamMember {
  _id?: string;
  name: string;
  location: string;
  specialty: string;
  quote: string;
  experience: string;
  image: string;
  type: 'farmer' | 'expert';
  isActive: boolean;
}

const DEFAULT_FORM: Omit<TeamMember, '_id'> = {
  name: '',
  location: '',
  specialty: '',
  quote: '',
  experience: '',
  image: '',
  type: 'farmer',
  isActive: true,
};

export const AboutSectionManager = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'farmer' | 'expert'>('all');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const { ok, json } = await api('/api/team?all=true');
      if (ok) setMembers(json.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load team members', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) {
      toast({ title: 'Error', description: 'Name and image are required.', variant: 'destructive' });
      return;
    }
    try {
      const url = editingId ? `/api/team/${editingId}` : '/api/team';
      const method = editingId ? 'PUT' : 'POST';
      const { ok, json } = await api(url, { method, body: JSON.stringify(formData) });
      
      if (!ok) throw new Error(json.message);
      
      toast({ title: 'Success', description: `Member ${editingId ? 'updated' : 'added'} successfully` });
      setShowForm(false);
      loadMembers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      name: member.name,
      location: member.location || '',
      specialty: member.specialty || '',
      quote: member.quote || '',
      experience: member.experience || '',
      image: member.image,
      type: member.type,
      isActive: member.isActive
    });
    setEditingId(member._id!);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    try {
      const { ok } = await api(`/api/team/${id}`, { method: 'DELETE' });
      if (!ok) throw new Error('Failed to delete member');
      toast({ title: 'Success', description: 'Member deleted successfully' });
      loadMembers();
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
        const { ok, json } = await api('/api/uploads/single', { method: 'POST', body: fd });
        if (!ok) throw new Error(json?.message || 'Upload failed');
        return json.url;
      }));
      return urls;
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMembers = members.filter(m => filterType === 'all' || m.type === filterType);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          Farmers & Experts
        </h1>
        <div className="flex gap-4 items-center">
          <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="farmer">Farmers</SelectItem>
              <SelectItem value="expert">Experts</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => { setFormData(DEFAULT_FORM); setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#6B4E3B] hover:bg-[#5D4037] text-white rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-xl shadow-md overflow-hidden border">
            <div className="relative h-48">
              <img src={member.image.startsWith('http') ? member.image : `/uploads/${member.image}`} alt={member.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded capitalize">
                {member.type}
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-bold text-lg">{member.name}</h3>
                <div className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={12}/> {member.location}</div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 italic">"{member.quote}"</p>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className={`text-xs px-2 py-1 rounded-full ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {member.isActive ? 'Active' : 'Hidden'}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(member)}><Edit className="w-4 h-4" /></Button>
                  <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(member._id!)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filteredMembers.length === 0 && <div className="col-span-full py-8 text-center text-gray-500">No profiles found.</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Profile' : 'Add Profile'}</h2>
              <Button variant="ghost" onClick={() => setShowForm(false)}><X className="w-5 h-5"/></Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Name *</Label><Input value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required /></div>
                <div>
                  <Label>Type *</Label>
                  <Select value={formData.type} onValueChange={v => setFormData(p => ({...p, type: v as 'farmer'|'expert'}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">Farmer</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Location</Label><Input value={formData.location} onChange={e => setFormData(p => ({...p, location: e.target.value}))} /></div>
                <div><Label>Specialty</Label><Input value={formData.specialty} onChange={e => setFormData(p => ({...p, specialty: e.target.value}))} /></div>
                <div><Label>Experience</Label><Input value={formData.experience} onChange={e => setFormData(p => ({...p, experience: e.target.value}))} placeholder="e.g. 15+ years" /></div>
              </div>

              <div>
                <Label>Profile Image *</Label>
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
                <Label>Quote</Label>
                <div className="mt-1 bg-white rounded-md overflow-hidden border border-input focus-within:ring-1 focus-within:ring-ring">
                  <ReactQuill 
                    theme="snow"
                    value={formData.quote}
                    onChange={val => setFormData(p => ({...p, quote: val}))}
                    modules={QUILL_MODULES}
                    formats={QUILL_FORMATS}
                    className="h-32 mb-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={formData.isActive} onCheckedChange={c => setFormData(p => ({...p, isActive: c}))} />
                <Label>Visible on website</Label>
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
