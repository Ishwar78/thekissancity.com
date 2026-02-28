import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Users, 
  Send, 
  Plus, 
  X, 
  Calculator,
  Calendar,
  Tag,
  Percent,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkCouponFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
  editingCoupon?: any;
}

export default function BulkCouponForm({ onSubmit, loading = false, editingCoupon }: BulkCouponFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '0',
    maxDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: '1',
    offerText: '',
    description: '',
    termsAndConditions: '',
    expiryDate: '',
    isPublic: false,
    sendToUsers: false,
    recipientEmails: [] as string[],
  });

  const [emailInput, setEmailInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Populate form when editing coupon
  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code || '',
        name: editingCoupon.name || '',
        discountType: editingCoupon.discountType || 'percentage',
        discountValue: editingCoupon.discountValue?.toString() || '',
        minOrderAmount: editingCoupon.minOrderAmount?.toString() || '0',
        maxDiscountAmount: editingCoupon.maxDiscountAmount?.toString() || '',
        usageLimit: editingCoupon.usageLimit?.toString() || '',
        usageLimitPerUser: editingCoupon.usageLimitPerUser?.toString() || '1',
        offerText: editingCoupon.offerText || '',
        description: editingCoupon.description || '',
        termsAndConditions: editingCoupon.termsAndConditions || '',
        expiryDate: editingCoupon.expiryDate ? new Date(editingCoupon.expiryDate).toISOString().split('T')[0] : '',
        isPublic: editingCoupon.isPublic || false,
        sendToUsers: false,
        recipientEmails: [],
      });
    } else {
      // Reset form for new coupon
      setFormData({
        code: '',
        name: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '0',
        maxDiscountAmount: '',
        usageLimit: '',
        usageLimitPerUser: '1',
        offerText: '',
        description: '',
        termsAndConditions: '',
        expiryDate: '',
        isPublic: false,
        sendToUsers: false,
        recipientEmails: [],
      });
    }
  }, [editingCoupon]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addEmailRecipient = () => {
    if (emailInput && emailInput.includes('@') && !formData.recipientEmails.includes(emailInput)) {
      setFormData(prev => ({
        ...prev,
        recipientEmails: [...prev.recipientEmails, emailInput.trim()]
      }));
      setEmailInput('');
    }
  };

  const removeEmailRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      recipientEmails: prev.recipientEmails.filter(e => e !== email)
    }));
  };

  const validateForm = () => {
    if (!formData.code || !formData.name || !formData.discountValue || !formData.usageLimit || !formData.expiryDate) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.discountType === 'percentage' && (Number(formData.discountValue) < 0 || Number(formData.discountValue) > 100)) {
      toast({
        title: 'Validation Error',
        description: 'Percentage discount must be between 0 and 100',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.discountType === 'flat' && Number(formData.discountValue) < 0) {
      toast({
        title: 'Validation Error',
        description: 'Flat discount must be positive',
        variant: 'destructive',
      });
      return false;
    }

    if (formData.sendToUsers && formData.recipientEmails.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one email recipient',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
      usageLimit: Number(formData.usageLimit),
      usageLimitPerUser: Number(formData.usageLimitPerUser),
    };

    onSubmit(submitData);
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {editingCoupon ? 'Edit Bulk Coupon' : 'Create Bulk Coupon'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="discount">Discount Details</TabsTrigger>
                <TabsTrigger value="distribution">Distribution</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Coupon Code *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                        placeholder="e.g., SAVE20"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={generateCouponCode}>
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Coupon Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Summer Sale Special"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date *</Label>
                    <Input
                      id="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usageLimit">Usage Limit *</Label>
                    <Input
                      id="usageLimit"
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                      placeholder="Total number of uses"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your coupon offer..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="termsAndConditions">Terms & Conditions</Label>
                  <Textarea
                    id="termsAndConditions"
                    value={formData.termsAndConditions}
                    onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                    placeholder="Terms and conditions for this coupon..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isPublic">Public Coupon</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow anyone to discover and use this coupon
                    </p>
                  </div>
                  <Switch
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="discount" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) => handleInputChange('discountType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Percentage
                          </div>
                        </SelectItem>
                        <SelectItem value="flat">
                          <div className="flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            Flat Amount
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      Discount Value *
                      {formData.discountType === 'percentage' && ' (%)'}
                      {formData.discountType === 'flat' && ' (₹)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', e.target.value)}
                      placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                    />
                  </div>
                </div>

                {formData.discountType === 'percentage' && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscountAmount">Maximum Discount Amount (₹)</Label>
                    <Input
                      id="maxDiscountAmount"
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => handleInputChange('maxDiscountAmount', e.target.value)}
                      placeholder="e.g., 500"
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: Set a maximum discount amount for percentage coupons
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                      placeholder="e.g., 500"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
                    <Input
                      id="usageLimitPerUser"
                      type="number"
                      value={formData.usageLimitPerUser}
                      onChange={(e) => handleInputChange('usageLimitPerUser', e.target.value)}
                      placeholder="e.g., 1"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offerText">Offer Text</Label>
                  <Input
                    id="offerText"
                    value={formData.offerText}
                    onChange={(e) => handleInputChange('offerText', e.target.value)}
                    placeholder="e.g., Get 20% off on your first order!"
                  />
                </div>
              </TabsContent>

              <TabsContent value="distribution" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sendToUsers">Send to Specific Users</Label>
                    <p className="text-sm text-muted-foreground">
                      Send this coupon directly to specific users via email
                    </p>
                  </div>
                  <Switch
                    id="sendToUsers"
                    checked={formData.sendToUsers}
                    onCheckedChange={(checked) => handleInputChange('sendToUsers', checked)}
                  />
                </div>

                {formData.sendToUsers && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email Recipients</Label>
                      <div className="flex gap-2">
                        <Input
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Enter email address"
                          onKeyPress={(e) => e.key === 'Enter' && addEmailRecipient()}
                        />
                        <Button type="button" onClick={addEmailRecipient}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {formData.recipientEmails.length > 0 && (
                      <div className="space-y-2">
                        <Label>Recipients ({formData.recipientEmails.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {formData.recipientEmails.map((email) => (
                            <Badge key={email} variant="secondary" className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {email}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => removeEmailRecipient(email)}
                              />
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-1">Email Preview</p>
                          <p>This coupon will be sent to {formData.recipientEmails.length} recipient(s) with a beautifully designed email template.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!formData.sendToUsers && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Private Coupon</p>
                        <p>This coupon will only be available to users who receive the email. It won't be publicly discoverable.</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Bulk Coupon'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Coupon Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Code</Label>
                  <p className="font-mono font-bold text-lg">{formData.code || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-semibold">{formData.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Discount</Label>
                  <p className="font-semibold">
                    {formData.discountType === 'percentage' 
                      ? `${formData.discountValue}%` 
                      : `₹${formData.discountValue}`
                    }
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Usage Limit</Label>
                  <p className="font-semibold">{formData.usageLimit} uses</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Per User Limit</Label>
                  <p className="font-semibold">{formData.usageLimitPerUser} uses</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Expiry Date</Label>
                  <p className="font-semibold">{formData.expiryDate || 'N/A'}</p>
                </div>
              </div>
              
              {formData.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="text-sm">{formData.description}</p>
                </div>
              )}

              {formData.sendToUsers && (
                <div>
                  <Label className="text-sm text-muted-foreground">Email Recipients</Label>
                  <p className="text-sm">{formData.recipientEmails.length} users will receive this coupon</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
