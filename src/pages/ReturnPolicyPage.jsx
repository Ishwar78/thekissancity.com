import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock3,
  Headphones,
  Leaf,
  PackageOpen,
  RefreshCcw,
  ShieldCheck,
  Undo2,
  Video,
} from "lucide-react";
import "./ReturnPolicyPage.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const returnPolicySections = [
  {
    number: "01",
    icon: RefreshCcw,
    title: "Return Eligibility",
    description:
      "A return request may be accepted when the product meets the required conditions.",
    points: [
      "The return request must be submitted within the permitted return period.",
      "The product must be unused and in its original condition.",
      "Original packaging, labels, accessories and invoice must be available.",
    ],
  },
  {
    number: "02",
    icon: PackageOpen,
    title: "Non-Returnable Products",
    description:
      "Certain products cannot be returned because of hygiene, safety or quality reasons.",
    points: [
      "Products marked as final sale or non-returnable.",
      "Used, damaged, altered or incorrectly stored products.",
      "Perishable products reported after the permitted time.",
    ],
  },
  {
    number: "03",
    icon: Video,
    title: "Damaged or Wrong Product",
    description:
      "Contact us immediately if you receive a damaged, defective or incorrect product.",
    points: [
      "Share your order ID and clear photographs of the product.",
      "A complete unboxing video may be required for verification.",
      "The issue should be reported within 24 hours of delivery.",
    ],
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Return Verification",
    description:
      "Every return request is reviewed before pickup or refund approval.",
    points: [
      "Our support team may request additional information.",
      "The returned product will be inspected after reaching our facility.",
      "A refund or replacement is issued after successful verification.",
    ],
  },
  {
    number: "05",
    icon: Banknote,
    title: "Refund Timeline",
    description:
      "Approved refunds are processed through the original payment method.",
    points: [
      "Refund initiation may take approximately 5–7 business days.",
      "Bank processing time may vary depending on the payment provider.",
      "Cash on delivery refunds may require valid bank account details.",
    ],
  },
  {
    number: "06",
    icon: Undo2,
    title: "Order Cancellation",
    description:
      "You may request order cancellation before the order is dispatched.",
    points: [
      "Orders cannot normally be cancelled after dispatch.",
      "Cancellation is confirmed only after approval by our team.",
      "Applicable refunds are processed after cancellation confirmation.",
    ],
  },
];

const ReturnPolicyPage = () => {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/policies`);
        const data = await res.json();
        if (data.success && data.policies?.returnPolicy) {
          setDynamicContent(data.policies.returnPolicy);
        }
      } catch (err) {
        console.error("Error fetching policies:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  return (
    < >
     <Navbar />
    <main className="return-page">
      <section className="return-hero">
        <div className="return-hero__shape return-hero__shape--one" />
        <div className="return-hero__shape return-hero__shape--two" />

        <div className="return-container">
          <div className="return-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Return Policy</strong>
          </div>

          <div className="return-hero__grid">
            <div className="return-hero__content">
              <div className="return-eyebrow">
                <Leaf size={17} />
                Easy and transparent process
              </div>

              <h1>
                Return & Refund <span>Policy</span>
              </h1>

              <p>
                We want every order to meet your expectations. Read the
                conditions below before requesting a return, replacement or
                refund.
              </p>

              <div className="return-hero__badges">
                <div>
                  <ShieldCheck size={19} />
                  Secure process
                </div>

                <div>
                  <BadgeCheck size={19} />
                  Customer focused
                </div>

                <div>
                  <Headphones size={19} />
                  Support available
                </div>
              </div>
            </div>

            <div className="return-hero__visual">
              <div className="return-process-card">
                <div className="return-process-card__top">
                  <div className="return-process-card__icon">
                    <RefreshCcw size={39} />
                  </div>

                  <span>Simple Returns</span>
                </div>

                <h2>Shop with greater confidence</h2>

                <p>
                  Clear steps for return verification, replacement and refund
                  processing.
                </p>

                <div className="return-progress">
                  <div className="return-progress__item">
                    <span>
                      <Undo2 size={15} />
                    </span>
                    <small>Request</small>
                  </div>

                  <div className="return-progress__line" />

                  <div className="return-progress__item">
                    <span>
                      <ShieldCheck size={15} />
                    </span>
                    <small>Verify</small>
                  </div>

                  <div className="return-progress__line" />

                  <div className="return-progress__item">
                    <span>
                      <Banknote size={15} />
                    </span>
                    <small>Refund</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="return-content-section">
        <div className="return-container">
          <div className="return-introduction">
            <div>
              <div className="return-section-label">
                <Leaf size={16} />
                Policy information
              </div>

              <h2>Everything You Need to Know About Returns</h2>

              <p>
                We have created a clear process to make returns, replacements
                and refunds easier for our customers.
              </p>
            </div>

            <div className="return-updated-card">
              <Clock3 size={19} />

              <div>
                <span>Last updated</span>
                <strong>July 2026</strong>
              </div>
            </div>
          </div>

          <div className="return-notice">
            <div className="return-notice__icon">
              <AlertCircle size={24} />
            </div>

            <div>
              <h3>Before requesting a return</h3>
              <p>
                Keep the original packaging and record a clear unboxing video.
                This helps our team verify damaged, missing or incorrect
                products quickly.
              </p>
            </div>
          </div>

          {dynamicContent ? (
            <div className="dynamic-policy-content" dangerouslySetInnerHTML={{ __html: dynamicContent }} style={{ padding: '40px 0', fontSize: '1.05rem', lineHeight: '1.8', color: '#334155' }} />
          ) : (
            <div className="return-policy-grid">
              {returnPolicySections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <article className="return-policy-card" key={section.number}>
                    <div className="return-policy-card__heading">
                      <div className="return-policy-card__number">
                        {section.number}
                      </div>

                      <div className="return-policy-card__icon">
                        <SectionIcon size={22} />
                      </div>
                    </div>

                    <h3>{section.title}</h3>
                    <p>{section.description}</p>

                    <ul>
                      {section.points.map((point) => (
                        <li key={point}>
                          <CheckCircle2 size={17} />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          )}

          <div className="return-support-banner">
            <div className="return-support-banner__icon">
              <Headphones size={30} />
            </div>

            <div>
              <span>Need help with a return?</span>
              <h3>Our support team will guide you.</h3>
              <p>
                Share your order ID, product photographs and unboxing video for
                faster verification.
              </p>
            </div>

            <Link to="/contact" className="return-support-button">
              Contact Support
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
};

export default ReturnPolicyPage;