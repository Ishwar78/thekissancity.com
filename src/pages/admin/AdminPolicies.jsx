import React, { useEffect, useMemo, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  LoaderCircle,
  RotateCcw,
  Save,
  ScrollText,
  ShieldCheck,
  Truck,
} from "lucide-react";

import "./AdminPolicies.css";

const EMPTY_POLICIES = {
  shippingPolicy: "",
  returnPolicy: "",
  privacyPolicy: "",
  termsAndConditions: "",
};

const POLICY_TABS = [
  {
    id: "shippingPolicy",
    label: "Shipping Policy",
    shortLabel: "Shipping",
    description:
      "Manage delivery areas, shipping charges, dispatch and delivery timelines.",
    icon: Truck,
  },
  {
    id: "returnPolicy",
    label: "Return & Refund Policy",
    shortLabel: "Returns",
    description:
      "Manage return eligibility, refund timelines and replacement conditions.",
    icon: RotateCcw,
  },
  {
    id: "privacyPolicy",
    label: "Privacy Policy",
    shortLabel: "Privacy",
    description:
      "Explain how customer information is collected, used and protected.",
    icon: ShieldCheck,
  },
  {
    id: "termsAndConditions",
    label: "Terms & Conditions",
    shortLabel: "Terms",
    description:
      "Manage website usage rules, responsibilities and purchase conditions.",
    icon: ScrollText,
  },
];

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, 4, false] }],
    [{ font: [] }],

    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],

    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],

    [{ align: [] }],
    ["blockquote", "link"],

    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "font",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "indent",
  "align",
  "blockquote",
  "link",
];

const getPlainText = (html = "") =>
  String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

