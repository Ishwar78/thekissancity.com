import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Loader2, Save, ChevronDown, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interfaces matching the backend schema
interface Paragraph {
  content: string;
}

interface Point {
  point: string;
}

interface InputField {
  label: string;
  value: string;
}

interface TermsOfServiceSection {
  _id?: string;
  heading: string;
  subHeading?: string;
  paragraphs?: Paragraph[];
  description?: string;
  points?: Point[];
  inputFields?: InputField[];
}

interface TermsOfServiceData {
  _id?: string;
  mainHeading: string;
  sections: TermsOfServiceSection[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminTermsOfServiceEditor = () => {
  const [policy, setPolicy] = useState<TermsOfServiceData | null>(null);
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
      const res = await api('/api/terms-of-service');
      if (res.ok && res.json?.data) {
        setPolicy(res.json.data as TermsOfServiceData);
      } else if (res.ok && !res.json?.data) {
        setPolicy({ mainHeading: '', sections: [] });
      } else {
        setError(res.json?.message || 'Failed to fetch terms of service');
        toast.error(res.json?.message || 'Failed to fetch terms of service');
      }
    } catch (err) {
      console.error('Error fetching terms of service:', err);
      setError('Network error or server unavailable');
      toast.error('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (field: keyof TermsOfServiceData, value: string) => {
    if (!policy) return;
    setPolicy({ ...policy, [field]: value });
  };

  const handleSectionChange = (sectionIndex: number, field: keyof TermsOfServiceSection, value: any) => {
    if (!policy) return;
    const updatedSections = [...policy.sections];
    // Special handling for paragraphs and points which are arrays
    if (field === 'paragraphs') {
      updatedSections[sectionIndex].paragraphs = value;
    } else if (field === 'points') {
      updatedSections[sectionIndex].points = value;
    } else if (field === 'inputFields') {
      updatedSections[sectionIndex].inputFields = value;
    }
     else {
      (updatedSections[sectionIndex] as any)[field] = value;
    }
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleAddSection = () => {
    if (!policy) return;
    setPolicy({
      ...policy,
      sections: [
        ...policy.sections,
        { heading: '', paragraphs: [{ content: '' }] }, // Default to one paragraph
      ],
    });
  };

  const handleRemoveSection = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.sections.filter((_, i) => i !== index);
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleParagraphChange = (sectionIndex: number, paragraphIndex: number, value: string) => {
    if (!policy || !policy.sections[sectionIndex].paragraphs) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].paragraphs![paragraphIndex].content = value;
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleAddParagraph = (sectionIndex: number) => {
    if (!policy || !policy.sections[sectionIndex].paragraphs) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].paragraphs!.push({ content: '' });
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleRemoveParagraph = (sectionIndex: number, paragraphIndex: number) => {
    if (!policy || !policy.sections[sectionIndex].paragraphs) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].paragraphs = updatedSections[sectionIndex].paragraphs!.filter(
      (_, i) => i !== paragraphIndex
    );
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handlePointChange = (sectionIndex: number, pointIndex: number, value: string) => {
    if (!policy || !policy.sections[sectionIndex].points) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].points![pointIndex].point = value;
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleAddPoint = (sectionIndex: number) => {
    if (!policy || !policy.sections[sectionIndex].points) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].points!.push({ point: '' });
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleRemovePoint = (sectionIndex: number, pointIndex: number) => {
    if (!policy || !policy.sections[sectionIndex].points) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].points = updatedSections[sectionIndex].points!.filter(
      (_, i) => i !== pointIndex
    );
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleInputFieldChange = (sectionIndex: number, fieldIndex: number, field: keyof InputField, value: string) => {
    if (!policy || !policy.sections[sectionIndex].inputFields) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].inputFields![fieldIndex] = { ...updatedSections[sectionIndex].inputFields![fieldIndex], [field]: value };
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleAddInputField = (sectionIndex: number) => {
    if (!policy || !policy.sections[sectionIndex].inputFields) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].inputFields!.push({ label: '', value: '' });
    setPolicy({ ...policy, sections: updatedSections });
  };

  const handleRemoveInputField = (sectionIndex: number, fieldIndex: number) => {
    if (!policy || !policy.sections[sectionIndex].inputFields) return;
    const updatedSections = [...policy.sections];
    updatedSections[sectionIndex].inputFields = updatedSections[sectionIndex].inputFields!.filter(
      (_, i) => i !== fieldIndex
    );
    setPolicy({ ...policy, sections: updatedSections });
  };


  const handleSavePolicy = async () => {
    if (!policy) return;

    setSaving(true);
    setError(null);
    try {
      const res = await api('/api/terms-of-service', {
        method: 'POST',
        body: JSON.stringify(policy),
      });

      if (res.ok && res.json?.data) {
        setPolicy(res.json.data as TermsOfServiceData);
        toast.success('Terms of service saved successfully!');
      } else {
        setError(res.json?.message || 'Failed to save terms of service');
        toast.error(res.json?.message || 'Failed to save terms of service');
      }
    } catch (err) {
      console.error('Error saving terms of service:', err);
      setError('Network error or server unavailable');
      toast.error('Network error or server unavailable');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Terms of Service</h1>
        <p>Loading terms of service editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Terms of Service</h1>
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={fetchPolicy}>Retry Load</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Terms of Service</h1>

      {/* Main Heading */}
      <Card>
        <CardHeader>
          <CardTitle>Main Heading</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mainHeading">Main Heading</Label>
            <Input
              id="mainHeading"
              value={policy?.mainHeading || ''}
              onChange={(e) => handlePolicyChange('mainHeading', e.target.value)}
              placeholder="e.g., Terms and Conditions"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Sections */}
      {policy?.sections.length === 0 && (
        <div className="text-gray-600 italic">No sections defined yet. Click "Add Section" to start.</div>
      )}

      {policy?.sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Section {sectionIndex + 1}</CardTitle>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveSection(sectionIndex)}
              aria-label="Remove section"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`section-heading-${sectionIndex}`}>Heading</Label>
              <Input
                id={`section-heading-${sectionIndex}`}
                value={section.heading}
                onChange={(e) => handleSectionChange(sectionIndex, 'heading', e.target.value)}
                placeholder="e.g., Introduction"
              />
            </div>
            {section.subHeading !== undefined && (
              <div>
                <Label htmlFor={`section-subheading-${sectionIndex}`}>Sub-heading</Label>
                <Input
                  id={`section-subheading-${sectionIndex}`}
                  value={section.subHeading || ''}
                  onChange={(e) => handleSectionChange(sectionIndex, 'subHeading', e.target.value)}
                  placeholder="e.g., Acceptance of Terms"
                />
              </div>
            )}
            {section.description !== undefined && (
              <div>
                <Label htmlFor={`section-description-${sectionIndex}`}>Description</Label>
                <Textarea
                  id={`section-description-${sectionIndex}`}
                  value={section.description || ''}
                  onChange={(e) => handleSectionChange(sectionIndex, 'description', e.target.value)}
                  placeholder="Provide a description for this section."
                  rows={3}
                />
              </div>
            )}
            {section.paragraphs !== undefined && (
              <div className="space-y-2">
                <Label>Paragraphs</Label>
                {section.paragraphs.map((p, pIndex) => (
                  <div key={pIndex} className="flex items-center space-x-2">
                    <Textarea
                      value={p.content}
                      onChange={(e) => handleParagraphChange(sectionIndex, pIndex, e.target.value)}
                      placeholder="Enter paragraph content"
                      rows={3}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveParagraph(sectionIndex, pIndex)}
                      aria-label="Remove paragraph"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={() => handleAddParagraph(sectionIndex)} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Paragraph
                </Button>
              </div>
            )}
            {section.points !== undefined && (
              <div className="space-y-2">
                <Label>Points</Label>
                {section.points.map((point, pointIndex) => (
                  <div key={pointIndex} className="flex items-center space-x-2">
                    <Input
                      value={point.point}
                      onChange={(e) => handlePointChange(sectionIndex, pointIndex, e.target.value)}
                      placeholder="Enter a point"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemovePoint(sectionIndex, pointIndex)}
                      aria-label="Remove point"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={() => handleAddPoint(sectionIndex)} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Point
                </Button>
              </div>
            )}
            {section.inputFields !== undefined && (
              <div className="space-y-2">
                <Label>Input Fields</Label>
                {section.inputFields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex items-center space-x-2">
                    <Input
                      value={field.label}
                      onChange={(e) => handleInputFieldChange(sectionIndex, fieldIndex, 'label', e.target.value)}
                      placeholder="Enter field label"
                    />
                    <Input
                      value={field.value}
                      onChange={(e) => handleInputFieldChange(sectionIndex, fieldIndex, 'value', e.target.value)}
                      placeholder="Enter field value"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveInputField(sectionIndex, fieldIndex)}
                      aria-label="Remove input field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={() => handleAddInputField(sectionIndex)} variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Input Field
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button onClick={handleAddSection} variant="outline">
          <PlusCircle className="h-4 w-4 mr-2" /> Add New Section
        </Button>
        <Button onClick={handleSavePolicy} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Terms of Service
        </Button>
      </div>
    </div>
  );
};

