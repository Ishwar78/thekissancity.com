import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
} from "lucide-react";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const baseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5005"
      ).replace(/\/$/, "");

      const response = await fetch(`${baseUrl}/api/user`);

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch users.");
      }

      if (data.success) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        throw new Error(data.message || "Unable to fetch users.");
      }
    } catch (fetchError) {
      console.error("Error fetching users:", fetchError);

      setError(
        fetchError.message ||
          "Something went wrong while loading registered users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) => {
      const name = user.name?.toLowerCase() || "";
      const mobile = String(user.mobile || "").toLowerCase();
      const email = user.email?.toLowerCase() || "";
      const role = user.role?.toLowerCase() || "user";
      const userId = user._id?.toLowerCase() || "";

      return (
        name.includes(term) ||
        mobile.includes(term) ||
        email.includes(term) ||
        role.includes(term) ||
        userId.includes(term)
      );
    });
  }, [users, searchTerm]);

  const userStatistics = useMemo(() => {
    const adminCount = users.filter(
      (user) => user.role?.toLowerCase() === "admin"
    ).length;

    return {
      total: users.length,
      customers: users.length - adminCount,
      admins: adminCount,
      visible: filteredUsers.length,
    };
  }, [users, filteredUsers]);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUserInitials = (name) => {
    if (!name?.trim()) {
      return "U";
    }

    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const getShortUserId = (userId) => {
    if (!userId) {
      return "N/A";
    }

    return userId.slice(-6).toUpperCase();
  };

  const getRoleClass = (role) => {
    return role?.toLowerCase() === "admin" ? "is-admin" : "is-user";
  };

  return (
    <main className="admin-users-page">
      <section className="admin-users-header">
        <div className="admin-users-header__content">
          <div className="admin-users-header__icon">
            <Users size={26} />
          </div>

          <div>
            <span className="admin-users-header__eyebrow">
              Customer Management
            </span>

            <h1>User Management</h1>

            <p>
              View and manage all customers registered on The Kissan City.
            </p>
          </div>
        </div>

        <div className="admin-users-header__actions">
          <div className="admin-users-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search name, phone or email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search registered users"
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-users-search__clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className="admin-users-refresh-button"
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "is-spinning" : ""}
            />

            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </section>

      <section className="admin-users-stats">
        <article className="admin-users-stat-card">
          <div className="admin-users-stat-card__icon">
            <Users size={22} />
          </div>

          <div>
            <span>Total Users</span>
            <strong>{userStatistics.total}</strong>
            <p>All registered accounts</p>
          </div>
        </article>

        <article className="admin-users-stat-card">
          <div className="admin-users-stat-card__icon">
            <UserRound size={22} />
          </div>

          <div>
            <span>Customers</span>
            <strong>{userStatistics.customers}</strong>
            <p>Regular customer accounts</p>
          </div>
        </article>

        <article className="admin-users-stat-card">
          <div className="admin-users-stat-card__icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <span>Administrators</span>
            <strong>{userStatistics.admins}</strong>
            <p>Admin access accounts</p>
          </div>
        </article>

        <article className="admin-users-stat-card">
          <div className="admin-users-stat-card__icon">
            <Search size={22} />
          </div>

          <div>
            <span>Visible Results</span>
            <strong>{userStatistics.visible}</strong>
            <p>
              {searchTerm ? "Matching your search" : "Currently displayed"}
            </p>
          </div>
        </article>
      </section>

      <section className="admin-users-panel">
        <div className="admin-users-panel__header">
          <div>
            <div className="admin-users-panel__title">
              <UserCheck size={20} />
              <h2>Registered Users</h2>
            </div>

            <p>
              {searchTerm
                ? `${filteredUsers.length} result${
                    filteredUsers.length === 1 ? "" : "s"
                  } found for “${searchTerm}”`
                : `${users.length} registered user${
                    users.length === 1 ? "" : "s"
                  }`}
            </p>
          </div>

          <div className="admin-users-panel__status">
            <span />
            Live user records
          </div>
        </div>

        {error && !loading && (
          <div className="admin-users-error">
            <div className="admin-users-error__icon">
              <AlertCircle size={23} />
            </div>

            <div>
              <h3>Unable to load users</h3>
              <p>{error}</p>
            </div>

            <button type="button" onClick={() => fetchUsers()}>
              Try Again
            </button>
          </div>
        )}

        {!error && (
          <div className="admin-users-table-wrapper">
            {loading ? (
              <div className="admin-users-loading">
                <div className="admin-users-loading__spinner" />

                <h3>Loading registered users</h3>
                <p>Please wait while we fetch the latest user records.</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Contact Information</th>
                    <th>Account Role</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const role = user.role?.toLowerCase() || "user";

                    return (
                      <tr key={user._id}>
                        <td data-label="User Details">
                          <div className="admin-users-profile-cell">
                            <div className="admin-users-avatar">
                              {getUserInitials(user.name)}
                            </div>

                            <div className="admin-users-profile-info">
                              <strong>{user.name || "Unnamed User"}</strong>

                              <span>
                                User ID: #{getShortUserId(user._id)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td data-label="Contact Information">
                          <div className="admin-users-contact-list">
                            <a
                              href={
                                user.mobile
                                  ? `tel:${user.mobile}`
                                  : undefined
                              }
                              className={
                                !user.mobile
                                  ? "admin-users-contact-item is-disabled"
                                  : "admin-users-contact-item"
                              }
                            >
                              <span>
                                <Phone size={15} />
                              </span>

                              {user.mobile || "Phone not provided"}
                            </a>

                            <a
                              href={
                                user.email
                                  ? `mailto:${user.email}`
                                  : undefined
                              }
                              className={
                                !user.email
                                  ? "admin-users-contact-item is-disabled"
                                  : "admin-users-contact-item"
                              }
                            >
                              <span>
                                <Mail size={15} />
                              </span>

                              {user.email || "Email not provided"}
                            </a>
                          </div>
                        </td>

                        <td data-label="Account Role">
                          <span
                            className={`admin-users-role-badge ${getRoleClass(
                              role
                            )}`}
                          >
                            {role === "admin" ? (
                              <ShieldCheck size={14} />
                            ) : (
                              <UserRound size={14} />
                            )}

                            {role}
                          </span>
                        </td>

                        <td data-label="Joined Date">
                          <div className="admin-users-date-cell">
                            <span>
                              <CalendarDays size={16} />
                            </span>

                            <div>
                              <strong>{formatDate(user.createdAt)}</strong>
                              <small>Registration date</small>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="admin-users-empty">
                <div className="admin-users-empty__icon">
                  <Search size={38} />
                </div>

                <h3>No users found</h3>

                <p>
                  No registered user matches “{searchTerm}”. Try searching with
                  a different name, email address or phone number.
                </p>

                <button type="button" onClick={() => setSearchTerm("")}>
                  Clear Search
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}