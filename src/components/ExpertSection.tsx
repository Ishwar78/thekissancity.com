import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Award } from 'lucide-react';

const ExpertSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [experts, setExperts] = useState<any[]>([]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const res = await fetch('/api/team?type=expert');
        if (res.ok) {
          const { data } = await res.json();
          setExperts(data);
        }
      } catch (err) {
        console.error('Failed to fetch experts:', err);
      }
    };
    fetchExperts();
  }, []);

  if (experts.length === 0) return null;

  return (
    <section className="es-root" ref={sectionRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        .es-root {
          background: #F5F0E8;
          padding: 50px 0 50px;
          overflow: hidden;
          --green: #2d6a4f;
          --brown: #6b4423;
          --brown-mid: #ba8c5c;
        }

        .es-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 0 16px;
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .es-header.in { opacity: 1; transform: translateY(0); }

        .es-eyebrow {
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

        .es-title {
          font-family: 'Lora', serif;
          font-size: clamp(26px, 7vw, 46px);
          font-weight: 700;
          color: #333;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin: 0 0 16px;
          position: relative;
        }

        .es-title::after {
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

        .es-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #666;
          max-width: 480px;
          margin: 16px auto 0;
          line-height: 1.6;
        }

        .es-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 1024px) { .es-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 580px) { .es-grid { grid-template-columns: 1fr; padding: 0 16px; } }

        .es-card {
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
        }
        .es-card.in { opacity: 1; transform: translateY(0); }
        .es-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(45,106,79,0.12); }

        .es-photo-wrap { position: relative; height: 220px; overflow: hidden; }
        .es-photo-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
        .es-card:hover .es-photo-wrap img { transform: scale(1.05); }

        .es-photo-wrap::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
          background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
        }

        .es-name-overlay { position: absolute; bottom: 12px; left: 14px; z-index: 2; }
        .es-expert-name { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 3px; }
        .es-location { display: flex; align-items: center; gap: 3px; font-family: 'DM Sans', sans-serif; font-size: 11px; color: rgba(255,255,255,0.8); }

        .es-card-body { padding: 16px; }
        .es-specialty { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
        .es-specialty-icon { color: var(--brown-mid); }
        .es-specialty-text { font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--brown-mid); }

        .es-quote-mark { font-size: 28px; line-height: 1; color: rgba(107,68,35,0.15); font-family: Georgia, serif; display: block; margin-bottom: 2px;}
        .es-quote { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 300; font-style: italic; color: #555; line-height: 1.6; margin-bottom: 14px; }
        .es-experience { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 12px;}
        .es-experience strong { color: #333; font-weight: 500; }
      `}</style>

      <div className={`es-header ${visible ? 'in' : ''}`}>
        <span className="es-eyebrow">Our Experts</span>
        <h2 className="es-title">Guided by Professionals</h2>
        <p className="es-subtitle">
          Meet the agricultural scientists and health experts who ensure the purity and quality of our products.
        </p>
      </div>

      <div className="es-grid">
        {experts.map((expert, i) => (
          <div key={i} className={`es-card ${visible ? 'in' : ''}`} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="es-photo-wrap">
              <img src={expert.image?.startsWith('http') ? expert.image : `/uploads/${expert.image}`} alt={expert.name} />
              <div className="es-name-overlay">
                <div className="es-expert-name">{expert.name}</div>
                {expert.location && (
                  <div className="es-location"><MapPin size={10} />{expert.location}</div>
                )}
              </div>
            </div>

            <div className="es-card-body">
              <div className="es-specialty">
                <Award size={12} className="es-specialty-icon" />
                <span className="es-specialty-text">{expert.specialty}</span>
              </div>
              <span className="es-quote-mark">❝</span>
              <p className="es-quote">{expert.quote}</p>
              
              {expert.experience && (
                <p className="es-experience">Experience: <strong>{expert.experience}</strong></p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExpertSection;
