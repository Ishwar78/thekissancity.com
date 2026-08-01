import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Heart,
  HeartHandshake,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Tractor,
  Truck,
  Users,
  Wheat,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./AboutPage.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5005"
).replace(/\/$/, "");

const HERO_CONTENT = {
  badge: "WHY KISSANCITY",
  titleBlack: "Good for You.",
  titleGreen: "Great for Farmers.",
  description:
    "We believe everyone deserves access to pure, organic food. KissanCity bridges the gap between hardworking Indian farmers and health-conscious families.",
};

const HERO_FEATURES = [
  {
    icon: Leaf,
    title: "100% Natural & Preservative-Free",
    text: "No chemicals, no artificial flavours — made with traditional recipes and farm-fresh ingredients.",
  },
  {
    icon: ShieldCheck,
    title: "Ayurvedic Health Benefits",
    text: "Each product is crafted with ingredients known for immunity, digestion & anti-inflammatory properties.",
  },
  {
    icon: Users,
    title: "Empowering Rural Farmers",
    text: "Every purchase directly supports rural farming communities and traditional food artisans.",
  },
  {
    icon: Heart,
    title: "Medicinal-Grade Mushrooms",
    text: "Our mushrooms are rich in beta-glucans, Vitamin D & antioxidants — nature's superfood.",
  },
];

const FALLBACK_ABOUT = {
  bullets: [
    "Direct partnerships with trusted Kissan farmers",
    "Naturally grown products with transparent sourcing",
    "Careful quality checks before every dispatch",
    "Fair value for farmers and honest prices for families",
  ],
  stats: [
    { number: "500+", label: "Kissan Farmers" },
    { number: "2L+", label: "Happy Families" },
    { number: "200+", label: "Farm Products" },
    { number: "18", label: "States Connected" },
  ],
  imageUrl: "/hero_banner.png",
  imageAlt: "The Kissan City farmers and natural produce",
};

const VALUE_CARDS = [
  {
    icon: ShieldCheck,
    number: "01",
    title: "Purity First",
    text: "Clean ingredients, transparent sourcing and honest product information — no shortcuts.",
  },
  {
    icon: HeartHandshake,
    number: "02",
    title: "Fair Farmer Partnerships",
    text: "We build long-term relationships so farmers receive respect, visibility and fair value.",
  },
  {
    icon: Leaf,
    number: "03",
    title: "Naturally Better",
    text: "Traditional and responsible farming practices help protect nutrition, soil health and taste.",
  },
  {
    icon: Users,
    number: "04",
    title: "Family Trust",
    text: "Every decision is made around the health, convenience and confidence of Indian families.",
  },
];

const JOURNEY = [
  {
    icon: Tractor,
    step: "01",
    title: "Partner with farmers",
    text: "We identify reliable farmers and producer groups following responsible growing practices.",
  },
  {
    icon: PackageCheck,
    step: "02",
    title: "Select & verify",
    text: "Every product is reviewed for quality, freshness, ingredients, packaging and traceability.",
  },
  {
    icon: Wheat,
    step: "03",
    title: "Prepare with care",
    text: "Products are handled and packed to preserve their natural quality, taste and freshness.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Deliver to your home",
    text: "Farm goodness reaches your family with dependable delivery and clear customer support.",
  },
];

const TRUST_POINTS = [
  { icon: BadgeCheck, title: "Quality Checked", text: "Every batch is carefully reviewed." },
  { icon: Sprout, title: "Farm First", text: "Direct relationships with trusted growers." },
  { icon: Star, title: "Family Approved", text: "Chosen for everyday Indian households." },
];

