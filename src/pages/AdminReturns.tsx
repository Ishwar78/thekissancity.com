import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { LayoutDashboard, Package, Receipt, Users2, CreditCard, Truck, Tags, MessageCircle, Megaphone, Star, Percent, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReturnOrderItem { title?: string; qty?: number; price?: number; image?: string }
interface ReturnOrder {
  _id: string;
  userId?: { _id: string; name?: string; email?: string } | string;
  items: ReturnOrderItem[];
  total: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  deliveredAt?: string;
  returnStatus?: 'Pending' | 'Approved' | 'Rejected' | 'None';
  returnReason?: string;
  refundUpiId?: string;
  refundMethod?: 'upi' | 'bank';
  refundBankDetails?: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  returnRequestedAt?: string;
  returnPhoto?: string;
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'coupons', label: 'Coupon Management', icon: Percent },
  { id: 'pages', label: 'Pages', icon: LayoutDashboard },
  { id: 'orders', label: 'Orders', icon: Receipt },
  { id: 'returns', label: 'Return Requests', icon: Receipt },
  { id: 'users', label: 'Users', icon: Users2 },
  { id: 'reviews', label: 'User Reviews', icon: Star },
  { id: 'notifications', label: 'Notifications', icon: Megaphone },
  { id: 'home', label: 'Home Ticker & New Arrivals', icon: LayoutDashboard },
  { id: 'support', label: 'Support Center', icon: MessageCircle },
  { id: 'contact', label: 'Contact Settings', icon: MessageCircle },
  { id: 'billing', label: 'Company Billing Details', icon: CreditCard },
  { id: 'payment', label: 'Payment Settings', icon: CreditCard },
  { id: 'razorpaySettings', label: 'Razorpay Settings', icon: CreditCard },
  { id: 'shiprocket', label: 'Shiprocket Settings', icon: Truck },
] as const;

