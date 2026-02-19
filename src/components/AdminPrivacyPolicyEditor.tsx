import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Loader2, Save, ChevronDown, CheckCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Point {
  point: string;
}

interface Section2 {
  subHeading: string;
  paragraph: string;
}

interface Section3 {
  subHeading: string;
  description: string;
  points: Point[]; // 5 points
}

interface Section4 {
  subHeading: string;
  description: string;
  points: Point[]; // 3 points
}

interface Section5 {
  subHeading: string;
  paragraphs: string[]; // 3 paragraphs
}

interface Section6 {
  subHeading: string;
  description: string;
}

interface InputField {
  label: string;
  placeholder: string;
  name: string;
}

interface PrivacyPolicyData {
  _id?: string;
  mainHeading: string;
  mainParagraph: string;
  section2: Section2[];
  section3: Section3[];
  section4: Section4[];
  section5: Section5[];
  section6: Section6[];
  inputFields: InputField[];
  lastUpdatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const AdminPrivacyPolicyEditor = () => {
  const [policy, setPolicy] = useState<PrivacyPolicyData | null>(null);
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
      const res = await api('/api/privacy-policy');
      if (res.ok && res.json?.data) {
        setPolicy(res.json.data as PrivacyPolicyData);
      } else if (res.ok && !res.json?.data) {
        setPolicy({
          mainHeading: '',
          mainParagraph: '',
          section2: [],
          section3: [],
          section4: [],
          section5: [],
          section6: [],
          inputFields: [],
        });
      } else {
        setError(res.json?.message || 'Failed to fetch privacy policy');
        toast.error(res.json?.message || 'Failed to fetch privacy policy');
      }
    } catch (err) {
      console.error('Error fetching privacy policy:', err);
      setError('Network error or server unavailable');
      toast.error('Network error or server unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyChange = (field: keyof PrivacyPolicyData, value: string) => {
    if (!policy) return;
    setPolicy({ ...policy, [field]: value });
  };

  // Section 2 Handlers
  const handleSection2Change = (index: number, field: keyof Section2, value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.section2];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicy({ ...policy, section2: updatedSections });
  };

  const handleAddSection2 = () => {
    if (!policy) return;
    setPolicy({ ...policy, section2: [...policy.section2, { subHeading: '', paragraph: '' }] });
  };

