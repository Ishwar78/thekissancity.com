import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ChevronRight,
  Heart,
  HelpCircle,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";

import { useUser } from "../../context/UserContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import UserProfileTab from "./UserProfileTab";
import UserOrdersTab from "./UserOrdersTab";
import UserWishlistTab from "./UserWishlistTab";
import UserReturnsTab from "./UserReturnsTab";
import UserShipmentTab from "./UserShipmentTab";
import UserSupportTab from "./UserSupportTab";

import "./UserDashboard.css";

const NAV_ITEMS = [
  {
    id: "profile",
    label: "My Profile",
    description: "Personal information",
    icon: User,
  },
  {
    id: "orders",
    label: "My Orders",
    description: "View order history",
    icon: ShoppingBag,
  },
  {
    id: "wishlist",
    label: "Wishlist",
    description: "Saved products",
    icon: Heart,
  },
  {
    id: "returns",
    label: "My Returns",
    description: "Manage returns",
    icon: RotateCcw,
  },
  {
    id: "shipment",
    label: "Shipment",
    description: "Track deliveries",
    icon: Truck,
  },
  {
    id: "support",
    label: "Support",
    description: "Get help quickly",
    icon: HelpCircle,
  },
];

const VALID_TABS = new Set(NAV_ITEMS.map((item) => item.id));

