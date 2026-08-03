import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  ReceiptText,
  RotateCcw,
  CalendarDays,
  ShoppingBag,
  Sparkles,
  XCircle,
  RefreshCw,
  ListFilter,
  Star,
  X,
  Upload,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import "./UserOrdersTab.css";

const ORDERS_PER_PAGE = 6;

const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Order Placed",
    icon: Clock3,
  },
  processing: {
    label: "Processing",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
  },
};

const ORDER_FILTERS = [
  {
    id: "all",
    label: "All Orders",
    description: "Every order",
    icon: ShoppingBag,
  },
  {
    id: "pending",
    label: "Pending",
    description: "Recently placed",
    icon: Clock3,
  },
  {
    id: "processing",
    label: "Processing",
    description: "Being prepared",
    icon: Package,
  },
  {
    id: "shipped",
    label: "Shipped",
    description: "On the way",
    icon: Truck,
  },
  {
    id: "delivered",
    label: "Delivered",
    description: "Completed orders",
    icon: CheckCircle2,
  },
];

const getOrderStatus = (order) =>
  String(order?.status || "pending").trim().toLowerCase();

export default function UserOrdersTab({ onSelectTab }) {
  const { user, token } = useUser();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Review Modal State
  const [reviewModalOrder, setReviewModalOrder] = useState(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const baseUrl = (
        import.meta.env.VITE_API_URL || "https://thekissancity.com"
      ).replace(/\/$/, "");

      const authToken =
        token || localStorage.getItem("kissanUserToken");

      if (!authToken) {
        setOrders([]);
        setCurrentPage(1);
        setLoading(false);
        return;
      }

      const response = await fetch(`${baseUrl}/api/orders/myorders`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load your orders.");
      }

      if (!data.success) {
        throw new Error(data?.message || "Unable to load your orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setCurrentPage(1);
    } catch (fetchError) {
      console.error("Error fetching user orders:", fetchError);

      setError(
        fetchError.message ||
          "Something went wrong while loading your orders."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((firstOrder, secondOrder) => {
      const firstDate = new Date(firstOrder?.createdAt || 0).getTime();
      const secondDate = new Date(secondOrder?.createdAt || 0).getTime();

      return secondDate - firstDate;
    });
  }, [orders]);

  const statusCounts = useMemo(() => {
    const counts = {
      all: sortedOrders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
    };

    sortedOrders.forEach((order) => {
      const status = getOrderStatus(order);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      }
    });

    return counts;
  }, [sortedOrders]);

  const filteredOrders = useMemo(() => {
    if (activeStatus === "all") {
      return sortedOrders;
    }

    return sortedOrders.filter(
      (order) => getOrderStatus(order) === activeStatus
    );
  }, [activeStatus, sortedOrders]);

  const totalPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE
  );

  const firstOrderIndex = (currentPage - 1) * ORDERS_PER_PAGE;

  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(
      firstOrderIndex,
      firstOrderIndex + ORDERS_PER_PAGE
    );
  }, [filteredOrders, firstOrderIndex]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    const items = [1];
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    if (startPage > 2) {
      items.push("start-ellipsis");
    }

    for (let page = startPage; page <= endPage; page += 1) {
      items.push(page);
    }

    if (endPage < totalPages - 1) {
      items.push("end-ellipsis");
    }

    items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeStatus]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const formatDate = (dateString) => {
    if (!dateString) return "Date unavailable";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const handleTrackOrder = (orderId) => {
    if (!orderId) return;

    localStorage.setItem("trackOrderId", orderId);

    if (onSelectTab) {
      onSelectTab("shipment");
    }
  };

  const handleInvoice = (orderId) => {
    if (!orderId) return;

    window.open(
      `/invoice/${encodeURIComponent(orderId)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const openReviewModal = (order, itemIdx = 0) => {
    setReviewModalOrder(order);
    setSelectedItemIndex(itemIdx);
    setReviewRating(5);
    setReviewTitle("");
    setReviewComment("");
    setReviewImage(null);
    setReviewImagePreview("");
    setReviewMsg({ type: "", text: "" });
  };

  const closeReviewModal = () => {
    setReviewModalOrder(null);
  };

  const handleReviewImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setReviewImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalOrder) return;

    const items = reviewModalOrder.items || [];
    const item = items[selectedItemIndex] || items[0];
    if (!item) return;

    if (!reviewComment.trim()) {
      setReviewMsg({ type: "error", text: "Please write a comment for your review." });
      return;
    }

    setSubmittingReview(true);
    setReviewMsg({ type: "", text: "" });

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
      const formData = new FormData();
      const productId = item.product || item.productId || item._id;

      formData.append("productId", productId);
      formData.append("userId", user?._id || user?.id || "");
      formData.append("rating", reviewRating);
      formData.append("title", reviewTitle || `Review for ${item.name || "Product"}`);
      formData.append("comment", reviewComment);
      if (reviewImage) {
        formData.append("image", reviewImage);
      }

      const authToken = token || localStorage.getItem("kissanUserToken");
      const res = await fetch(`${baseUrl}/api/reviews`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReviewMsg({ type: "success", text: "Review submitted successfully! Thank you." });
        setTimeout(() => {
          closeReviewModal();
        }, 1800);
      } else {
        setReviewMsg({ type: "error", text: data.message || "Failed to submit review." });
      }
    } catch (err) {
      console.error(err);
      setReviewMsg({ type: "error", text: "Server error while submitting review." });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleStatusChange = (statusId) => {
    setActiveStatus(statusId);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    if (
      pageNumber < 1 ||
      pageNumber > totalPages ||
      pageNumber === currentPage
    ) {
      return;
    }

    setCurrentPage(pageNumber);

    window.setTimeout(() => {
      document
        .querySelector(".orders-status-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  const activeFilter =
    ORDER_FILTERS.find((filter) => filter.id === activeStatus) ||
    ORDER_FILTERS[0];

  const ActiveFilterIcon = activeFilter.icon;

  if (loading) {
    return (
      <div className="user-orders-state user-orders-loading-state">
        <div className="user-orders-state-icon">
          <LoaderCircle className="user-orders-spinner" size={34} />
        </div>

        <h3>Loading your orders</h3>

        <p>
          Please wait while we collect your latest order information.
        </p>
      </div>
    );
  }

  return (
    <div className="orders-tab-container">
      <section className="orders-tab-hero">
        <div className="orders-tab-hero-content">
          <span className="orders-tab-eyebrow">
            <Sparkles size={15} />
            Your Purchases
          </span>

          <h3 className="orders-tab-title">My Orders</h3>

          <p className="orders-tab-desc">
            View your purchases, download invoices, track deliveries and
            manage return requests.
          </p>
        </div>

        <div className="orders-tab-summary">
          <div className="orders-tab-summary-icon">
            <ShoppingBag size={24} />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </div>
      </section>

      {error ? (
        <div className="user-orders-state user-orders-error-state">
          <div className="user-orders-state-icon">
            <XCircle size={34} />
          </div>

          <h3>Unable to load orders</h3>

          <p>{error}</p>

          <button
            type="button"
            className="user-orders-retry-btn"
            onClick={fetchOrders}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="user-orders-state user-orders-empty-state">
          <div className="user-orders-state-icon">
            <Package size={38} />
          </div>

          <span className="user-orders-empty-label">No purchases yet</span>

          <h3>Your order list is empty</h3>

          <p>
            Once you place an order, its products, invoice and delivery
            progress will appear here.
          </p>
        </div>
      ) : (
        <>
          <section className="orders-status-panel">
            <div className="orders-status-panel__heading">
              <div>
                <span className="orders-status-panel__icon">
                  <ListFilter size={19} />
                </span>

                <div>
                  <span>Filter orders</span>
                  <h4>Browse orders by current status</h4>
                </div>
              </div>

              <div className="orders-status-result">
                Showing
                <strong>{filteredOrders.length}</strong>
                of
                <strong>{orders.length}</strong>
              </div>
            </div>

            <div
              className="orders-status-filters"
              role="tablist"
              aria-label="Filter orders by status"
            >
              {ORDER_FILTERS.map((filter) => {
                const FilterIcon = filter.icon;
                const isActive = activeStatus === filter.id;

                return (
                  <button
                    type="button"
                    key={filter.id}
                    role="tab"
                    aria-selected={isActive}
                    aria-pressed={isActive}
                    className={`orders-status-filter filter-${filter.id}${
                      isActive ? " active" : ""
                    }`}
                    onClick={() => handleStatusChange(filter.id)}
                  >
                    <span className="orders-status-filter__icon">
                      <FilterIcon size={18} />
                    </span>

                    <span className="orders-status-filter__content">
                      <strong>{filter.label}</strong>
                      <small>{filter.description}</small>
                    </span>

                    <span className="orders-status-filter__count">
                      {statusCounts[filter.id] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {filteredOrders.length === 0 ? (
            <div className="user-orders-state user-orders-filter-empty-state">
              <div className="user-orders-state-icon">
                <ActiveFilterIcon size={38} />
              </div>

              <span className="user-orders-empty-label">
                No matching orders
              </span>

              <h3>No {activeFilter.label.toLowerCase()} found</h3>

              <p>
                There are currently no orders available under this status.
                Select another status or view all orders.
              </p>

              <button
                type="button"
                className="user-orders-clear-filter-btn"
                onClick={() => handleStatusChange("all")}
              >
                <ShoppingBag size={16} />
                Show All Orders
              </button>
            </div>
          ) : (
            <>
              <div className="orders-list">
                {paginatedOrders.map((order) => {
                  const statusKey = getOrderStatus(order);

                  const statusConfig =
                    ORDER_STATUS_CONFIG[statusKey] ||
                    ORDER_STATUS_CONFIG.pending;

                  const StatusIcon = statusConfig.icon;

                  const resolvedOrderId =
                    order?.orderId || order?._id || "";

                  return (
                    <article
                      className="order-card"
                      key={order?._id || resolvedOrderId}
                    >
                      <header className="order-card-header">
                        <div className="order-card-heading">
                          <div className="order-card-package-icon">
                            <Package size={21} />
                          </div>

                          <div className="order-card-heading-content">
                            <span className="order-card-label">
                              Order ID
                            </span>

                            <div className="order-id-txt">
                              {order?.orderId ||
                                `#${String(order?._id || "").slice(-8)}`}
                            </div>

                            <div className="order-date-txt">
                              <CalendarDays size={14} />
                              Placed on {formatDate(order?.createdAt)}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`order-status-badge status-${statusKey}`}
                        >
                          <StatusIcon size={15} />

                          {order?.statusText || statusConfig.label}
                        </span>
                      </header>

                      <div className="order-card-body">
                        <div className="order-products-heading">
                          <div>
                            <span>Items in this order</span>

                            <strong>
                              {order?.items?.length || 0}{" "}
                              {(order?.items?.length || 0) === 1
                                ? "Product"
                                : "Products"}
                            </strong>
                          </div>
                        </div>

                        <div className="order-products-list">
                          {(order?.items || []).map((item, index) => {
                            const quantity = Number(item?.qty || 0);
                            const itemPrice = Number(item?.price || 0);
                            const itemTotal = itemPrice * quantity;

                            return (
                              <div
                                className="order-item-row"
                                key={
                                  item?._id ||
                                  item?.productId ||
                                  `${resolvedOrderId}-${index}`
                                }
                              >
                                <div className="order-item-image-wrapper">
                                  <img
                                    src={
                                      item?.image ||
                                      item?.img ||
                                      "/product_ghee.png"
                                    }
                                    alt={item?.name || "Product"}
                                    className="order-item-img"
                                    onError={(event) => {
                                      event.currentTarget.src =
                                        "/product_ghee.png";
                                    }}
                                  />
                                </div>

                                <div className="order-item-info">
                                  <strong>
                                    {item?.name || "Product"}
                                  </strong>

                                  <div className="order-item-meta">
                                    <span>
                                      Pack: {item?.size || "Standard"}
                                    </span>

                                    <span className="order-item-meta-dot" />

                                    <span>Qty: {quantity}</span>

                                    {item?.color && (
                                      <>
                                        <span className="order-item-meta-dot" />
                                        <span>
                                          Color: {item.color}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="order-item-price">
                                  <span>
                                    {formatCurrency(itemPrice)} × {quantity}
                                  </span>

                                  <strong>
                                    {formatCurrency(itemTotal)}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <footer className="order-card-footer">
                        <div className="order-total-block">
                          <span>Total Amount</span>

                          <strong>
                            {formatCurrency(order?.totalAmount)}
                          </strong>

                          <small>
                            Inclusive of all applicable charges
                          </small>
                        </div>

                        <div className="order-card-actions">
                          {statusKey !== "cancelled" && (
                            <button
                              type="button"
                              className="order-action-btn order-track-btn"
                              onClick={() =>
                                handleTrackOrder(resolvedOrderId)
                              }
                            >
                              <Truck size={16} />
                              Track Shipment
                              <ChevronRight size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="order-action-btn order-invoice-btn"
                            onClick={() =>
                              handleInvoice(resolvedOrderId)
                            }
                          >
                            <ReceiptText size={16} />
                            View Invoice
                          </button>

                          {statusKey === "delivered" && (
                            <button
                              type="button"
                              className="order-action-btn order-review-btn"
                              onClick={() => openReviewModal(order)}
                            >
                              <Star size={16} />
                              Add Review
                            </button>
                          )}

                          {statusKey === "delivered" && (
                            <button
                              type="button"
                              className="order-action-btn order-return-btn"
                              onClick={() =>
                                onSelectTab &&
                                onSelectTab("returns")
                              }
                            >
                              <RotateCcw size={16} />
                              Return Item
                            </button>
                          )}
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>

              <nav
                className="orders-pagination"
                aria-label="Orders pagination"
              >
                <div className="orders-pagination__summary">
                  <span>Showing orders</span>
                  <strong>
                    {firstOrderIndex + 1}–
                    {Math.min(
                      firstOrderIndex + ORDERS_PER_PAGE,
                      filteredOrders.length
                    )}
                  </strong>
                  <span>of {filteredOrders.length}</span>
                </div>

                {totalPages > 1 && (
                  <div className="orders-pagination__controls">
                    <button
                      type="button"
                      className="orders-pagination__nav"
                      disabled={currentPage === 1}
                      onClick={() =>
                        handlePageChange(currentPage - 1)
                      }
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft size={17} />
                      <span>Previous</span>
                    </button>

                    <div className="orders-pagination__numbers">
                      {paginationItems.map((item) => {
                        if (typeof item === "string") {
                          return (
                            <span
                              className="orders-pagination__ellipsis"
                              key={item}
                            >
                              …
                            </span>
                          );
                        }

                        return (
                          <button
                            type="button"
                            key={item}
                            className={`orders-pagination__page${
                              item === currentPage ? " active" : ""
                            }`}
                            onClick={() => handlePageChange(item)}
                            aria-label={`Go to page ${item}`}
                            aria-current={
                              item === currentPage
                                ? "page"
                                : undefined
                            }
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="orders-pagination__nav"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        handlePageChange(currentPage + 1)
                      }
                      aria-label="Go to next page"
                    >
                      <span>Next</span>
                      <ChevronRight size={17} />
                    </button>
                  </div>
                )}
              </nav>
            </>
          )}
        </>
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <div className="order-review-modal-overlay" onClick={closeReviewModal}>
          <div className="order-review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-review-modal-header">
              <div>
                <h3>Add Product Review</h3>
                <p>Share your experience for order #{reviewModalOrder.orderId || String(reviewModalOrder._id).slice(-8)}</p>
              </div>
              <button type="button" className="order-review-modal-close" onClick={closeReviewModal}>
                <X size={20} />
              </button>
            </div>

            {reviewMsg.text && (
              <div className={`order-review-alert ${reviewMsg.type}`}>
                {reviewMsg.text}
              </div>
            )}

            <form onSubmit={submitReview} className="order-review-form">
              {reviewModalOrder.items?.length > 1 && (
                <div className="order-review-field">
                  <label>Select Product to Review</label>
                  <select 
                    value={selectedItemIndex} 
                    onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
                  >
                    {reviewModalOrder.items.map((it, idx) => (
                      <option key={idx} value={idx}>{it.name || `Product #${idx + 1}`}</option>
                    ))}
                  </select>
                </div>
              )}

              {reviewModalOrder.items?.[selectedItemIndex] && (
                <div className="order-review-selected-product">
                  <img 
                    src={reviewModalOrder.items[selectedItemIndex].image || "/product_ghee.png"} 
                    alt="Product" 
                    onError={(e) => { e.currentTarget.src = "/product_ghee.png"; }}
                  />
                  <div>
                    <strong>{reviewModalOrder.items[selectedItemIndex].name}</strong>
                    <span>Pack: {reviewModalOrder.items[selectedItemIndex].size || "Standard"}</span>
                  </div>
                </div>
              )}

              <div className="order-review-field">
                <label>Overall Rating</label>
                <div className="order-review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`order-review-star-btn ${star <= reviewRating ? "active" : ""}`}
                      onClick={() => setReviewRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="order-review-field">
                <label>Review Title (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Excellent quality & fast delivery!" 
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
              </div>

              <div className="order-review-field">
                <label>Your Review *</label>
                <textarea 
                  rows="4"
                  placeholder="Write your honest opinion about this product..." 
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="order-review-field">
                <label>Attach Photo (Optional)</label>
                <div className="order-review-upload-box">
                  <input 
                    type="file" 
                    id="order-review-img-input" 
                    accept="image/*" 
                    onChange={handleReviewImageChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="order-review-img-input" className="order-review-upload-btn">
                    <Upload size={16} /> Choose Image
                  </label>
                  {reviewImagePreview && (
                    <div className="order-review-img-preview">
                      <img src={reviewImagePreview} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="order-review-actions">
                <button type="button" className="order-review-cancel-btn" onClick={closeReviewModal}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="order-review-submit-btn">
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}