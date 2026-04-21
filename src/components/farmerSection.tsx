import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Award } from 'lucide-react';

const FarmersSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [farmers, setFarmers] = useState<any[]>([]);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const res = await fetch('/api/team?type=farmer');
        if (res.ok) {
          const { data } = await res.json();
          setFarmers(data);
        }
      } catch (err) {
        console.error('Failed to fetch farmers:', err);
      }
    };
    fetchFarmers();
  }, []);

  return (
    <section className="fs-root" ref={sectionRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        .fs-root {
          background: #F5F0E8;
          padding: 20px 0 50px;
          overflow: hidden;
          --green: #2d6a4f;
          --green-dark: #1b4332;
          --brown: #6b4423;
          --brown-mid: #ba8c5c;
        }

        /* ── HEADER ── */
        .fs-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 0 16px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fs-header.in { opacity: 1; transform: translateY(0); }

        .fs-eyebrow {
          display: inline-flex;
          align-items: center;
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brown-mid);
          margin-bottom: 12px;
          padding: 4px 12px;
          background: rgba(107, 68, 35, 0.08);
          border-radius: 20px;
          border: 1px solid rgba(107, 68, 35, 0.15);
        }

        .fs-title {
          font-family: 'Lora', serif;
          font-size: clamp(26px, 7vw, 56px);
          font-weight: 700;
          background: linear-gradient(135deg, var(--green), var(--brown));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin: 0 0 16px;
          position: relative;
        }

        .fs-title::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2.5px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          border-radius: 2px;
        }

        .fs-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #666;
          max-width: 480px;
          margin: 16px auto 0;
          line-height: 1.6;
          letter-spacing: 0.02em;
        }

        /* ── GRID ── */
        .fs-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 1024px) {
          .fs-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 0 20px; }
        }
        @media (max-width: 580px) {
          .fs-grid { 
            grid-template-columns: 1fr; 
            gap: 16px; 
            padding: 0 16px; 
          }
        }

        /* ── CARD ── */
        .fs-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
        }
        .fs-card.in { opacity: 1; transform: translateY(0); }
        .fs-card:hover {
          box-shadow: 0 8px 24px rgba(45,106,79,0.12);
          transform: translateY(-3px);
        }

        .fs-card-d0 { transition-delay: 0.05s; }
        .fs-card-d1 { transition-delay: 0.15s; }
        .fs-card-d2 { transition-delay: 0.25s; }
        .fs-card-d3 { transition-delay: 0.35s; }

        /* Photo area */
        .fs-photo-wrap {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        @media (max-width: 580px) {
          .fs-photo-wrap {
            height: 180px;
          }
        }

        .fs-photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.5s ease;
          display: block;
        }
        .fs-card:hover .fs-photo-wrap img { transform: scale(1.05); }

        /* Gradient over photo bottom */
        .fs-photo-wrap::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 50%;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
          pointer-events: none;
        }

        /* Name overlay on photo */
        .fs-name-overlay {
          position: absolute;
          bottom: 12px;
          left: 14px;
          z-index: 2;
        }

        @media (max-width: 580px) {
          .fs-name-overlay {
            bottom: 10px;
            left: 12px;
          }
        }

        .fs-farmer-name {
          font-family: 'Lora', serif;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 3px;
        }

        @media (max-width: 580px) {
          .fs-farmer-name {
            font-size: 15px;
          }
        }

        .fs-location {
          display: flex;
          align-items: center;
          gap: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 400;
          color: rgba(255,255,255,0.8);
        }

        /* Card body */
        .fs-card-body {
          padding: 16px 16px 18px;
        }

        @media (max-width: 580px) {
          .fs-card-body {
            padding: 14px 14px 16px;
          }
        }

        /* Specialty tag */
        .fs-specialty {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }

        .fs-specialty-icon {
          color: var(--brown-mid);
          flex-shrink: 0;
        }

        .fs-specialty-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--brown-mid);
        }

        /* Quote */
        .fs-quote-mark {
          font-size: 28px;
          line-height: 1;
          color: rgba(107,68,35,0.15);
          font-family: Georgia, serif;
          margin-bottom: 2px;
          display: block;
        }

        @media (max-width: 580px) {
          .fs-quote-mark {
            font-size: 24px;
          }
        }

        .fs-quote {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 300;
          font-style: italic;
          color: #555;
          line-height: 1.6;
          margin-bottom: 14px;
        }

        @media (max-width: 580px) {
          .fs-quote {
            font-size: 11.5px;
            line-height: 1.5;
            margin-bottom: 12px;
          }
        }

        /* Divider */
        .fs-divider {
          height: 1px;
          background: #f0ebe2;
          margin-bottom: 12px;
        }

        /* Experience */
        .fs-experience {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: #999;
          font-weight: 300;
        }

        @media (max-width: 580px) {
          .fs-experience {
            font-size: 11px;
          }
        }

        .fs-experience strong {
          color: #333;
          font-weight: 500;
        }
      `}</style>

      <div className="fs-header-wrap">
        <div className={`fs-header ${visible ? 'in' : ''}`}>
          <span className="fs-eyebrow">Our Farmers</span>
          <h2 className="fs-title">The Hands Behind Your Food</h2>
          <p className="fs-subtitle">
            Meet the passionate farmers who grow, harvest, and handcraft every product with love and generations of wisdom.
          </p>
        </div>
      </div>

      <div className="fs-grid">
        {farmers.map((farmer, i) => (
          <div
            key={i}
            className={`fs-card fs-card-d${i} ${visible ? 'in' : ''}`}
          >
            {/* Photo */}
            <div className="fs-photo-wrap">
              <img src={farmer.image?.startsWith('http') ? farmer.image : `/uploads/${farmer.image}`} alt={farmer.name} />
              <div className="fs-name-overlay">
                <div className="fs-farmer-name">{farmer.name}</div>
                <div className="fs-location">
                  <MapPin size={10} />
                  {farmer.location}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="fs-card-body">
              <div className="fs-specialty">
                <Award size={12} className="fs-specialty-icon" />
                <span className="fs-specialty-text">{farmer.specialty}</span>
              </div>

              <span className="fs-quote-mark">❝</span>
              <p className="fs-quote">{farmer.quote}</p>

              <div className="fs-divider" />

              <p className="fs-experience">
                Farming experience: <strong>{farmer.experience}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FarmersSection;