import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Package,
  Truck,
  CheckCircle2,
  Search,
  XCircle,
  FileText,
  ChevronDown,
  Clock3,
  ShoppingBag,
  IndianRupee,
  RefreshCw,
  Eye,
  Loader2,
  MapPin,
  Phone,
  CreditCard,
  CalendarDays,
  UserRound,
  AlertCircle,
  Printer,
} from "lucide-react";
import "./AdminOrders.css";

const ORDERS_PER_PAGE = 12;

const normalizeStatus = (status) =>
  String(status || "pending").trim().toLowerCase();

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    text: "Order Placed",
    icon: Clock3,
  },
  processing: {
    label: "Processing",
    text: "Processing",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    text: "Shipped / In Transit",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    text: "Delivered",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    text: "Cancelled",
    icon: XCircle,
  },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [syncingShiprocketId, setSyncingShiprocketId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState("");

  const getBaseUrl = () =>
    (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(
      /\/$/,
      ""
    );

  const handleSyncShiprocket = async (orderIdToSync) => {
    try {
      setSyncingShiprocketId(orderIdToSync);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${getBaseUrl()}/api/orders/${orderIdToSync}/sync-shiprocket`,
        {
          method: "POST",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderIdToSync ? data.order : o))
        );
        if (selectedOrder && selectedOrder._id === orderIdToSync) {
          setSelectedOrder(data.order);
        }
        window.alert(`🚀 Shiprocket Sync Success!\nShiprocket Order ID: ${data.shiprocketOrderId}`);
      } else {
        window.alert(`⚠️ Shiprocket Sync Failed:\n${data.message || 'Unable to sync with Shiprocket.'}`);
      }
    } catch (err) {
      console.error("Error syncing to Shiprocket:", err);
      window.alert(`Error connecting to server for Shiprocket sync.`);
    } finally {
      setSyncingShiprocketId(null);
    }
  };

  const fetchOrders = async (showRefreshLoader = false) => {
    try {
      setError("");

      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${getBaseUrl()}/api/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Unable to fetch orders");
      }

      if (data.success) {
        const normalizedOrders = Array.isArray(data.orders)
          ? data.orders.map((order) => ({
              ...order,
              status: normalizeStatus(order?.status || order?.orderStatus),
            }))
          : [];

        setOrders(normalizedOrders);
      } else {
        throw new Error(data?.message || "Unable to fetch orders");
      }
    } catch (fetchError) {
      console.error("Error fetching admin orders:", fetchError);
      setError(fetchError.message || "Something went wrong while loading orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!selectedOrder) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    const normalizedNewStatus = normalizeStatus(newStatus);

    if (!orderId || !STATUS_CONFIG[normalizedNewStatus]) return;

    try {
      setUpdatingOrderId(orderId);

      const token = localStorage.getItem("adminToken");
      const statusText = STATUS_CONFIG[normalizedNewStatus].text;

      const sendStatusRequest = (method) =>
        fetch(`${getBaseUrl()}/api/orders/${orderId}/status`, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            status: normalizedNewStatus,
            orderStatus: normalizedNewStatus,
            statusText,
          }),
        });

      let res = await sendStatusRequest("PATCH");

      // Kuch backends isi route par PUT use karte hain.
      if (res.status === 404 || res.status === 405) {
        res = await sendStatusRequest("PUT");
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to update order status");
      }

      const updatedFromApi =
        data?.order || data?.updatedOrder || data?.data?.order || {};

      const mergeUpdatedOrder = (order) => ({
        ...order,
        ...updatedFromApi,
        status: normalizeStatus(
          updatedFromApi?.status ||
            updatedFromApi?.orderStatus ||
            normalizedNewStatus
        ),
        statusText: updatedFromApi?.statusText || statusText,
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? mergeUpdatedOrder(order) : order
        )
      );

      setSelectedOrder((previousOrder) =>
        previousOrder?._id === orderId
          ? mergeUpdatedOrder(previousOrder)
          : previousOrder
      );
    } catch (updateError) {
      console.error("Error updating order status:", updateError);
      window.alert(updateError.message || "Unable to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const getTotalItems = (items = []) =>
    items.reduce((total, item) => total + Number(item?.qty || 0), 0);

  const getProductNames = (items = []) => {
    const names = items
      .map((item) =>
        item?.name
          ? `${item.name}${item.size ? ` (${item.size})` : ""}`
          : null
      )
      .filter(Boolean)
      .join(", ");

    return names || "Product information unavailable";
  };

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const orderId = String(order?.orderId || "").toLowerCase();
      const customerName = String(
        order?.shippingAddress?.name || ""
      ).toLowerCase();
      const phone = String(order?.shippingAddress?.phone || "").toLowerCase();
      const email = String(order?.shippingAddress?.email || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        orderId.includes(normalizedSearch) ||
        customerName.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        email.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || normalizeStatus(order?.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter((order) =>
        ["pending", "processing", "shipped"].includes(
          normalizeStatus(order?.status)
        )
      ).length,
      delivered: orders.filter((order) => normalizeStatus(order?.status) === "delivered")
        .length,
      cancelled: orders.filter((order) => normalizeStatus(order?.status) === "cancelled")
        .length,
      revenue: orders
        .filter((order) => normalizeStatus(order?.status) !== "cancelled")
        .reduce(
          (total, order) => total + Number(order?.totalAmount || 0),
          0
        ),
    };
  }, [orders]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis-right", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "ellipsis-left",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis-right",
      totalPages,
    ];
  }, [currentPage, totalPages]);

  const firstVisibleOrder =
    filteredOrders.length === 0
      ? 0
      : (currentPage - 1) * ORDERS_PER_PAGE + 1;

  const lastVisibleOrder = Math.min(
    currentPage * ORDERS_PER_PAGE,
    filteredOrders.length
  );

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    setCurrentPage(safePage);

    requestAnimationFrame(() => {
      document
        .querySelector(".admin-orders-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-heading">
        <div>
          <span className="admin-orders-eyebrow">
            <ShoppingBag size={15} />
            Order Management
          </span>

          <h1>Manage Orders</h1>
          <p>
            Track customer orders, payment details and delivery status.
          </p>
        </div>

        <button
          type="button"
          className="admin-orders-refresh-btn"
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "admin-orders-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      <div className="admin-orders-stats">
        <div className="admin-order-stat-card stat-total">
          <div className="admin-order-stat-icon">
            <ShoppingBag size={23} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{orderStats.total}</strong>
            <small>All customer orders</small>
          </div>
        </div>

        <div className="admin-order-stat-card stat-active">
          <div className="admin-order-stat-icon">
            <Truck size={23} />
          </div>

          <div>
            <span>Active Orders</span>
            <strong>{orderStats.active}</strong>
            <small>Pending, processing or shipped</small>
          </div>
        </div>

        <div className="admin-order-stat-card stat-delivered">
          <div className="admin-order-stat-icon">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <span>Delivered</span>
            <strong>{orderStats.delivered}</strong>
            <small>Successfully completed</small>
          </div>
        </div>

        <div className="admin-order-stat-card stat-revenue">
          <div className="admin-order-stat-icon">
            <IndianRupee size={23} />
          </div>

          <div>
            <span>Total Revenue</span>
            <strong>{formatCurrency(orderStats.revenue)}</strong>
            <small>Excluding cancelled orders</small>
          </div>
        </div>
      </div>

      <div className="admin-orders-panel">
        <div className="admin-orders-toolbar">
          <div className="admin-orders-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search order ID, customer, phone or email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <XCircle size={17} />
              </button>
            )}
          </div>

          <div className="admin-orders-filter">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Order Status</option>
              <option value="pending">Pending Orders</option>
              <option value="processing">Processing Orders</option>
              <option value="shipped">Shipped Orders</option>
              <option value="delivered">Delivered Orders</option>
              <option value="cancelled">Cancelled Orders</option>
            </select>

            <ChevronDown size={17} />
          </div>
        </div>

        <div className="admin-orders-result-info">
          <div>
            <strong>{filteredOrders.length}</strong>
            <span>
              {filteredOrders.length === 1 ? " order found" : " orders found"}
            </span>
          </div>

          {orderStats.cancelled > 0 && (
            <div className="admin-orders-cancelled-info">
              <XCircle size={15} />
              {orderStats.cancelled} cancelled
            </div>
          )}
        </div>

        {loading ? (
          <div className="admin-orders-loading">
            <div className="admin-orders-loader">
              <Loader2 size={32} />
            </div>
            <h3>Loading orders</h3>
            <p>Please wait while we fetch the latest order information.</p>
          </div>
        ) : error ? (
          <div className="admin-orders-empty admin-orders-error">
            <div className="admin-orders-empty-icon">
              <AlertCircle size={30} />
            </div>

            <h3>Unable to load orders</h3>
            <p>{error}</p>

            <button type="button" onClick={() => fetchOrders()}>
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="admin-orders-empty">
            <div className="admin-orders-empty-icon">
              <Package size={30} />
            </div>

            <h3>No orders found</h3>
            <p>
              Try changing the search keyword or selected order status.
            </p>
          </div>
        ) : (
          <div className="admin-orders-table-wrapper">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order Details</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedOrders.map((order) => {
                  const orderStatus = normalizeStatus(order?.status);
                  const StatusIcon =
                    STATUS_CONFIG[orderStatus]?.icon || Clock3;
                  const isUpdating = updatingOrderId === order._id;

                  return (
                    <tr key={order._id}>
                      <td>
                        <div className="admin-order-id-cell">
                          <div className="admin-order-package-icon">
                            <Package size={20} />
                          </div>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong>
                                {order?.orderId || `#${order?._id?.slice(-8)}`}
                              </strong>
                              {orderStatus.toLowerCase() === 'pending' && (
                                <span style={{
                                  background: '#ef4444',
                                  color: '#ffffff',
                                  fontSize: '0.64rem',
                                  fontWeight: 900,
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  letterSpacing: '0.05em',
                                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                                }}>
                                  NEW ORDER
                                </span>
                              )}
                            </div>

                            <span>
                              <CalendarDays size={13} />
                              {formatDate(order?.createdAt)}
                            </span>

                            <span
                              className={`admin-order-payment-method payment-${
                                order?.paymentMethod?.toLowerCase() || "other"
                              }`}
                            >
                              {order?.paymentMethod?.toUpperCase() || "N/A"}
                            </span>

                            {order.shiprocketStatus === 'Synced' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', marginTop: '4px' }}>
                                🚀 Shiprocket Synced ({order.shiprocketOrderId || 'Done'})
                              </span>
                            ) : order.shiprocketStatus === 'Failed' ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', marginTop: '4px' }} title={order.shiprocketSyncError}>
                                ⚠️ Shiprocket Failed
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-customer-cell">
                          <strong>
                            {order?.shippingAddress?.name || "Customer"}
                          </strong>

                          <span>
                            <Phone size={13} />
                            {order?.shippingAddress?.phone || "N/A"}
                          </span>

                          <span>
                            <MapPin size={13} />
                            {[
                              order?.shippingAddress?.city,
                              order?.shippingAddress?.state,
                            ]
                              .filter(Boolean)
                              .join(", ") || "Location N/A"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-items-summary">
                          <strong>
                            {order?.items?.reduce(
                              (total, item) => total + (item?.qty || 1),
                              0
                            ) || 0}{" "}
                            Item(s)
                          </strong>

                          <p>
                            {order?.items
                              ?.map((item) => item?.name)
                              .filter(Boolean)
                              .join(", ") || "No items listed"}
                          </p>

                          <span className="admin-order-amount">
                            ₹{order?.totalAmount || 0}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-payment-cell">
                          <span
                            className={`admin-order-payment-status status-${
                              order?.paymentStatus?.toLowerCase() || "pending"
                            }`}
                          >
                            {order?.paymentStatus || "Pending"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div
                          className={`admin-order-status-select-wrap status-${orderStatus}`}
                        >
                          {isUpdating ? (
                            <Loader2 size={16} className="admin-orders-spin" />
                          ) : (
                            <StatusIcon size={16} />
                          )}

                          <select
                            value={orderStatus}
                            onChange={(event) =>
                              updateOrderStatus(
                                order._id,
                                event.target.value
                              )
                            }
                            disabled={isUpdating}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {!isUpdating && <ChevronDown size={15} />}
                        </div>
                      </td>

                      <td>
                        <div className="admin-order-actions">
                          <button
                            type="button"
                            className="admin-order-action-btn admin-order-action-btn--view"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <Eye size={16} />
                            Details
                          </button>

                          <button
                            type="button"
                            className="admin-order-action-btn"
                            style={{
                              background: order.shiprocketStatus === 'Synced' ? '#f0fdf4' : '#eff6ff',
                              color: order.shiprocketStatus === 'Synced' ? '#16a34a' : '#2563eb',
                              border: `1px solid ${order.shiprocketStatus === 'Synced' ? '#bbf7d0' : '#bfdbfe'}`
                            }}
                            onClick={() => handleSyncShiprocket(order._id)}
                            disabled={syncingShiprocketId === order._id}
                            title={order.shiprocketStatus === 'Synced' ? 'Resync to Shiprocket' : 'Sync Order to Shiprocket'}
                          >
                            <Truck size={15} />
                            {syncingShiprocketId === order._id ? 'Syncing...' : order.shiprocketStatus === 'Synced' ? 'Synced' : 'Shiprocket'}
                          </button>

                          <button
                            type="button"
                            className="admin-order-action-btn admin-order-action-btn--bill"
                            onClick={() =>
                              window.open(
                                `/invoice/${order?.orderId || order?._id}`,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          >
                            <Printer size={16} />
                            Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="admin-orders-pagination">
            <div className="admin-orders-pagination-info">
              Showing <strong>{firstVisibleOrder}</strong> to{" "}
              <strong>{lastVisibleOrder}</strong> of{" "}
              <strong>{filteredOrders.length}</strong> orders
            </div>

            <div className="admin-orders-pagination-controls">
              <button
                type="button"
                className="admin-orders-page-nav"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="admin-orders-page-numbers">
                {paginationItems.map((item, index) =>
                  typeof item === "number" ? (
                    <button
                      type="button"
                      key={item}
                      className={currentPage === item ? "active" : ""}
                      onClick={() => goToPage(item)}
                      aria-current={currentPage === item ? "page" : undefined}
                    >
                      {item}
                    </button>
                  ) : (
                    <span key={`${item}-${index}`}>...</span>
                  )
                )}
              </div>

              <button
                type="button"
                className="admin-orders-page-nav"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          className="admin-order-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOrder(null);
            }
          }}
        >
          <div className="admin-order-modal">
            <div className="admin-order-modal-header">
              <div>
                <span>Order information</span>
                <h2>
                  {selectedOrder?.orderId ||
                    `#${selectedOrder?._id?.slice(-8)}`}
                </h2>
                <p>{formatDate(selectedOrder?.createdAt)}</p>

                <div
                  className={`admin-order-modal-header-badge modal-status-${
                    normalizeStatus(selectedOrder?.status)
                  }`}
                >
                  {React.createElement(
                    STATUS_CONFIG[normalizeStatus(selectedOrder?.status)]?.icon || Clock3,
                    { size: 14 }
                  )}
                  <span>
                    {STATUS_CONFIG[normalizeStatus(selectedOrder?.status)]?.label || "Pending"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="admin-order-modal-close"
                aria-label="Close order details"
                onClick={() => setSelectedOrder(null)}
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="admin-order-modal-content">
              <div className="admin-order-modal-top-grid">
                <div className="admin-order-info-card">
                  <div className="admin-order-info-title">
                    <UserRound size={18} />
                    <h3>Customer Details</h3>
                  </div>

                  <div className="admin-order-info-list">
                    <div>
                      <span>Name</span>
                      <strong>
                        {selectedOrder?.shippingAddress?.name || "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Mobile</span>
                      <strong>
                        {selectedOrder?.shippingAddress?.phone || "N/A"}
                      </strong>
                    </div>

                    {selectedOrder?.shippingAddress?.email && (
                      <div>
                        <span>Email</span>
                        <strong>
                          {selectedOrder.shippingAddress.email}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="admin-order-info-card">
                  <div className="admin-order-info-title">
                    <MapPin size={18} />
                    <h3>Shipping Address</h3>
                  </div>

                  <p className="admin-order-address-text">
                    {[
                      selectedOrder?.shippingAddress?.address,
                      selectedOrder?.shippingAddress?.addressLine1,
                      selectedOrder?.shippingAddress?.addressLine2,
                      selectedOrder?.shippingAddress?.city,
                      selectedOrder?.shippingAddress?.state,
                      selectedOrder?.shippingAddress?.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Shipping address unavailable"}
                  </p>
                </div>

                <div className="admin-order-info-card">
                  <div className="admin-order-info-title">
                    <CreditCard size={18} />
                    <h3>Payment Details</h3>
                  </div>

                  <div className="admin-order-info-list">
                    <div>
                      <span>Payment Method</span>
                      <strong>
                        {selectedOrder?.paymentMethod?.toUpperCase() ||
                          "N/A"}
                      </strong>
                    </div>

                    <div>
                      <span>Payment Status</span>
                      <strong className="admin-order-payment-status">
                        {selectedOrder?.paymentStatus ||
                          selectedOrder?.statusText ||
                          "Order Placed"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-order-modal-products">
                <div className="admin-order-modal-section-title">
                  <div>
                    <FileText size={19} />
                    <h3>Ordered Products</h3>
                  </div>

                  <span>
                    {getTotalItems(selectedOrder?.items)} total items
                  </span>
                </div>

                <div className="admin-order-modal-product-list">
                  {(selectedOrder?.items || []).map((item, index) => (
                    <div
                      className="admin-order-modal-product"
                      key={item?._id || item?.productId || index}
                    >
                      <div className="admin-order-modal-product-image">
                        {item?.image ? (
                          <img src={item.image} alt={item?.name || "Product"} />
                        ) : (
                          <Package size={23} />
                        )}
                      </div>

                      <div className="admin-order-modal-product-info">
                        <strong>{item?.name || "Product"}</strong>

                        <span>
                          Quantity: {Number(item?.qty || 0)}
                          {item?.size ? ` • Size: ${item.size}` : ""}
                          {item?.color ? ` • Color: ${item.color}` : ""}
                        </span>
                      </div>

                      <div className="admin-order-modal-product-price">
                        <span>
                          {formatCurrency(
                            item?.price || item?.salePrice || 0
                          )}{" "}
                          × {Number(item?.qty || 0)}
                        </span>

                        <strong>
                          {formatCurrency(
                            Number(item?.price || item?.salePrice || 0) *
                              Number(item?.qty || 0)
                          )}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-order-modal-footer">
                <div className="admin-order-modal-status">
                  <span>Update order status</span>

                  <div
                    className={`admin-order-status-select status-${
                      normalizeStatus(selectedOrder?.status)
                    }`}
                  >
                    {React.createElement(
                      STATUS_CONFIG[normalizeStatus(selectedOrder?.status)]?.icon || Clock3,
                      { size: 15 }
                    )}

                    <select
                      value={normalizeStatus(selectedOrder?.status)}
                      disabled={updatingOrderId === selectedOrder._id}
                      onChange={(event) =>
                        updateOrderStatus(
                          selectedOrder._id,
                          event.target.value
                        )
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {updatingOrderId === selectedOrder._id ? (
                      <Loader2
                        size={15}
                        className="admin-orders-spin"
                      />
                    ) : (
                      <ChevronDown size={15} />
                    )}
                  </div>
                </div>

                <div className="admin-order-price-summary">
                  {Number(selectedOrder?.subtotal) > 0 && (
                    <div>
                      <span>Subtotal</span>
                      <strong>
                        {formatCurrency(selectedOrder.subtotal)}
                      </strong>
                    </div>
                  )}

                  {Number(selectedOrder?.discountAmount) > 0 && (
                    <div className="discount-row">
                      <span>Discount</span>
                      <strong>
                        -{formatCurrency(selectedOrder.discountAmount)}
                      </strong>
                    </div>
                  )}

                  {Number(selectedOrder?.shippingCharge) > 0 && (
                    <div>
                      <span>Shipping</span>
                      <strong>
                        {formatCurrency(selectedOrder.shippingCharge)}
                      </strong>
                    </div>
                  )}

                  <div className="admin-order-grand-total">
                    <span>Total Amount</span>
                    <strong>
                      {formatCurrency(selectedOrder?.totalAmount)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}