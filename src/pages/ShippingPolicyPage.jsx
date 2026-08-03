import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Headphones,
  Leaf,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import "./ShippingPolicyPage.css";

import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const shippingPolicySections = [
  {
    number: "01",
    icon: Warehouse,
    title: "Order Processing",
    description:
      "After your order is successfully confirmed, our team starts preparing it for dispatch.",
    points: [
      "Orders are normally processed within 1–2 business days.",
      "Orders placed on Sundays or public holidays may be processed on the next working day.",
      "An order confirmation is sent to your registered email address or phone number.",
    ],
  },
  {
    number: "02",
    icon: Clock3,
    title: "Estimated Delivery Time",
    description:
      "Delivery time depends on your location, product availability and courier service.",
    points: [
      "Metro cities: approximately 3–5 business days.",
      "Other cities and towns: approximately 5–8 business days.",
      "Remote locations may require additional delivery time.",
    ],
  },
  {
    number: "03",
    icon: Truck,
    title: "Shipping Charges",
    description:
      "Applicable shipping charges are displayed during checkout before payment.",
    points: [
      "Free shipping may be available on selected orders or offers.",
      "Additional charges may apply for remote delivery locations.",
      "Shipping charges may not be refundable after order dispatch.",
    ],
  },
  {
    number: "04",
    icon: MapPin,
    title: "Order Tracking",
    description:
      "Once the order is dispatched, tracking information is provided to you.",
    points: [
      "Tracking details may be sent through email, SMS or WhatsApp.",
      "Tracking information can take a few hours to become active.",
      "You can use our Track Order page to check the latest status.",
    ],
  },
  {
    number: "05",
    icon: AlertCircle,
    title: "Delayed or Failed Delivery",
    description:
      "Unexpected circumstances may sometimes cause a delay in delivery.",
    points: [
      "Weather, strikes, holidays or courier issues may cause delays.",
      "Please provide a complete address and reachable phone number.",
      "Contact our support team if the delivery exceeds the estimated time.",
    ],
  },
  {
    number: "06",
    icon: PackageCheck,
    title: "Damaged Package",
    description:
      "Inspect the package carefully at the time of delivery whenever possible.",
    points: [
      "Do not accept a package that appears opened or severely damaged.",
      "Record a clear unboxing video before opening your order.",
      "Report damaged products within 24 hours of delivery.",
    ],
  },
];


