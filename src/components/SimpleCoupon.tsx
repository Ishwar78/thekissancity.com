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
    <div className="my-0.5">
      <h3
        className="text-[7px] font-medium mb-0.5 uppercase tracking-wider"
        style={{ color: '#6b4423' }}
      >
        Offers
      </h3>

      <div className="flex gap-0.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="min-w-[72px] snap-start flex-shrink-0 rounded"
            style={{
              padding: '3px 4px',
              border: '1px dashed #6b4423',
              background: 'linear-gradient(135deg, #1a0e08 0%, #2d1a0f 100%)',
            }}
          >
            {/* TOP ROW */}
            <div className="flex items-center justify-between gap-0.5">
              <div className="flex items-center gap-0.5 min-w-0">
                <Tag className="h-1.5 w-1.5 shrink-0" style={{ color: '#e8a060' }} />
                <span
                  className="text-[6px] font-semibold truncate max-w-[36px]"
                  style={{ color: '#f2c89a' }}
                >
                  {coupon.code}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => handleUseNow(coupon.code)}
                className="h-3 rounded px-0.5 text-[5px] min-w-[20px] border-0 hover:opacity-90"
                style={{ background: '#6b4423', color: '#fde8cc' }}
              >
                Apply
              </Button>
            </div>

            {/* DISCOUNT + EXPIRY */}
            <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
              <div className="flex items-center gap-0.5">
                <Sparkles className="h-1.5 w-1.5 shrink-0" style={{ color: '#f5c842' }} />
                <span className="text-[5px] font-semibold" style={{ color: '#f2c89a' }}>
                  {coupon.discount}% off
                </span>
              </div>
              <p className="text-[5px]" style={{ color: '#a07050' }}>
                {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>

            {coupon.termsAndConditions && (
              <button
                className="text-[5px] font-medium block text-left hover:opacity-100"
                style={{ marginTop: '1px', color: '#6b4423' }}
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