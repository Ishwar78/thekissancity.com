import React, { useEffect, useState } from "react";
import {
  PhoneCall,
  Mail,
  Clock,
  MapPin,
  MessageCircle,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import "./AdminContactUpdate.css";

export default function AdminContactUpdate() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    phone: "+91 8295780500",
    phoneSubtext: "Monday to Saturday",
    email: "connect@thekissancity.com",
    emailSubtext: "Reply within 24 working hours",
    supportHours: "9:00 AM – 7:00 PM",
    supportHoursSubtext: "Monday to Saturday",
    serviceLocation: "Across India",
    serviceLocationSubtext: "Delivering happiness nationwide",
    whatsappNumber: "918295780500",
    companyName: "The Kissan City",
    companyAddressLine1: "Rohtak Road, Near Bus Stand",
    companyAddressLine2: "Rohtak, Haryana - 124001",
    companyGstin: "06AAAAA0000A1Z5",
    companyInvoiceEmail: "connect@thekissancity.com",
    companyInvoicePhone: "+91 8295780500",
    companyInvoiceFooterNote: "Fresh products. Honest sourcing. Trusted delivery."
  });

  const getBaseUrl = () => {
    return (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
  };

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const res = await fetch(`${getBaseUrl()}/api/contact-info`);
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.contactInfo) {
        setForm({
          phone: data.contactInfo.phone || "+91 8295780500",
          phoneSubtext: data.contactInfo.phoneSubtext || "Monday to Saturday",
          email: data.contactInfo.email || "connect@thekissancity.com",
          emailSubtext: data.contactInfo.emailSubtext || "Reply within 24 working hours",
          supportHours: data.contactInfo.supportHours || "9:00 AM – 7:00 PM",
          supportHoursSubtext: data.contactInfo.supportHoursSubtext || "Monday to Saturday",
          serviceLocation: data.contactInfo.serviceLocation || "Across India",
          serviceLocationSubtext: data.contactInfo.serviceLocationSubtext || "Delivering happiness nationwide",
          whatsappNumber: data.contactInfo.whatsappNumber || "918295780500",
          companyName: data.contactInfo.companyName || "The Kissan City",
          companyAddressLine1: data.contactInfo.companyAddressLine1 || "Rohtak Road, Near Bus Stand",
          companyAddressLine2: data.contactInfo.companyAddressLine2 || "Rohtak, Haryana - 124001",
          companyGstin: data.contactInfo.companyGstin || "06AAAAA0000A1Z5",
          companyInvoiceEmail: data.contactInfo.companyInvoiceEmail || "connect@thekissancity.com",
          companyInvoicePhone: data.contactInfo.companyInvoicePhone || "+91 8295780500",
          companyInvoiceFooterNote: data.contactInfo.companyInvoiceFooterNote || "Fresh products. Honest sourcing. Trusted delivery."
        });
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      setMessage({ type: "error", text: "Failed to load contact information." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${getBaseUrl()}/api/contact-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Contact information updated successfully! Changes are live on the website." });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update contact info." });
      }
    } catch (error) {
      console.error("Error saving contact info:", error);
      setMessage({ type: "error", text: "Server error occurred while saving." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-contact-update-shell">
      {/* Header Banner */}
      <div className="admin-contact-header">
        <div className="admin-contact-header-content">
          <span className="admin-contact-badge">
            <Sparkles size={14} /> Website Contact Management
          </span>
          <h1>Manage Store Contact Information</h1>
          <p>Update phone number, email address, support hours, service location & WhatsApp contact shown on website header, footer & contact page.</p>
        </div>

        <button
          type="button"
          className="admin-contact-refresh-btn"
          onClick={fetchContactInfo}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          Refresh Info
        </button>
      </div>

      {message.text && (
        <div className={`admin-contact-alert alert-${message.type}`}>
          {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-contact-loading">
          <div className="contact-spinner" />
          <p>Loading contact information...</p>
        </div>
      ) : (
        <form className="admin-contact-form" onSubmit={handleSubmit}>
          
          {/* Card 1: Call Us Phone Section */}
          <div className="contact-edit-card">
            <div className="contact-card-title">
              <div className="card-icon green">
                <PhoneCall size={20} />
              </div>
              <div>
                <h3>1. Call Us (Phone Support)</h3>
                <p>Main contact number displayed for customer phone support</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="form-group">
                <label>Phone / Mobile Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 8295780500"
                  required
                />
              </div>

              <div className="form-group">
                <label>Working Days / Subtext</label>
                <input
                  type="text"
                  name="phoneSubtext"
                  value={form.phoneSubtext}
                  onChange={handleChange}
                  placeholder="e.g. Monday to Saturday"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Email Us Section */}
          <div className="contact-edit-card">
            <div className="contact-card-title">
              <div className="card-icon blue">
                <Mail size={20} />
              </div>
              <div>
                <h3>2. Email Us (Support Email)</h3>
                <p>Official support email address for customer enquiries</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. connect@thekissancity.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Reply Subtext</label>
                <input
                  type="text"
                  name="emailSubtext"
                  value={form.emailSubtext}
                  onChange={handleChange}
                  placeholder="e.g. Reply within 24 working hours"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Support Hours Section */}
          <div className="contact-edit-card">
            <div className="contact-card-title">
              <div className="card-icon purple">
                <Clock size={20} />
              </div>
              <div>
                <h3>3. Support Hours</h3>
                <p>Operating timings of customer support team</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="form-group">
                <label>Support Hours Text *</label>
                <input
                  type="text"
                  name="supportHours"
                  value={form.supportHours}
                  onChange={handleChange}
                  placeholder="e.g. 9:00 AM – 7:00 PM"
                  required
                />
              </div>

              <div className="form-group">
                <label>Hours Subtext</label>
                <input
                  type="text"
                  name="supportHoursSubtext"
                  value={form.supportHoursSubtext}
                  onChange={handleChange}
                  placeholder="e.g. Monday to Saturday"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Service Location Section */}
          <div className="contact-edit-card">
            <div className="contact-card-title">
              <div className="card-icon orange">
                <MapPin size={20} />
              </div>
              <div>
                <h3>4. Service Location</h3>
                <p>Delivery coverage location area</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="form-group">
                <label>Location Title *</label>
                <input
                  type="text"
                  name="serviceLocation"
                  value={form.serviceLocation}
                  onChange={handleChange}
                  placeholder="e.g. Across India"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location Subtext</label>
                <input
                  type="text"
                  name="serviceLocationSubtext"
                  value={form.serviceLocationSubtext}
                  onChange={handleChange}
                  placeholder="e.g. Delivering happiness nationwide"
                />
              </div>
            </div>
          </div>

          {/* Card 5: WhatsApp Support Number */}
          <div className="contact-edit-card">
            <div className="contact-card-title">
              <div className="card-icon teal">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3>5. WhatsApp Support Number</h3>
                <p>Mobile number used for WhatsApp direct chat button (without spaces/plus sign)</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="form-group form-group-full">
                <label>WhatsApp Mobile Number (e.g. 918295780500)</label>
                <input
                  type="text"
                  name="whatsappNumber"
                  value={form.whatsappNumber}
                  onChange={handleChange}
                  placeholder="e.g. 918295780500"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Company Invoice & Bill Details */}
          <div className="contact-edit-card" style={{ border: '2px solid #16a34a', borderRadius: '16px' }}>
            <div className="contact-card-title">
              <div className="card-icon green">
                <Sparkles size={20} />
              </div>
              <div>
                <h3>6. Company Bill & Invoice Details (Customer Bill Info)</h3>
                <p>Official company name, GSTIN, address, email & phone printed on customer tax invoices / bills.</p>
              </div>
            </div>

            <div className="contact-form-grid">
              <div className="form-group">
                <label>Company / Brand Name on Bill *</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="e.g. The Kissan City"
                  required
                />
              </div>

              <div className="form-group">
                <label>GSTIN / Tax ID Number</label>
                <input
                  type="text"
                  name="companyGstin"
                  value={form.companyGstin}
                  onChange={handleChange}
                  placeholder="e.g. 06AAAAA0000A1Z5"
                />
              </div>

              <div className="form-group">
                <label>Company Address Line 1 *</label>
                <input
                  type="text"
                  name="companyAddressLine1"
                  value={form.companyAddressLine1}
                  onChange={handleChange}
                  placeholder="e.g. Rohtak Road, Near Bus Stand"
                  required
                />
              </div>

              <div className="form-group">
                <label>City, State & Pincode *</label>
                <input
                  type="text"
                  name="companyAddressLine2"
                  value={form.companyAddressLine2}
                  onChange={handleChange}
                  placeholder="e.g. Rohtak, Haryana - 124001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Official Invoice Email *</label>
                <input
                  type="email"
                  name="companyInvoiceEmail"
                  value={form.companyInvoiceEmail}
                  onChange={handleChange}
                  placeholder="e.g. connect@thekissancity.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Official Invoice Support Phone</label>
                <input
                  type="text"
                  name="companyInvoicePhone"
                  value={form.companyInvoicePhone}
                  onChange={handleChange}
                  placeholder="e.g. +91 8295780500"
                />
              </div>

              <div className="form-group form-group-full">
                <label>Invoice Footer Tagline / Note</label>
                <input
                  type="text"
                  name="companyInvoiceFooterNote"
                  value={form.companyInvoiceFooterNote}
                  onChange={handleChange}
                  placeholder="e.g. Fresh products. Honest sourcing. Trusted delivery."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="admin-contact-actions">
            <button type="submit" className="save-contact-btn" disabled={saving}>
              {saving ? (
                <>
                  <span className="save-spinner" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save size={18} /> Save & Publish Contact Info
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
