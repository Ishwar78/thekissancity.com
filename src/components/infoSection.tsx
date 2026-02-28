import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Users, Shield, Heart } from 'lucide-react';
import farmAerial from '@/assets/f4_files/farm-aerial-EsFvI8Bg.jpg';

const features = [
  {
    icon: Leaf,
    title: "100% Natural & Preservative-Free",
    description: "No chemicals, no artificial flavours — made with traditional recipes and farm-fresh ingredients.",
  },
  {
    icon: Shield,
    title: "Ayurvedic Health Benefits",
    description: "Each product is crafted with ingredients known for immunity, digestion & anti-inflammatory properties.",
  },
  {
    icon: Users,
    title: "Empowering Rural Farmers",
    description: "Every purchase directly supports rural farming communities and traditional food artisans.",
  },
  {
    icon: Heart,
    title: "Medicinal-Grade Mushrooms",
    description: "Our mushrooms are rich in beta-glucans, Vitamin D & antioxidants — nature's superfood.",
  },
];

const InfoSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="wk-root" ref={sectionRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        .wk-root {
          background: #F5F0E8;
          padding: 80px 0 90px;
          overflow: hidden;
          --green: #2d6a4f;
          --green-dark: #1b4332;
          --brown: #6b4423;
          --brown-mid: #ba8c5c;
        }

        /* ── INNER LAYOUT ── */
        .wk-inner {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }

        @media (max-width: 900px) {
          .wk-inner {
            grid-template-columns: 1fr;
            gap: 48px;
            padding: 0 24px;
          }
          .wk-right { order: -1; }
        }

        /* ── LEFT SIDE ── */
        .wk-left {
          opacity: 0;
          transform: translateX(-28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .wk-left.in { opacity: 1; transform: translateX(0); }

        .wk-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--brown-mid);
          display: block;
          margin-bottom: 16px;
        }

        .wk-title {
          font-family: 'Lora', serif;
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 700;
          color: #1a1a1a;
          line-height: 1.12;
          letter-spacing: -0.5px;
          margin: 0 0 20px;
        }
        .wk-title span {
          color: var(--green);
        }

        .wk-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #666;
          line-height: 1.75;
          max-width: 460px;
          margin-bottom: 44px;
        }

        /* ── FEATURE GRID ── */
        .wk-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px 32px;
        }

        @media (max-width: 480px) {
          .wk-features { grid-template-columns: 1fr; }
        }

        .wk-feature {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .wk-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(45,106,79,0.09);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
          transition: background 0.25s;
        }
        .wk-feature:hover .wk-icon-wrap {
          background: rgba(45,106,79,0.18);
        }

        .wk-feature-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 5px;
          line-height: 1.35;
        }

        .wk-feature-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #777;
          line-height: 1.65;
          margin: 0;
        }

        /* ── RIGHT SIDE ── */
        .wk-right {
          opacity: 0;
          transform: translateX(28px);
          transition: opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s;
          position: relative;
        }
        .wk-right.in { opacity: 1; transform: translateX(0); }

        .wk-img-wrap {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          aspect-ratio: 1 / 1.05;
          box-shadow: 0 20px 60px rgba(0,0,0,0.14);
        }

        .wk-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Floating badge */
        .wk-badge {
          position: absolute;
          bottom: -18px;
          left: -18px;
          background: #fff;
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          min-width: 220px;
          z-index: 2;
        }

        @media (max-width: 900px) {
          .wk-badge {
            bottom: 16px;
            left: 16px;
          }
        }

        .wk-badge-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(45,106,79,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .wk-badge-title {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 2px;
        }

        .wk-badge-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 300;
          color: #999;
          margin: 0;
        }
      `}</style>

      <div className="wk-inner">

        {/* ── LEFT ── */}
        <div className={`wk-left ${visible ? 'in' : ''}`}>
          <span className="wk-eyebrow">Why KissanCity</span>
          <h2 className="wk-title">
            Good for You.<br />
            <span>Great for Farmers.</span>
          </h2>
          <p className="wk-desc">
            We believe everyone deserves access to pure, organic food. KissanCity bridges the gap between hardworking Indian farmers and health-conscious families.
          </p>

          <div className="wk-features">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div className="wk-feature" key={i}>
                  <div className="wk-icon-wrap">
                    <Icon size={18} color="#2d6a4f" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="wk-feature-title">{f.title}</p>
                    <p className="wk-feature-desc">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className={`wk-right ${visible ? 'in' : ''}`}>
          <div className="wk-img-wrap">
            <img src={farmAerial} alt="Organic farm aerial view" />
          </div>

          {/* Floating badge */}
          <div className="wk-badge">
            <div className="wk-badge-icon">
              <Leaf size={22} color="#2d6a4f" strokeWidth={1.8} />
            </div>
            <div>
              <p className="wk-badge-title">Certified Organic</p>
              <p className="wk-badge-sub">Verified farm sources</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default InfoSection;