import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, MapPin, Minus, Plus } from "lucide-react";
import "./Footer.css";

/* Inline social icons — lucide version issue nahi aayega */
const IconInstagram = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const IconFacebook = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M13.5 22v-8h2.75l.41-3.18H13.5V8.79c0-.92.26-1.55 1.58-1.55h1.69V4.4c-.29-.04-1.3-.12-2.47-.12-2.44 0-4.11 1.49-4.11 4.23v2.31H7.43V14h2.76v8h3.31Z" />
  </svg>
);

const IconLinkedin = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const IconYoutube = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98" />
  </svg>
);

const footerLinks = {
  Shop: [
    { title: "About Us", href: "/about" },
    { title: "Blog", href: "/blog" },
    { title: "Shop", href: "/new-arrivals" },
    { title: "New Arrivals", href: "/new-arrivals" },
  ],
  Support: [
    { title: "Contact Us", href: "/contact" },
    { title: "Shipping Policy", href: "/shipping" },
    { title: "Return Policy", href: "/Return-policy" },
    { title: "Track Order", href: "/Track-order" },
  ],
  Follow: [
    {
      title: "Stay updated with our latest collections and farm-fresh news.",
      href: "",
    },
  ],
};

const socials = [
  {
    icon: <IconInstagram />,
    href: "https://www.instagram.com/thekissancity_official/",
    label: "Instagram",
  },
  {
    icon: <IconFacebook />,
    href: "https://facebook.com/yourusername",
    label: "Facebook",
  },
  {
  icon: <IconLinkedin />,
  href: "https://www.linkedin.com/in/yourusername/",
  label: "LinkedIn",
},
  {
    icon: <IconYoutube />,
    href: "https://www.youtube.com/@thekissancity",
    label: "YouTube",
  },
];

const bottomLinks = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms of Service", href: "/terms" },
];

export default function Footer() {
  const [openSection, setOpenSection] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    email: "connect@thekissancity.com",
    serviceLocation: "Across India",
  });

  React.useEffect(() => {
    const fetchInfo = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || "https://thekissancity.com").replace(/\/$/, "");
        const res = await fetch(`${baseUrl}/api/contact-info`);
        const data = await res.json().catch(() => ({}));
        if (data.success && data.contactInfo) {
          setContactInfo(data.contactInfo);
        }
      } catch (err) {
        console.error("Error fetching footer contact info:", err);
      }
    };
    fetchInfo();
  }, []);

  const toggleSection = (title) => {
    setOpenSection((current) => (current === title ? null : title));
  };

  return (
    <footer className="footer">
      {/* Tablet/Mobile par desktop image ki jagah ye theme decorations aayengi */}
      <div className="footer__mobile-theme" aria-hidden="true">
        <span className="footer__theme-circle footer__theme-circle--farmer">
          👨‍🌾
        </span>
        <span className="footer__theme-circle footer__theme-circle--wheat">
          🌾
        </span>
        <span className="footer__theme-circle footer__theme-circle--leaf">
          🍃
        </span>
        <span className="footer__theme-circle footer__theme-circle--veg">
          🥬
        </span>
      </div>

      <div className="footer__glow footer__glow--one" aria-hidden="true" />
      <div className="footer__glow footer__glow--two" aria-hidden="true" />

      <div className="container footer__container">
        <div className="footer__grid">
          {/* Brand */}
          <div className="footer__brand">
            <Link to="/" className="footer__logo-wrap" aria-label="Home">
              <img
                src="/kissancitylogo.jpg"
                alt="The Kissan City"
                className="footer__logo-img"
              />
            </Link>

            <p className="footer__desc">
              Connecting 500+ Kissan farmers with 2 lakh+ Indian families.
              Pure, organic and farm-fresh products with zero compromise on
              quality.
            </p>

            <div className="footer__contact">
              <div className="footer__contact-item">
                <span className="footer__contact-icon">
                  <MapPin size={16} />
                </span>

                <span className="footer__contact-copy">
                  <small>Our Location</small>
                  <strong>{contactInfo.serviceLocation || "Across India"}</strong>
                </span>
              </div>

              <a
                href={`mailto:${contactInfo.email || 'connect@thekissancity.com'}`}
                className="footer__contact-item"
              >
                <span className="footer__contact-icon">
                  <Mail size={16} />
                </span>

                <span className="footer__contact-copy">
                  <small>Email Support</small>
                  <strong>{contactInfo.email || "connect@thekissancity.com"}</strong>
                </span>
              </a>
            </div>
          </div>

          {/* Footer columns */}
          {Object.entries(footerLinks).map(([title, links]) => {
            const isOpen = openSection === title;

            return (
              <div
                key={title}
                className={`footer__column ${
                  isOpen ? "footer__column--open" : ""
                }`}
              >
                <button
                  type="button"
                  className="footer__col-header"
                  onClick={() => toggleSection(title)}
                  aria-expanded={isOpen}
                >
                  <span className="footer__col-title">{title}</span>

                  <span className="footer__toggle-icon">
                    {isOpen ? <Minus size={19} /> : <Plus size={19} />}
                  </span>
                </button>

                <div className="footer__links-wrap">
                  <div className="footer__links-inner">
                    <ul className="footer__links">
                      {links.map((item) => (
                        <li key={`${title}-${item.title}`}>
                          {item.href ? (
                            <Link to={item.href}>
                              <span className="footer__link-arrow">→</span>
                              {item.title}
                            </Link>
                          ) : (
                            <span className="footer__follow-text">
                              {item.title}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {title === "Follow" && (
                      <div className="footer__socials">
                        {socials.map((social) => (
                          <a
                            key={social.label}
                            href={social.href}
                            className="footer__social-btn"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            title={social.label}
                          >
                            {social.icon}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} The Kissan City. Made with 🌱 for
            Indian families.
          </p>

          <div className="footer__bottom-links">
            {bottomLinks.map((item) => (
              <Link key={item.title} to={item.href}>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}