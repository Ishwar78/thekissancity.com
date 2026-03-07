import { useState, useEffect } from "react";
import { Tag, Copy, Sparkles, AlertCircle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface BulkCoupon {
  code: string;
  name: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  offerText?: string;
  appliesToAllProducts: boolean;
}

interface CouponCheckResult {
  code: string;
  name: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  offerText?: string;
  applicable: boolean;
}

interface BulkCouponCheckerProps {
  productId: string;
  onUseNow?: (code: string) => void;
  productPrice?: number;
}

export function BulkCouponChecker({ productId, onUseNow, productPrice }: BulkCouponCheckerProps) {
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<CouponCheckResult | null>(null);
  const [alternativeCoupons, setAlternativeCoupons] = useState<BulkCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Load alternative coupons on mount
  useEffect(() => {
    fetchAlternativeCoupons();
  }, [productId]);

  const fetchAlternativeCoupons = async () => {
    try {
      setLoading(true);
      const { ok, json } = await api(`/api/bulk-coupons/check-applicability/${productId}`);
      if (ok && json?.success) {
        setAlternativeCoupons(json.data.applicableCoupons || []);
      }
    } catch (error) {
      console.error("Failed to fetch alternative coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkCouponApplicability = async () => {
    if (!couponInput.trim()) {
      toast({
        title: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    try {
      setChecking(true);
      const { ok, json } = await api(
        `/api/bulk-coupons/check-applicability/${productId}?couponCode=${encodeURIComponent(couponInput.trim())}`
      );

      if (ok && json?.success) {
        const result = json.data.couponChecked;
        if (result) {
          setCheckResult(result);
          if (!result.applicable) {
            setShowAlternatives(true);
            toast({
              title: "Coupon Not Applicable",
              description: "This coupon is not applicable to this product. See alternative offers below.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Coupon Applicable! 🎉",
              description: `${result.name} can be applied to this product.`,
            });
            if (onUseNow) onUseNow(result.code);
          }
        } else {
          toast({
            title: "Coupon Not Found",
            description: "This coupon code is not valid or has expired.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Failed to check coupon:", error);
      toast({
        title: "Error",
        description: "Failed to check coupon applicability.",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleUseCoupon = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Coupon Copied 🎉",
        description: `${code} copied to clipboard`,
      });
    } catch {
      toast({ title: `Coupon ${code} is ready to use!` });
    }
    if (onUseNow) onUseNow(code);
  };

  const formatDiscount = (coupon: BulkCoupon | CouponCheckResult) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Coupon Input Section */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Have a coupon?</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && checkCouponApplicability()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button 
              onClick={checkCouponApplicability} 
              disabled={checking}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {checking ? "Checking..." : "Apply"}
            </Button>
          </div>

          {/* Check Result */}
          {checkResult && (
            <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
              checkResult.applicable 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {checkResult.applicable ? (
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  checkResult.applicable ? 'text-green-800' : 'text-red-800'
                }`}>
                  {checkResult.applicable 
                    ? `✅ ${checkResult.name} is applicable!`
                    : `❌ ${checkResult.name} is not applicable to this product`
                  }
                </p>
                <p className={`text-xs mt-1 ${
                  checkResult.applicable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatDiscount(checkResult)} • {checkResult.offerText || 'No additional details'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alternative Coupons */}
      {showAlternatives && alternativeCoupons.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Available Offers for This Product</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAlternatives(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {alternativeCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="flex items-center justify-between p-3 border border-dashed border-primary/30 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{coupon.code}</p>
                      <p className="text-xs text-gray-600">{coupon.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-primary">
                          {formatDiscount(coupon)}
                        </span>
                        {coupon.offerText && (
                          <span className="text-xs text-gray-500">• {coupon.offerText}</span>
                        )}
                        {coupon.appliesToAllProducts && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            All Products
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUseCoupon(coupon.code)}
                    className="h-8 rounded-full px-3 text-xs bg-primary text-white hover:bg-primary/90"
                  >
                    Use Now
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Default Alternative Coupons (always show if available) */}
      {!showAlternatives && !loading && alternativeCoupons.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Available Offers</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
              {alternativeCoupons.slice(0, 3).map((coupon) => (
                <div
                  key={coupon.code}
                  className="min-w-[200px] flex-shrink-0 p-3 border border-dashed border-primary/40 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-primary tracking-wide">
                        {coupon.code}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {formatDiscount(coupon)}
                    </span>
                  </div>
                  {coupon.offerText && (
                    <p className="text-[10px] text-gray-600 mt-1 truncate">{coupon.offerText}</p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleUseCoupon(coupon.code)}
                    className="mt-2 h-6 rounded-full px-2 text-[10px] bg-primary text-white hover:bg-primary/90 w-full"
                  >
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
