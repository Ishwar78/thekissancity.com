import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Headphones,
  Leaf,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import "./ContactPage.css";

const initialFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const ContactPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState({
    type: "",
    text: "",
  });

  const [contactInfo, setContactInfo] = useState({
    phone: "+91 8295780500",
    phoneSubtext: "Monday to Saturday",
    email: "connect@thekissancity.com",
    emailSubtext: "Reply within 24 working hours",
    supportHours: "9:00 AM – 7:00 PM",
    supportHoursSubtext: "Monday to Saturday",
    serviceLocation: "Across India",
    serviceLocationSubtext: "Delivering happiness nationwide",
    whatsappNumber: "918295780500"
  });

  React.useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/contact-info`);
        const data = await res.json().catch(() => ({}));
        if (data.success && data.contactInfo) {
          setContactInfo(data.contactInfo);
        }
      } catch (err) {
        console.error("Error fetching contact info:", err);
      }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (responseMessage.text) {
      setResponseMessage({
        type: "",
        text: "",
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      setResponseMessage({
        type: "error",
        text: "Please fill in all the required fields.",
      });
      return;
    }

    try {
      setSubmitting(true);

      const baseUrl = (
        import.meta.env.VITE_API_URL || "https://thekissancity.com"
      ).replace(/\/$/, "");

      const response = await fetch(`${baseUrl}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          source: "contact-page",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to submit your message right now."
        );
      }

      setResponseMessage({
        type: "success",
        text: "Thank you! Your message has been submitted successfully.",
      });

      setFormData(initialFormData);
    } catch (error) {
      setResponseMessage({
        type: "error",
        text:
          error.message ||
          "Something went wrong. Please try again after some time.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello Kissan City, I need help regarding an order or product."
    );

    const waNum = (contactInfo.whatsappNumber || "918295780500").replace(/[^0-9]/g, "");

    window.open(
      `https://wa.me/${waNum}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
    <Navbar />
    <main className="contact-page">
      <section className="contact-hero">
        <div className="contact-hero__shape contact-hero__shape--one" />
        <div className="contact-hero__shape contact-hero__shape--two" />

        <div className="contact-container">
          <div className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Contact Us</strong>
          </div>

          <div className="contact-hero__grid">
            <div className="contact-hero__content">
              <div className="contact-eyebrow">
                <Leaf size={17} />
                Customer Support
              </div>

              <h1>
                We’re Here to <span>Help You</span>
              </h1>

              <p>
                Have questions about your order, delivery, product, payment or
                return? Send us a message and our support team will assist you.
              </p>

              <div className="contact-hero__buttons">
                <button
                  type="button"
                  className="contact-primary-button"
                  onClick={openWhatsApp}
                >
                  <MessageCircle size={19} />
                  Chat on WhatsApp
                  <ArrowRight size={17} />
                </button>

                <a
                  href={`tel:${contactInfo.phone}`}
                  className="contact-secondary-button"
                >
                  <Phone size={18} />
                  Call Support
                </a>
              </div>

              <div className="contact-hero__features">
                <div>
                  <CheckCircle2 size={18} />
                  Quick response
                </div>

                <div>
                  <ShieldCheck size={18} />
                  Secure support
                </div>

                <div>
                  <Headphones size={18} />
                  Friendly assistance
                </div>
              </div>
            </div>

            <div className="contact-hero__visual">
              <div className="contact-support-card">
                <div className="contact-support-card__icon">
                  <MessageCircle size={40} />
                </div>

                <span className="contact-support-card__label">
                  Dedicated Support
                </span>

                <h2>How can we help?</h2>

                <p>
                  Our customer care team is ready to answer all your questions.
                </p>

                <div className="contact-support-card__status">
                  <span />
                  Support team is available
                </div>

                <div className="contact-support-card__bottom">
                  <div className="contact-avatar-stack">
                    <div>KC</div>
                    <div>CS</div>
                    <div>+</div>
                  </div>

                  <p>
                    <strong>Trusted support</strong>
                    <span>For every customer</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-details-section">
        <div className="contact-container">
          <div className="contact-info-grid">
            <article className="contact-info-card">
              <div className="contact-info-card__icon">
                <Phone size={23} />
              </div>

              <div>
                <span>Call us</span>
                <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                <p>{contactInfo.phoneSubtext}</p>
              </div>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-card__icon">
                <Mail size={23} />
              </div>

              <div>
                <span>Email us</span>
                <a href={`mailto:${contactInfo.email}`}>
                  {contactInfo.email}
                </a>
                <p>{contactInfo.emailSubtext}</p>
              </div>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-card__icon">
                <Clock3 size={23} />
              </div>

              <div>
                <span>Support hours</span>
                <strong>{contactInfo.supportHours}</strong>
                <p>{contactInfo.supportHoursSubtext}</p>
              </div>
            </article>

            <article className="contact-info-card">
              <div className="contact-info-card__icon">
                <MapPin size={23} />
              </div>

              <div>
                <span>Service location</span>
                <strong>{contactInfo.serviceLocation}</strong>
                <p>{contactInfo.serviceLocationSubtext}</p>
              </div>
            </article>
          </div>

          <div className="contact-main-grid">
            <div className="contact-main-content">
              <div className="contact-section-label">
                <Leaf size={16} />
                Send a message
              </div>

              <h2>Let’s Talk About Your Concern</h2>

              <p className="contact-main-content__description">
                Fill in your details below. For order-related concerns, please
                mention your order ID in the message.
              </p>

              <div className="contact-benefits">
                <div className="contact-benefit-item">
                  <div>
                    <CheckCircle2 size={20} />
                  </div>

                  <p>
                    <strong>Fast customer support</strong>
                    <span>Our team responds to your concerns quickly.</span>
                  </p>
                </div>

                <div className="contact-benefit-item">
                  <div>
                    <ShieldCheck size={20} />
                  </div>

                  <p>
                    <strong>Secure information</strong>
                    <span>Your personal information remains protected.</span>
                  </p>
                </div>

                <div className="contact-benefit-item">
                  <div>
                    <Headphones size={20} />
                  </div>

                  <p>
                    <strong>Complete assistance</strong>
                    <span>Support for orders, delivery, returns and payment.</span>
                  </p>
                </div>
              </div>

              <div className="contact-whatsapp-box">
                <div className="contact-whatsapp-box__icon">
                  <MessageCircle size={26} />
                </div>

                <div>
                  <span>Need an immediate response?</span>
                  <strong>Connect with us on WhatsApp</strong>
                </div>

                <button type="button" onClick={openWhatsApp}>
                  Chat now
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <form className="contact-form-card" onSubmit={handleSubmit}>
              <div className="contact-form-card__header">
                <span>Contact form</span>
                <h2>Send Your Message</h2>
                <p>Our team will contact you as soon as possible.</p>
              </div>

              <div className="contact-form-grid">
                <div className="contact-form-field">
                  <label htmlFor="contact-name">
                    Full name <span>*</span>
                  </label>

                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-phone">
                    Phone number <span>*</span>
                  </label>

                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-email">
                    Email address <span>*</span>
                  </label>

                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-subject">Subject</label>

                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option value="">Select a subject</option>
                    <option value="Order enquiry">Order enquiry</option>
                    <option value="Delivery enquiry">Delivery enquiry</option>
                    <option value="Return or refund">Return or refund</option>
                    <option value="Product enquiry">Product enquiry</option>
                    <option value="Payment issue">Payment issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="contact-form-field contact-form-field--full">
                  <label htmlFor="contact-message">
                    Message <span>*</span>
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help you..."
                    rows={6}
                  />
                </div>
              </div>

              {responseMessage.text && (
                <div
                  className={`contact-form-message contact-form-message--${responseMessage.type}`}
                >
                  {responseMessage.type === "success" && (
                    <CheckCircle2 size={19} />
                  )}

                  {responseMessage.text}
                </div>
              )}

              <button
                type="submit"
                className="contact-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="contact-button-loader" />
                    Sending message...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Send Message
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
      <Footer />
      </>
  );
};

export default ContactPage;