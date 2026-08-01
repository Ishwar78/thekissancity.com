import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Cookie,
  Database,
  Eye,
  FileText,
  HeartHandshake,
  Leaf,
  LockKeyhole,
  Mail,
  MessageCircle,
  ShieldCheck,
  ShoppingBasket,
  Sprout,
  UserCheck,
} from "lucide-react";
import "./PrivacyPolicyPage.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const privacySections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "The Information We Collect",
    icon: Database,
    introduction:
      "To get our quality products from the farm to your table, we collect:",
    points: [
      {
        title: "Your Identity",
        text: "Name, delivery address, and contact number so we know where to send your order.",
      },
      {
        title: "Your Journey",
        text: 'Your email and order history, which helps us understand which "original and real" products you love most.',
      },
      {
        title: "Secure Payments",
        text: "We use trusted payment partners. We do not store your private bank or card details on our own systems.",
      },
      {
        title: "Website Usage",
        text: "Simple technical data, such as cookies, that helps our website run smoothly for you.",
      },
    ],
  },
  {
    id: "how-we-use-data",
    number: "02",
    title: "How We Use Your Data",
    icon: Eye,
    introduction:
      "We use your information strictly to build a better food system:",
    points: [
      {
        title: "Delivery",
        text: "Sharing your address with our delivery team so your food arrives fresh.",
      },
      {
        title: "Product Quality",
        text: "Using your feedback to improve both the goods we source from farmers and the specialty products we manufacture ourselves.",
      },
      {
        title: "Updates",
        text: "Sending you news about new seasonal harvests or healthy product launches.",
      },
      {
        title: "Farmer Support",
        text: "Helping us track the direct income impact your purchases have on our local farming partners.",
      },
    ],
  },
  {
    id: "manufacturing-sourcing",
    number: "03",
    title: "Our Manufacturing & Sourcing Standard",
    icon: Sprout,
    introduction: "We take pride in our dual role:",
    points: [
      {
        title: "Direct Sourcing",
        text: 'For raw goods, we act as a bridge. Because these are "real" products, natural variations in appearance are a sign of authenticity.',
      },
      {
        title: "In-House Manufacturing",
        text: "For products we manufacture, we maintain strict hygiene and quality standards to ensure everything is healthy and original.",
      },
    ],
  },
  {
    id: "data-safety",
    number: "04",
    title: "Keeping Your Data Safe",
    icon: LockKeyhole,
    paragraphs: [
      "We do not sell, trade, or rent your personal information to outsiders. We treat your data as a private trust.",
      "We only share necessary details with partners who help us complete and deliver your order, such as payment processors and courier partners. We expect these partners to handle your information responsibly.",
    ],
  },
  {
    id: "choices-control",
    number: "05",
    title: "Your Choices and Control",
    icon: UserCheck,
    paragraphs: [
      "You are in charge of your information. You can update your profile, change your delivery details, or ask us to remove your account at any time.",
      "If you have concerns about how your information is being handled, you can contact our team directly.",
    ],
  },
  {
    id: "contact-team",
    number: "06",
    title: "Contact Your Team",
    icon: MessageCircle,
    paragraphs: [
      "If you have questions about this policy or want to know more about how we protect our community, please contact The Kissan City Team.",
    ],
  },
];

const privacyHighlights = [
  {
    icon: ShieldCheck,
    title: "Your data stays protected",
    text: "We use your information responsibly and only when required.",
  },
  {
    icon: ShoppingBasket,
    title: "Better order experience",
    text: "Your details help us process and deliver your orders correctly.",
  },
  {
    icon: HeartHandshake,
    title: "No selling of data",
    text: "We do not sell, trade or rent your personal information.",
  },
];

