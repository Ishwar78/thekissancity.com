import { useState, useEffect } from "react";
import { Tag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export const SimpleCoupon: React.FC<Props> = ({ onUseNow, productPrice }) => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const { ok, json } = await api("/api/coupons/active");
        if (ok && Array.isArray(json?.data)) {
          const filteredCoupons = json.data.filter((coupon: Coupon) => 
            !coupon.code.toLowerCase().includes('good')
          );
          setCoupons(filteredCoupons);
        }
      } catch (error) {
        console.error("Failed to fetch coupons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleUseNow = async (code: string) => {
    if (onUseNow) onUseNow(code);
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: "Coupon Copied 🎉", description: `${code} copied to clipboard` });
    } catch {
      toast({ title: `Coupon ${code} is ready to use!` });
    }
  };

  if (loading || coupons.length === 0) return null;

  return (
    <div className="my-1">
      <h3
        className="text-xs font-medium mb-1 uppercase tracking-wider"
        style={{ color: '#6b4423' }}
      >
        Offers
      </h3>

      <div className="flex gap-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="min-w-[120px] snap-start flex-shrink-0 rounded"
            style={{
              padding: '6px 8px',
              border: '1.5px dashed #6b4423',
              background: 'linear-gradient(135deg, #1a0e08 0%, #2d1a0f 100%)',
            }}
          >
            {/* TOP ROW */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <Tag className="h-3 w-3 shrink-0" style={{ color: '#e8a060' }} />
                <span
                  className="text-xs font-semibold truncate max-w-[60px]"
                  style={{ color: '#f2c89a' }}
                >
                  {coupon.code}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => handleUseNow(coupon.code)}
                className="h-5 rounded px-1 text-xs min-w-[32px] border-0 hover:opacity-90"
                style={{ background: '#6b4423', color: '#fde8cc' }}
              >
                Apply
              </Button>
            </div>

            {/* DISCOUNT + EXPIRY */}
            <div className="flex items-center justify-between" style={{ marginTop: '4px' }}>
              <div className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 shrink-0" style={{ color: '#f5c842' }} />
                <span className="text-xs font-semibold" style={{ color: '#f2c89a' }}>
                  {coupon.discount}% off
                </span>
              </div>
              <p className="text-xs" style={{ color: '#a07050' }}>
                {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>

            {coupon.termsAndConditions && (
              <button
                className="text-xs font-medium block text-left hover:opacity-100"
                style={{ marginTop: '2px', color: '#6b4423' }}
              >
                T&C →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};