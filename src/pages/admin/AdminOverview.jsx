import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Calendar,
  AlertCircle
} from "lucide-react";
import "./AdminOverview.css";

export default function AdminOverview({ onSelectTab }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    recentOrders: []
  });

  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
  };

  const fetchOverviewData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const baseUrl = getBaseUrl();

      // Fetch Orders, Users, Products in parallel
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        fetch(`${baseUrl}/api/orders`).then(r => r.json()).catch(() => ({ success: false, orders: [] })),
        fetch(`${baseUrl}/api/user`).then(r => r.json()).catch(() => ({ success: false, users: [] })),
        fetch(`${baseUrl}/api/products`).then(r => r.json()).catch(() => ({ success: false, products: [] }))
      ]);

      const orders = Array.isArray(ordersRes.orders) ? ordersRes.orders : [];
      const users = Array.isArray(usersRes.users) ? usersRes.users : [];
      const products = Array.isArray(productsRes.products) ? productsRes.products : [];

      // Calculate Total Revenue (Sum of totalAmount for non-cancelled orders)
      const revenue = orders.reduce((sum, o) => {
        const status = String(o.status || '').toLowerCase();
        if (status !== 'cancelled' && status !== 'rejected') {
          return sum + (Number(o.totalAmount) || 0);
        }
        return sum;
      }, 0);

      const pending = orders.filter(o => {
        const s = String(o.status || '').toLowerCase();
        return s === 'pending' || s === 'processing';
      }).length;

      const delivered = orders.filter(o => {
        const s = String(o.status || '').toLowerCase();
        return s === 'delivered' || s === 'completed';
      }).length;

      setStats({
        totalOrders: orders.length,
        totalRevenue: revenue,
        totalUsers: users.length,
        pendingOrders: pending,
        deliveredOrders: delivered,
        totalProducts: products.length,
        recentOrders: orders.slice(0, 5)
      });
    } catch (err) {
      console.error("Error loading Overview stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const formatRupee = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-overview-container">
      {/* Header Banner */}
      <div className="overview-header-card">
        <div className="overview-header-copy">
          <span className="overview-badge">
            <Sparkles size={14} /> Real-time Analytics & Business Summary
          </span>
          <h1>Store Performance Overview</h1>
          <p>Track live revenue, total customer orders, registered users, and store growth.</p>
        </div>

        <button
          type="button"
          className="overview-refresh-btn"
          onClick={() => fetchOverviewData(true)}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Stats"}
        </button>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="overview-metrics-grid">
        {/* Total Revenue Card */}
        <div className="metric-card metric-revenue">
          <div className="metric-icon">
            <IndianRupee size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Revenue</span>
            <h2 className="metric-value">{loading ? "..." : formatRupee(stats.totalRevenue)}</h2>
            <div className="metric-trend">
              <TrendingUp size={14} /> Sum of active order sales
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="metric-card metric-orders" onClick={() => onSelectTab && onSelectTab("orders")} style={{ cursor: "pointer" }}>
          <div className="metric-icon">
            <ShoppingBag size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Orders</span>
            <h2 className="metric-value">{loading ? "..." : stats.totalOrders}</h2>
            <div className="metric-trend">
              {stats.pendingOrders > 0 ? (
                <span className="pending-pill">{stats.pendingOrders} Pending Action</span>
              ) : (
                "All orders processed"
              )}
            </div>
          </div>
        </div>

        {/* Total Users Card */}
        <div className="metric-card metric-users" onClick={() => onSelectTab && onSelectTab("users")} style={{ cursor: "pointer" }}>
          <div className="metric-icon">
            <Users size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Registered Users</span>
            <h2 className="metric-value">{loading ? "..." : stats.totalUsers}</h2>
            <div className="metric-trend">
              Active mobile verified accounts
            </div>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="metric-card metric-products" onClick={() => onSelectTab && onSelectTab("products")} style={{ cursor: "pointer" }}>
          <div className="metric-icon">
            <Package size={26} />
          </div>
          <div className="metric-details">
            <span className="metric-label">Total Products</span>
            <h2 className="metric-value">{loading ? "..." : stats.totalProducts}</h2>
            <div className="metric-trend">
              Active items in catalog
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Quick Stats */}
      <div className="overview-sub-grid">
        <div className="sub-stat-card">
          <div className="sub-stat-icon yellow">
            <Clock size={20} />
          </div>
          <div>
            <strong className="sub-stat-val">{loading ? "..." : stats.pendingOrders}</strong>
            <span className="sub-stat-lbl">Pending / Processing Orders</span>
          </div>
        </div>

        <div className="sub-stat-card">
          <div className="sub-stat-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <strong className="sub-stat-val">{loading ? "..." : stats.deliveredOrders}</strong>
            <span className="sub-stat-lbl">Successfully Delivered Orders</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="overview-recent-card">
        <div className="recent-card-header">
          <div>
            <h3>Recent Customer Orders</h3>
            <p>Latest orders placed across website & mobile checkout</p>
          </div>

          <button
            type="button"
            className="view-all-btn"
            onClick={() => onSelectTab && onSelectTab("orders")}
          >
            View All Orders <ArrowRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="overview-loading">Loading recent order statistics...</div>
        ) : stats.recentOrders.length > 0 ? (
          <div className="overview-table-wrapper">
            <table className="overview-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => {
                  const status = String(order.status || 'Pending').toLowerCase();
                  const isNew = status === 'pending';

                  return (
                    <tr key={order._id}>
                      <td data-label="Order ID">
                        <strong className="order-id-txt">
                          {order.orderId || 'N/A'}
                          {isNew && <span className="new-tag-pill">NEW</span>}
                        </strong>
                      </td>
                      <td data-label="Customer">
                        <div className="customer-cell">
                          <strong>{order.shippingAddress?.fullName || order.user?.name || 'Customer'}</strong>
                          <small>+91 {order.shippingAddress?.phone || order.user?.mobile || ''}</small>
                        </div>
                      </td>
                      <td data-label="Date">
                        <span className="date-cell">
                          <Calendar size={13} /> {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td data-label="Amount">
                        <strong className="amount-txt">₹{order.totalAmount || 0}</strong>
                      </td>
                      <td data-label="Status">
                        <span className={`status-pill status-${status}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overview-empty">
            <AlertCircle size={32} color="#94a3b8" />
            <p>No customer orders placed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}