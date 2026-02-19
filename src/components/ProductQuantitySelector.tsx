import { cn } from "@/lib/utils";

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
    <div className={cn("space-y-4", className)}>
      <label className="block text-sm font-semibold">
        Options:{" "}
        <span className="font-medium text-primary">
          {sortedOptions.find(o => o.id === selectedOption)?.displayLabel}
        </span>
      </label>

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedOptions.map((option) => {
          const isSelected = selectedOption === option.id;
          const isOutOfStock = option.stock === 0;
          const savings = option.originalPrice
            ? calculateSavings(option.originalPrice, option.price)
            : 0;

          return (
            <div key={option.id} className="relative">
              <button
                type="button"
                disabled={disabled || isOutOfStock}
                onClick={() => !isOutOfStock && onSelectionChange(option.id)}
                className={cn(
                  "w-full p-3 rounded-lg border transition-all duration-200 text-left",
                  // In-stock hover effects only
                  !isOutOfStock && "hover:shadow-sm hover:border-primary/60",
                  // Selected state
                  isSelected && !isOutOfStock
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                    : !isOutOfStock
                    ? "border-gray-200 bg-white"
                    : "",
                  // Out of stock state
                  isOutOfStock &&
                    "opacity-50 cursor-not-allowed bg-gray-50 border-dashed border-gray-300"
                )}
              >
                {/* TOP LABEL */}
                <div className="mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold">
                      {option.displayLabel}
                    </span>

                    {option.packSize > 1 && (
                      <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                        Pack {option.packSize}
                      </span>
                    )}
                  </div>
                </div>

                {/* PRICE SECTION */}
                <div className="flex items-end gap-1">
                  <span
                    className={cn(
                      "text-lg font-bold",
                      isOutOfStock ? "text-gray-400" : "text-foreground"
                    )}
                  >
                    ₹{option.price.toLocaleString("en-IN")}
                  </span>

                  {option.originalPrice &&
                    option.originalPrice > option.price && (
                      <span className="text-xs text-gray-400 line-through">
                        ₹{option.originalPrice.toLocaleString("en-IN")}
                      </span>
                    )}
                </div>

                {/* SAVE TEXT */}
                {savings > 0 && !isOutOfStock && (
                  <div className="mt-1 text-red-600 font-medium text-xs">
                    Save {savings}%
                  </div>
                )}

                {/* LOW STOCK */}
                {option.stock > 0 && option.stock <= 3 && (
                  <div className="mt-1 text-xs text-orange-600 font-medium">
                    Only {option.stock} left
                  </div>
                )}

               
              </button>

              {/* Diagonal hatch overlay for out of stock */}
              {isOutOfStock && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 6px,
                        rgba(0,0,0,0.03) 6px,
                        rgba(0,0,0,0.03) 7px
                      )`
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};