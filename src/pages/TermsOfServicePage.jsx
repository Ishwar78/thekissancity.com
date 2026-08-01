import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeIndianRupee,
  Scale,
  CheckCircle2,
  FileCheck2,
  Gavel,
  Handshake,
  Headphones,
  Leaf,
  LockKeyhole,
  MessageCircle,
  PackageCheck,
  RefreshCcw,

  ShieldCheck,
  ShoppingBag,
  Sprout,
  UserRoundCheck,
  Utensils,
} from "lucide-react";
import "./TermsOfServicePage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const termsSections = [
  {
    id: "business-model",
    number: "01",
    title: "Our Business Model",
    icon: Handshake,
    introduction:
      "The Kissan City operates as a bridge between local farmers and consumers. We provide:",
    points: [
      {
        title: "Direct-Sourced Products",
        text: "Goods sourced directly from farmers to ensure freshness and fair income for the grower.",
      },
      {
        title: "Manufactured Products",
        text: "High-quality food items crafted in-house under our strict health and hygiene standards.",
      },
    ],
    conclusion:
      "By purchasing from us, you acknowledge that you are supporting a mission-driven startup dedicated to improving the lives of both farmers and customers through authentic food.",
  },
  {
    id: "product-authenticity",
    number: "02",
    title: "Product Authenticity & Natural Variation",
    icon: Sprout,
    introduction:
      'We take pride in providing "Original and Real" products.',
    points: [
      {
        title: "Nature’s Variation",
        text: "Because our farm-sourced products are minimally processed and natural, you may notice variations in colour, size, texture and taste. These are not defects but signs of authenticity.",
      },
      {
        title: "Manufactured Standards",
        text: "Our in-house products are made to consistent quality standards yet remain free from unnecessary artificial enhancements.",
      },
    ],
  },
  {
    id: "user-accounts",
    number: "03",
    title: "User Accounts",
    icon: UserRoundCheck,
    paragraphs: [
      "When you create an account, you are responsible for maintaining the confidentiality of your login details.",
      "You agree to provide accurate and current information to ensure smooth delivery of your orders.",
      "We reserve the right to suspend accounts that provide false information or misuse the platform.",
    ],
  },
  {
    id: "pricing-payments",
    number: "04",
    title: "Pricing & Payments",
    icon: BadgeIndianRupee,
    points: [
      {
        title: "Currency",
        text: "All prices are listed in Indian Rupees (INR).",
      },
      {
        title: "Fair Pricing",
        text: "We aim to provide fair pricing that reflects the quality of the produce and a fair share for the farmer.",
      },
      {
        title: "Secure Payments",
        text: "Payments must be made through our authorised secure payment gateways. Orders are confirmed only after successful payment processing.",
      },
    ],
  },
  {
    id: "proper-use",
    number: "05",
    title: "Proper Use of Products",
    icon: Utensils,
    introduction: "As we provide healthy and natural food items:",
    points: [
      {
        title: "Storage",
        text: 'You are responsible for following any storage instructions, such as "keep refrigerated" or "store in a cool, dry place", provided on the packaging or website.',
      },
      {
        title: "Consumption",
        text: "Please check for personal allergies. While our products are healthy and natural, we are not liable for individual allergic reactions to standard food ingredients such as mushrooms, honey and similar items.",
      },
    ],
  },
  {
    id: "intellectual-property",
    number: "06",
    title: "Intellectual Property",
    icon: LockKeyhole,
    paragraphs: [
      'All content on this website, including the name "The Kissan City", our logo, product descriptions and the "Farm-to-Fork" branding, is our property.',
      "You may not use, copy or distribute our branding or content for commercial purposes without our written permission.",
    ],
  },
  {
    id: "limitation-liability",
    number: "07",
    title: "Limitation of Liability",
    icon: ShieldCheck,
    introduction:
      'We strive for perfection, but we provide our services "as is".',
    points: [
      {
        title: "Indirect Damages",
        text: "The Kissan City shall not be liable for any indirect or consequential damages arising from the use of our website or products.",
      },
      {
        title: "Purchase-Related Claims",
        text: "Our total liability for any claim related to a purchase is limited to the amount paid for that specific order.",
      },
    ],
  },
  {
    id: "governing-law",
    number: "08",
    title: "Governing Law & Disputes",
    icon: Gavel,
    paragraphs: [
      "These terms are governed by the laws applicable in India.",
      "Any disputes arising from your use of this website or purchases made will be subject to the exclusive jurisdiction of the courts in Rohtak, Haryana.",
    ],
  },
  {
    id: "changes-terms",
    number: "09",
    title: "Changes to Terms",
    icon: RefreshCcw,
    paragraphs: [
      "We may update these terms as our startup grows.",
      "Your continued use of the website after changes are posted means that you accept the updated terms.",
    ],
  },
];

const termsHighlights = [
  {
    icon: FileCheck2,
    title: "Clear conditions",
    text: "Understand the terms that apply when using our platform.",
  },
  {
    icon: PackageCheck,
    title: "Authentic products",
    text: "Natural variations are part of original farm-sourced products.",
  },
  {
    icon: Scale,
    title: "Fair responsibility",
    text: "Our terms protect customers, farmers and The Kissan City.",
  },
];

