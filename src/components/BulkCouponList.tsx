import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Mail, 
  Send, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Calendar,
  Tag,
  Percent,
  IndianRupee,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  MoreHorizontal,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface BulkCoupon {
  _id: string;
  code: string;
  name: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number;
  usageLimitPerUser: number;
  usedCount: number;
  remainingUsage: number;
  offerText?: string;
  description?: string;
  termsAndConditions?: string;
  expiryDate: string;
  isActive: boolean;
  isPublic: boolean;
  sentTo: Array<{
    userId?: string;
    email: string;
    sentAt: string;
    isUsed: boolean;
  }>;
  usedBy: Array<{
    userId: string;
    email: string;
    usedAt: string;
    orderAmount: number;
    discountAmount: number;
  }>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BulkCouponListProps {
  onEdit?: (coupon: BulkCoupon) => void;
  refreshKey?: number;
}

export default function BulkCouponList({ onEdit, refreshKey = 0 }: BulkCouponListProps) {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<BulkCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCoupon, setSelectedCoupon] = useState<BulkCoupon | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [sendingEmails, setSendingEmails] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(status !== 'all' && { status }),
        ...(search && { search }),
      });

      const response = await api(`/api/bulk-coupons?${params}`);
      if (response.ok) {
        setCoupons(response.json.data);
        setTotalPages(response.json.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch bulk coupons',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [page, status, search, refreshKey]);

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this bulk coupon? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api(`/api/bulk-coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Bulk coupon deleted successfully',
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bulk coupon',
        variant: 'destructive',
      });
    }
  };

  const handleSendEmails = async () => {
    if (!selectedCoupon || !emailRecipients.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter recipient emails',
        variant: 'destructive',
      });
      return;
    }

    const emails = emailRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email.includes('@'));

    if (emails.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter valid email addresses',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSendingEmails(true);
      const response = await api(`/api/bulk-coupons/${selectedCoupon._id}/send-emails`, {
        method: 'POST',
        body: JSON.stringify({ recipientEmails: emails }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Emails sent to ${response.json.data.sentCount} recipients`,
        });
        setShowEmailDialog(false);
        setEmailRecipients('');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      toast({
        title: 'Error',
        description: 'Failed to send emails',
        variant: 'destructive',
      });
    } finally {
      setSendingEmails(false);
    }
  };

  const getStatusBadge = (coupon: BulkCoupon) => {
    const isExpired = new Date(coupon.expiryDate) < new Date();
    const isFullyUsed = coupon.usedCount >= coupon.usageLimit;

    if (!coupon.isActive || isExpired || isFullyUsed) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const formatDiscount = (coupon: BulkCoupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    }
    return `₹${coupon.discountValue}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Bulk Coupons
            </span>
            <Button onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search coupons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coupons</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {coupons.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bulk coupons found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first bulk coupon to get started
              </p>
              <Button onClick={() => window.location.reload()}>
                Create Bulk Coupon
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => (
                    <TableRow key={coupon._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            {coupon.code}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{coupon.name}</p>
                          {coupon.offerText && (
                            <p className="text-sm text-muted-foreground">{coupon.offerText}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {coupon.discountType === 'percentage' ? (
                            <Percent className="h-4 w-4" />
                          ) : (
                            <IndianRupee className="h-4 w-4" />
                          )}
                          <span className="font-medium">{formatDiscount(coupon)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{coupon.usedCount}/{coupon.usageLimit}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{
                                width: `${(coupon.usedCount / coupon.usageLimit) * 100}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{formatDate(coupon.expiryDate)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(coupon)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{coupon.sentTo.length}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit?.(coupon)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCoupon(coupon);
                              setShowEmailDialog(true);
                            }}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coupon._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coupon Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Coupon Details
            </DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Basic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Code:</span>
                        <Badge variant="outline" className="font-mono">
                          {selectedCoupon.code}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{selectedCoupon.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        {getStatusBadge(selectedCoupon)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Public:</span>
                        <Badge variant={selectedCoupon.isPublic ? 'default' : 'secondary'}>
                          {selectedCoupon.isPublic ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span className="text-sm">{formatDate(selectedCoupon.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Discount Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{selectedCoupon.discountType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Value:</span>
                        <span className="font-medium">{formatDiscount(selectedCoupon)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Order:</span>
                        <span className="font-medium">₹{selectedCoupon.minOrderAmount}</span>
                      </div>
                      {selectedCoupon.maxDiscountAmount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Discount:</span>
                          <span className="font-medium">₹{selectedCoupon.maxDiscountAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Expiry:</span>
                        <span className="font-medium">{formatDate(selectedCoupon.expiryDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-4">Usage Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {selectedCoupon.usedCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Uses</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedCoupon.remainingUsage}
                      </div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedCoupon.sentTo.length}
                      </div>
                      <p className="text-sm text-muted-foreground">Email Recipients</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedCoupon.description && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Description</h4>
                    <p className="text-sm">{selectedCoupon.description}</p>
                  </CardContent>
                </Card>
              )}

              {selectedCoupon.termsAndConditions && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Terms & Conditions</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedCoupon.termsAndConditions}</p>
                  </CardContent>
                </Card>
              )}

              {selectedCoupon.usedBy.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-4">Recent Usage</h4>
                    <div className="space-y-2">
                      {selectedCoupon.usedBy.slice(0, 5).map((usage, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded">
                          <div>
                            <p className="font-medium">{usage.email}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(usage.usedAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{usage.discountAmount}</p>
                            <p className="text-sm text-muted-foreground">
                              Order: ₹{usage.orderAmount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Coupon Emails
            </DialogTitle>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Send coupon <Badge variant="outline">{selectedCoupon.code}</Badge> to additional users
                </p>
                <Textarea
                  placeholder="Enter email addresses separated by commas..."
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmails} disabled={sendingEmails}>
                  {sendingEmails ? 'Sending...' : 'Send Emails'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