const formatPolicyHtml = (html = "") => {
  if (!html || typeof document === "undefined") return html;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;

  /*
   * Old policy content may contain manually typed bullet characters inside
   * one paragraph. React Quill does not treat those characters as a real list,
   * so we convert them into semantic <ul><li>...</li></ul> markup.
   */
  wrapper.querySelectorAll("p").forEach((paragraph) => {
    const text = (paragraph.textContent || "")
      .replace(/\u00a0/g, " ")
      .trim();

    if (!text.includes("•")) return;

    const items = text
      .split("•")
      .map((item) => item.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (items.length < 2) return;

    const list = document.createElement("ul");
    list.className = "policy-generated-list";

    items.forEach((item) => {
      const listItem = document.createElement("li");
      listItem.textContent = item;
      list.appendChild(listItem);
    });

    paragraph.replaceWith(list);
  });

  // Remove completely empty paragraphs created by repeated Enter presses.
  wrapper.querySelectorAll("p").forEach((paragraph) => {
    const hasUsefulElement = paragraph.querySelector("img, video, iframe, br");

    if (!(paragraph.textContent || "").trim() && !hasUsefulElement) {
      paragraph.remove();
    }
  });

  return wrapper.innerHTML;
};

const ShippingPolicyPage = () => {
  const [dynamicContent, setDynamicContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedDynamicContent = useMemo(
    () => formatPolicyHtml(dynamicContent || ""),
    [dynamicContent],
  );

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/policies`);
        const data = await res.json();
        if (data.success && data.policies?.shippingPolicy) {
          setDynamicContent(data.policies.shippingPolicy);
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
    <main className="shipping-page">
      <section className="shipping-hero">
        <div className="shipping-hero__circle shipping-hero__circle--one" />
        <div className="shipping-hero__circle shipping-hero__circle--two" />

        <div className="shipping-container">
          <div className="shipping-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <strong>Shipping Policy</strong>
          </div>

          <div className="shipping-hero__grid">
            <div className="shipping-hero__content">
              <div className="shipping-eyebrow">
                <Leaf size={17} />
                Reliable delivery across India
              </div>

              <h1>
                Shipping & Delivery <span>Policy</span>
              </h1>

              <p>
                Learn how we process, pack, dispatch and safely deliver your
                Kissan City order to your doorstep.
              </p>

              <div className="shipping-hero__badges">
                <div>
                  <ShieldCheck size={19} />
                  Secure packaging
                </div>

                <div>
                  <BadgeCheck size={19} />
                  Trusted delivery
                </div>

                <div>
                  <Headphones size={19} />
                  Support available
                </div>
              </div>
            </div>

            <div className="shipping-hero__visual">
              <div className="shipping-delivery-card">
                <div className="shipping-delivery-card__top">
                  <div className="shipping-delivery-card__icon">
                    <Truck size={39} />
                  </div>

                  <span>Safe Delivery</span>
                </div>

                <h2>From our store to your door</h2>

                <p>
                  Every order is carefully packed, dispatched and tracked until
                  it reaches you.
                </p>

                <div className="shipping-progress">
                  <div className="shipping-progress__item">
                    <span>
                      <CheckCircle2 size={15} />
                    </span>
                    <small>Confirmed</small>
                  </div>

                  <div className="shipping-progress__line is-active" />

                  <div className="shipping-progress__item">
                    <span>
                      <Warehouse size={15} />
                    </span>
                    <small>Packed</small>
                  </div>

                  <div className="shipping-progress__line is-active" />

                  <div className="shipping-progress__item">
                    <span>
                      <Truck size={15} />
                    </span>
                    <small>Delivered</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shipping-content-section">
        <div className="shipping-container">
          <div className="shipping-introduction">
            <div>
              <div className="shipping-section-label">
                <Leaf size={16} />
                Policy information
              </div>

              <h2>Everything You Need to Know About Delivery</h2>

              <p>
                Our goal is to make every delivery safe, transparent and
                convenient for our customers.
              </p>
            </div>

            <div className="shipping-updated-card">
              <Clock3 size={19} />

              <div>
                <span>Last updated</span>
                <strong>July 2026</strong>
              </div>
            </div>
          </div>

          <div className="shipping-notice">
            <div className="shipping-notice__icon">
              <AlertCircle size={24} />
            </div>

            <div>
              <h3>Important delivery information</h3>
              <p>
                Delivery timelines are estimates and may vary because of
                location, weather conditions, courier availability or
                circumstances outside our control.
              </p>
            </div>
          </div>

          {dynamicContent ? (
            <section className="dynamic-policy-shell">
              <div className="dynamic-policy-shell__header">
                <div className="dynamic-policy-shell__icon">
                  <FileText size={23} />
                </div>

                <div>
                  <span>Official store policy</span>
                  <h2>Shipping & Delivery Policy Details</h2>
                  <p>
                    Please review the information below before placing your
                    order.
                  </p>
                </div>
              </div>

              <div
                className="dynamic-policy-content"
                dangerouslySetInnerHTML={{
                  __html: formattedDynamicContent,
                }}
              />
            </section>
          ) : (
            <div className="shipping-policy-grid">
              {shippingPolicySections.map((section) => {
                const SectionIcon = section.icon;

                return (
                  <article
                    className="shipping-policy-card"
                    key={section.number}
                  >
                    <div className="shipping-policy-card__heading">
                      <div className="shipping-policy-card__number">
                        {section.number}
                      </div>

                      <div className="shipping-policy-card__icon">
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

          <div className="shipping-support-banner">
            <div className="shipping-support-banner__icon">
              <Headphones size={30} />
            </div>

            <div>
              <span>Still have delivery questions?</span>
              <h3>Our support team is ready to help.</h3>
              <p>
                Share your order ID and registered phone number for faster
                assistance.
              </p>
            </div>

            <Link to="/contact" className="shipping-support-button">
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

export default ShippingPolicyPage;