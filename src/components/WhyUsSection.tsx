import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Tractor, ShieldCheck, HeartHandshake } from 'lucide-react';

const features = [
  {
    title: "Unfiltered Purity",
    description: "No additives , no alterations. We bring you food in its most honest form , preserving the land's natural nutrients and authentic taste.",
    icon: Leaf,
    stat: "100%",
    statLabel: "Original & Real",
  },
  {
    title: "Farm to Fork Direct",
    description: "We bridge the gap and ensure you get the freshest harvest while the farmer receives a fair , honest income",
    icon: Tractor,
    stat: "Direct",
    statLabel: "Impact",
  },
  {
    title: "Scientifically Pure",
    description: "Using traditional wisdom and modern quality standards , our products are crafted to stay fresh naturally without a single drop of synthetic preservatives or chemicals",
    icon: ShieldCheck,
    stat: "Nature's",
    statLabel: "Integrity",
  },
  {
    title: "Local Farmers , Cultivating Prosperity",
    description: "Your purchase is an investment in our local farming families .Together , we are building a sustainable future for the people who feed our nation .",
    icon: HeartHandshake,
    stat: "500+",
    statLabel: "Farmers",
  },
];

const WhyUsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ backgroundColor: '#F5F0E8' }} className="wus-root py-14 sm:py-20 overflow-hidden">
      <style>{`
        .wus-root {
          --green:      #2d6a4f;
          --green-dark: #1b4332;
          --green-soft: #d8f3dc;
          --brown:      #6b4423;
          --brown-mid:  #ba8c5c;
          --cream:      #faf3eb;
        }

        /* ── Header ── */
        .wus-eyebrow {
          display: inline-block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--brown-mid);
          background: rgba(107,68,35,0.08);
          padding: 4px 14px; border-radius: 20px;
          margin-bottom: 10px;
        }
        .wus-title {
          font-size: clamp(1.9rem, 4.5vw, 3.2rem);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1;
          color: var(--brown); margin-bottom: 10px;
        }
        .wus-title span { color: var(--green); }
        .wus-underline {
          height: 4px; width: 60px; border-radius: 4px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          margin: 0 auto 6px;
        }
        .wus-subtitle {
          font-size: 14px; color: #888; max-width: 400px; margin: 0 auto;
          line-height: 1.6;
        }

        /* ── Scroll reveal ── */
        .wus-reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .wus-reveal.wus-in {
          opacity: 1;
          transform: translateY(0);
        }
        .wus-d0 { transition-delay: 0.05s; }
        .wus-d1 { transition-delay: 0.15s; }
        .wus-d2 { transition-delay: 0.25s; }
        .wus-d3 { transition-delay: 0.35s; }

        /* ── Card ── */
        .wus-card {
          position: relative;
          background: #fff;
          border-radius: 22px;
          padding: 32px 24px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1.5px solid rgba(107,68,35,0.07);
          box-shadow: 0 4px 18px rgba(45,106,79,0.06);
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s;
          cursor: default;
          /* Ensure cards in same row have equal height */
          height: 100%;
        }
        .wus-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
          border-radius: 22px 22px 0 0;
        }
        .wus-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 18px 42px rgba(45,106,79,0.13);
          border-color: rgba(45,106,79,0.15);
        }
        .wus-card:hover::before { transform: scaleX(1); }

        /* Background number watermark */
        .wus-watermark {
          position: absolute;
          top: -10px; right: 10px;
          font-size: 88px; font-weight: 900;
          color: rgba(45,106,79,0.04);
          line-height: 1;
          pointer-events: none;
          user-select: none;
          font-variant-numeric: tabular-nums;
        }

        /* Icon ring */
        .wus-icon-ring {
          position: relative;
          width: 68px; height: 68px;
          border-radius: 50%;
          margin-bottom: 18px;
          display: flex; align-items: center; justify-content: center;
          background: var(--green-soft);
          transition: background 0.3s, transform 0.3s;
        }
        .wus-card:hover .wus-icon-ring {
          background: var(--green);
          transform: scale(1.08) rotate(-4deg);
        }
        .wus-card:hover .wus-icon-ring svg { color: #fff !important; }

        /* Pulse ring animation */
        @keyframes wus-pulse {
          0%   { transform: scale(1); opacity: 0.35; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        .wus-icon-ring::after {
          content: '';
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 2px solid var(--green);
          opacity: 0;
          animation: wus-pulse 2.5s ease-out infinite;
        }
        .wus-card:hover .wus-icon-ring::after { opacity: 0.35; }

        /* Stat */
        .wus-stat {
          font-size: 28px; font-weight: 900;
          color: var(--green);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 2px;
          transition: color 0.2s;
        }
        .wus-stat-label {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.15em;
          color: var(--brown-mid);
          margin-bottom: 12px;
        }

        /* Divider */
        .wus-divider {
          width: 32px; height: 2px;
          background: linear-gradient(90deg, var(--green), transparent);
          border-radius: 2px;
          margin: 0 auto 14px;
          transition: width 0.3s;
        }
        .wus-card:hover .wus-divider { width: 48px; }

        /* Title */
        .wus-card-title {
          font-size: 15px; font-weight: 800;
          color: var(--brown);
          letter-spacing: 0.1px;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        /* Description */
        .wus-card-desc {
          font-size: 13px;
          color: #888;
          line-height: 1.65;
          max-width: 220px;
        }

        /* Mobile-specific adjustments for 2-column layout */
        @media (max-width: 639px) {
          .wus-card {
            padding: 24px 16px 20px;
          }
          
          .wus-icon-ring {
            width: 56px;
            height: 56px;
            margin-bottom: 14px;
          }
          
          .wus-icon-ring svg {
            width: 22px;
            height: 22px;
          }
          
          .wus-stat {
            font-size: 24px;
          }
          
          .wus-stat-label {
            font-size: 9px;
            margin-bottom: 10px;
          }
          
          .wus-divider {
            margin-bottom: 12px;
          }
          
          .wus-card-title {
            font-size: 14px;
          }
          
          .wus-card-desc {
            font-size: 12px;
            max-width: 100%;
          }
          
          .wus-watermark {
            font-size: 70px;
            top: -5px;
            right: 5px;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8" ref={sectionRef}>

        {/* Header */}
        <div className={`text-center mb-12 sm:mb-14 wus-reveal ${visible ? 'wus-in' : ''}`}>
          <span className="wus-eyebrow">Our Promise</span>
          <h2 className="wus-title">Why Choose <span>Us?</span></h2>
          <div className="wus-underline" />
          <p className="wus-subtitle">
            We believe food should be honest, clean, and kind — to you and the earth.
          </p>
        </div>

        {/* Cards - Updated grid classes for 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`wus-card wus-reveal wus-d${index} ${visible ? 'wus-in' : ''}`}
              >
                {/* Watermark number */}
                <div className="wus-watermark">{String(index + 1).padStart(2, '0')}</div>

                {/* Icon */}
                <div className="wus-icon-ring">
                  <Icon size={26} style={{ color: 'var(--green)', transition: 'color 0.3s' }} />
                </div>

                {/* Stat */}
                <div className="wus-stat">{feature.stat}</div>
                <div className="wus-stat-label">{feature.statLabel}</div>

                <div className="wus-divider" />

                <h3 className="wus-card-title">{feature.title}</h3>
                <p className="wus-card-desc">{feature.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyUsSection;