import React, { useEffect, useRef, useState } from 'react';
import { Truck, Lock, RefreshCcw, Headphones, Shield, Clock, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: " Direct Farm Sourcing",
    description: "Every product is harvested and sourced directly from local farms , ensuring maximum freshness and fair pay for our growers.",
    color: "#2d6a4f",
    bgGradient: "linear-gradient(135deg, #2d6a4f, #40916c)",
    stat: "1000+",
    statLabel: "Daily Orders"
  },
  {
    icon: Lock,
    title: "Secure Payment",
    description: "100% secure payment process",
    color: "#6b4423",
    bgGradient: "linear-gradient(135deg, #6b4423, #ba8c5c)",
    stat: "SSL",
    statLabel: "Encrypted"
  },
  {
    icon: RefreshCcw,
    title: "Quality Replacement",
    description: "Not happy with the quality or found a defect ? We offer a hassle free-replacement or refund for damaged items within 36 hours",
    color: "#2d6a4f",
    bgGradient: "linear-gradient(135deg, #2d6a4f, #40916c)",
    stat: "30",
    statLabel: "Days Policy"
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer support",
    color: "#6b4423",
    bgGradient: "linear-gradient(135deg, #6b4423, #ba8c5c)",
    stat: "24/7",
    statLabel: "Available"
  }
];