function resolveImageUrl(value) {
  if (!value) return FALLBACK_ABOUT.imageUrl;

  const normalized = String(value).trim().replace(/\\/g, "/");

  if (
    /^https?:\/\//i.test(normalized) ||
    normalized.startsWith("data:") ||
    normalized.startsWith("blob:")
  ) {
    return normalized;
  }

  if (normalized.startsWith("/uploads/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalized}`;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  return `${API_BASE_URL}/uploads/${normalized}`;
}

export default function AboutPage() {
  const [about, setAbout] = useState(FALLBACK_ABOUT);
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState([]);
  const [experts, setExperts] = useState([]);

  useEffect(() => {
    document.title = "About Us | The Kissan City";

    const controller = new AbortController();

    async function fetchAboutVisualData() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/about-home`, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.aboutHome) {
          return;
        }

        const incoming = data.aboutHome;

        setAbout((current) => ({
          ...current,
          bullets:
            Array.isArray(incoming.bullets) && incoming.bullets.length
              ? incoming.bullets
              : current.bullets,
          stats:
            Array.isArray(incoming.stats) && incoming.stats.length
              ? incoming.stats
              : current.stats,
          imageUrl: incoming.imageUrl || current.imageUrl,
          imageAlt: incoming.imageAlt || current.imageAlt,
        }));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("About page API error:", error);
        }
      } finally {
        setLoading(false);
      }
    }

    async function fetchFarmersExperts() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/farmers-experts?activeOnly=true`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.profiles)) {
          setFarmers(data.profiles.filter((p) => p.type === "Farmer"));
          setExperts(data.profiles.filter((p) => p.type === "Expert"));
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Farmers experts API error:", err);
        }
      }
    }

    fetchAboutVisualData();
    fetchFarmersExperts();

    return () => controller.abort();
  }, []);

  const imageUrl = useMemo(
    () => resolveImageUrl(about.imageUrl),
    [about.imageUrl],
  );

  const stats = about.stats?.length ? about.stats : FALLBACK_ABOUT.stats;
  const bullets = about.bullets?.length
    ? about.bullets
    : FALLBACK_ABOUT.bullets;

  return (
    <>
      <Navbar />

      <main className="about-page">
        {/* ===================== HERO ===================== */}
        <section className="about-hero">
          <div className="about-hero__orb about-hero__orb--one" />
          <div className="about-hero__orb about-hero__orb--two" />
          <div className="about-hero__grain" aria-hidden="true" />

          <div className="about-page-container about-hero__grid">
            <div className="about-hero__content">
              <div className="about-eyebrow">
                <Sparkles size={15} />
                {HERO_CONTENT.badge}
              </div>

              <h1 className="about-hero__title">
                <span>{HERO_CONTENT.titleBlack}</span>
                <strong>{HERO_CONTENT.titleGreen}</strong>
              </h1>

              <p className="about-hero__description">
                {HERO_CONTENT.description}
              </p>

              <div className="about-hero__features">
                {HERO_FEATURES.map(({ icon: Icon, title, text }) => (
                  <article className="about-hero-feature" key={title}>
                    <span className="about-hero-feature__icon">
                      <Icon size={20} />
                    </span>

                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="about-hero__actions">
                <Link to="/shop" className="about-primary-button">
                  Explore Products
                  <ArrowRight size={18} />
                </Link>

                <a href="#our-journey" className="about-secondary-button">
                  See how it works
                </a>
              </div>

              <div className="about-hero__mini-trust">
                <span>
                  <ShieldCheck size={16} />
                  Quality checked
                </span>
                <span>
                  <Leaf size={16} />
                  Naturally sourced
                </span>
                <span>
                  <Truck size={16} />
                  Delivered with care
                </span>
              </div>
            </div>

            <div className="about-hero__visual">
              <div className="about-hero__visual-backdrop" />

              <div className="about-hero__image-card">
                {loading && <div className="about-image-skeleton" />}

                <img
                  src={imageUrl}
                  alt={about.imageAlt || FALLBACK_ABOUT.imageAlt}
                  onLoad={(event) => {
                    event.currentTarget.parentElement?.classList.add(
                      "is-loaded",
                    );
                  }}
                  onError={(event) => {
                    if (event.currentTarget.dataset.fallback === "true") {
                      return;
                    }

                    event.currentTarget.dataset.fallback = "true";
                    event.currentTarget.src = FALLBACK_ABOUT.imageUrl;
                  }}
                />

                <div className="about-hero__image-label">
                  <span>
                    <Sprout size={16} />
                  </span>
                  <div>
                    <strong>From Indian farms</strong>
                    <small>To family kitchens</small>
                  </div>
                </div>
              </div>

              <div className="about-floating-card about-floating-card--top">
                <span className="about-floating-card__icon">
                  <Sprout size={20} />
                </span>
                <div>
                  <strong>Farm-first sourcing</strong>
                  <small>From trusted growers</small>
                </div>
              </div>

              <div className="about-floating-card about-floating-card--bottom">
                <span className="about-floating-card__icon">
                  <CheckCircle2 size={20} />
                </span>
                <div>
                  <strong>Family-approved quality</strong>
                  <small>Carefully selected products</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== STATS ===================== */}
        <section className="about-stats-section">
          <div className="about-page-container about-stats-shell">
            <div className="about-stats-intro">
              <span>Growing together</span>
              <strong>One trusted network</strong>
            </div>

            <div className="about-stats-grid">
              {stats.map((stat, index) => (
                <div
                  className="about-stat-card"
                  key={`${stat.label}-${index}`}
                >
                  <strong>{stat.number}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== FARMERS SECTION ===================== */}
        {farmers.length > 0 && (
          <section className="about-fe-section about-fe-section--farmers">
            <div className="about-page-container">
              <div className="about-section-heading about-section-heading--center">
                <div className="about-section-kicker">
                  <Sprout size={16} /> Heart of our harvest
                </div>
                <h2>
                  Meet Our <span>Kissan Farmers</span>
                </h2>
                <p>
                  The dedicated hands behind our pure, organic and farm-fresh produce across Indian states.
                </p>
              </div>

              <div className="about-fe-grid">
                {farmers.map((farmer) => {
                  const imgUrl = resolveImageUrl(farmer.image);
                  return (
                    <article className="about-fe-card" key={farmer._id}>
                      <div className="about-fe-card__image-wrap">
                        <img
                          src={imgUrl}
                          alt={farmer.name}
                          loading="lazy"
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallback === "true") return;
                            e.currentTarget.dataset.fallback = "true";
                            e.currentTarget.src = "/hero_banner.png";
                          }}
                        />
                        <span className="about-fe-card__badge about-fe-card__badge--farmer">
                          🌾 Kissan Farmer
                        </span>
                      </div>

                      <div className="about-fe-card__content">
                        <h3 className="about-fe-card__name">{farmer.name}</h3>

                        <div className="about-fe-card__tags">
                          {farmer.location && (
                            <span className="about-fe-tag about-fe-tag--location">
                              <MapPin size={13} /> {farmer.location}
                            </span>
                          )}
                          {farmer.specialty && (
                            <span className="about-fe-tag about-fe-tag--specialty">
                              🌱 {farmer.specialty}
                            </span>
                          )}
                          {farmer.experience && (
                            <span className="about-fe-tag about-fe-tag--experience">
                              ⏱️ {farmer.experience}
                            </span>
                          )}
                        </div>

                        {farmer.quote && (
                          <div
                            className="about-fe-card__quote"
                            dangerouslySetInnerHTML={{ __html: farmer.quote }}
                          />
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===================== EXPERTS SECTION ===================== */}
        {experts.length > 0 && (
          <section className="about-fe-section about-fe-section--experts">
            <div className="about-page-container">
              <div className="about-section-heading about-section-heading--center">
                <div className="about-section-kicker">
                  <Users size={16} /> Science & Quality Leadership
                </div>
                <h2>
                  Our <span>Agricultural Experts</span>
                </h2>
                <p>
                  Guiding our farming practices with research, organic standards, and health wisdom.
                </p>
              </div>

              <div className="about-fe-grid">
                {experts.map((expert) => {
                  const imgUrl = resolveImageUrl(expert.image);
                  return (
                    <article className="about-fe-card" key={expert._id}>
                      <div className="about-fe-card__image-wrap">
                        <img
                          src={imgUrl}
                          alt={expert.name}
                          loading="lazy"
                          onError={(e) => {
                            if (e.currentTarget.dataset.fallback === "true") return;
                            e.currentTarget.dataset.fallback = "true";
                            e.currentTarget.src = "/hero_banner.png";
                          }}
                        />
                        <span className="about-fe-card__badge about-fe-card__badge--expert">
                          🎓 Agro Expert
                        </span>
                      </div>

                      <div className="about-fe-card__content">
                        <h3 className="about-fe-card__name">{expert.name}</h3>

                        <div className="about-fe-card__tags">
                          {expert.location && (
                            <span className="about-fe-tag about-fe-tag--location">
                              <MapPin size={13} /> {expert.location}
                            </span>
                          )}
                          {expert.specialty && (
                            <span className="about-fe-tag about-fe-tag--specialty">
                              🔬 {expert.specialty}
                            </span>
                          )}
                          {expert.experience && (
                            <span className="about-fe-tag about-fe-tag--experience">
                              ⏱️ {expert.experience}
                            </span>
                          )}
                        </div>

                        {expert.quote && (
                          <div
                            className="about-fe-card__quote"
                            dangerouslySetInnerHTML={{ __html: expert.quote }}
                          />
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ===================== STORY ===================== */}
        <section className="about-story-section">
          <div className="about-page-container about-story-grid">
            <div className="about-story-heading">
              <div className="about-section-kicker">
                Our Promise
              </div>

              <h2>
                Better food should create a{" "}
                <span>better ecosystem.</span>
              </h2>

              <p>
                The Kissan City is built around a simple belief: families
                deserve honest food, and farmers deserve honest value. We
                shorten the distance between both.
              </p>

              <div className="about-story-signature">
                <span className="about-story-signature__icon">
                  <Leaf size={18} />
                </span>
                <div>
                  <strong>Farm to family, with fewer compromises.</strong>
                  <small>The Kissan City promise</small>
                </div>
              </div>
            </div>

            <div className="about-story-points">
              {bullets.map((point, index) => (
                <article
                  className="about-story-point"
                  key={`${point}-${index}`}
                >
                  <span className="about-story-point__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="about-story-point__icon">
                    <CheckCircle2 size={18} />
                  </div>

                  <p>{point}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== TRUST STRIP ===================== */}
        <section className="about-trust-section">
          <div className="about-page-container about-trust-card">
            {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
              <article className="about-trust-item" key={title}>
                <span>
                  <Icon size={20} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ===================== VALUES ===================== */}
        <section className="about-values-section">
          <div className="about-page-container">
            <div className="about-section-heading about-section-heading--center">
              <div className="about-section-kicker">What guides us</div>

              <h2>
                Values behind every{" "}
                <span>product we choose.</span>
              </h2>

              <p>
                From the first conversation with a farmer to the final package
                at your door, these principles shape every decision.
              </p>
            </div>

            <div className="about-values-grid">
              {VALUE_CARDS.map(
                ({ icon: Icon, number, title, text }) => (
                  <article className="about-value-card" key={title}>
                    <div className="about-value-card__top">
                      <span className="about-value-card__icon">
                        <Icon size={23} />
                      </span>
                      <span className="about-value-card__number">
                        {number}
                      </span>
                    </div>

                    <h3>{title}</h3>
                    <p>{text}</p>

                    <div className="about-value-card__line" />
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ===================== JOURNEY ===================== */}
        <section className="about-journey-section" id="our-journey">
          <div className="about-page-container">
            <div className="about-section-heading">
              <div className="about-section-kicker">
                From soil to doorstep
              </div>

              <h2>
                A shorter journey.{" "}
                <span>A clearer story.</span>
              </h2>

              <p>
                Fewer unnecessary layers help protect freshness, traceability
                and value at every step.
              </p>
            </div>

            <div className="about-journey-grid">
              {JOURNEY.map(({ icon: Icon, step, title, text }, index) => (
                <article className="about-journey-card" key={step}>
                  <div className="about-journey-card__top">
                    <span className="about-journey-card__icon">
                      <Icon size={22} />
                    </span>
                    <strong>{step}</strong>
                  </div>

                  <h3>{title}</h3>
                  <p>{text}</p>

                  {index < JOURNEY.length - 1 && (
                    <span
                      className="about-journey-card__connector"
                      aria-hidden="true"
                    >
                      <ArrowRight size={18} />
                    </span>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== CTA ===================== */}
        <section className="about-cta-section">
          <div className="about-page-container about-cta-card">
            <div className="about-cta-card__pattern" aria-hidden="true" />

            <div className="about-cta-card__copy">
              <span className="about-cta-eyebrow">
                <Leaf size={15} />
                Bring farm goodness home
              </span>

              <h2>
                Food with a story you can trust.
              </h2>

              <p>
                Choose products rooted in honesty, traditional wisdom and a
                better future for farming families.
              </p>
            </div>

            <Link to="/shop" className="about-cta-button">
              Shop The Kissan City
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}