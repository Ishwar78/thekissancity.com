import React, { useEffect, useRef, useState } from 'react';

const stats = [
  { value: "50+",  label: "Farmer Families" },
  { value: "100%", label: "Organic"          },
  { value: "0",    label: "Middlemen"        },
];

const FarmerStatsSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="fss-root" ref={sectionRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

        .fss-root {
          background: #F5F0E8;
          padding: 48px 32px 56px;
          --green: #2d6a4f;
        }

        /* Card */
        .fss-card {
          max-width: 860px;
          margin: 0 auto;
          background: #faf7f2;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 20px;
          padding: 52px 48px 48px;
          text-align: center;
          box-shadow: 0 2px 24px rgba(0,0,0,0.04);
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fss-card.in { opacity: 1; transform: translateY(0); }

        /* Title */
        .fss-title {
          font-family: 'Lora', serif;
          font-size: clamp(22px, 3.5vw, 36px);
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.3px;
          margin: 0 0 16px;
          line-height: 1.2;
        }

        /* Body text */
        .fss-body {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 300;
          color: #777;
          line-height: 1.75;
          max-width: 580px;
          margin: 0 auto 44px;
        }

        /* Divider */
        .fss-divider {
          height: 1px;
          background: rgba(0,0,0,0.07);
          margin-bottom: 40px;
        }

        /* Stats row */
        .fss-stats {
          display: flex;
          justify-content: center;
          gap: 0;
        }

        .fss-stat {
          flex: 1;
          max-width: 200px;
          position: relative;
          opacity: 0;
          transform: translateY(14px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fss-stat.in { opacity: 1; transform: translateY(0); }
        .fss-stat-d0 { transition-delay: 0.1s; }
        .fss-stat-d1 { transition-delay: 0.22s; }
        .fss-stat-d2 { transition-delay: 0.34s; }

        /* Vertical separator */
        .fss-stat + .fss-stat::before {
          content: '';
          position: absolute;
          left: 0; top: 15%; bottom: 15%;
          width: 1px;
          background: rgba(0,0,0,0.1);
        }

        .fss-stat-num {
          font-family: 'Lora', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 700;
          color: var(--green);
          line-height: 1;
          display: block;
          margin-bottom: 8px;
          letter-spacing: -1px;
        }

        .fss-stat-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 400;
          color: #999;
          letter-spacing: 0.02em;
          display: block;
        }

        @media (max-width: 600px) {
          .fss-card { padding: 36px 24px 36px; }
          .fss-stats { gap: 0; }
        }
      `}</style>

      <div className={`fss-card ${visible ? 'in' : ''}`}>
        <h2 className="fss-title">Supporting 50+ Farmer Families</h2>
        <p className="fss-body">
          Every purchase directly supports small-scale organic farmers across India. We ensure fair prices, no middlemen, and sustainable farming practices that protect both the farmer and the earth.
        </p>

        <div className="fss-divider" />

        <div className="fss-stats">
          {stats.map((s, i) => (
            <div key={i} className={`fss-stat fss-stat-d${i} ${visible ? 'in' : ''}`}>
              <span className="fss-stat-num">{s.value}</span>
              <span className="fss-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FarmerStatsSection;