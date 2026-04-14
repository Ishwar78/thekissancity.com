import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import {
  ChevronRight, Search, Loader2, LayoutDashboard, Package, Receipt,
  Users2, CreditCard, Truck, Tags, MessageCircle, Megaphone, Star, Percent, Menu,
  MapPin, ShoppingBag, Phone, Hash, IndianRupee, CreditCard as PayIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SupportTicket = {
  _id: string;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'accepted' | 'rejected' | 'closed';
  createdAt: string;
  purchaseDate?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  orderId?: {
    _id: string;
    status: string;
    paymentMethod: string;
    total: number;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    items: any[];
  };
  productId?: {
    _id: string;
    title: string;
    image?: string;
    price: number;
  };
  replies?: Array<{
    _id?: string;
    authorId: any;
    message: string;
    createdAt: string;
  }>;
};

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

export default function SupportCenter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) navigate('/auth', { replace: true });
    else if (user.role !== 'admin') navigate('/dashboard', { replace: true });
  }, [loading, user, navigate]);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SupportTicket['status']>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState<SupportTicket['status']>('pending');
  const [savingReply, setSavingReply] = useState(false);

  useEffect(() => { fetchTickets(); }, [statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const { ok, json } = await api(`/api/support/admin/tickets?status=${statusFilter}&v=${Date.now()}`, { cache: 'no-store' as any });
      if (ok && json?.ok) setTickets(json.data || []);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoadingTickets(false); }
  };

  const handleOpenTicket = async (ticketId: string) => {
    try {
      const { ok, json } = await api(`/api/support/admin/tickets/${ticketId}?v=${Date.now()}`, { cache: 'no-store' as any });
      if (!ok || !json?.ok) { toast.error('Failed to load ticket details'); return; }

      let ticket = json.data as any;

      if (ticket?.productId && (!ticket.productId.image || !ticket.productId.title)) {
        const pid = typeof ticket.productId === 'object' ? ticket.productId._id : ticket.productId;
        if (pid) {
          try {
            const { ok: pok, json: pjson } = await api(`/api/products/${pid}`);
            if (pok && pjson?.data) {
              const p = pjson.data;
              ticket = {
                ...ticket,
                productId: {
                  _id: pid,
                  title: ticket.productId?.title || p.title,
                  image: ticket.productId?.image || p.image_url || (Array.isArray(p.images) ? p.images[0] : undefined),
                  price: ticket.productId?.price || p.price,
                },
              };
            }
          } catch { }
        }
      }

      if (ticket?.orderId && (!ticket.orderId.items?.length || !ticket.orderId.address)) {
        try {
          const oid = typeof ticket.orderId === 'object' ? (ticket.orderId._id || ticket.orderId.id) : ticket.orderId;
          const { ok: ook, json: ojson } = await api(`/api/admin/orders/${oid}`, { cache: 'no-store' as any });
          if (ook && ojson?.data) {
            const od = ojson.data;
            const shipping = od.shipping || {};
            ticket = {
              ...ticket,
              orderId: {
                _id: od.id || oid,
                status: od.status || ticket.orderId.status,
                paymentMethod: od.paymentMethod || ticket.orderId.paymentMethod,
                total: od.totals?.total || ticket.orderId.total,
                name: shipping.name || ticket.orderId.name,
                phone: shipping.phone || ticket.orderId.phone,
                address: shipping.address1 || ticket.orderId.address,
                city: shipping.city || ticket.orderId.city,
                state: shipping.state || ticket.orderId.state,
                pincode: shipping.pincode || ticket.orderId.pincode,
                items: Array.isArray(od.items) ? od.items : ticket.orderId.items,
              },
            };
          }
        } catch { }
      }

      setSelectedTicket(ticket);
      setNewStatus(ticket.status);
      setReplyMessage('');
      setShowModal(true);
    } catch { toast.error('Failed to load ticket details'); }
  };

  const handleSaveReply = async () => {
    if (!selectedTicket || (!replyMessage.trim() && newStatus === selectedTicket.status)) {
      toast.error('Please add a reply or change the status');
      return;
    }
    try {
      setSavingReply(true);
      const { ok, json } = await api(`/api/support/admin/tickets/${selectedTicket._id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, message: replyMessage || undefined }),
      });
      if (ok && json?.ok) {
        toast.success('Ticket updated successfully');
        setReplyMessage('');
        setShowModal(false);
        await fetchTickets();
      } else {
        toast.error(json?.message || 'Failed to update ticket');
      }
    } catch { toast.error('Failed to update ticket'); }
    finally { setSavingReply(false); }
  };

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase();
    return tickets.filter(t =>
      t.subject.toLowerCase().includes(q) ||
      t.userId?.name.toLowerCase().includes(q) ||
      t.userId?.email.toLowerCase().includes(q) ||
      t._id.toLowerCase().includes(q) ||
      (t.orderId?._id || '').toLowerCase().includes(q)
    );
  }, [tickets, searchQuery]);

  const statusBadgeColor = (status: string) => ({
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    accepted: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    closed: 'bg-gray-200 text-gray-700 border-gray-300',
  }[status] || 'bg-gray-100 text-gray-800');

  const orderStatusColor = (status: string) => ({
    delivered: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }[status?.toLowerCase()] || 'bg-gray-100 text-gray-700');

  if (loading) return <div className="min-h-screen bg-background" />;
  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">

        {/* Mobile sidebar toggle */}
        <div className="md:hidden mb-4">
          <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Sidebar */}
          <aside className={cn('transition-all duration-300 w-full md:w-64', isSidebarOpen ? 'block' : 'hidden md:block')}>
            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Admin Navigation</span>
              </div>
              <div className="mt-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === 'support';
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'returns') navigate('/admin/returns');
                        else if (item.id !== 'support') navigate(`/admin?tab=${item.id}`);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

          {/* Main content */}
          <section className="flex-1 min-w-0 space-y-4 sm:space-y-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Support Center</h1>
              <p className="text-muted-foreground">Manage customer support tickets</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by subject, customer, email, or ticket ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['open', 'pending', 'accepted', 'rejected', 'closed'].map(s => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ticket list */}
            {loadingTickets ? (
              <div className="space-y-2">
                <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <Card className="p-6"><p className="text-muted-foreground text-center">No tickets found</p></Card>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <Card
                    key={ticket._id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenTicket(ticket._id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <p className="font-semibold">{ticket.subject}</p>
                          <Badge className={statusBadgeColor(ticket.status)}>{ticket.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong>From:</strong> {ticket.userId?.name} ({ticket.userId?.email})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Ticket #{ticket._id?.slice(0, 8)} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Ticket Detail Modal ── */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 bg-background">
          {/* Sticky Header */}
          <DialogHeader className="sticky top-0 bg-background z-10 px-6 py-4 border-b border-border shadow-sm">
            <DialogTitle className="text-lg font-bold">{selectedTicket?.subject}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Ticket #{selectedTicket?._id?.slice(0, 8)}
            </p>
          </DialogHeader>

          <div className="px-6 py-5 space-y-6">

            {/* ── Status + Date Row ── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
                <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                  <SelectTrigger className="h-9 text-sm bg-muted/40 border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['open', 'pending', 'accepted', 'rejected', 'closed'].map(s => (
                      <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created</p>
                <p className="text-sm font-medium mt-2 text-foreground">
                  {selectedTicket?.createdAt ? new Date(selectedTicket.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </p>
              </div>
            </div>

            {/* ── Customer Info ── */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer Information</p>
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                    {selectedTicket?.userId?.name?.[0]?.toUpperCase()}
                  </span>
                  <span className="font-semibold text-foreground">{selectedTicket?.userId?.name}</span>
                </div>
                <p className="text-muted-foreground pl-7">{selectedTicket?.userId?.email}</p>
                {selectedTicket?.userId?.phone && (
                  <p className="text-muted-foreground pl-7 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {selectedTicket.userId.phone}
                  </p>
                )}
              </div>
            </div>

            {/* ── Original Message ── */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original Message</p>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-foreground leading-relaxed">
                {selectedTicket?.message}
              </div>
            </div>

            {/* ── Linked Order ── */}
            {selectedTicket?.orderId && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Linked Order</p>

                <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">

                  {/* Order header bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-mono font-semibold text-foreground">
                        {selectedTicket.orderId._id?.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <Badge className={cn('text-xs border', orderStatusColor(selectedTicket.orderId.status))}>
                      {selectedTicket.orderId.status}
                    </Badge>
                  </div>

                  <div className="p-4 space-y-4">

                    {/* Payment + Total */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-background border border-border px-3 py-2.5">
                        <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" /> Total
                        </p>
                        <p className="text-sm font-bold text-foreground">₹{selectedTicket.orderId.total?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="rounded-lg bg-background border border-border px-3 py-2.5">
                        <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                          <PayIcon className="h-3 w-3" /> Payment
                        </p>
                        <p className="text-sm font-semibold text-foreground capitalize">{selectedTicket.orderId.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="rounded-lg bg-background border border-border p-3">
                      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 font-semibold">
                        <MapPin className="h-3 w-3" /> Shipping Address
                      </p>
                      <div className="text-sm text-foreground space-y-0.5">
                        <p className="font-medium">{selectedTicket.orderId.name}</p>
                        {selectedTicket.orderId.address && (
                          <p className="text-muted-foreground">{selectedTicket.orderId.address}</p>
                        )}
                        <p className="text-muted-foreground">
                          {[selectedTicket.orderId.city, selectedTicket.orderId.state, selectedTicket.orderId.pincode]
                            .filter(Boolean).join(', ')}
                        </p>
                        {selectedTicket.orderId.phone && (
                          <p className="text-muted-foreground flex items-center gap-1 pt-0.5">
                            <Phone className="h-3 w-3" /> {selectedTicket.orderId.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    {selectedTicket.orderId.items?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1 font-semibold">
                          <ShoppingBag className="h-3 w-3" /> Order Items
                        </p>
                        <div className="rounded-lg bg-background border border-border overflow-hidden divide-y divide-border">
                          {selectedTicket.orderId.items.map((item: any, idx: number) => {
                            const pid = (item.productId || item.id || '').toString();
                            const highlight = (selectedTicket.productId?._id || '').toString() === pid;
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  'flex items-center justify-between px-3 py-2.5 text-sm transition-colors',
                                  highlight ? 'bg-primary/8 border-l-2 border-l-primary' : 'hover:bg-muted/30'
                                )}
                              >
                                <span className={cn('flex-1 truncate pr-4', highlight ? 'font-semibold text-foreground' : 'text-foreground')}>
                                  {highlight && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 mb-0.5" />}
                                  {item.title}
                                </span>
                                <span className="text-muted-foreground text-xs whitespace-nowrap">
                                  x{item.qty} <span className="text-foreground font-medium">@ ₹{item.price}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* View Full Order Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-border hover:bg-muted text-foreground"
                      onClick={() => {
                        if (selectedTicket?.orderId?._id) {
                          navigate(`/orders/success?orderId=${selectedTicket.orderId._id}`);
                        }
                      }}
                    >
                      View Full Order
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Linked Product ── */}
            {selectedTicket?.productId && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Information</p>
                <div className="rounded-xl border border-border bg-muted/20 overflow-hidden">
                  {selectedTicket.productId.image && (
                    <div className="w-full aspect-video bg-muted">
                      <img
                        src={selectedTicket.productId.image}
                        alt={selectedTicket.productId.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Product Name</p>
                      <p className="text-sm font-semibold text-foreground">{selectedTicket.productId.title}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Price</p>
                        <p className="text-sm font-bold text-foreground">₹{selectedTicket.productId.price?.toLocaleString('en-IN')}</p>
                      </div>
                      {selectedTicket.purchaseDate && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Purchase Date</p>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(selectedTicket.purchaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Replies / Conversation ── */}
            {selectedTicket?.replies && selectedTicket.replies.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Conversation</p>
                <div className="space-y-2">
                  {selectedTicket.replies.map((reply, idx) => {
                    const isAdmin = reply.authorId?.role === 'admin';
                    return (
                      <div
                        key={idx}
                        className={cn(
                          'rounded-xl border p-3.5 text-sm',
                          isAdmin
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-muted/30 border-border'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn('font-semibold text-foreground', isAdmin && 'text-primary')}>
                            {reply.authorId?.name || 'Unknown'}
                          </span>
                          {isAdmin && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/5 py-0">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{reply.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {reply.createdAt ? new Date(reply.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Reply Form ── */}
            <div className="space-y-3 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Reply</p>
              <Textarea
                placeholder="Type your reply here..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="min-h-24 bg-muted/30 border-border resize-none focus:bg-background transition-colors"
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)} className="border-border">
                  Close
                </Button>
                <Button onClick={handleSaveReply} disabled={savingReply} className="min-w-32">
                  {savingReply && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}