export const FeatureSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="fs-root py-16 sm:py-20 relative overflow-hidden"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      <style>{`
        .fs-root {
          --green: #2d6a4f;
          --green-dark: #1b4332;
          --green-soft: #d8f3dc;
          --brown: #6b4423;
          --brown-mid: #ba8c5c;
          --cream: #faf3eb;
        }

        /* Background decoration */
        .fs-root::before {
          content: '';
          position: absolute;
          top: -30%;
          left: -5%;
          right: -5%;
          height: 160%;
          background: radial-gradient(ellipse at center, rgba(45,106,79,0.04) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Header */
        .fs-eyebrow {
          display: inline-block;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--brown-mid);
          background: rgba(107,68,35,0.08);
          padding: 4px 14px; border-radius: 20px;
          margin-bottom: 10px;
        }
        .fs-title {
          font-size: clamp(1.5rem, 4vw, 2.5rem);
          font-weight: 900; letter-spacing: -0.03em; line-height: 1;
          color: var(--brown); margin-bottom: 10px;
          white-space: nowrap;
        }
        .fs-title span { color: var(--green); }
        .fs-underline {
          height: 4px; width: 60px; border-radius: 4px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          margin: 0 auto;
        }

        /* Scroll reveal */
        .fs-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .fs-reveal.fs-in {
          opacity: 1;
          transform: translateY(0);
        }
        .fs-d0 { transition-delay: 0.05s; }
        .fs-d1 { transition-delay: 0.15s; }
        .fs-d2 { transition-delay: 0.25s; }
        .fs-d3 { transition-delay: 0.35s; }

        /* Feature cards */
        .fs-feature {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(107, 68, 35, 0.1);
          border-radius: 20px;
          padding: 28px 24px;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2);
          overflow: hidden;
          cursor: pointer;
          /* Ensure cards in same row have equal height */
          height: 100%;
        }
        .fs-feature:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 50px rgba(45,106,79,0.15);
          border-color: rgba(45, 106, 79, 0.2);
        }

        /* Animated border */
        .fs-feature::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--green), var(--brown-mid));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
          border-radius: 20px 20px 0 0;
        }
        .fs-feature:hover::before { transform: scaleX(1); }

        /* Icon container */
        .fs-icon-wrap {
          position: relative;
          width: 64px; height: 64px;
          margin: 0 auto 20px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--green-soft);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2);
        }
        .fs-feature:hover .fs-icon-wrap {
          transform: scale(1.1) rotate(-5deg);
          box-shadow: 0 8px 25px rgba(45,106,79,0.3);
        }

        /* Pulse ring animation */
        @keyframes fs-pulse {
          0%   { transform: scale(1); opacity: 0.4; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .fs-icon-wrap::after {
          content: '';
          position: absolute; inset: 0;
          border-radius: 50%;
          border: 2px solid var(--green);
          opacity: 0;
          animation: fs-pulse 2.5s ease-out infinite;
        }
        .fs-feature:hover .fs-icon-wrap::after { opacity: 0.4; }

        /* Icon */
        .fs-icon-wrap svg {
          transition: all 0.3s ease;
        }
        .fs-feature:hover .fs-icon-wrap svg {
          transform: scale(1.1);
        }

        /* Stat badge */
        .fs-stat {
          font-size: 24px; font-weight: 900;
          color: var(--green);
          letter-spacing: -0.04em;
          line-height: 1;
          margin-bottom: 4px;
          transition: all 0.3s;
        }
        .fs-stat-label {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.15em;
          color: var(--brown-mid);
          margin-bottom: 16px;
        }

        /* Divider */
        .fs-divider {
          width: 32px; height: 2px;
          background: linear-gradient(90deg, var(--green), transparent);
          border-radius: 2px;
          margin: 0 auto 16px;
          transition: width 0.3s;
        }
        .fs-feature:hover .fs-divider { width: 48px; }

        /* Title */
        .fs-title-text {
          font-size: 16px; font-weight: 800;
          color: var(--brown);
          letter-spacing: 0.1px;
          margin-bottom: 8px;
          line-height: 1.3;
          transition: color 0.3s;
        }
        .fs-feature:hover .fs-title-text {
          color: var(--green);
        }

        /* Description */
        .fs-desc {
          font-size: 13px;
          color: #888;
          line-height: 1.6;
          transition: color 0.3s;
        }
        .fs-feature:hover .fs-desc {
          color: #666;
        }

        /* Floating particles */
        .fs-particle {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: var(--green);
          opacity: 0;
          pointer-events: none;
        }
        .fs-feature:hover .fs-particle {
          opacity: 1;
          animation: fs-particle-float 2s ease-out forwards;
        }

        @keyframes fs-particle-float {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(var(--x), var(--y)) scale(1);
            opacity: 0;
          }
        }

        .fs-particle:nth-child(1) { --x: -20px; --y: -20px; top: 30%; left: 20%; }
        .fs-particle:nth-child(2) { --x: 20px; --y: -20px; top: 30%; right: 20%; }
        .fs-particle:nth-child(3) { --x: -20px; --y: 20px; bottom: 30%; left: 20%; }
        .fs-particle:nth-child(4) { --x: 20px; --y: 20px; bottom: 30%; right: 20%; }

        /* Mobile optimizations */
        @media (max-width: 639px) {
          .fs-feature {
            padding: 20px 16px;
          }
          
          .fs-feature:hover {
            transform: translateY(-4px) scale(1.01);
          }
          
          .fs-icon-wrap {
            width: 48px; 
            height: 48px;
            margin-bottom: 16px;
          }
          
          .fs-icon-wrap svg {
            width: 20px;
            height: 20px;
          }
          
          .fs-stat {
            font-size: 20px;
            margin-bottom: 2px;
          }
          
          .fs-stat-label {
            font-size: 9px;
            margin-bottom: 12px;
          }
          
          .fs-divider {
            width: 28px;
            margin-bottom: 12px;
          }
          
          .fs-feature:hover .fs-divider { 
            width: 40px; 
          }
          
          .fs-title-text {
            font-size: 14px;
            margin-bottom: 6px;
          }
          
          .fs-desc {
            font-size: 11px;
            line-height: 1.5;
          }
          
          /* Adjust particle positions for smaller cards */
          .fs-particle:nth-child(1) { --x: -15px; --y: -15px; }
          .fs-particle:nth-child(2) { --x: 15px; --y: -15px; }
          .fs-particle:nth-child(3) { --x: -15px; --y: 15px; }
          .fs-particle:nth-child(4) { --x: 15px; --y: 15px; }
        }
      `}</style>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className={`text-center mb-12 sm:mb-16 fs-reveal ${visible ? 'fs-in' : ''}`}>
          <span className="fs-eyebrow">Our Services</span>
          <h2 className="fs-title">Features That <span>Matter</span></h2>
          <div className="fs-underline" />
        </div>

        {/* Features Grid - Updated for 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`fs-feature fs-reveal fs-d${index} ${visible ? 'fs-in' : ''}`}
              >
                {/* Particles */}
                <div className="fs-particle"></div>
                <div className="fs-particle"></div>
                <div className="fs-particle"></div>
                <div className="fs-particle"></div>

                {/* Icon */}
                <div className="fs-icon-wrap">
                  <Icon 
                    size={24} 
                    style={{ color: feature.color }} 
                  />
                </div>

                {/* Stat */}
                {/* <div className="fs-stat">{feature.stat}</div>
                <div className="fs-stat-label">{feature.statLabel}</div> */}

                <div className="fs-divider" />

                {/* Content */}
                <h3 className="fs-title-text">{feature.title}</h3>
                <p className="fs-desc">{feature.description}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};