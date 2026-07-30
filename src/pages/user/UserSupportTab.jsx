import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Headphones,
  Inbox,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Tag,
  UserRound,
  XCircle,
} from "lucide-react";
import { useUser } from "../../context/UserContext";
import "./UserSupportTab.css";

const SUPPORT_PHONE = "+919876543210";
const SUPPORT_WHATSAPP = "919876543210";
const SUPPORT_EMAIL = "support@kissancity.com";

const initialTicketForm = {
  subject: "",
  category: "Order Query",
  message: "",
};

export default function UserSupportTab() {
  const { user } = useUser();

  const [ticket, setTicket] = useState(initialTicketForm);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTicketId, setReplyingTicketId] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [pageError, setPageError] = useState("");

  const [replyText, setReplyText] = useState({});
  const [expandedTicket, setExpandedTicket] = useState(null);

  const getBaseUrl = () =>
    (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(
      /\/$/,
      ""
    );

  const getUserId = () => user?.id || user?._id;

  useEffect(() => {
    if (getUserId()) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTickets = async (isRefresh = false) => {
    const userId = getUserId();

    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setPageError("");

      const response = await fetch(
        `${getBaseUrl()}/api/tickets/my-tickets/${userId}`
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load your support tickets.");
      }

      setTickets(Array.isArray(data.tickets) ? data.tickets : []);
    } catch (error) {
      console.error("Error fetching tickets:", error);

      setPageError(
        error.message ||
          "Something went wrong while loading your support tickets."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setTicket((previousTicket) => ({
      ...previousTicket,
      [name]: value,
    }));

    setFormError("");
    setFormSuccess("");
  };

  const validateTicket = () => {
    if (!ticket.subject.trim()) {
      return "Please enter a subject for your support ticket.";
    }

    if (ticket.subject.trim().length < 4) {
      return "Subject should contain at least 4 characters.";
    }

    if (!ticket.message.trim()) {
      return "Please describe your issue in detail.";
    }

    if (ticket.message.trim().length < 10) {
      return "Message should contain at least 10 characters.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateTicket();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const userId = getUserId();

    if (!userId) {
      setFormError("Please log in again before raising a support ticket.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");
      setFormSuccess("");

      const response = await fetch(`${getBaseUrl()}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          subject: ticket.subject.trim(),
          category: ticket.category,
          message: ticket.message.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit support ticket.");
      }

      setTicket(initialTicketForm);
      setFormSuccess(
        "Your support ticket has been submitted successfully. Our team will respond shortly."
      );

      await fetchTickets();

      window.setTimeout(() => {
        setFormSuccess("");
      }, 4500);
    } catch (error) {
      console.error("Error submitting ticket:", error);

      setFormError(
        error.message || "Server error while submitting your ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (ticketId) => {
    const text = replyText[ticketId]?.trim();

    if (!text) return;

    try {
      setReplyingTicketId(ticketId);

      const response = await fetch(
        `${getBaseUrl()}/api/tickets/${ticketId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: "user",
            text,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send your reply.");
      }

      setTickets((previousTickets) =>
        previousTickets.map((currentTicket) =>
          currentTicket._id === ticketId
            ? {
                ...currentTicket,
                ...data.ticket,
                user: data.ticket?.user || currentTicket.user,
              }
            : currentTicket
        )
      );

      setReplyText((previousReplyText) => ({
        ...previousReplyText,
        [ticketId]: "",
      }));
    } catch (error) {
      console.error("Error sending reply:", error);
      window.alert(error.message || "Unable to send your reply right now.");
    } finally {
      setReplyingTicketId("");
    }
  };

  const toggleTicket = (ticketId) => {
    setExpandedTicket((currentTicketId) =>
      currentTicketId === ticketId ? null : ticketId
    );
  };

  const normalizeStatus = (status) =>
    String(status || "Open").trim().toLowerCase();

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

  const isCompleted = (status) => {
    const normalizedStatus = normalizeStatus(status);

    return normalizedStatus === "resolved" || normalizedStatus === "closed";
  };

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

  const ticketStats = useMemo(() => {
    const openTickets = tickets.filter(
      (currentTicket) => normalizeStatus(currentTicket.status) === "open"
    ).length;

    const activeTickets = tickets.filter(
      (currentTicket) =>
        normalizeStatus(currentTicket.status) === "in progress"
    ).length;

    const completedTickets = tickets.filter((currentTicket) =>
      isCompleted(currentTicket.status)
    ).length;

    return {
      total: tickets.length,
      open: openTickets,
      active: activeTickets,
      completed: completedTickets,
    };
  }, [tickets]);

  return (
    <main className="user-support-page">
      <section className="user-support-hero">
        <div className="user-support-hero__content">
          <div className="user-support-hero__icon">
            <Headphones size={28} />
          </div>

          <div>
            <span className="user-support-hero__eyebrow">
              Customer Help Centre
            </span>

            <h1>Customer Support & Help Desk</h1>

            <p>
              Need help with an order, payment, product or delivery? Our support
              team is ready to assist you.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="user-support-refresh-button"
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

      <section className="user-support-stats">
        <article className="user-support-stat-card">
          <div className="user-support-stat-card__icon">
            <Inbox size={21} />
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{ticketStats.total}</strong>
            <p>All support requests</p>
          </div>
        </article>

        <article className="user-support-stat-card is-open">
          <div className="user-support-stat-card__icon">
            <MessageCircle size={21} />
          </div>

          <div>
            <span>Open</span>
            <strong>{ticketStats.open}</strong>
            <p>Waiting for response</p>
          </div>
        </article>

        <article className="user-support-stat-card is-progress">
          <div className="user-support-stat-card__icon">
            <Clock3 size={21} />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{ticketStats.active}</strong>
            <p>Currently being handled</p>
          </div>
        </article>

        <article className="user-support-stat-card is-completed">
          <div className="user-support-stat-card__icon">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <span>Completed</span>
            <strong>{ticketStats.completed}</strong>
            <p>Resolved or closed</p>
          </div>
        </article>
      </section>

      

      <section className="user-support-workspace">
        <article className="user-support-form-card">
          <div className="user-support-card-heading">
            <div className="user-support-card-heading__icon">
              <MessageSquare size={21} />
            </div>

            <div>
              <span>Need more help?</span>
              <h2>Raise a Support Ticket</h2>
              <p>Share the issue and our support team will contact you.</p>
            </div>
          </div>

          <form className="user-support-form" onSubmit={handleSubmit}>
            <div className="user-support-form__group">
              <label htmlFor="support-category">
                Category <span>*</span>
              </label>

              <div className="user-support-form__select">
                <Tag size={17} />

                <select
                  id="support-category"
                  name="category"
                  value={ticket.category}
                  onChange={handleInputChange}
                >
                  <option value="Order Query">Order Query</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Product Quality">Product Quality</option>
                  <option value="Delivery Delay">Delivery Delay</option>
                  <option value="Other">Other</option>
                </select>

                <ChevronDown size={16} />
              </div>
            </div>

            <div className="user-support-form__group">
              <label htmlFor="support-subject">
                Subject <span>*</span>
              </label>

              <div className="user-support-form__input">
                <MessageCircle size={17} />

                <input
                  id="support-subject"
                  name="subject"
                  type="text"
                  placeholder="Brief summary of your issue"
                  value={ticket.subject}
                  onChange={handleInputChange}
                  maxLength={100}
                />
              </div>

              <div className="user-support-form__helper">
                <span>Enter a clear and short subject.</span>
                <strong>{ticket.subject.length}/100</strong>
              </div>
            </div>

            <div className="user-support-form__group">
              <label htmlFor="support-message">
                Message <span>*</span>
              </label>

              <textarea
                id="support-message"
                name="message"
                placeholder="Describe your issue in detail. Include order ID or payment details where relevant..."
                value={ticket.message}
                onChange={handleInputChange}
                rows={6}
                maxLength={1000}
              />

              <div className="user-support-form__helper">
                <span>Do not share card PIN, OTP or passwords.</span>
                <strong>{ticket.message.length}/1000</strong>
              </div>
            </div>

            {formError && (
              <div className="user-support-form-message is-error">
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="user-support-form-message is-success">
                <CheckCircle2 size={20} />

                <div>
                  <strong>Ticket submitted successfully</strong>
                  <span>{formSuccess}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="user-support-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="user-support-button-loader" />
                  Submitting Ticket...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Submit Support Ticket
                </>
              )}
            </button>

            <div className="user-support-security-note">
              <ShieldCheck size={16} />
              Your support conversation remains private and secure.
            </div>
          </form>
        </article>

        <article className="user-support-tickets-card">
          <div className="user-support-card-heading user-support-card-heading--tickets">
            <div className="user-support-card-heading__icon">
              <Inbox size={21} />
            </div>

            <div>
              <span>Your conversations</span>
              <h2>My Previous Tickets</h2>
              <p>Track responses and continue conversations.</p>
            </div>

            <div className="user-support-ticket-count">
              {tickets.length}
            </div>
          </div>

          {pageError && !loading ? (
            <div className="user-support-state user-support-state--error">
              <div className="user-support-state__icon">
                <AlertCircle size={31} />
              </div>

              <h3>Unable to load tickets</h3>
              <p>{pageError}</p>

              <button type="button" onClick={() => fetchTickets()}>
                Try Again
              </button>
            </div>
          ) : loading ? (
            <div className="user-support-state">
              <div className="user-support-loading-spinner" />

              <h3>Loading your tickets</h3>
              <p>Please wait while we fetch your support conversations.</p>
            </div>
          ) : tickets.length > 0 ? (
            <div className="user-support-ticket-list">
              {tickets.map((currentTicket) => {
                const isExpanded = expandedTicket === currentTicket._id;
                const responses = Array.isArray(currentTicket.responses)
                  ? currentTicket.responses
                  : [];
                const isReplying =
                  replyingTicketId === currentTicket._id;

                return (
                  <article
                    className={`user-support-ticket ${
                      isExpanded ? "is-expanded" : ""
                    }`}
                    key={currentTicket._id}
                  >
                    <button
                      type="button"
                      className="user-support-ticket__summary"
                      onClick={() => toggleTicket(currentTicket._id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="user-support-ticket__main">
                        <div className="user-support-ticket__icon">
                          <MessageSquare size={19} />
                        </div>

                        <div>
                          <div className="user-support-ticket__meta">
                            <span>
                              #{getShortTicketId(currentTicket._id)}
                            </span>

                            <i />

                            <span>{formatDate(currentTicket.createdAt)}</span>
                          </div>

                          <h3>
                            {currentTicket.subject || "Support Request"}
                          </h3>

                          <div className="user-support-ticket__category">
                            <Tag size={12} />
                            {currentTicket.category || "General"}
                          </div>
                        </div>
                      </div>

                      <div className="user-support-ticket__right">
                        <span
                          className={`user-support-status ${getStatusClass(
                            currentTicket.status
                          )}`}
                        >
                          {currentTicket.status || "Open"}
                        </span>

                        <div className="user-support-ticket__chevron">
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="user-support-ticket__conversation">
                        <div className="user-support-conversation-heading">
                          <div>
                            <MessageCircle size={18} />

                            <span>
                              {responses.length + 1} message
                              {responses.length + 1 === 1 ? "" : "s"}
                            </span>
                          </div>

                          <small>
                            Ticket #{getShortTicketId(currentTicket._id)}
                          </small>
                        </div>

                        <div className="user-support-messages">
                          <div className="user-support-message is-user">
                            <div className="user-support-message__avatar">
                              <UserRound size={16} />
                            </div>

                            <div className="user-support-message__body">
                              <div className="user-support-message__meta">
                                <strong>You</strong>
                                <span>
                                  {formatDateTime(currentTicket.createdAt)}
                                </span>
                              </div>

                              <div className="user-support-message__bubble">
                                {currentTicket.message ||
                                  "No message provided."}
                              </div>
                            </div>
                          </div>

                          {responses.map((response, index) => {
                            const isAdmin = response.sender === "admin";

                            return (
                              <div
                                key={
                                  response._id ||
                                  `${currentTicket._id}-${index}`
                                }
                                className={`user-support-message ${
                                  isAdmin ? "is-admin" : "is-user"
                                }`}
                              >
                                <div className="user-support-message__avatar">
                                  {isAdmin ? (
                                    <Headphones size={16} />
                                  ) : (
                                    <UserRound size={16} />
                                  )}
                                </div>

                                <div className="user-support-message__body">
                                  <div className="user-support-message__meta">
                                    <strong>
                                      {isAdmin ? "Support Team" : "You"}
                                    </strong>

                                    <span>
                                      {formatDateTime(
                                        response.date || response.createdAt
                                      )}
                                    </span>
                                  </div>

                                  <div className="user-support-message__bubble">
                                    {response.text}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {isCompleted(currentTicket.status) ? (
                          <div className="user-support-ticket-closed">
                            {normalizeStatus(currentTicket.status) ===
                            "resolved" ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <XCircle size={20} />
                            )}

                            <div>
                              <strong>
                                Ticket {normalizeStatus(currentTicket.status)}
                              </strong>

                              <span>
                                This conversation is no longer accepting new
                                replies.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="user-support-reply-box">
                            <div className="user-support-reply-box__heading">
                              <span>Continue this conversation</span>
                              <small>Press Enter to send</small>
                            </div>

                            <div className="user-support-reply-box__form">
                              <textarea
                                rows={2}
                                placeholder="Type your reply..."
                                value={replyText[currentTicket._id] || ""}
                                onChange={(event) =>
                                  setReplyText((previousReplyText) => ({
                                    ...previousReplyText,
                                    [currentTicket._id]:
                                      event.target.value,
                                  }))
                                }
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                  ) {
                                    event.preventDefault();
                                    handleReply(currentTicket._id);
                                  }
                                }}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleReply(currentTicket._id)
                                }
                                disabled={
                                  isReplying ||
                                  !replyText[currentTicket._id]?.trim()
                                }
                              >
                                {isReplying ? (
                                  <span className="user-support-reply-loader" />
                                ) : (
                                  <Send size={17} />
                                )}

                                <span>
                                  {isReplying ? "Sending" : "Send"}
                                </span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="user-support-state">
              <div className="user-support-state__icon">
                <CheckCircle2 size={37} />
              </div>

              <h3>No support tickets yet</h3>

              <p>
                Your submitted support tickets and conversations will appear
                here.
              </p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}