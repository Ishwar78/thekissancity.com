import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PolicySection {
  title: string;
  content: string;
}

interface ReturnPolicyData {
  _id?: string;
  sections: PolicySection[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminReturnPolicyEditor = () => {
  const [policy, setPolicy] = useState<ReturnPolicyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/api/return-policy');
      if (res.ok && res.json?.data) {
        setPolicy(res.json.data as ReturnPolicyData);
      } else if (res.ok && !res.json?.data) {
        setPolicy({ sections: [] }); // No policy found, initialize with empty sections
      } else {
        setError(res.json?.message || 'Failed to fetch return policy');
        toast.error(res.json?.message || 'Failed to fetch return policy');
      }
    } catch (err) {
      console.error('Error fetching return policy:', err);
      setError('Network error or server unavailable');
      toast.error('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (index: number, field: keyof PolicySection, value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleAddSection = () => {
    if (!policy) return;
    setPolicy({ ...policy, sections: [...policy.sections, { title: '', content: '' }] });
  };

  const handleRemoveSection = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.sections.filter((_, i) => i !== index);
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleSavePolicy = async () => {
    if (!policy) return;

    // Basic validation
    for (const section of policy.sections) {
      if (!section.title.trim() || !section.content.trim()) {
        toast.error('All section titles and content must be filled.');
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const res = await api('/api/return-policy', {
        method: 'POST',
        body: JSON.stringify({ sections: policy.sections }),
      });

      if (res.ok && res.json?.data) {
        setPolicy(res.json.data as ReturnPolicyData);
        toast.success('Return policy saved successfully!');
      } else {
        setError(res.json?.message || 'Failed to save return policy');
        toast.error(res.json?.message || 'Failed to save return policy');
      }
    } catch (err) {
      console.error('Error saving return policy:', err);
      setError('Network error or server unavailable');
      toast.error('Network error or server unavailable');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Return Policy</h1>
        <p>Loading policy editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Return Policy</h1>
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={fetchPolicy}>Retry Load</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Return Policy</h1>

      {policy?.sections.length === 0 && (
        <div className="text-gray-600 italic">No sections defined yet. Click "Add Section" to start.</div>
      )}

      <div className="space-y-8">
        {policy?.sections.map((section, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Section {index + 1}</CardTitle>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveSection(index)}
                aria-label="Remove section"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`title-${index}`}>Section Title</Label>
                <Input
                  id={`title-${index}`}
                  value={section.title}
                  onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                  placeholder="e.g., Return Eligibility"
                />
              </div>
              <div>
                <Label htmlFor={`content-${index}`}>Section Content</Label>
                <Textarea
                  id={`content-${index}`}
                  value={section.content}
                  onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                  placeholder="Provide detailed content for this section."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button onClick={handleAddSection} variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Section
        </Button>
        <Button onClick={handleSavePolicy} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Policy
        </Button>
      </div>
    </div>
  );
};

