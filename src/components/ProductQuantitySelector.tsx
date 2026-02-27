import { cn } from "@/lib/utils";
import { Package, Percent, AlertTriangle } from "lucide-react";

export interface QuantityOption {
  id: string;
  quantity: number;
  unit: 'gm' | 'ml' | 'l' | 'pcs';
  packSize: number;
  displayLabel: string;
  price: number;
  originalPrice?: number;
  stock: number;
  isActive: boolean;
  sortOrder: number;
}

interface ProductQuantitySelectorProps {
  options: QuantityOption[];
  selectedOption?: string;
  onSelectionChange: (optionId: string) => void;
  disabled?: boolean;
  className?: string;
}

export const ProductQuantitySelector = ({
  options,
  selectedOption,
  onSelectionChange,
  disabled = false,
  className
}: ProductQuantitySelectorProps) => {
  const sortedOptions = [...options]
    .filter(option => option.isActive)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.quantity - b.quantity;
    });

  const calculateSavings = (originalPrice: number, currentPrice: number) => {
    if (!originalPrice || originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  if (sortedOptions.length === 0) {
    return null;
  }

  return (
    <div className={cn("pq-selector", className)}>
      <style>{`
        .pq-selector {
          --pq-primary: #2d6a4f;
          --pq-primary-light: #d8f3dc;
          --pq-border: #e8ddd0;
          --pq-text: #3b2410;
          --pq-text-muted: #7a5c3a;
          --pq-danger: #dc2626;
          --pq-warning: #ea580c;
        }
        
        .pq-label {
          display: block; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--pq-text-muted); margin-bottom: 12px;
        }
        .pq-label span {
          color: var(--pq-primary); font-weight: 800;
        }
        
        .pq-grid {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        @media (min-width: 640px) {
          .pq-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        .pq-option {
          position: relative; background: #fff;
          border: 1.5px solid var(--pq-border);
          border-radius: 12px; overflow: hidden;
          transition: all 0.2s ease;
        }
        .pq-option:hover:not(.pq-out-of-stock) {
          border-color: var(--pq-primary); box-shadow: 0 4px 12px rgba(45,106,79,0.12);
          transform: translateY(-1px);
        }
        .pq-option.pq-selected {
          border-color: var(--pq-primary); background: var(--pq-primary-light);
          box-shadow: 0 0 0 3px rgba(45,106,79,0.1);
        }
        .pq-option.pq-out-of-stock {
          opacity: 0.5; cursor: not-allowed;
          background: #fafafa; border-style: dashed;
        }
        
        .pq-btn {
          width: 100%; padding: 12px; border: none; background: none;
          text-align: left; cursor: pointer;
          transition: all 0.2s ease;
        }
        .pq-option.pq-out-of-stock .pq-btn {
          cursor: not-allowed;
        }
        
        .pq-header {
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 8px;
        }
        .pq-name {
          font-size: 13px; font-weight: 700; color: var(--pq-text);
          line-height: 1.2;
        }
        .pq-pack {
          display: inline-flex; align-items: center; gap: 2px;
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          background: var(--pq-primary); color: #fff;
          padding: 2px 6px; border-radius: 8px;
          white-space: nowrap;
        }
        
        .pq-price-row {
          display: flex; align-items: baseline; gap: 6px;
          margin-bottom: 6px;
        }
        .pq-price {
          font-size: 16px; font-weight: 900; color: var(--pq-primary);
          line-height: 1;
        }
        .pq-price-orig {
          font-size: 11px; color: var(--pq-text-muted);
          text-decoration: line-through;
        }
        
        .pq-meta {
          display: flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 600;
          min-height: 16px;
        }
        .pq-save {
          display: inline-flex; align-items: center; gap: 2px;
          color: var(--pq-danger); background: rgba(220,38,38,0.08);
          padding: 2px 6px; border-radius: 6px;
        }
        .pq-low-stock {
          display: inline-flex; align-items: center; gap: 2px;
          color: var(--pq-warning); background: rgba(234,88,12,0.08);
          padding: 2px 6px; border-radius: 6px;
        }
        
        .pq-hatch {
          position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(
            -45deg, transparent, transparent 6px,
            rgba(0,0,0,0.03) 6px, rgba(0,0,0,0.03) 7px
          );
          border-radius: 12px;
        }
      `}</style>

      <label className="pq-label">
        Options: <span>{sortedOptions.find(o => o.id === selectedOption)?.displayLabel}</span>
      </label>

      <div className="pq-grid">
        {sortedOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isOutOfStock = option.stock === 0;
          const savings = option.originalPrice
            ? calculateSavings(option.originalPrice, option.price)
            : 0;
          const isLowStock = option.stock > 0 && option.stock <= 3;

          return (
            <div key={option.id} className={cn(
              "pq-option",
              isSelected && !isOutOfStock && "pq-selected",
              isOutOfStock && "pq-out-of-stock"
            )}>
              <button
                type="button"
                disabled={disabled || isOutOfStock}
                onClick={() => !isOutOfStock && onSelectionChange(option.id)}
                className="pq-btn"
              >
                <div className="pq-header">
                  <span className="pq-name">{option.displayLabel}</span>
                  {option.packSize > 1 && (
                    <span className="pq-pack">
                      <Package size={8} />
                      Pack {option.packSize}
                    </span>
                  )}
                </div>

                <div className="pq-price-row">
                  <span className={cn("pq-price", isOutOfStock && "opacity-40")}>
                    ₹{option.price.toLocaleString("en-IN")}
                  </span>
                  {option.originalPrice && option.originalPrice > option.price && (
                    <span className="pq-price-orig">
                      ₹{option.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>

                {/* Combined save and low stock in one line */}
                <div className="pq-meta">
                  {savings > 0 && !isOutOfStock && (
                    <span className="pq-save">
                      <Percent size={10} />
                      Save {savings}%
                    </span>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <span className="pq-low-stock">
                      <AlertTriangle size={10} />
                      Only {option.stock} left
                    </span>
                  )}
                </div>
              </button>

              {/* Diagonal hatch overlay for out of stock */}
              {isOutOfStock && <div className="pq-hatch" />}
            </div>
          );
        })}
      </div>
    </div>
  );  
};