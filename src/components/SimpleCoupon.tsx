import { useState, useEffect } from 'react';
import { Tag, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type Coupon = {
  code: string;
  discount: number;
  expiryDate: string;
  offerText?: string;
  description?: string;
  termsAndConditions?: string;
};

type Props = {
  onUseNow?: (code: string) => void;
  productPrice: number;
};

export const SimpleCoupon: React.FC<Props> = ({ onUseNow, productPrice }) => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const { ok, json } = await api('/api/coupons/active');
        if (ok && Array.isArray(json?.data)) {
          setCoupons(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const handleUseNow = async (code: string) => {
    if (onUseNow) {
      onUseNow(code);
    }
    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(code);
      toast({ 
        title: 'Coupon copied!', 
        description: `Code ${code} has been copied to your clipboard`,
      });
    } catch (err) {
      toast({ title: `Coupon ${code} is ready to use!` });
    }
  };

  if (loading || coupons.length === 0) {
    return null;
  }

  return (
    <div className="my-4 w-fit">
      {coupons.slice(0, 1).map((coupon) => (
        <div
          key={coupon.code}
          className="border-2 border-dashed border-gray-300 rounded-lg p-3 bg-white hover:border-gray-400 transition-colors w-fit"
        >
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleUseNow(coupon.code)}
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-md">
                <Tag className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Coupon Code</p>
                <p className="text-sm font-bold text-gray-900 tracking-wider">
                  {coupon.code}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="p-1.5 hover:bg-gray-100"
            >
              <Copy className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          
          {coupon.termsAndConditions && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Handle terms view if needed
              }}
              className="w-full text-xs text-gray-600 hover:text-gray-900 hover:underline focus:outline-none font-medium transition-colors text-center mt-2"
            >
              View Terms & Conditions
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
