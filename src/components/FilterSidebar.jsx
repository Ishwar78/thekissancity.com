import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PRICE_RANGES, BRANDS } from '../data/products';
import { api } from '../utils/api';

function Accordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--gray-100)', paddingBottom: 16, marginBottom: 16 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12,
          fontFamily: 'inherit',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-800)' }}>{title}</span>
        {open ? <ChevronUp size={16} color="var(--gray-400)" /> : <ChevronDown size={16} color="var(--gray-400)" />}
      </button>
      {open && children}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, onClear, type = 'food', mobileOpen, onMobileClose }) {
  const [dynamicCats, setDynamicCats] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await api('/api/categories');
        if (data.success) {
          const mapped = data.categories.map(c => ({
            slug: c.name.toLowerCase().replace(/\s+/g, '-'),
            label: c.name,
            icon: '📦' // Default icon
          }));
          setDynamicCats(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCats();
  }, []);

  const toggle = (key, val) => {
    const current = filters[key] || [];
    const next = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    onChange({ ...filters, [key]: next });
  };

  const Checkbox = ({ label, value, filterKey, count }) => {
    const checked = (filters[filterKey] || []).includes(value);
    return (
      <label style={{
        display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        padding: '5px 0', fontSize: '0.88rem', color: checked ? 'var(--green-700)' : 'var(--gray-600)',
        fontWeight: checked ? 600 : 400,
      }}>
        <div onClick={() => toggle(filterKey, value)} style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: `2px solid ${checked ? 'var(--green-500)' : 'var(--gray-300)'}`,
          background: checked ? 'var(--green-500)' : 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', cursor: 'pointer',
        }}>
          {checked && <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3L9 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
        </div>
        <span style={{ flex: 1 }}>{label}</span>
        {count !== undefined && (
          <span style={{ fontSize: '0.72rem', color: 'var(--gray-400)', background: 'var(--gray-100)', padding: '1px 6px', borderRadius: 99 }}>
            {count}
          </span>
        )}
      </label>
    );
  };

  const hasFilters = Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v);

  const SidebarContent = () => (
    <div style={{ padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={18} color="var(--green-600)" />
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gray-900)' }}>Filters</span>
          {hasFilters && (
            <span style={{
              background: 'var(--green-500)', color: 'white', fontSize: '0.7rem',
              fontWeight: 700, padding: '2px 7px', borderRadius: 99,
            }}>
              {Object.values(filters).flat().length}
            </span>
          )}
        </div>
        {hasFilters && (
          <button onClick={onClear} style={{
            fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Clear All
          </button>
        )}
      </div>

      {/* Categories */}
      <Accordion title="Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dynamicCats.map(c => (
            <Checkbox key={c.slug} label={`${c.icon} ${c.label}`} value={c.slug} filterKey="categories" />
          ))}
        </div>
      </Accordion>

      {/* Price Range */}
      <Accordion title="Price Range">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PRICE_RANGES.map(r => (
            <Checkbox key={r.label} label={r.label} value={r.label} filterKey="priceRanges" />
          ))}
        </div>
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div style={{
        width: 260, flexShrink: 0,
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-100)',
        padding: '20px 20px 0',
        height: 'fit-content',
        position: 'sticky', top: 90,
      }} className="filter-sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen !== undefined && (
        <>
          <div
            onClick={onMobileClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 800,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
              opacity: mobileOpen ? 1 : 0,
              pointerEvents: mobileOpen ? 'all' : 'none',
              transition: 'opacity 0.3s ease',
              display: 'none',
            }}
            className="filter-mobile-overlay"
          />
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 900,
              width: 300, background: 'white',
              padding: '20px', overflowY: 'auto',
              transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
              display: 'none',
            }}
            className="filter-mobile-drawer"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>🌿 Filters</span>
              <button onClick={onMobileClose} style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--gray-100)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 900px) {
          .filter-sidebar-desktop { display: none !important; }
          .filter-mobile-overlay { display: block !important; }
          .filter-mobile-drawer { display: block !important; }
        }
      `}</style>
    </>
  );
}