  const handleRemoveSection2 = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.section2.filter((_, i) => i !== index);
    setPolicy({ ...policy, section2: updatedSections });
  };

  // Section 3 Handlers
  const handleSection3Change = (index: number, field: keyof Section3, value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.section3];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicy({ ...policy, section3: updatedSections });
  };

  const handleAddSection3 = () => {
    if (!policy) return;
    setPolicy({ ...policy, section3: [...policy.section3, { subHeading: '', description: '', points: [{ point: '' }] }] });
  };

  const handleRemoveSection3 = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.section3.filter((_, i) => i !== index);
    setPolicy({ ...policy, section3: updatedSections });
  };

  const handlePointChange = (sectionIndex: number, pointIndex: number, value: string, sectionType: 'section3' | 'section4') => {
    if (!policy) return;
    const updatedSections = [...policy[sectionType]];
    // @ts-ignore - TypeScript struggles with indexed access on union types
    updatedSections[sectionIndex].points[pointIndex].point = value;
    setPolicy({ ...policy, [sectionType]: updatedSections });
  };

  const handleAddPoint = (sectionIndex: number, sectionType: 'section3' | 'section4') => {
    if (!policy) return;
    const updatedSections = [...policy[sectionType]];
    // @ts-ignore
    updatedSections[sectionIndex].points.push({ point: '' });
    setPolicy({ ...policy, [sectionType]: updatedSections });
  };

  const handleRemovePoint = (sectionIndex: number, pointIndex: number, sectionType: 'section3' | 'section4') => {
    if (!policy) return;
    const updatedSections = [...policy[sectionType]];
    // @ts-ignore
    updatedSections[sectionIndex].points = updatedSections[sectionIndex].points.filter((_, i) => i !== pointIndex);
    setPolicy({ ...policy, [sectionType]: updatedSections });
  };

  // Section 4 Handlers
  const handleSection4Change = (index: number, field: keyof Section4, value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.section4];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicy({ ...policy, section4: updatedSections });
  };

  const handleAddSection4 = () => {
    if (!policy) return;
    setPolicy({ ...policy, section4: [...policy.section4, { subHeading: '', description: '', points: [{ point: '' }] }] });
  };

  const handleRemoveSection4 = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.section4.filter((_, i) => i !== index);
    setPolicy({ ...policy, section4: updatedSections });
  };

  // Section 5 Handlers
  const handleSection5Change = (index: number, field: keyof Section5, value: string | string[]) => {
    if (!policy) return;
    const updatedSections = [...policy.section5];
    if (field === 'paragraphs') {
      updatedSections[index] = { ...updatedSections[index], [field]: value as string[] };
    } else {
      updatedSections[index] = { ...updatedSections[index], [field]: value as string };
    }
    setPolicy({ ...policy, section5: updatedSections });
  };

  const handleAddSection5 = () => {
    if (!policy) return;
    setPolicy({ ...policy, section5: [...policy.section5, { subHeading: '', paragraphs: [''] }] });
  };

  const handleRemoveSection5 = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.section5.filter((_, i) => i !== index);
    setPolicy({ ...policy, section5: updatedSections });
  };

  const handleParagraphChange = (sectionIndex: number, paragraphIndex: number, value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.section5];
    updatedSections[sectionIndex].paragraphs[paragraphIndex] = value;
    setPolicy({ ...policy, section5: updatedSections });
  };

  const handleAddParagraph = (sectionIndex: number) => {
    if (!policy) return;
    const updatedSections = [...policy.section5];
    updatedSections[sectionIndex].paragraphs.push('');
    setPolicy({ ...policy, section5: updatedSections });
  };

  const handleRemoveParagraph = (sectionIndex: number, paragraphIndex: number) => {
    if (!policy) return;
    const updatedSections = [...policy.section5];
    updatedSections[sectionIndex].paragraphs = updatedSections[sectionIndex].paragraphs.filter((_, i) => i !== paragraphIndex);
    setPolicy({ ...policy, section5: updatedSections });
  };

  // Section 6 Handlers
  const handleSection6Change = (index: number, field: keyof Section6, value: string) => {
    if (!policy) return;
    const updatedSections = [...policy.section6];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPolicy({ ...policy, section6: updatedSections });
  };

  const handleAddSection6 = () => {
    if (!policy) return;
    setPolicy({ ...policy, section6: [...policy.section6, { subHeading: '', description: '' }] });
  };

  const handleRemoveSection6 = (index: number) => {
    if (!policy) return;
    const updatedSections = policy.section6.filter((_, i) => i !== index);
    setPolicy({ ...policy, section6: updatedSections });
  };

  // Input Fields Handlers
  const handleInputFieldChange = (index: number, field: keyof InputField, value: string) => {
    if (!policy) return;
    const updatedFields = [...policy.inputFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setPolicy({ ...policy, inputFields: updatedFields });
  };

  const handleAddInputField = () => {
    if (!policy) return;
    setPolicy({ ...policy, inputFields: [...policy.inputFields, { label: '', placeholder: '', name: '' }] });
  };

  const handleRemoveInputField = (index: number) => {
    if (!policy) return;
    const updatedFields = policy.inputFields.filter((_, i) => i !== index);
    setPolicy({ ...policy, inputFields: updatedFields });
  };


  const handleSavePolicy = async () => {
    if (!policy) return;

    setSaving(true);
    setError(null);
    try {
      const res = await api('/api/privacy-policy', {
        method: 'POST',
        body: JSON.stringify(policy),
      });

      if (res.ok && res.json?.data) {
        setPolicy(res.json.data as PrivacyPolicyData);
        toast.success('Privacy policy saved successfully!');
      } else {
        setError(res.json?.message || 'Failed to save privacy policy');
        toast.error(res.json?.message || 'Failed to save privacy policy');
      }
    } catch (err) {
      console.error('Error saving privacy policy:', err);
      setError('Network error or server unavailable');
      toast.error('Network error or server unavailable');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Privacy Policy</h1>
        <p>Loading policy editor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Edit Privacy Policy</h1>
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={fetchPolicy}>Retry Load</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Privacy Policy</h1>

      {/* Main Heading and Paragraph */}
      <Card>
        <CardHeader>
          <CardTitle>Main Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mainHeading">Main Heading</Label>
            <Input
              id="mainHeading"
              value={policy?.mainHeading || ''}
              onChange={(e) => handlePolicyChange('mainHeading', e.target.value)}
              placeholder="e.g., Privacy Policy"
            />
          </div>
          <div>
            <Label htmlFor="mainParagraph">Main Paragraph</Label>
            <Textarea
              id="mainParagraph"
              value={policy?.mainParagraph || ''}
              onChange={(e) => handlePolicyChange('mainParagraph', e.target.value)}
              placeholder="Provide the main introductory paragraph for the privacy policy."
              rows={5}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 2 (Sub-heading & Paragraph)</CardTitle>
          <Button onClick={handleAddSection2} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Section 2 Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policy?.section2.length === 0 && <p className="text-gray-600 italic">No Section 2 items yet.</p>}
          {policy?.section2.map((section, index) => (
            <Card key={index} className="bg-gray-50 shadow-none border">
              <CardHeader className="flex flex-row items-center justify-between py-3 pr-3 pl-6">
                <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveSection2(index)}
                  aria-label="Remove section 2 item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div>
                  <Label htmlFor={`section2-subheading-${index}`}>Sub-heading</Label>
                  <Input
                    id={`section2-subheading-${index}`}
                    value={section.subHeading}
                    onChange={(e) => handleSection2Change(index, 'subHeading', e.target.value)}
                    placeholder="e.g., Information We Collect"
                  />
                </div>
                <div>
                  <Label htmlFor={`section2-paragraph-${index}`}>Paragraph</Label>
                  <Textarea
                    id={`section2-paragraph-${index}`}
                    value={section.paragraph}
                    onChange={(e) => handleSection2Change(index, 'paragraph', e.target.value)}
                    placeholder="Provide detailed content for this paragraph."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 3 (Sub-heading, Description & 5 Points)</CardTitle>
          <Button onClick={handleAddSection3} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Section 3 Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policy?.section3.length === 0 && <p className="text-gray-600 italic">No Section 3 items yet.</p>}
          {policy?.section3.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="bg-gray-50 shadow-none border">
              <CardHeader className="flex flex-row items-center justify-between py-3 pr-3 pl-6">
                <CardTitle className="text-lg">Item {sectionIndex + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveSection3(sectionIndex)}
                  aria-label="Remove section 3 item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div>
                  <Label htmlFor={`section3-subheading-${sectionIndex}`}>Sub-heading</Label>
                  <Input
                    id={`section3-subheading-${sectionIndex}`}
                    value={section.subHeading}
                    onChange={(e) => handleSection3Change(sectionIndex, 'subHeading', e.target.value)}
                    placeholder="e.g., How We Use Your Information"
                  />
                </div>
                <div>
                  <Label htmlFor={`section3-description-${sectionIndex}`}>Description</Label>
                  <Textarea
                    id={`section3-description-${sectionIndex}`}
                    value={section.description}
                    onChange={(e) => handleSection3Change(sectionIndex, 'description', e.target.value)}
                    placeholder="Provide a brief description."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Points (up to 5)</Label>
                  {section.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-center space-x-2">
                      <Input
                        value={point.point}
                        onChange={(e) => handlePointChange(sectionIndex, pointIndex, e.target.value, 'section3')}
                        placeholder="Enter a point"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemovePoint(sectionIndex, pointIndex, 'section3')}
                        aria-label="Remove point"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {section.points.length < 5 && (
                    <Button onClick={() => handleAddPoint(sectionIndex, 'section3')} variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Point
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 4 (Sub-heading, Description & 3 Points)</CardTitle>
          <Button onClick={handleAddSection4} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Section 4 Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policy?.section4.length === 0 && <p className="text-gray-600 italic">No Section 4 items yet.</p>}
          {policy?.section4.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="bg-gray-50 shadow-none border">
              <CardHeader className="flex flex-row items-center justify-between py-3 pr-3 pl-6">
                <CardTitle className="text-lg">Item {sectionIndex + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveSection4(sectionIndex)}
                  aria-label="Remove section 4 item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div>
                  <Label htmlFor={`section4-subheading-${sectionIndex}`}>Sub-heading</Label>
                  <Input
                    id={`section4-subheading-${sectionIndex}`}
                    value={section.subHeading}
                    onChange={(e) => handleSection4Change(sectionIndex, 'subHeading', e.target.value)}
                    placeholder="e.g., Data Security"
                  />
                </div>
                <div>
                  <Label htmlFor={`section4-description-${sectionIndex}`}>Description</Label>
                  <Textarea
                    id={`section4-description-${sectionIndex}`}
                    value={section.description}
                    onChange={(e) => handleSection4Change(sectionIndex, 'description', e.target.value)}
                    placeholder="Provide a brief description."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Points (up to 3)</Label>
                  {section.points.map((point, pointIndex) => (
                    <div key={pointIndex} className="flex items-center space-x-2">
                      <Input
                        value={point.point}
                        onChange={(e) => handlePointChange(sectionIndex, pointIndex, e.target.value, 'section4')}
                        placeholder="Enter a point"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemovePoint(sectionIndex, pointIndex, 'section4')}
                        aria-label="Remove point"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {section.points.length < 3 && (
                    <Button onClick={() => handleAddPoint(sectionIndex, 'section4')} variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Point
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Section 5 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 5 (Sub-heading & 3 Paragraphs)</CardTitle>
          <Button onClick={handleAddSection5} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Section 5 Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policy?.section5.length === 0 && <p className="text-gray-600 italic">No Section 5 items yet.</p>}
          {policy?.section5.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="bg-gray-50 shadow-none border">
              <CardHeader className="flex flex-row items-center justify-between py-3 pr-3 pl-6">
                <CardTitle className="text-lg">Item {sectionIndex + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveSection5(sectionIndex)}
                  aria-label="Remove section 5 item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div>
                  <Label htmlFor={`section5-subheading-${sectionIndex}`}>Sub-heading</Label>
                  <Input
                    id={`section5-subheading-${sectionIndex}`}
                    value={section.subHeading}
                    onChange={(e) => handleSection5Change(sectionIndex, 'subHeading', e.target.value)}
                    placeholder="e.g., Your Rights"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Paragraphs (up to 3)</Label>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <div key={paragraphIndex} className="flex items-center space-x-2">
                      <Textarea
                        value={paragraph}
                        onChange={(e) => handleParagraphChange(sectionIndex, paragraphIndex, e.target.value)}
                        placeholder="Enter a paragraph"
                        rows={3}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveParagraph(sectionIndex, paragraphIndex)}
                        aria-label="Remove paragraph"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {section.paragraphs.length < 3 && (
                    <Button onClick={() => handleAddParagraph(sectionIndex)} variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Paragraph
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Section 6 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Section 6 (Sub-heading & Description)</CardTitle>
          <Button onClick={handleAddSection6} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Section 6 Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policy?.section6.length === 0 && <p className="text-gray-600 italic">No Section 6 items yet.</p>}
          {policy?.section6.map((section, index) => (
            <Card key={index} className="bg-gray-50 shadow-none border">
              <CardHeader className="flex flex-row items-center justify-between py-3 pr-3 pl-6">
                <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveSection6(index)}
                  aria-label="Remove section 6 item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div>
                  <Label htmlFor={`section6-subheading-${index}`}>Sub-heading</Label>
                  <Input
                    id={`section6-subheading-${index}`}
                    value={section.subHeading}
                    onChange={(e) => handleSection6Change(index, 'subHeading', e.target.value)}
                    placeholder="e.g., Changes to This Policy"
                  />
                </div>
                <div>
                  <Label htmlFor={`section6-description-${index}`}>Description</Label>
                  <Textarea
                    id={`section6-description-${index}`}
                    value={section.description}
                    onChange={(e) => handleSection6Change(index, 'description', e.target.value)}
                    placeholder="Provide detailed content for this description."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Input Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Input Fields (Labels & Placeholders)</CardTitle>
          <Button onClick={handleAddInputField} variant="outline" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" /> Add Input Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {policy?.inputFields.length === 0 && <p className="text-gray-600 italic">No input fields yet.</p>}
          {policy?.inputFields.map((field, index) => (
            <Card key={index} className="bg-gray-50 shadow-none border">
              <CardHeader className="flex flex-row items-center justify-between py-3 pr-3 pl-6">
                <CardTitle className="text-lg">Field {index + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveInputField(index)}
                  aria-label="Remove input field"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 px-6 pb-6">
                <div>
                  <Label htmlFor={`input-label-${index}`}>Label</Label>
                  <Input
                    id={`input-label-${index}`}
                    value={field.label}
                    onChange={(e) => handleInputFieldChange(index, 'label', e.target.value)}
                    placeholder="e.g., Your Name"
                  />
                </div>
                <div>
                  <Label htmlFor={`input-placeholder-${index}`}>Placeholder</Label>
                  <Input
                    id={`input-placeholder-${index}`}
                    value={field.placeholder}
                    onChange={(e) => handleInputFieldChange(index, 'placeholder', e.target.value)}
                    placeholder="e.g., Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor={`input-name-${index}`}>Name (Unique Identifier)</Label>
                  <Input
                    id={`input-name-${index}`}
                    value={field.name}
                    onChange={(e) => handleInputFieldChange(index, 'name', e.target.value)}
                    placeholder="e.g., fullName (must be unique)"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSavePolicy} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} Save Privacy Policy
        </Button>
      </div>
    </div>
  );
};

