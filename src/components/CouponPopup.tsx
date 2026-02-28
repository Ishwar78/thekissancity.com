import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  expiryDate: string;
  offerText: string;
  description: string;
  termsAndConditions: string;
}

interface CouponPopupProps {
  isOpen: boolean;
  onClose: () => void;
  coupons: Coupon[];
}

export default function CouponPopup({ isOpen, onClose, coupons }: CouponPopupProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [mounted, setMounted] = useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => setMounted(true), 30);
    } else {
      document.body.style.overflow = '';
      setMounted(false);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Code copied to clipboard');
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const toggleTerms = () => {
    const newShowTerms = !showTerms;
    setShowTerms(newShowTerms);
    
    // Smooth scroll to terms when expanded
    if (newShowTerms && modalRef.current) {
      setTimeout(() => {
        const termsButton = modalRef.current?.querySelector('.cp-terms-btn') as HTMLElement;
        if (termsButton && modalRef.current) {
          // Calculate scroll position for smooth centering
          const modalRect = modalRef.current.getBoundingClientRect();
          const buttonRect = termsButton.getBoundingClientRect();
          const scrollTop = buttonRect.top - modalRect.top - (modalRef.current.clientHeight / 2) + (buttonRect.height / 2);
          
          modalRef.current.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }, 150);
    }
  };

  if (!isOpen || coupons.length === 0) return null;
  const coupon = coupons[0];

  const expiryDate = new Date(coupon.expiryDate);
  const daysLeft = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysLeft <= 3;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

        .cp-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          background: rgba(25, 25, 15%, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .cp-modal {
          font-family: 'Jost', sans-serif;
          position: relative;
          width: 100%;
          max-width: 400px;
          max-height: 90vh;
          overflow-y: scroll;
          overflow-x: hidden;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          border-radius: 0.5rem;
          background: hsl(var(--card));
          transform: ${mounted ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)'};
          opacity: ${mounted ? 1 : 0};
          transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease;
          box-shadow: var(--shadow-elegant);
        }
        
        /* Enhanced scrollbar styling for smooth scrolling */
        .cp-modal::-webkit-scrollbar {
          width: 6px;
          background: transparent;
        }
        
        .cp-modal::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 3px;
        }
        
        .cp-modal::-webkit-scrollbar-thumb {
          background: hsl(var(--border) / 0.3);
          border-radius: 3px;
          transition: background 0.2s ease;
        }
        
        .cp-modal::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--border) / 0.5);
        }
        
        .cp-modal {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--border) / 0.3) transparent;
        }
        
        /* Improve scrolling performance */
        .cp-modal {
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          will-change: scroll-position;
        }
        
        /* Smooth momentum scrolling for iOS */
        @supports (-webkit-touch-callout: none) {
          .cp-modal {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
        }

        /* ── HEADER ── */
        .cp-header {
          position: relative;
          padding: 2.5rem 2.5rem 2.25rem;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.9));
          overflow: hidden;
        }

        /* Top gold shimmer bar using logo-yellow */
        .cp-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            hsl(var(--logo-yellow) / 0.4) 15%,
            hsl(var(--logo-yellow) / 0.6) 35%,
            hsl(var(--logo-yellow) / 0.8) 50%,
            hsl(var(--logo-yellow) / 0.6) 65%,
            hsl(var(--logo-yellow) / 0.4) 85%,
            transparent 100%
          );
        }

        /* Ambient glow */
        .cp-header::after {
          content: '';
          position: absolute;
          top: -80px;
          right: -60px;
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, hsl(var(--logo-yellow) / 0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .cp-close {
          position: absolute;
          top: 1.1rem;
          right: 1.25rem;
          background: none;
          border: none;
          color: hsl(var(--primary-foreground) / 0.3);
          font-size: 18px;
          font-weight: 200;
          cursor: pointer;
          transition: color 0.2s;
          z-index: 3;
          font-family: 'Jost', sans-serif;
          line-height: 1;
          padding: 4px;
        }
        .cp-close:hover { color: hsl(var(--primary-foreground) / 0.7); }

        /* Eyebrow row with ornamental lines */
        .cp-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.75rem;
          position: relative;
          z-index: 1;
        }
        .cp-eyebrow-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, hsl(var(--logo-yellow) / 0.3));
        }
        .cp-eyebrow-line.r {
          background: linear-gradient(90deg, hsl(var(--logo-yellow) / 0.3), transparent);
        }
        .cp-eyebrow-text {
          font-size: 9px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: hsl(var(--logo-yellow));
          font-weight: 400;
          white-space: nowrap;
        }

        /* Big discount number */
        .cp-discount-wrap {
          position: relative;
          z-index: 1;
          margin-bottom: 0.75rem;
        }
        .cp-discount-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 88px;
          font-weight: 300;
          line-height: 0.88;
          color: hsl(var(--primary-foreground));
          letter-spacing: -4px;
          display: inline;
        }
        .cp-discount-pct {
          font-family: 'Cormorant Garamond', serif;
          font-size: 30px;
          font-weight: 300;
          color: hsl(var(--logo-yellow));
          letter-spacing: 0.04em;
          vertical-align: top;
          margin-top: 18px;
          display: inline-block;
          margin-left: 4px;
        }

        .cp-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-style: italic;
          font-weight: 300;
          color: hsl(var(--primary-foreground) / 0.7);
          letter-spacing: 0.03em;
          position: relative;
          z-index: 1;
        }

        /* ── BODY ── */
        .cp-body {
          padding: 2rem 2.5rem 2rem;
          background: hsl(var(--background));
        }

        /* Section label */
        .cp-label {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground));
          font-weight: 400;
          margin-bottom: 10px;
        }

        /* Code box */
        .cp-code-box {
          display: flex;
          align-items: stretch;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          overflow: hidden;
          background: hsl(var(--card));
          margin-bottom: 1.75rem;
        }
        .cp-code-text {
          flex: 1;
          padding: 14px 18px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: hsl(var(--foreground));
          user-select: all;
        }
        .cp-copy-btn {
          padding: 0 20px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          white-space: nowrap;
          min-width: 88px;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .cp-copy-btn.idle {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .cp-copy-btn.idle:hover {
          background: hsl(var(--primary) / 0.9);
        }
        .cp-copy-btn.copied {
          background: hsl(142 76% 36%);
          color: white;
        }

        /* Ornamental divider */
        .cp-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 1.5rem 0;
        }
        .cp-div-line {
          flex: 1;
          height: 1px;
          background: hsl(var(--border));
        }
        .cp-div-diamond {
          width: 4px;
          height: 4px;
          background: hsl(var(--logo-yellow));
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        /* Expiry */
        .cp-expiry {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 0.05em;
          color: hsl(var(--muted-foreground));
          margin-bottom: 1.25rem;
          font-weight: 300;
        }
        .cp-expiry.urgent { color: hsl(var(--destructive)); }

        /* Description */
        .cp-desc {
          font-size: 13px;
          font-weight: 300;
          color: hsl(var(--muted-foreground));
          line-height: 1.8;
          margin-bottom: 0;
        }

        /* Terms */
        .cp-terms-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 10px 0;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground));
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          transition: color 0.2s;
        }
        .cp-terms-btn:hover { color: hsl(var(--foreground)); }
        .cp-terms-content {
          font-size: 11.5px;
          font-weight: 300;
          color: hsl(var(--muted-foreground));
          line-height: 1.85;
          overflow: hidden;
          max-height: ${showTerms ? '200px' : '0'};
          transition: max-height 0.35s ease;
          padding-bottom: ${showTerms ? '4px' : '0'};
        }

        /* CTA */
        .cp-later {
          width: 100%;
          margin-top: 1.75rem;
          padding: 13px;
          background: transparent;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          color: hsl(var(--muted-foreground));
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .cp-later:hover {
          background: hsl(var(--primary));
          border-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }

        /* Bottom flourish */
        .cp-flourish {
          text-align: center;
          padding: 1.25rem 0 1.5rem;
          color: hsl(var(--logo-yellow));
          letter-spacing: 10px;
          font-size: 10px;
          opacity: 0.45;
          font-family: serif;
        }
      `}</style>

      <div className="cp-overlay" onClick={onClose}>
        <div className="cp-modal" ref={modalRef} onClick={e => e.stopPropagation()}>

          {/* ── HEADER ── */}
          <div className="cp-header">
            <button className="cp-close" onClick={onClose}>✕</button>

            <div className="cp-eyebrow">
              <div className="cp-eyebrow-line" />
              <span className="cp-eyebrow-text">Exclusive Privilege</span>
              <div className="cp-eyebrow-line r" />
            </div>

            <div className="cp-discount-wrap">
              <span className="cp-discount-num">{coupon.discount}</span>
              <span className="cp-discount-pct">% off</span>
            </div>

            <p className="cp-tagline">
              {coupon.offerText || 'A curated saving, reserved for you'}
            </p>
          </div>

          {/* ── BODY ── */}
          <div className="cp-body">

            <div className="cp-label">Redemption Code</div>
            <div className="cp-code-box">
              <div className="cp-code-text">{coupon.code}</div>
              <button
                className={`cp-copy-btn ${copiedCode === coupon.code ? 'copied' : 'idle'}`}
                onClick={() => copyToClipboard(coupon.code)}
              >
                {copiedCode === coupon.code ? (
                  <><Check size={11} /> Copied</>
                ) : (
                  <><Copy size={11} /> Copy</>
                )}
              </button>
            </div>

            <div className="cp-divider">
              <div className="cp-div-line" />
              <div className="cp-div-diamond" />
              <div className="cp-div-line" />
            </div>

            <div className={`cp-expiry${isUrgent ? ' urgent' : ''}`}>
              <Clock size={13} />
              <span>
                Valid until {expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {daysLeft > 0 && daysLeft <= 14 && (
                <span style={{ fontStyle: 'italic', opacity: 0.75, marginLeft: 4 }}>
                  — {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
              )}
            </div>

            {coupon.description && (
              <p className="cp-desc">{coupon.description}</p>
            )}

            {coupon.termsAndConditions && (
              <>
                <div className="cp-divider">
                  <div className="cp-div-line" />
                  <div className="cp-div-diamond" />
                  <div className="cp-div-line" />
                </div>
                <button className="cp-terms-btn" onClick={toggleTerms}>
                  <span>Terms & Conditions</span>
                  {showTerms ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                <div className="cp-terms-content">{coupon.termsAndConditions}</div>
              </>
            )}

            <button className="cp-later" onClick={onClose}>
              I'll use it later
            </button>

            <div className="cp-flourish">✦ &nbsp; ✦ &nbsp; ✦</div>
          </div>

        </div>
      </div>
    </>
  );
}