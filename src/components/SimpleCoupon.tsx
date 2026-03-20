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
          setCoupons(json.data);
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
      <h3 className="text-[7px] font-medium mb-0.5 text-gray-500 uppercase tracking-wider">
        Offers
      </h3>

      <div className="flex gap-0.5 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="min-w-[72px] snap-start flex-shrink-0 rounded border border-dashed border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10"
            style={{ padding: '3px 4px' }}
          >
            {/* TOP ROW */}
            <div className="flex items-center justify-between gap-0.5">
              <div className="flex items-center gap-0.5 min-w-0">
                <Tag className="h-1.5 w-1.5 text-primary shrink-0" />
                <span className="text-[6px] font-semibold text-primary truncate max-w-[36px]">
                  {coupon.code}
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => handleUseNow(coupon.code)}
                className="h-3 rounded px-0.5 text-[5px] bg-primary text-black hover:bg-primary/90 min-w-[20px]"
              >
                Apply
              </Button>
            </div>

            {/* DISCOUNT + EXPIRY */}
            <div className="flex items-center justify-between" style={{ marginTop: '2px' }}>
              <div className="flex items-center gap-0.5">
                <Sparkles className="h-1.5 w-1.5 text-yellow-500 shrink-0" />
                <span className="text-[5px] font-medium text-gray-700">
                  {coupon.discount}%
                </span>
              </div>
              <p className="text-[5px] text-muted-foreground">
                {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>

            {coupon.termsAndConditions && (
              <button className="text-[5px] font-medium text-primary/60 hover:text-primary block text-left" style={{ marginTop: '1px' }}>
                T&C →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};