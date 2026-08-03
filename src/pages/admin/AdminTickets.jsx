import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Inbox,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Send,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import "./AdminTickets.css";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [expandedTicket, setExpandedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyingTicketId, setReplyingTicketId] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageError, setPageError] = useState("");
  const [replyError, setReplyError] = useState("");

  useEffect(() => {
    fetchTickets();
  }, []);

  const getBaseUrl = () => {
    return (
      import.meta.env.VITE_API_URL || "https://thekissancity.com"
    ).replace(/\/$/, "");
  };

  const fetchTickets = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError("");

      const response = await fetch(`${getBaseUrl()}/api/tickets`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load support tickets."
        );
      }

      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (error) {
      console.error("Error fetching tickets:", error);

      setPageError(
        error.message ||
          "Something went wrong while loading support tickets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleExpandTicket = (ticketId) => {
    setExpandedTicket((currentTicketId) =>
      currentTicketId === ticketId ? null : ticketId
    );

    setReplyText("");
    setReplyError("");
  };

  const handleReply = async (ticketId) => {
    const message = replyText.trim();

    if (!message) {
      setReplyError("Please enter a reply before sending.");
      return;
    }

    try {
      setReplyingTicketId(ticketId);
      setReplyError("");

      const response = await fetch(
        `${getBaseUrl()}/api/tickets/${ticketId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: "admin",
            text: message,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to send your reply."
        );
      }

      setTickets((previousTickets) =>
        previousTickets.map((ticket) =>
          ticket._id === ticketId ? data.ticket : ticket
        )
      );

      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);

      setReplyError(
        error.message || "Unable to send the reply right now."
      );
    } finally {
      setReplyingTicketId("");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      setUpdatingStatusId(ticketId);

      const response = await fetch(
        `${getBaseUrl()}/api/tickets/${ticketId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update ticket status."
        );
      }

      setTickets((previousTickets) =>
        previousTickets.map((ticket) =>
          ticket._id === ticketId
            ? data.ticket || {
                ...ticket,
                status: newStatus,
              }
            : ticket
        )
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
      window.alert(
        error.message || "Unable to update ticket status."
      );
    } finally {
      setUpdatingStatusId("");
    }
  };

  const normalizeStatus = (status) => {
    return String(status || "Open").trim().toLowerCase();
  };

  const getStatusClass = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "in progress") {
      return "is-progress";
    }

    if (normalizedStatus === "resolved") {
      return "is-resolved";
    }

    if (normalizedStatus === "closed") {
      return "is-closed";
    }

    return "is-open";
  };

  const filteredTickets = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const ticketId = String(ticket._id || "").toLowerCase();
      const subject = String(ticket.subject || "").toLowerCase();
      const message = String(ticket.message || "").toLowerCase();
      const category = String(ticket.category || "").toLowerCase();
      const status = normalizeStatus(ticket.status);
      const customerName = String(
        ticket.user?.name || ""
      ).toLowerCase();
      const customerMobile = String(
        ticket.user?.mobile || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        ticketId.includes(query) ||
        subject.includes(query) ||
        message.includes(query) ||
        category.includes(query) ||
        status.includes(query) ||
        customerName.includes(query) ||
        customerMobile.includes(query);

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, statusFilter]);

  const statistics = useMemo(() => {
    const openTickets = tickets.filter(
      (ticket) => normalizeStatus(ticket.status) === "open"
    ).length;

    const inProgressTickets = tickets.filter(
      (ticket) =>
        normalizeStatus(ticket.status) === "in progress"
    ).length;

    const completedTickets = tickets.filter((ticket) => {
      const status = normalizeStatus(ticket.status);

      return status === "resolved" || status === "closed";
    }).length;

    return {
      total: tickets.length,
      open: openTickets,
      inProgress: inProgressTickets,
      completed: completedTickets,
    };
  }, [tickets]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";

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

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "Time not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Time not available";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getShortTicketId = (ticketId) => {
    if (!ticketId) return "N/A";

    return ticketId.slice(-6).toUpperCase();
  };

  const isTicketCompleted = (status) => {
    const normalizedStatus = normalizeStatus(status);

    return (
      normalizedStatus === "closed" ||
      normalizedStatus === "resolved"
    );
  };

  return (
    <main className="admin-tickets-page">
      <section className="admin-tickets-header">
        <div className="admin-tickets-header__content">
          <div className="admin-tickets-header__icon">
            <MessageSquare size={27} />
          </div>

          <div>
            <span className="admin-tickets-header__eyebrow">
              Customer Support
            </span>

            <h1>Support Tickets</h1>

            <p>
              Review customer questions, send replies and manage
              support ticket statuses.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="admin-tickets-refresh-button"
          onClick={() => fetchTickets(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "is-spinning" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh Tickets"}
        </button>
      </section>

      <section className="admin-tickets-stats">
        <article className="admin-tickets-stat-card">
          <div className="admin-tickets-stat-card__icon">
            <Inbox size={22} />
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{statistics.total}</strong>
            <p>All support requests</p>
          </div>
        </article>

        <article className="admin-tickets-stat-card is-open">
          <div className="admin-tickets-stat-card__icon">
            <MessageCircle size={22} />
          </div>

          <div>
            <span>Open Tickets</span>
            <strong>{statistics.open}</strong>
            <p>Waiting for support</p>
          </div>
        </article>

        <article className="admin-tickets-stat-card is-progress">
          <div className="admin-tickets-stat-card__icon">
            <Clock3 size={22} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{statistics.inProgress}</strong>
            <p>Currently being handled</p>
          </div>
        </article>

        <article className="admin-tickets-stat-card is-completed">
          <div className="admin-tickets-stat-card__icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{statistics.completed}</strong>
            <p>Resolved or closed</p>
          </div>
        </article>
      </section>

      <section className="admin-tickets-panel">
        <div className="admin-tickets-panel__header">
          <div>
            <div className="admin-tickets-panel__title">
              <MessageSquare size={20} />
              <h2>Customer Help Desk</h2>
            </div>

            <p>
              Showing {filteredTickets.length} of {tickets.length} ticket
              {tickets.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="admin-tickets-filters">
            <div className="admin-tickets-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search ticket, customer or category..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear ticket search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="admin-tickets-filter-select">
              <Tag size={16} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="all">All Status</option>
                <option value="open">Open Only</option>
                <option value="in progress">
                  In Progress
                </option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <ChevronDown size={15} />
            </div>
          </div>
        </div>

        {pageError && !loading && (
          <div className="admin-tickets-error">
            <div className="admin-tickets-error__icon">
              <AlertCircle size={23} />
            </div>

            <div>
              <h3>Unable to load support tickets</h3>
              <p>{pageError}</p>
            </div>

            <button
              type="button"
              onClick={() => fetchTickets()}
            >
              Try Again
            </button>
          </div>
        )}

        {!pageError && (
          <div className="admin-tickets-table-wrapper">
            {loading ? (
              <div className="admin-tickets-loading">
                <div className="admin-tickets-loader" />

                <h3>Loading support tickets</h3>

                <p>
                  Please wait while we fetch the latest customer
                  support requests.
                </p>
              </div>
            ) : filteredTickets.length > 0 ? (
              <table className="admin-tickets-table">
                <thead>
                  <tr>
                    <th>Ticket Details</th>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="admin-tickets-expand-heading">
                      Conversation
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => {
                    const isExpanded =
                      expandedTicket === ticket._id;

                    const responses = Array.isArray(
                      ticket.responses
                    )
                      ? ticket.responses
                      : [];

                    const isUpdating =
                      updatingStatusId === ticket._id;

                    const isReplying =
                      replyingTicketId === ticket._id;

                    return (
                      <React.Fragment key={ticket._id}>
                        <tr
                          className={`admin-tickets-row ${
                            isExpanded ? "is-expanded" : ""
                          }`}
                          onClick={() =>
                            handleExpandTicket(ticket._id)
                          }
                        >
                          <td data-label="Ticket Details">
                            <div className="admin-tickets-subject-cell">
                              <div className="admin-tickets-subject-icon">
                                <MessageSquare size={19} />
                              </div>

                              <div>
                                <strong>
                                  {ticket.subject ||
                                    "Support Request"}
                                </strong>

                                <span>
                                  <span>
                                    #{getShortTicketId(ticket._id)}
                                  </span>

                                  <i />

                                  <CalendarDays size={13} />

                                  {formatDate(ticket.createdAt)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td data-label="Customer">
                            <div className="admin-tickets-customer-cell">
                              <div className="admin-tickets-customer-avatar">
                                <UserRound size={18} />
                              </div>

                              <div>
                                <strong>
                                  {ticket.user?.name ||
                                    "Unknown Customer"}
                                </strong>

                                <span>
                                  <Phone size={13} />

                                  {ticket.user?.mobile ||
                                    "Phone unavailable"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td data-label="Category">
                            <span className="admin-tickets-category">
                              <Tag size={13} />

                              {ticket.category || "General"}
                            </span>
                          </td>

                          <td
                            data-label="Status"
                            onClick={(event) =>
                              event.stopPropagation()
                            }
                          >
                            <div
                              className={`admin-tickets-status-select ${getStatusClass(
                                ticket.status
                              )}`}
                            >
                              {isUpdating ? (
                                <span className="admin-tickets-small-loader" />
                              ) : (
                                <span className="admin-tickets-status-dot" />
                              )}

                              <select
                                value={ticket.status || "Open"}
                                onChange={(event) =>
                                  handleStatusChange(
                                    ticket._id,
                                    event.target.value
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <option value="Open">Open</option>

                                <option value="In Progress">
                                  In Progress
                                </option>

                                <option value="Resolved">
                                  Resolved
                                </option>

                                <option value="Closed">
                                  Closed
                                </option>
                              </select>

                              <ChevronDown size={14} />
                            </div>
                          </td>

                          <td
                            data-label="Conversation"
                            className="admin-tickets-expand-cell"
                          >
                            <button
                              type="button"
                              className={`admin-tickets-expand-button ${
                                isExpanded ? "is-active" : ""
                              }`}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleExpandTicket(ticket._id);
                              }}
                            >
                              <span>
                                {responses.length + 1} message
                                {responses.length + 1 === 1
                                  ? ""
                                  : "s"}
                              </span>

                              {isExpanded ? (
                                <ChevronUp size={18} />
                              ) : (
                                <ChevronDown size={18} />
                              )}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="admin-tickets-expanded-row">
                            <td colSpan="5">
                              <div className="admin-ticket-conversation">
                                <div className="admin-ticket-conversation__header">
                                  <div>
                                    <div className="admin-ticket-conversation__header-icon">
                                      <MessageCircle size={20} />
                                    </div>

                                    <div>
                                      <span>
                                        Ticket conversation
                                      </span>

                                      <h3>
                                        {ticket.subject ||
                                          "Support Request"}
                                      </h3>
                                    </div>
                                  </div>

                                  <span
                                    className={`admin-ticket-conversation__status ${getStatusClass(
                                      ticket.status
                                    )}`}
                                  >
                                    {ticket.status || "Open"}
                                  </span>
                                </div>

                                <div className="admin-ticket-messages">
                                  <div className="admin-ticket-message is-customer">
                                    <div className="admin-ticket-message__avatar">
                                      <UserRound size={17} />
                                    </div>

                                    <div className="admin-ticket-message__body">
                                      <div className="admin-ticket-message__meta">
                                        <strong>
                                          {ticket.user?.name ||
                                            "Customer"}
                                        </strong>

                                        <span>
                                          {formatDateTime(
                                            ticket.createdAt
                                          )}
                                        </span>
                                      </div>

                                      <div className="admin-ticket-message__bubble">
                                        {ticket.message ||
                                          "No message provided."}
                                      </div>
                                    </div>
                                  </div>

                                  {responses.map(
                                    (response, index) => {
                                      const isAdmin =
                                        response.sender ===
                                        "admin";

                                      return (
                                        <div
                                          key={
                                            response._id ||
                                            `${ticket._id}-${index}`
                                          }
                                          className={`admin-ticket-message ${
                                            isAdmin
                                              ? "is-admin"
                                              : "is-customer"
                                          }`}
                                        >
                                          <div className="admin-ticket-message__avatar">
                                            {isAdmin ? (
                                              <MessageSquare
                                                size={17}
                                              />
                                            ) : (
                                              <UserRound
                                                size={17}
                                              />
                                            )}
                                          </div>

                                          <div className="admin-ticket-message__body">
                                            <div className="admin-ticket-message__meta">
                                              <strong>
                                                {isAdmin
                                                  ? "Support Team"
                                                  : ticket.user
                                                        ?.name ||
                                                    "Customer"}
                                              </strong>

                                              <span>
                                                {formatDateTime(
                                                  response.date ||
                                                    response.createdAt
                                                )}
                                              </span>
                                            </div>

                                            <div className="admin-ticket-message__bubble">
                                              {response.text}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>

                                {isTicketCompleted(
                                  ticket.status
                                ) ? (
                                  <div className="admin-ticket-closed-note">
                                    <CheckCircle2 size={20} />

                                    <div>
                                      <strong>
                                        This ticket is{" "}
                                        {normalizeStatus(
                                          ticket.status
                                        )}
                                      </strong>

                                      <span>
                                        Change its status to Open or
                                        In Progress to send another
                                        response.
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="admin-ticket-reply-section">
                                    <div className="admin-ticket-reply-section__heading">
                                      <div>
                                        <Send size={17} />

                                        <span>
                                          Reply as Support Team
                                        </span>
                                      </div>

                                      <small>
                                        Shift + Enter for new line
                                      </small>
                                    </div>

                                    <div className="admin-ticket-reply-box">
                                      <textarea
                                        rows={3}
                                        placeholder="Write a helpful response to the customer..."
                                        value={replyText}
                                        onChange={(event) => {
                                          setReplyText(
                                            event.target.value
                                          );

                                          setReplyError("");
                                        }}
                                        onKeyDown={(event) => {
                                          if (
                                            event.key === "Enter" &&
                                            !event.shiftKey
                                          ) {
                                            event.preventDefault();
                                            handleReply(ticket._id);
                                          }
                                        }}
                                      />

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleReply(ticket._id)
                                        }
                                        disabled={
                                          isReplying ||
                                          !replyText.trim()
                                        }
                                      >
                                        {isReplying ? (
                                          <>
                                            <span className="admin-tickets-reply-loader" />
                                            Sending...
                                          </>
                                        ) : (
                                          <>
                                            <Send size={16} />
                                            Send Reply
                                          </>
                                        )}
                                      </button>
                                    </div>

                                    {replyError && (
                                      <div className="admin-ticket-reply-error">
                                        <AlertCircle size={16} />
                                        {replyError}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="admin-tickets-empty">
                <div className="admin-tickets-empty__icon">
                  <CheckCircle2 size={43} />
                </div>

                <h3>
                  {searchTerm || statusFilter !== "all"
                    ? "No matching tickets found"
                    : "All caught up!"}
                </h3>

                <p>
                  {searchTerm || statusFilter !== "all"
                    ? "Try changing the search term or selected status filter."
                    : "There are currently no customer support tickets requiring your attention."}
                </p>

                {(searchTerm || statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}