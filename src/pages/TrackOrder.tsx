import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Truck, CheckCircle, PackageOpen, AlertCircle, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

type PublicOrderInfo = {
  _id: string;
  status: string;
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
  phone: string;
  city: string;
  state: string;
  items: Array<{
    title: string;
    qty: number;
    image?: string;
  }>;
};

export default function TrackOrder() {
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<PublicOrderInfo | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError("Invalid order ID.");
        setLoading(false);
        return;
      }
      
      try {
        const res = await api(`/api/orders/${orderId}/track`);
        if (res.ok && res.json?.ok) {
          setOrder(res.json.data);
        } else {
          setError("Order not found or tracking information is currently unavailable.");
        }
      } catch (err) {
        console.error("Tracking error:", err);
        setError("Unable to track this order. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Package className="w-8 h-8 text-amber-500" />;
      case 'paid': return <Package className="w-8 h-8 text-amber-600" />;
      case 'shipped': return <Truck className="w-8 h-8 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'returned': return <PackageOpen className="w-8 h-8 text-purple-500" />;
      case 'cancelled': return <AlertCircle className="w-8 h-8 text-red-500" />;
      default: return <Package className="w-8 h-8 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return "bg-amber-100 text-amber-800";
      case 'paid': return "bg-amber-100 text-amber-800";
      case 'shipped': return "bg-blue-100 text-blue-800";
      case 'delivered': return "bg-green-100 text-green-800";
      case 'returned': return "bg-purple-100 text-purple-800";
      case 'cancelled': return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-32 pb-16">
        <Link to="/my-orders" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to all orders
        </Link>
        
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Track Your Order</h1>
            <p className="text-slate-500">View real-time updates for your order</p>
          </div>

          {loading ? (
            <Card className="border shadow-sm p-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Locating your order...</p>
              </div>
            </Card>
          ) : error || !order ? (
            <Card className="border shadow-sm p-12 text-center border-red-100 bg-red-50/30">
              <div className="mx-auto bg-red-100 w-16 h-16 rounded-full items-center justify-center flex mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-slate-900">Oops! We couldn't find that order</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <Button asChild onClick={() => window.location.href = '/my-orders'}>
                <Link to="/my-orders">Go to My Orders</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Status Header */}
              <Card className="border shadow-sm overflow-hidden">
                <div className="bg-primary/5 p-6 sm:p-8 flex items-center gap-6">
                  <div className="bg-white p-4 rounded-xl shadow-sm hidden sm:block">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 capitalize">
                      Order is {order.status}
                    </h2>
                    <p className="text-slate-600 text-sm mb-4">
                      Order ID: <span className="font-semibold text-slate-800">{order._id}</span>
                    </p>
                    <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${getStatusBadge(order.status)}`}>
                      Current Status: {order.status}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Delivery Details */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">Destination</p>
                    <p className="text-slate-900 font-semibold">{order.city}, {order.state}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium mb-1">Contact Phone</p>
                    <p className="text-slate-900 font-semibold">******{order.phone}</p>
                  </div>
                  {order.trackingId && (
                    <div className="sm:col-span-2 p-4 bg-slate-50 border border-slate-100 rounded-xl mt-2 flex justify-between items-center bg-blue-50/50">
                      <div>
                        <p className="text-muted-foreground font-medium mb-1 text-xs uppercase tracking-wider text-blue-600">Tracking Reference</p>
                        <p className="text-slate-900 font-bold">{order.trackingId}</p>
                      </div>
                      <Package className="w-8 h-8 text-blue-200" />
                    </div>
                  )}
                  <div className="sm:col-span-2 pt-4 border-t">
                    <p className="text-muted-foreground font-medium mb-1">Order Placed On</p>
                    <p className="text-slate-900 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order Items */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                  <CardDescription>Limited details are shown to protect your privacy</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-slate-100 border-y border-slate-100 rounded">
                    {order.items.map((item, index) => (
                      <li key={index} className="py-4 flex items-center gap-4">
                        {item.image ? (
                          <div className="w-16 h-16 rounded overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded bg-slate-100 flex-shrink-0 flex items-center justify-center border border-slate-200">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-grow">
                          <p className="font-semibold text-slate-900 text-sm sm:text-base leading-snug">{item.title}</p>
                          <p className="text-slate-500 text-sm mt-1">Qty: {item.qty}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4">
                    <div className="bg-amber-100 p-2 rounded-full hidden sm:block">
                      <AlertCircle className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-amber-900 font-semibold mb-1 text-sm">Need more details?</h4>
                      <p className="text-amber-800/80 text-sm">
                        To view your complete invoice, exact delivery address, or request returns, please <Link to="/auth" className="underline font-semibold hover:text-amber-900">log in to your account</Link>.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
