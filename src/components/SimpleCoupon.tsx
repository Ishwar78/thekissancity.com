import { useState, useEffect } from "react";
import { Tag, Copy, Sparkles } from "lucide-react";
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
      toast({
        title: "Coupon Copied 🎉",
        description: `${code} copied to clipboard`,
      });
    } catch {
      toast({ title: `Coupon ${code} is ready to use!` });
    }
  };

  if (loading || coupons.length === 0) return null;

  return (
    <div className="my-4">
      <h3 className="text-xs font-semibold mb-2 text-gray-600">Available Offers</h3>

      {/* SLIDER CONTAINER */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="min-w-[200px] snap-start flex-shrink-0 
                       rounded-lg border border-dashed border-primary/40
                       bg-gradient-to-r from-primary/5 to-primary/10
                       p-3 shadow-sm hover:shadow transition-all duration-200"
          >
            {/* TOP ROW */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary tracking-wide">
                  {coupon.code}
                </span>
              </div>

              <Button
                size="sm"
                onClick={() => handleUseNow(coupon.code)}
                className="h-6 rounded-full px-2 text-[10px] bg-primary text-black hover:bg-primary/90"
              >
                Apply
              </Button>
            </div>

            {/* DISCOUNT */}
            <div className="mt-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs font-medium text-gray-700">
                Save {coupon.discount}%
              </span>
            </div>

            {/* EXPIRY */}
            <p className="text-[10px] text-muted-foreground mt-1">
              Valid till{" "}
              {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </p>

            {coupon.termsAndConditions && (
              <button className="text-[10px] mt-1.5 font-medium text-primary/80 hover:text-primary">
                View Terms →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};