const TermsOfServicePage = () => {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/policies`);
        const data = await res.json();
        if (data.success && data.policies?.termsAndConditions) {
          setDynamicContent(data.policies.termsAndConditions);
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
    <>
    <Navbar />
    <main className="terms-page">
      <section className="terms-hero">
        <div className="terms-hero__shape terms-hero__shape--one" />
        <div className="terms-hero__shape terms-hero__shape--two" />

        <div className="terms-container">
          <div className="terms-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Terms of Service</strong>
          </div>

          <div className="terms-hero__grid">
            <div className="terms-hero__content">
              <div className="terms-eyebrow">
                <Leaf size={17} />
                Fair and transparent terms
              </div>

              <h1>
                Terms of Service: <span>The Kissan City</span>
              </h1>

              <p>
                These terms explain the conditions that apply when you access
                our website, create an account or purchase our products.
              </p>

              <div className="terms-hero__features">
                <div>
                  <Scale size={18} />
                  Fair conditions
                </div>

                <div>
                  <ShieldCheck size={18} />
                  Secure transactions
                </div>

                <div>
                  <ShoppingBag size={18} />
                  Responsible shopping
                </div>
              </div>
            </div>

            <div className="terms-hero__visual">
              <div className="terms-agreement-card">
                <div className="terms-agreement-card__icon">
                  <FileCheck2 size={44} />
                </div>

                <span>Service Agreement</span>
                <h2>Built on trust and fairness</h2>

                <p>
                  By using The Kissan City, you agree to follow these terms and
                  use our platform responsibly.
                </p>

                <div className="terms-agreement-card__items">
                  <div>
                    <CheckCircle2 size={17} />
                    Authentic products
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    Fair farmer support
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    Secure payment process
                  </div>
                </div>

                <div className="terms-agreement-card__status">
                  <span />
                  Customer-first conditions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="terms-content-section">
        <div className="terms-container">
          <div className="terms-highlights">
            {termsHighlights.map((highlight) => {
              const HighlightIcon = highlight.icon;

              return (
                <article className="terms-highlight-card" key={highlight.title}>
                  <div className="terms-highlight-card__icon">
                    <HighlightIcon size={23} />
                  </div>

                  <div>
                    <h3>{highlight.title}</h3>
                    <p>{highlight.text}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="terms-notice">
            <div className="terms-notice__icon">
              <AlertCircle size={23} />
            </div>

            <div>
              <h2>Please read these terms carefully</h2>
              <p>
                By accessing this website, creating an account or placing an
                order, you acknowledge that you have read and accepted these
                terms.
              </p>
            </div>
          </div>

          {dynamicContent ? (
            <div className="dynamic-policy-content" dangerouslySetInnerHTML={{ __html: dynamicContent }} style={{ padding: '40px 0', fontSize: '1.05rem', lineHeight: '1.8', color: '#334155' }} />
          ) : (
            <div className="terms-content-layout">
              <aside className="terms-sidebar">
                <div className="terms-sidebar__header">
                  <FileCheck2 size={20} />

                  <div>
                    <span>Service terms</span>
                    <h2>Quick Navigation</h2>
                  </div>
                </div>

                <nav className="terms-sidebar__navigation">
                  {termsSections.map((section) => (
                    <a href={`#${section.id}`} key={section.id}>
                      <span>{section.number}</span>
                      {section.title}
                    </a>
                  ))}
                </nav>
              </aside>

              <div className="terms-main-content">
                <div className="terms-content-heading">
                  <div className="terms-section-label">
                    <Leaf size={16} />
                    Terms and conditions
                  </div>

                  <h2>Rules for Using The Kissan City</h2>

                  <p>
                    These sections explain our business model, product standards,
                    payment rules, customer responsibilities and applicable laws.
                  </p>
                </div>

                <div className="terms-section-list">
                  {termsSections.map((section) => {
                    const SectionIcon = section.icon;

                    return (
                      <article
                        id={section.id}
                        className="terms-service-card"
                        key={section.id}
                      >
                        <div className="terms-service-card__top">
                          <div className="terms-service-card__number">
                            {section.number}
                          </div>

                          <div className="terms-service-card__icon">
                            <SectionIcon size={24} />
                          </div>
                        </div>

                        <h2>{section.title}</h2>

                        {section.introduction && (
                          <p className="terms-service-card__introduction">
                            {section.introduction}
                          </p>
                        )}

                        {section.paragraphs && (
                          <div className="terms-service-card__paragraphs">
                            {section.paragraphs.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        )}

                        {section.points && (
                          <div className="terms-service-points">
                            {section.points.map((point) => (
                              <div
                                className="terms-service-point"
                                key={point.title}
                              >
                                <div className="terms-service-point__check">
                                  <CheckCircle2 size={17} />
                                </div>

                                <div>
                                  <h3>{point.title}</h3>
                                  <p>{point.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {section.conclusion && (
                          <div className="terms-service-card__conclusion">
                            <Sprout size={19} />
                            <p>{section.conclusion}</p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="terms-question-banner">
            <div className="terms-question-banner__icon">
              <MessageCircle size={30} />
            </div>

            <div>
              <span>Questions About Our Terms of Service?</span>
              <h2>Contact our support team for clarification.</h2>

              <p>
                If you have any questions or concerns regarding our terms of
                service, please do not hesitate to contact our support team.
              </p>
            </div>

            <Link to="/contact" className="terms-question-banner__button">
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

export default TermsOfServicePage;