export default function AdminReturns() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rows, setRows] = useState<ReturnOrder[]>([]);
  const [fetching, setFetching] = useState(true);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('Your return request update');
  const [emailHtml, setEmailHtml] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) navigate('/auth', { replace: true });
      else if (user.role !== 'admin') navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => { void fetchReturns(); }, []);

  console.log('🔄 [AdminReturns] Component Render - Rows count:', rows.length);

  const fetchReturns = async () => {
    try {
      setFetching(true);
      const url = '/api/orders/returns?v=' + Date.now();
      console.log('📡 [AdminReturns] Fetching returns:', url);
      const res = await api(url);
      console.log('📡 [AdminReturns] Fetch Response:', { ok: res.ok, jsonOk: res.json?.ok });
      
      if (res.ok && res.json?.ok) {
        const data = Array.isArray(res.json.data) ? res.json.data : [];
        console.log('📡 [AdminReturns] Fetched data length:', data.length);
        console.log('📡 [AdminReturns] Sample data (first row status):', data[0]?.returnStatus);
        setRows(data);
      }
    } catch (err) {
      console.error('❌ [AdminReturns] Fetch error:', err);
    } finally {
      setFetching(false);
    }
  };

  const updateStatus = async (orderId: string, value: 'Pending' | 'Approved' | 'Rejected') => {
    console.log('🚀 [AdminReturns] updateStatus start:', { orderId, value });
    
    // Optimistic Update: Update local UI immediately
    const previousRows = [...rows];
    setRows(current => current.map(row => 
      row._id === orderId ? { ...row, returnStatus: value } : row
    ));

    try {
      const res = await api(`/api/orders/${orderId}/admin-update`, {
        method: 'PUT',
        body: JSON.stringify({ returnStatus: value }),
      });
      
      console.log('🚀 [AdminReturns] API response status ok:', res.ok);
      
      if (res.ok) {
        toast({ title: 'Status updated' });
        console.log('🚀 [AdminReturns] Success toast shown, calling fetchReturns...');
        // Refresh data from server to ensure UI is perfectly in sync and pick up other side-effects
        await fetchReturns();
        console.log('🚀 [AdminReturns] fetchReturns completed');
        
        // Send email update if not Approved
        if (value !== 'Approved') {
          // Note: we use current rows from the CLOSURE which is the old state, 
          // but we just need the user email which shouldn't have changed.
          const row = previousRows.find(r => r._id === orderId);
          console.log('🚀 [AdminReturns] Mailing logic - current row found:', !!row);
          const userEmail = (row?.userId && typeof row.userId === 'object') ? (row.userId.email || '') : '';
          if (userEmail) {
            console.log('🚀 [AdminReturns] Sending mail to:', userEmail);
            const subj = value === 'Rejected' ? 'Return Rejected' : 'Return Update';
            const html = `<p>Hello ${(row?.userId as any)?.name || ''},</p><p>Your return request for order #${orderId.slice(0, 8).toUpperCase()} is <b>${value}</b>.</p>`;
            const mailRes = await api('/api/orders/send-mail', { method: 'POST', body: JSON.stringify({ to: userEmail, subject: subj, html }) });
            console.log('🚀 [AdminReturns] Mail response ok:', mailRes.ok);
          }
        }
      } else {
        console.warn('🚀 [AdminReturns] API update returned not ok, rolling back...');
        setRows(previousRows);
        toast({ title: res.json?.message || 'Failed to update', variant: 'destructive' });
      }
    } catch (e: any) {
      console.error('❌ [AdminReturns] Error updating status:', e);
      setRows(previousRows);
      toast({ title: e?.message || 'Failed to update', variant: 'destructive' });
    }
  };

  const openEmail = (row: ReturnOrder) => {
    const to = (row.userId && typeof row.userId === 'object') ? (row.userId.email || '') : '';
    const refundText = row.refundMethod === 'bank' && row.refundBankDetails
      ? `Bank Account: ${row.refundBankDetails.accountHolderName}, ${row.refundBankDetails.bankName}, A/C: ${row.refundBankDetails.accountNumber}, IFSC: ${row.refundBankDetails.ifscCode}`
      : `UPI: ${row.refundUpiId || '-'}`;
    setEmailTo(to);
    setEmailSubject('Refund processed for order #' + row._id.slice(0, 8).toUpperCase());
    setEmailHtml(`<p>Hello ${(row.userId as any)?.name || ''},</p><p>Your refund for order #${row._id.slice(0, 8).toUpperCase()} has been processed to ${refundText}.</p>`);
    setEmailOpen(true);
  };

  const sendEmail = async () => {
    try {
      setEmailSending(true);
      const { ok, json } = await api('/api/orders/send-mail', { method: 'POST', body: JSON.stringify({ to: emailTo, subject: emailSubject, html: emailHtml }) });
      if (ok) {
        toast({ title: 'Email sent' });
        setEmailOpen(false);
      } else {
        toast({ title: json?.message || 'Failed to send email', variant: 'destructive' });
      }
    } finally {
      setEmailSending(false);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden mb-4 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sidebar */}
          <aside
            className={cn(
              'transition-all duration-300 ease-in-out',
              'w-full md:w-64',
              isSidebarOpen ? 'block' : 'hidden md:block'
            )}
          >
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Admin Navigation</span>
              </div>
              <div className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === 'returns';
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'returns') {
                          setIsSidebarOpen(false);
                        } else if (item.id === 'support') {
                          navigate('/admin/support');
                          setIsSidebarOpen(false);
                        } else {
                          navigate(`/admin?tab=${item.id}`);
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0 space-y-4 sm:space-y-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Return Requests</h1>
              <p className="text-sm text-muted-foreground">Review and process product return requests</p>
            </div>

            <Card className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse" style={{ tableLayout: 'fixed', minWidth: '900px' }}>
                  <colgroup>
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '200px' }} />
                    <col style={{ width: '150px' }} />
                    <col style={{ width: '190px' }} />
                    <col style={{ width: '120px' }} />
                    <col style={{ width: '145px' }} />
                    <col style={{ width: '160px' }} />
                  </colgroup>
                  <thead>
                    <tr className="text-left text-muted-foreground border-b">
                      <th className="py-2 pr-3 font-medium">Order ID</th>
                      <th className="py-2 pr-3 font-medium">User Name & Email</th>
                      <th className="py-2 pr-3 font-medium">Product Details</th>
                      <th className="py-2 pr-3 font-medium">Return Reason</th>
                      <th className="py-2 pr-3 font-medium">Refund Details</th>
                      <th className="py-2 pr-3 font-medium">Date</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fetching ? (
                      <tr>
                        <td className="py-8 text-center text-muted-foreground" colSpan={8}>Loading...</td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td className="py-8 text-center text-muted-foreground" colSpan={8}>No return requests</td>
                      </tr>
                    ) : (
                      rows.map(row => {
                        const first = (row.items || [])[0] || {};
                        const d = row.returnRequestedAt || row.updatedAt || row.createdAt;
                        const u = typeof row.userId === 'object' ? row.userId : undefined;
                        return (
                          <tr key={row._id} className="border-b last:border-b-0 align-top">
                            {/* Order ID */}
                            <td className="py-3 pr-3">
                              <span className="font-mono text-xs">{row._id.slice(0, 8).toUpperCase()}</span>
                            </td>

                            {/* User Name & Email */}
                            <td className="py-3 pr-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium truncate">{u?.name || '-'}</span>
                                <span className="text-xs text-muted-foreground truncate">{u?.email || '-'}</span>
                              </div>
                            </td>

                            {/* Product Details */}
                            <td className="py-3 pr-3">
                              <div className="flex items-start gap-2">
                                <img
                                  src={first.image || '/placeholder.svg'}
                                  alt={first.title || 'Product'}
                                  className="w-10 h-10 object-cover rounded border flex-shrink-0 mt-0.5"
                                />
                                <div className="min-w-0">
                                  <div className="font-medium text-xs leading-snug break-words">{first.title || '-'}</div>
                                  <div className="text-xs text-muted-foreground mt-0.5">Qty {first.qty || 0}</div>
                                </div>
                              </div>
                            </td>

                            {/* Return Reason */}
                            <td className="py-3 pr-3">
                              <div className="text-xs break-words leading-snug">{row.returnReason || '-'}</div>
                              {row.returnPhoto && (
                                <div className="mt-2">
                                  <a 
                                    href={row.returnPhoto} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-primary hover:underline flex items-center gap-1"
                                  >
                                    <Eye className="h-3 w-3" /> View Photo
                                  </a>
                                  <img 
                                    src={row.returnPhoto} 
                                    alt="Return evidence" 
                                    className="w-16 h-16 object-cover rounded mt-1 border cursor-zoom-in hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(row.returnPhoto, '_blank')}
                                  />
                                </div>
                              )}
                            </td>

                            {/* Refund Details */}
                            <td className="py-3 pr-3">
                              {row.refundMethod === 'bank' && row.refundBankDetails ? (
                                <div className="text-xs space-y-0.5">
                                  <div><span className="font-semibold">Name:</span> {row.refundBankDetails.accountHolderName}</div>
                                  <div><span className="font-semibold">Bank:</span> {row.refundBankDetails.bankName}</div>
                                  <div><span className="font-semibold">A/C:</span> {row.refundBankDetails.accountNumber}</div>
                                  <div><span className="font-semibold">IFSC:</span> {row.refundBankDetails.ifscCode}</div>
                                </div>
                              ) : (
                                <div className="text-xs">
                                  <span className="font-semibold">UPI:</span>{' '}
                                  <span className="font-mono break-all">{row.refundUpiId || '-'}</span>
                                </div>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-3 pr-3">
                              <div className="text-xs whitespace-nowrap">
                                {new Date(d as any).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(d as any).toLocaleTimeString()}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3 pr-3">
                              <select
                                value={row.returnStatus || 'Pending'}
                                onChange={(e) => updateStatus(row._id, e.target.value as 'Pending' | 'Approved' | 'Rejected')}
                                className="w-[130px] h-8 text-xs px-2 rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-gray-400"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="py-3">
                              <div className="flex flex-col gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs px-2 w-full"
                                  onClick={() => navigate(`/admin/orders/${row._id}/invoice`)}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs px-2 w-full"
                                  onClick={() => openEmail(row)}
                                >
                                  Process Refund
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>To</Label>
              <Input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            </div>
            <div>
              <Label>HTML Content</Label>
              <textarea
                className="w-full h-40 border rounded p-2 text-sm
                           text-slate-900 dark:text-slate-100
                           placeholder:text-slate-500 dark:placeholder:text-slate-400
                           caret-primary"
                placeholder="Write HTML here..."
                value={emailHtml}
                onChange={(e) => setEmailHtml(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={sendEmail} 
                disabled={emailSending}
                className="bg-black text-white border-black hover:bg-gray-800 hover:text-white focus-visible:bg-gray-800 focus-visible:text-white active:bg-gray-800 active:text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailSending ? 'Sending…' : 'Send'}
              </button>
              <button 
                type="button"
                onClick={() => setEmailOpen(false)}
                className="bg-white text-black border-gray-300 hover:border-gray-400 hover:bg-gray-50 focus-visible:border-gray-400 focus-visible:bg-gray-50 active:border-gray-400 active:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}