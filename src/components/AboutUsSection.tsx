import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Leaf, Mountain, Heart } from 'lucide-react';

interface AboutUsData {
  eyebrow: {
    text: string;
    icon: string;
  };
  title: {
    main: string;
    highlighted: string;
  };
  content: {
    main: { text: string }[];
    expanded: { text: string }[];
  };
  image: {
    src: string;
    alt: string;
    badge: {
      text: string;
      icon: string;
    };
    banner: {
      text: string;
    };
  };
  icons: {
    text: string;
    icon: string;
  }[];
  stats: {
    value: string;
    label: string;
  }[];
}

const AboutUsSection = () => {
  const [isReadMore, setIsReadMore] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutUsData, setAboutUsData] = useState<AboutUsData | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/about-us');
        if (!response.ok) {
          throw new Error('Failed to fetch About Us data');  
        }
        const data = await response.json();
        console.log('About Us API response:', data);
        setAboutUsData(data);
      } catch (err) {
        console.error('Error fetching About Us data:', err);
        setError('Failed to load About Us content');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutUsData();
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Leaf': return Leaf;
      case 'Mountain': return Mountain;
      case 'Heart': return Heart;
      default: return Leaf;
    }
  };

  const ImageCard = ({ height = 420 }: { height?: number }) => {
    if (!aboutUsData) return null;

    const BadgeIcon = getIconComponent(aboutUsData.image.badge.icon);

    return (
      <div className="au-image-card">
        <div className="au-img-top-bar" />
        <div className="au-img-wrap" style={{ height }}>
          <img src={aboutUsData.image.src} alt={aboutUsData.image.alt} />
          <div className="au-img-overlay" />
          <div className="au-float-badge">
            <BadgeIcon size={10} />
            {aboutUsData.image.badge.text}
          </div>
        </div>
        <div className="au-img-banner">
          <div className="au-img-banner-dot" />
          <span className="au-img-banner-text">{aboutUsData.image.banner.text}</span>
          <div className="au-img-banner-dot" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="au-root" ref={sectionRef}>
        <style>{`
          .au-root {
            position: relative; overflow: hidden;
            background: linear-gradient(135deg, #1a120a 0%, #2d1f10 40%, #1e160c 100%);
            padding: 80px 0;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .au-loading {
            color: #ba8c5c;
            font-size: 18px;
            font-weight: 600;
          }
        `}</style>
        <div className="au-loading">Loading About Us...</div>
      </section>
    );
  }

  if (error || !aboutUsData) {
    return (
      <section className="au-root" ref={sectionRef}>
        <style>{`
          .au-root {
            position: relative; overflow: hidden;
            background: linear-gradient(135deg, #1a120a 0%, #2d1f10 40%, #1e160c 100%);
            padding: 80px 0;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .au-error {
            color: #e74c3c;
            font-size: 16px;
            font-weight: 500;
            text-align: center;
          }
        `}</style>
        <div className="au-error">{error || 'About Us content not available'}</div>
      </section>
    );
  }

  const EyebrowIcon = getIconComponent(aboutUsData.eyebrow.icon);

  return (
    <section className="au-root" ref={sectionRef}>
      <style>{`
        .au-root {
          position: relative; overflow: hidden;
          background: linear-gradient(135deg, #1a120a 0%, #2d1f10 40%, #1e160c 100%);
          padding: 80px 0;
        }
        .au-root::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(186,140,92,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none; z-index: 0;
        }

        /* Glowing orbs */
        .au-orb1 {
          position: absolute; top: -80px; left: -80px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(45,106,79,0.18) 0%, transparent 70%);
          pointer-events: none;
          animation: au-drift 8s ease-in-out infinite alternate;
        }
        .au-orb2 {
          position: absolute; bottom: -60px; right: -60px;
          width: 280px; height: 280px; border-radius: 50%;
          background: radial-gradient(circle, rgba(186,140,92,0.14) 0%, transparent 70%);
          pointer-events: none;
          animation: au-drift 10s ease-in-out infinite alternate-reverse;
        }
        @keyframes au-drift {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(25px, 18px) scale(1.08); }
        }

        /* Scroll reveal */
        .au-reveal-left {
          opacity: 0; transform: translateX(-30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .au-reveal-left.au-in { opacity: 1; transform: translateX(0); }
        .au-reveal-right {
          opacity: 0; transform: translateX(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .au-reveal-right.au-in { opacity: 1; transform: translateX(0); }
        .au-reveal {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .au-reveal.au-in { opacity: 1; transform: translateY(0); }
        .au-d2 { transition-delay: 0.15s; }
        .au-d3 { transition-delay: 0.3s; }

        /* Eyebrow */
        .au-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase;
          color: #ba8c5c; background: rgba(186,140,92,0.1);
          border: 1px solid rgba(186,140,92,0.22);
          padding: 5px 14px; border-radius: 20px; margin-bottom: 16px;
        }

        /* Title */
        .au-title {
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 900; line-height: 1; letter-spacing: -0.03em;
          color: #fff; margin-bottom: 8px;
        }
        .au-title span {
          background: linear-gradient(135deg, #ba8c5c, #e8c07a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .au-title-underline {
          height: 3px; width: 60px; border-radius: 3px;
          background: linear-gradient(90deg, #2d6a4f, #ba8c5c);
          margin-bottom: 28px;
        }

        /* Body text */
        .au-body { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.62); margin-bottom: 12px; }
        .au-body-more { font-size: 14px; line-height: 1.8; color: rgba(255,255,255,0.5); margin-bottom: 12px; }

        /* Toggle btn */
        .au-toggle-btn {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: #ba8c5c; border: none; background: none; cursor: pointer; padding: 0; margin-top: 6px;
          transition: color 0.2s, gap 0.2s;
        }
        .au-toggle-btn:hover { color: #e8c07a; gap: 10px; }

        /* Shimmer divider */
        .au-shimmer-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(186,140,92,0.4), transparent);
          margin: 26px 0; position: relative; overflow: hidden;
        }
        .au-shimmer-line::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
          animation: au-shimmer 3s ease-in-out infinite;
        }
        @keyframes au-shimmer { 0% { left: -100%; } 100% { left: 100%; } }

        /* Icon pills */
        .au-icons-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 24px; }
        .au-icon-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          padding: 6px 12px; border-radius: 20px;
          transition: color 0.2s, background 0.2s, border-color 0.2s;
        }
        .au-icon-pill:hover { color: #ba8c5c; background: rgba(186,140,92,0.1); border-color: rgba(186,140,92,0.25); }

        /* Stats */
        .au-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        @media (min-width: 480px) { .au-stats { grid-template-columns: repeat(4, 1fr); } }
        .au-stat-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px; padding: 14px 8px; text-align: center;
          transition: background 0.25s, border-color 0.25s, transform 0.25s;
        }
        .au-stat-card:hover { background: rgba(45,106,79,0.15); border-color: rgba(45,106,79,0.35); transform: translateY(-3px); }
        .au-stat-value {
          font-size: 22px; font-weight: 900; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ba8c5c, #e8c07a);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; display: block; margin-bottom: 3px;
        }
        .au-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.35); }

        /* ── IMAGE CARD ── */
        .au-image-card {
          position: relative; border-radius: 24px; overflow: hidden;
          box-shadow: 0 30px 70px rgba(0,0,0,0.55);
          border: 1px solid rgba(255,255,255,0.07);
          background: #1a120a;
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .au-image-card:hover {
          transform: translateY(-5px) scale(1.01);
          box-shadow: 0 40px 90px rgba(0,0,0,0.65);
        }
        .au-img-top-bar {
          height: 4px;
          background: linear-gradient(90deg, #2d6a4f, #ba8c5c, #e8c07a);
        }
        .au-img-wrap {
          position: relative; overflow: hidden; width: 100%;
        }
        /* ✅ THE FIX: object-cover fills the height, no black void */
        .au-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: top center;
          display: block;
          transition: transform 0.7s ease;
        }
        .au-image-card:hover .au-img-wrap img { transform: scale(1.04); }
        .au-img-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 55%);
          pointer-events: none;
        }

        /* Floating badge */
        .au-float-badge {
          position: absolute; top: 14px; right: 14px; z-index: 3;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
          border: 1px solid rgba(186,140,92,0.35); border-radius: 30px;
          padding: 6px 13px;
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; color: #e8c07a; letter-spacing: 0.08em;
          animation: au-badge-float 3s ease-in-out infinite;
        }
        @keyframes au-badge-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }

        /* Bottom banner */
        .au-img-banner {
          background: linear-gradient(135deg, #1a120a, #2d1f10);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 15px 20px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .au-img-banner-text {
          font-size: 12px; font-weight: 800; letter-spacing: 0.2em;
          text-transform: uppercase; color: rgba(255,255,255,0.8);
        }
        .au-img-banner-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: linear-gradient(135deg, #2d6a4f, #ba8c5c);
        }
      `}</style>

      <div className="au-orb1" />
      <div className="au-orb2" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── LEFT TEXT ── */}
          <div className={`lg:w-[50%] w-full au-reveal-left ${visible ? 'au-in' : ''}`}>

            <div className="au-eyebrow">
              <EyebrowIcon size={12} />
              {aboutUsData.eyebrow.text}
            </div>

            <h2 className="au-title">{aboutUsData.title.main} <span>{aboutUsData.title.highlighted}</span></h2>
            <div className="au-title-underline" />

            {aboutUsData.content.main.map((paragraph, index) => (
              <p key={index} className="au-body">
                {paragraph.text}
              </p>
            ))}

            {isReadMore && aboutUsData.content.expanded.map((paragraph, index) => (
              <p key={index} className="au-body-more">
                {paragraph.text}
              </p>
            ))}

            <button className="au-toggle-btn" onClick={() => setIsReadMore(!isReadMore)}>
              {isReadMore ? (
                <>
                  <span>Read Less</span>
                  <ChevronUp size={14} />
                </>
              ) : (
                <>
                  <span>Read More</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>

            <div className="au-shimmer-line" />

            <div className="lg:hidden mt-6">
              <ImageCard height={260} />
            </div>

            <div className="au-icons-row">
              {aboutUsData.icons.map((icon, index) => {
                const IconComponent = getIconComponent(icon.icon);
                return (
                  <span key={index} className="au-icon-pill">
                    <IconComponent size={11} />
                    {icon.text}
                  </span>
                );
              })}
            </div>

            <div className={`au-stats au-reveal au-d3 ${visible ? 'au-in' : ''}`}>
              {aboutUsData.stats.map((stat, index) => (
                <div key={index} className="au-stat-card">
                  <span className="au-stat-value">{stat.value}</span>
                  <span className="au-stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT IMAGE (desktop) ── */}
          <div className={`hidden lg:block lg:w-[46%] au-reveal-right au-d2 ${visible ? 'au-in' : ''}`}>
            <ImageCard height={480} />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;