export default function UserDashboard() {
  const { user, logoutUser, loading } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const initialTab = VALID_TABS.has(requestedTab) ? requestedTab : "profile";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const activeNavItem = useMemo(
    () => NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0],
    [activeTab],
  );

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");

    if (VALID_TABS.has(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow = "";
      return undefined;
    }

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleResize);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteError("");
    }
  }, [showDeleteModal]);

  const getUserInitial = () => {
    const displayName = user?.name?.trim();
    return displayName ? displayName.charAt(0).toUpperCase() : "K";
  };

  const selectTab = (tabId) => {
    if (!VALID_TABS.has(tabId)) return;

    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    logoutUser();
    navigate("/", { replace: true });
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeletingAccount(true);

    try {
      const baseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5005"
      ).replace(/\/$/, "");

      const token = localStorage.getItem("kissanUserToken");
      const userId = user?.id || user?._id;

      if (userId && !String(userId).startsWith("demo-")) {
        const response = await fetch(`${baseUrl}/api/user/${userId}`, {
          method: "DELETE",
          headers: {
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        });

        let responseData = {};

        try {
          responseData = await response.json();
        } catch {
          responseData = {};
        }

        if (!response.ok) {
          throw new Error(
            responseData?.message || "Unable to delete your account.",
          );
        }
      }

      logoutUser();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Delete account error:", error);
      setDeleteError(
        error?.message || "Account deletion failed. Please try again.",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfileTab />;
      case "orders":
        return <UserOrdersTab onSelectTab={selectTab} />;
      case "wishlist":
        return <UserWishlistTab />;
      case "returns":
        return <UserReturnsTab />;
      case "shipment":
        return <UserShipmentTab />;
      case "support":
        return <UserSupportTab />;
      default:
        return <UserProfileTab />;
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard-loading">
        <span className="user-dashboard-loading__icon">
          <LoaderCircle className="user-dashboard-spinner" size={30} />
        </span>
        <h2>Loading your dashboard</h2>
        <p>Please wait while we prepare your account.</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="user-dashboard-page">
      <Navbar />

      <main className="user-dashboard-wrapper">
        <div className="user-dashboard-container">
          <section className="user-dashboard-header">
            <div
              className="user-dashboard-header__decoration user-dashboard-header__decoration--one"
              aria-hidden="true"
            />
            <div
              className="user-dashboard-header__decoration user-dashboard-header__decoration--two"
              aria-hidden="true"
            />

            <div className="user-info-group">
              <div className="user-avatar-circle">{getUserInitial()}</div>

              <div className="user-greeting-copy">
                <span className="user-dashboard-eyebrow">
                  <Sparkles size={14} />
                  Welcome to your account
                </span>

                <h1 className="user-greeting-title">
                  Hello, {user.name || "Kissan Customer"}!
                </h1>

                <p className="user-greeting-sub">
                  Manage orders, saved items, shipments and account details
                  from one place.
                </p>
              </div>
            </div>

            <div className="user-header-badges">
              <span className="user-header-badge">
                <Leaf size={15} />
                Kissan Club Member
              </span>

              <span className="user-header-badge">
                <ShieldCheck size={15} />
                Secure Account
              </span>
            </div>
          </section>

          <div className="user-dashboard-mobile-bar">
            <div>
              <span>Current Section</span>
              <strong>{activeNavItem.label}</strong>
            </div>

            <button
              type="button"
              className="user-dashboard-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open dashboard menu"
              aria-expanded={sidebarOpen}
            >
              <Menu size={20} />
              Menu
            </button>
          </div>

          <div className="user-dashboard-grid">
            {sidebarOpen && (
              <button
                type="button"
                className="user-sidebar-overlay"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close dashboard menu"
              />
            )}

            <aside
              className={`user-sidebar-card ${
                sidebarOpen ? "user-sidebar-card--open" : ""
              }`}
              aria-label="User dashboard navigation"
            >
              <div className="user-sidebar-mobile-header">
                <div>
                  <span>Dashboard Menu</span>
                  <strong>{user.name || "My Account"}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close dashboard menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="user-sidebar-profile">
                <div className="user-sidebar-profile__avatar">
                  {getUserInitial()}
                </div>

                <div>
                  <strong>{user.name || "Kissan Customer"}</strong>
                  <span>{user.mobile ? `+91 ${user.mobile}` : "My Account"}</span>
                </div>
              </div>

              <nav className="user-sidebar-nav">
                <span className="user-sidebar-nav__label">Account Menu</span>

                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`user-nav-item ${
                        isActive ? "active" : ""
                      }`}
                      onClick={() => selectTab(item.id)}
                    >
                      <span className="user-nav-item__icon">
                        <Icon size={18} />
                      </span>

                      <span className="user-nav-item__copy">
                        <strong>{item.label}</strong>
                        <small>{item.description}</small>
                      </span>

                      <ChevronRight
                        className="user-nav-item__arrow"
                        size={16}
                      />
                    </button>
                  );
                })}

                <div className="user-nav-divider" />

                <button
                  type="button"
                  className="user-nav-item user-nav-item--logout"
                  onClick={handleLogout}
                >
                  <span className="user-nav-item__icon">
                    <LogOut size={18} />
                  </span>

                  <span className="user-nav-item__copy">
                    <strong>Logout</strong>
                    <small>Sign out from this account</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="user-nav-item user-nav-item--delete"
                  onClick={() => {
                    setSidebarOpen(false);
                    navigate("/account/delete");
                  }}
                >
                  <span className="user-nav-item__icon">
                    <Trash2 size={18} />
                  </span>

                  <span className="user-nav-item__copy">
                    <strong>Delete Account</strong>
                    <small>Permanently remove account</small>
                  </span>
                </button>
              </nav>
            </aside>

            <section className="user-content-card">
              <div className="user-content-card__header">
                <div>
                  <span className="user-dashboard-eyebrow">
                    {React.createElement(activeNavItem.icon, { size: 14 })}
                    Account dashboard
                  </span>
                  <h2>{activeNavItem.label}</h2>
                  <p>{activeNavItem.description}</p>
                </div>
              </div>

              <div className="user-content-card__body">{renderContent()}</div>
            </section>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deletingAccount) {
              setShowDeleteModal(false);
            }
          }}
        >
          <div
            className="delete-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
            <div className="delete-modal-icon">
              <AlertTriangle size={29} />
            </div>

            <h3 id="delete-account-title">Delete Your Account?</h3>

            <p>
              Are you sure you want to delete your account? Your saved
              addresses, account details and wishlist items will be permanently
              removed.
            </p>

            {deleteError && (
              <div className="delete-modal-error">{deleteError}</div>
            )}

            <div className="delete-modal-actions">
              <button
                type="button"
                className="delete-modal-btn delete-modal-btn--danger"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? (
                  <>
                    <LoaderCircle
                      className="user-dashboard-spinner"
                      size={17}
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Yes, Delete
                  </>
                )}
              </button>

              <button
                type="button"
                className="delete-modal-btn delete-modal-btn--cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}