import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  MapPin,
  Image as ImageIcon,
  Percent,
  Mail,
  Layout,
  Receipt,
  RefreshCcw,
  LogOut,
  Film,
  BookOpenText,
  Sun,
  Menu,
  X,
  UserRound,
  HelpCircle,
  MessageSquareText,
  Type,
  PhoneCall,
  FileText,
  Users,
  Layers
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import AdminCategories from "./AdminCategories";
import AdminHealth from "./AdminHealth";
import AdminBanners from "./AdminBanners";
import AdminVideos from "./AdminVideos";
import AdminAboutHome from "./AdminAboutHome";
import AdminProducts from "./AdminProducts";
import AdminSolarInquiries from "./AdminSolarInquiries";
import AdminOrders from "./AdminOrders";
import AdminUsers from "./AdminUsers";
import AdminCoupons from "./AdminCoupons";
import AdminReturns from "./AdminReturns";
import AdminTickets from "./AdminTickets";
import AdminTickers from "./AdminTickers";
import AdminBlogs from "./AdminBlogs";
import AdminOverview from "./AdminOverview";
import AdminContactUpdate from "./AdminContactUpdate";
import AdminInquiries from "./AdminInquiries";
import AdminReviews from "./AdminReviews";
import AdminCreateReview from "./AdminCreateReview";
import AdminPolicies from "./AdminPolicies";
import AdminFarmersExperts from "./AdminFarmersExperts";
import AdminBulkCoupons from "./AdminBulkCoupons";

import "./AdminDashboard.css";

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "contact-update",
    label: "Contact & Bill Details Update",
    icon: <PhoneCall size={20} />,
  },
  {
    id: "inquiries",
    label: "Contact Inquiries",
    icon: <Mail size={20} />,
  },
  {
    id: "about-home",
    label: "About Home",
    icon: <BookOpenText size={20} />,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <Receipt size={20} />,
  },
  {
    id: "users",
    label: "Users",
    icon: <UserRound size={20} />,
  },
  {
    id: "products",
    label: "Products",
    icon: <Package size={20} />,
  },
  {
    id: "solar-inquiry",
    label: "Solar Inquiry",
    icon: <Sun size={20} />,
  },
  {
    id: "admin-reviews",
    label: "User Reviews",
    icon: <MessageSquareText size={20} />,
  },
  {
    id: "admin-create-review",
    label: "Create Review",
    icon: <ImageIcon size={20} />,
  },
  {
    id: "categories",
    label: "Categories",
    icon: <Tags size={20} />,
  },
  {
    id: "health",
    label: "Health",
    icon: <MapPin size={20} />,
  },
  {
    id: "slider",
    label: "Product Slider",
    icon: <ImageIcon size={20} />,
  },
  {
    id: "videos",
    label: "Influencer Videos",
    icon: <Film size={20} />,
  },
  {
    id: "coupons",
    label: "Coupon Management",
    icon: <Percent size={20} />,
  },
  {
    id: "bulk-coupons",
    label: "Bulk Coupons",
    icon: <Layers size={20} />,
  },
  // {
  //   id: "pages",
  //   label: "Pages",
  //   icon: <Layout size={20} />,
  // },
  {
    id: "returns",
    label: "Return Requests",
    icon: <RefreshCcw size={20} />,
  },
  {
    id: "tickets",
    label: "Support Tickets",
    icon: <HelpCircle size={20} />,
  },
  {
    id: "tickers",
    label: "Ticker Bar",
    icon: <Type size={20} />,
  },
  {
    id: "blogs",
    label: "Blogs",
    icon: <MessageSquareText size={20} />,
  },
  {
    id: "admin-policies",
    label: "Policy Pages",
    icon: <FileText size={20} />,
  },
  {
    id: "farmers-experts",
    label: "Farmers & Experts",
    icon: <Users size={20} />,
  },
];

