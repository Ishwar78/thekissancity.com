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
    if (newShowTerms && modalRef.current) {
      setTimeout(() => {
        const termsButton = modalRef.current?.querySelector('.cp-terms-btn') as HTMLElement;
        if (termsButton && modalRef.current) {
          const modalRect = modalRef.current.getBoundingClientRect();
          const buttonRect = termsButton.getBoundingClientRect();
          const scrollTop = buttonRect.top - modalRect.top - (modalRef.current.clientHeight / 2) + (buttonRect.height / 2);
          modalRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' });
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
          padding: 1rem;
          background: rgba(25, 25, 15%, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .cp-modal {
          font-family: 'Jost', sans-serif;
          position: relative;
          width: 100%;
          max-width: 260px;
          max-height: 85vh;
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

        .cp-modal::-webkit-scrollbar { width: 4px; background: transparent; }
        .cp-modal::-webkit-scrollbar-track { background: transparent; }
        .cp-modal::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.3); border-radius: 2px; }
        .cp-modal { scrollbar-width: thin; scrollbar-color: hsl(var(--border) / 0.3) transparent; }

        /* ── HEADER ── */
        .cp-header {
          position: relative;
          padding: 1.25rem 1.4rem 1.1rem;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.9));
          overflow: hidden;
        }

        .cp-header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            hsl(var(--logo-yellow) / 0.4) 15%,
            hsl(var(--logo-yellow) / 0.8) 50%,
            hsl(var(--logo-yellow) / 0.4) 85%,
            transparent 100%
          );
        }

        .cp-header::after {
          content: '';
          position: absolute;
          top: -40px; right: -30px;
          width: 110px; height: 110px;
          background: radial-gradient(circle, hsl(var(--logo-yellow) / 0.08) 0%, transparent 65%);
          pointer-events: none;
        }

        .cp-close {
          position: absolute;
          top: 0.6rem; right: 0.75rem;
          background: none; border: none;
          color: hsl(var(--primary-foreground) / 0.3);
          font-size: 14px; font-weight: 200;
          cursor: pointer;
          transition: color 0.2s;
          z-index: 3;
          font-family: 'Jost', sans-serif;
          line-height: 1; padding: 3px;
        }
        .cp-close:hover { color: hsl(var(--primary-foreground) / 0.7); }

        .cp-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.9rem;
          position: relative;
          z-index: 1;
        }
        .cp-eyebrow-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, hsl(var(--logo-yellow) / 0.3));
        }
        .cp-eyebrow-line.r {
          background: linear-gradient(90deg, hsl(var(--logo-yellow) / 0.3), transparent);
        }
        .cp-eyebrow-text {
          font-size: 7px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: hsl(var(--logo-yellow));
          font-weight: 400;
          white-space: nowrap;
        }

        .cp-discount-wrap {
          position: relative; z-index: 1;
          margin-bottom: 0.4rem;
        }
        .cp-discount-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px;
          font-weight: 300;
          line-height: 0.88;
          color: hsl(var(--primary-foreground));
          letter-spacing: -2px;
          display: inline;
        }
        .cp-discount-pct {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          color: hsl(var(--logo-yellow));
          letter-spacing: 0.04em;
          vertical-align: top;
          margin-top: 10px;
          display: inline-block;
          margin-left: 2px;
        }

        .cp-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 10px;
          font-style: italic;
          font-weight: 300;
          color: hsl(var(--primary-foreground) / 0.7);
          letter-spacing: 0.03em;
          position: relative; z-index: 1;
        }

        /* ── BODY ── */
        .cp-body {
          padding: 1.1rem 1.4rem 1rem;
          background: hsl(var(--background));
        }

        .cp-label {
          font-size: 7px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground));
          font-weight: 400;
          margin-bottom: 6px;
        }

        .cp-code-box {
          display: flex;
          align-items: stretch;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          overflow: hidden;
          background: hsl(var(--card));
          margin-bottom: 0.9rem;
        }
        .cp-code-text {
          flex: 1;
          padding: 8px 10px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: hsl(var(--foreground));
          user-select: all;
        }
        .cp-copy-btn {
          padding: 0 12px;
          border: none; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          font-size: 8px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          white-space: nowrap;
          min-width: 58px;
          justify-content: center;
          transition: all 0.25s ease;
        }
        .cp-copy-btn.idle { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
        .cp-copy-btn.idle:hover { background: hsl(var(--primary) / 0.9); }
        .cp-copy-btn.copied { background: hsl(142 76% 36%); color: white; }

        .cp-divider {
          display: flex; align-items: center; gap: 8px;
          margin: 0.75rem 0;
        }
        .cp-div-line { flex: 1; height: 1px; background: hsl(var(--border)); }
        .cp-div-diamond {
          width: 3px; height: 3px;
          background: hsl(var(--logo-yellow));
          transform: rotate(45deg); flex-shrink: 0;
        }

        .cp-expiry {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px;
          letter-spacing: 0.04em;
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.7rem;
          font-weight: 300;
        }
        .cp-expiry.urgent { color: hsl(var(--destructive)); }

        .cp-desc {
          font-size: 10px;
          font-weight: 300;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          margin-bottom: 0;
        }

        .cp-terms-btn {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; background: none; border: none; cursor: pointer;
          padding: 6px 0;
          font-size: 8px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground));
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          transition: color 0.2s;
        }
        .cp-terms-btn:hover { color: hsl(var(--foreground)); }
        .cp-terms-content {
          font-size: 9px;
          font-weight: 300;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          overflow: hidden;
          max-height: ${showTerms ? '160px' : '0'};
          transition: max-height 0.35s ease;
          padding-bottom: ${showTerms ? '4px' : '0'};
        }

        .cp-later {
          width: 100%;
          margin-top: 0.9rem;
          padding: 8px;
          background: transparent;
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          color: hsl(var(--muted-foreground));
          font-size: 8px;
          letter-spacing: 0.18em;
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

        .cp-flourish {
          text-align: center;
          padding: 0.6rem 0 0.75rem;
          color: hsl(var(--logo-yellow));
          letter-spacing: 8px;
          font-size: 8px;
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
                  <><Check size={8} /> Copied</>
                ) : (
                  <><Copy size={8} /> Copy</>
                )}
              </button>
            </div>

            <div className="cp-divider">
              <div className="cp-div-line" />
              <div className="cp-div-diamond" />
              <div className="cp-div-line" />
            </div>

            <div className={`cp-expiry${isUrgent ? ' urgent' : ''}`}>
              <Clock size={10} />
              <span>
                Valid until {expiryDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {daysLeft > 0 && daysLeft <= 14 && (
                <span style={{ fontStyle: 'italic', opacity: 0.75, marginLeft: 3 }}>
                  — {daysLeft}d left
                </span>
              )}
            </div>

            {/* {coupon.description && (
              <p className="cp-desc">{coupon.description}</p>
            )} */}

            {coupon.termsAndConditions && (
              <>
                <div className="cp-divider">
                  <div className="cp-div-line" />
                  <div className="cp-div-diamond" />
                  <div className="cp-div-line" />
                </div>
                <button className="cp-terms-btn cp-terms-btn" onClick={toggleTerms}>
                  <span>Terms & Conditions</span>
                  {showTerms ? <ChevronUp size={9} /> : <ChevronDown size={9} />}
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