export default function AdminPolicies() {
  const [form, setForm] = useState(EMPTY_POLICIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [activeTab, setActiveTab] = useState("shippingPolicy");
  const [showPreview, setShowPreview] = useState(true);

  const getBaseUrl = () =>
    (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(
      /\/$/,
      "",
    );

  const activePolicy = useMemo(
    () =>
      POLICY_TABS.find((policy) => policy.id === activeTab) || POLICY_TABS[0],
    [activeTab],
  );

  const activeContent = form[activeTab] || "";
  const plainText = getPlainText(activeContent);
  const characterCount = plainText.length;
  const wordCount = plainText ? plainText.split(/\s+/).length : 0;

  const ActivePolicyIcon = activePolicy.icon;

  useEffect(() => {
    const controller = new AbortController();

    const fetchPolicies = async () => {
      try {
        setLoading(true);
        setMessage({ type: "", text: "" });

        const response = await fetch(`${getBaseUrl()}/api/policies`, {
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Failed to load policy content.");
        }

        if (data.success && data.policies) {
          setForm({
            shippingPolicy: data.policies.shippingPolicy || "",
            returnPolicy: data.policies.returnPolicy || "",
            privacyPolicy: data.policies.privacyPolicy || "",
            termsAndConditions: data.policies.termsAndConditions || "",
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching policies:", error);

          setMessage({
            type: "error",
            text: error.message || "Failed to load policy content.",
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPolicies();

    return () => controller.abort();
  }, []);

  const handleEditorChange = (content) => {
    setForm((previous) => ({
      ...previous,
      [activeTab]: content,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMessage({ type: "", text: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const response = await fetch(`${getBaseUrl()}/api/policies`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken") || ""}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update policies.");
      }

      setMessage({
        type: "success",
        text: "All policy pages have been updated successfully.",
      });

      window.setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3500);
    } catch (error) {
      console.error("Error updating policies:", error);

      setMessage({
        type: "error",
        text: error.message || "Server error while updating policies.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-policies-loading">
        <div className="admin-policies-loading__icon">
          <LoaderCircle size={30} />
        </div>

        <strong>Loading policy pages</strong>
        <span>Please wait while policy content is being fetched.</span>
      </div>
    );
  }

  return (
    <div className="admin-policies-page">
      <div className="admin-policies-header">
        <div className="admin-policies-header__content">
          <div className="admin-policies-header__icon">
            <FileText size={26} />
          </div>

          <div>
            <span className="admin-policies-header__eyebrow">
              Website content
            </span>

            <h1>Policy Pages Management</h1>

            <p>
              Create and update your store policies using the rich text editor.
              All formatting will be saved as HTML.
            </p>
          </div>
        </div>

        <div className="admin-policies-header__status">
          <span className="admin-policies-status-dot" />
          Four policy pages connected
        </div>
      </div>

      {message.text && (
        <div
          className={`admin-policies-alert ${message.type}`}
          role="alert"
        >
          <span className="admin-policies-alert__icon">
            {message.type === "success" ? (
              <CheckCircle2 size={19} />
            ) : (
              <AlertCircle size={19} />
            )}
          </span>

          <div>
            <strong>
              {message.type === "success"
                ? "Changes saved"
                : "Something went wrong"}
            </strong>

            <span>{message.text}</span>
          </div>
        </div>
      )}

      <div className="admin-policies-container">
        <div className="admin-policies-tabs" role="tablist">
          {POLICY_TABS.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                type="button"
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`admin-policy-tab ${
                  isActive ? "active" : ""
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <span className="admin-policy-tab__icon">
                  <TabIcon size={18} />
                </span>

                <span className="admin-policy-tab__text">
                  <strong>{tab.label}</strong>
                  <small>{tab.shortLabel} page</small>
                </span>

                {isActive && (
                  <CheckCircle2
                    className="admin-policy-tab__check"
                    size={17}
                  />
                )}
              </button>
            );
          })}
        </div>

        <form
          onSubmit={handleSubmit}
          className="admin-policies-form"
        >
          <div className="admin-policy-toolbar">
            <div className="admin-policy-toolbar__heading">
              <span className="admin-policy-toolbar__icon">
                <ActivePolicyIcon size={21} />
              </span>

              <div>
                <span>Currently editing</span>
                <h2>{activePolicy.label}</h2>
                <p>{activePolicy.description}</p>
              </div>
            </div>

            <button
              type="button"
              className={`admin-policy-preview-toggle ${
                showPreview ? "active" : ""
              }`}
              onClick={() => setShowPreview((previous) => !previous)}
            >
              <Eye size={17} />
              {showPreview ? "Hide preview" : "Show preview"}
            </button>
          </div>

          <div
            className={`admin-policy-workspace ${
              showPreview ? "with-preview" : ""
            }`}
          >
            <div className="admin-policy-editor-card">
              <div className="admin-policy-editor-card__head">
                <div>
                  <span>Rich text editor</span>
                  <strong>{activePolicy.label} content</strong>
                </div>

                <div className="admin-policy-editor-stats">
                  <span>{wordCount} words</span>
                  <span>{characterCount} characters</span>
                </div>
              </div>

              <div className="admin-policy-quill">
                <ReactQuill
                  key={activeTab}
                  theme="snow"
                  value={activeContent}
                  onChange={handleEditorChange}
                  modules={QUILL_MODULES}
                  formats={QUILL_FORMATS}
                  placeholder={`Write your ${activePolicy.label.toLowerCase()} here...`}
                  preserveWhitespace
                />
              </div>

              <div className="admin-policy-editor-help">
                <FileText size={16} />

                <span>
                  Use headings, bold text, links, lists and quotations to
                  structure the policy professionally.
                </span>
              </div>
            </div>

            {showPreview && (
              <aside className="admin-policy-preview-card">
                <div className="admin-policy-preview-card__head">
                  <div>
                    <span>Customer view</span>
                    <strong>Live preview</strong>
                  </div>

                  <Eye size={19} />
                </div>

                <div className="admin-policy-preview-browser">
                  <div className="admin-policy-preview-browser__bar">
                    <span />
                    <span />
                    <span />

                    <div>{activePolicy.shortLabel.toLowerCase()}-policy</div>
                  </div>

                  <div className="admin-policy-preview__body">
                    <div className="admin-policy-preview__badge">
                      <ActivePolicyIcon size={15} />
                      Store policy
                    </div>

                    <h2>{activePolicy.label}</h2>

                    {plainText ? (
                      <div
                        className="admin-policy-preview__content"
                        dangerouslySetInnerHTML={{
                          __html: activeContent,
                        }}
                      />
                    ) : (
                      <div className="admin-policy-preview__empty">
                        <FileText size={31} />

                        <strong>No content added yet</strong>

                        <span>
                          Start writing in the editor to see the live preview.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </div>

          <div className="admin-policies-actions">
            <div className="admin-policies-actions__note">
              <CheckCircle2 size={17} />

              <span>
                Saving will update all four policy pages on the website.
              </span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="admin-policies-save-btn"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    className="admin-policies-spinner"
                    size={19}
                  />
                  Saving policies...
                </>
              ) : (
                <>
                  <Save size={19} />
                  Save policy updates
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}