const PrivacyPolicyPage = () => {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5005").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/policies`);
        const data = await res.json();
        if (data.success && data.policies?.privacyPolicy) {
          setDynamicContent(data.policies.privacyPolicy);
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
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero__leaf privacy-hero__leaf--one" />
        <div className="privacy-hero__leaf privacy-hero__leaf--two" />
        <div className="privacy-hero__circle privacy-hero__circle--one" />
        <div className="privacy-hero__circle privacy-hero__circle--two" />

        <div className="privacy-container">
          <div className="privacy-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Privacy Policy</strong>
          </div>

          <div className="privacy-hero__grid">
            <div className="privacy-hero__content">
              <div className="privacy-eyebrow">
                <Leaf size={17} />
                Your privacy matters
              </div>

              <h1>
                Privacy Policy – <span>The Kissan City</span>
              </h1>

              <p>
                At The Kissan City, we believe that transparency is the root
                of a healthy relationship.
              </p>

              <p className="privacy-hero__secondary-text">
                Whether we are sourcing fresh produce directly from a local
                farmer or crafting our own specialised products, we handle
                your personal information with the same care we give to our
                harvests.
              </p>

              <div className="privacy-hero__features">
                <div>
                  <ShieldCheck size={18} />
                  Secure information
                </div>

                <div>
                  <LockKeyhole size={18} />
                  Trusted processing
                </div>

                <div>
                  <HeartHandshake size={18} />
                  Transparent practices
                </div>
              </div>
            </div>

            <div className="privacy-hero__visual">
              <div className="privacy-protection-card">
                <div className="privacy-protection-card__icon">
                  <ShieldCheck size={44} />
                </div>

                <span>Your Information</span>
                <h2>Handled with care</h2>

                <p>
                  We collect only the information needed to provide a secure,
                  reliable and personalised shopping experience.
                </p>

                <div className="privacy-protection-card__items">
                  <div>
                    <CheckCircle2 size={17} />
                    Secure payment partners
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    Responsible data usage
                  </div>

                  <div>
                    <CheckCircle2 size={17} />
                    Customer control
                  </div>
                </div>

                <div className="privacy-protection-card__status">
                  <span />
                  Privacy-first approach
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="privacy-content-section">
        <div className="privacy-container">
          <div className="privacy-highlights">
            {privacyHighlights.map((highlight) => {
              const HighlightIcon = highlight.icon;

              return (
                <article
                  className="privacy-highlight-card"
                  key={highlight.title}
                >
                  <div className="privacy-highlight-card__icon">
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

          {dynamicContent ? (
            <div className="dynamic-policy-content" dangerouslySetInnerHTML={{ __html: dynamicContent }} style={{ padding: '40px 0', fontSize: '1.05rem', lineHeight: '1.8', color: '#334155' }} />
          ) : (
            <div className="privacy-content-layout">
              <aside className="privacy-sidebar">
                <div className="privacy-sidebar__header">
                  <FileText size={20} />

                  <div>
                    <span>Policy contents</span>
                    <h2>Quick Navigation</h2>
                  </div>
                </div>

                <nav className="privacy-sidebar__navigation">
                  {privacySections.map((section) => (
                    <a href={`#${section.id}`} key={section.id}>
                      <span>{section.number}</span>
                      {section.title}
                    </a>
                  ))}
                </nav>

                <div className="privacy-sidebar__cookie">
                  <div>
                    <Cookie size={20} />
                  </div>

                  <p>
                    <strong>Cookie information</strong>
                    <span>
                      Cookies help us provide a smoother website experience.
                    </span>
                  </p>
                </div>
              </aside>

              <div className="privacy-main-content">
                <div className="privacy-content-heading">
                  <div className="privacy-section-label">
                    <Leaf size={16} />
                    Privacy information
                  </div>

                  <h2>How We Protect and Use Your Information</h2>

                  <p>
                    This policy explains what information we collect, why we use
                    it and the choices available to you.
                  </p>
                </div>

                <div className="privacy-section-list">
                  {privacySections.map((section) => {
                    const SectionIcon = section.icon;

                    return (
                      <article
                        id={section.id}
                        className="privacy-policy-card"
                        key={section.id}
                      >
                        <div className="privacy-policy-card__top">
                          <div className="privacy-policy-card__number">
                            {section.number}
                          </div>

                          <div className="privacy-policy-card__icon">
                            <SectionIcon size={24} />
                          </div>
                        </div>

                        <h2>{section.title}</h2>

                        {section.introduction && (
                          <p className="privacy-policy-card__introduction">
                            {section.introduction}
                          </p>
                        )}

                        {section.paragraphs && (
                          <div className="privacy-policy-card__paragraphs">
                            {section.paragraphs.map((paragraph) => (
                              <p key={paragraph}>{paragraph}</p>
                            ))}
                          </div>
                        )}

                        {section.points && (
                          <div className="privacy-policy-points">
                            {section.points.map((point) => (
                              <div
                                className="privacy-policy-point"
                                key={point.title}
                              >
                                <div className="privacy-policy-point__check">
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

                        {section.id === "contact-team" && (
                          <div className="privacy-contact-box">
                            <div className="privacy-contact-box__icon">
                              <Mail size={23} />
                            </div>

                            <div>
                              <span>Email our support team</span>
                              <a href="mailto:support@kissancity.in">
                                support@kissancity.in
                              </a>
                            </div>

                            <a
                              href="mailto:support@kissancity.in"
                              className="privacy-contact-box__button"
                            >
                              Send Email
                              <ArrowRight size={16} />
                            </a>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="privacy-question-banner">
            <div className="privacy-question-banner__icon">
              <MessageCircle size={30} />
            </div>

            <div>
              <span>Questions About Our Privacy Policy?</span>
              <h2>Our support team is ready to provide clarification.</h2>

              <p>
                If you have any questions or concerns regarding our privacy
                practices, please do not hesitate to contact our support team.
              </p>
            </div>

            <Link to="/contact" className="privacy-question-banner__button">
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

export default PrivacyPolicyPage;