const fullWidthTabs = [
  "contact-update",
  "inquiries",
  "orders",
  "users",
  "coupons",
  "returns",
  "tickets",
  "tickers",
  "blogs",
  "products",
  "solar-inquiry",
  "about-home",
  "categories",
  "health",
  "slider",
  "videos",
  "admin-reviews",
  "admin-create-review",
  "admin-policies",
  "farmers-experts",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Poll for new pending orders
  useEffect(() => {
    const checkNewOrders = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/orders`);
        const data = await res.json().catch(() => ({}));
        if (data.success && Array.isArray(data.orders)) {
          const pendingCount = data.orders.filter(o => {
            const s = String(o.status || '').toLowerCase();
            return s === 'pending' || s === 'processing';
          }).length;
          setNewOrdersCount(pendingCount);
        }
      } catch (err) {
        console.error("Error checking new orders:", err);
      }
    };

    checkNewOrders();
    const interval = setInterval(checkNewOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of Admin Panel?")) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin/login");
    }
  };

  const activeItem = navItems.find((item) => item.id === activeTab);
  const isFullWidthTab = fullWidthTabs.includes(activeTab);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add("admin-sidebar-open");
    } else {
      document.body.classList.remove("admin-sidebar-open");
    }

    return () => {
      document.body.classList.remove("admin-sidebar-open");
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 991) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const renderActiveContent = () => {
    switch (activeTab) {
      case "overview":
        return <AdminOverview onSelectTab={handleTabChange} />;

      case "contact-update":
        return <AdminContactUpdate />;

      case "inquiries":
        return <AdminInquiries />;

      case "orders":
        return <AdminOrders />;

      case "users":
        return <AdminUsers />;

      case "coupons":
        return <AdminCoupons />;

      case "bulk-coupons":
        return <AdminBulkCoupons />;

      case "returns":
        return <AdminReturns />;

      case "tickets":
        return <AdminTickets />;

      case "tickers":
        return <AdminTickers />;

      case "blogs":
        return <AdminBlogs />;

      case "products":
        return <AdminProducts />;

      case "solar-inquiry":
        return <AdminSolarInquiries />;

      case "about-home":
        return <AdminAboutHome />;

      case "categories":
        return <AdminCategories />;

      case "health":
        return <AdminHealth />;

      case "slider":
        return <AdminBanners />;

      case "videos":
        return <AdminVideos />;

      case "admin-reviews":
        return <AdminReviews />;

      case "admin-create-review":
        return <AdminCreateReview />;

      case "admin-policies":
        return <AdminPolicies />;

      case "farmers-experts":
        return <AdminFarmersExperts />;

      default:
        return <AdminOverview onSelectTab={handleTabChange} />;
    }
  };

  return (
    <div className="admin-dashboard-shell">
      <button
        type="button"
        className={`admin-sidebar-overlay ${
          sidebarOpen ? "is-visible" : ""
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close navigation menu"
      />

      <aside
        className={`admin-dashboard-sidebar ${
          sidebarOpen ? "is-open" : ""
        }`}
      >
        <div className="admin-sidebar-brand">
          <div className="admin-sidebar-logo">
            <span>K</span>
          </div>

          <div className="admin-sidebar-brand-text">
            <h2>Kissan Admin</h2>
            <p>Management Panel</p>
          </div>

          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        <div className="admin-sidebar-menu-label">Main menu</div>

        <nav className="admin-sidebar-nav">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const isOrdersTab = item.id === "orders";

            return (
              <button
                type="button"
                key={item.id}
                className={`admin-sidebar-nav-item ${
                  isActive ? "is-active" : ""
                }`}
                onClick={() => handleTabChange(item.id)}
              >
                <span className="admin-sidebar-nav-icon">{item.icon}</span>

                <span className="admin-sidebar-nav-label">{item.label}</span>

                {isOrdersTab && newOrdersCount > 0 && (
                  <span style={{
                    background: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 900,
                    padding: "2px 7px",
                    borderRadius: "20px",
                    marginLeft: "auto",
                    marginRight: "4px",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                    letterSpacing: "0.05em"
                  }}>
                    {newOrdersCount} NEW
                  </span>
                )}

                {isActive && (
                  <span className="admin-sidebar-active-dot" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link to="/" className="admin-sidebar-store-link" style={{ textDecoration: "none" }}>
            <BookOpenText size={18} />
            <span>Back to Store</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar-store-link"
            style={{
              background: "#fff1f2",
              borderColor: "#fecdd3",
              color: "#e11d48",
              cursor: "pointer",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              borderStyle: "solid",
              borderWidth: "1px",
            }}
          >
            <LogOut size={18} />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-header-left">
            <button
              type="button"
              className="admin-dashboard-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            <div className="admin-dashboard-title">
              <span>Admin dashboard</span>
              <h1>{activeItem?.label || "Overview"}</h1>
            </div>
          </div>

          <div className="admin-dashboard-user" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="admin-dashboard-avatar">
                <UserRound size={20} />
              </div>

              <div className="admin-dashboard-user-info">
                <strong>Admin User</strong>
                <span>Superadmin</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout Admin"
              style={{
                padding: "8px 14px",
                borderRadius: "9px",
                border: "1px solid #fecdd3",
                background: "#fff1f2",
                color: "#e11d48",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <section
          className={`admin-dashboard-content ${
            isFullWidthTab
              ? "admin-dashboard-content--full"
              : "admin-dashboard-content--card"
          }`}
        >
          {renderActiveContent()}
        </section>
      </main>
    </div>
  );
}