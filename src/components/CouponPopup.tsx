import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, X, Gift, Tag, Calendar, Sparkles, Star } from 'lucide-react';
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

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Coupon code ${code} copied to clipboard!`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast.error('Failed to copy coupon code');
    }
  };

  if (!isOpen || coupons.length === 0) return null;

  const coupon = coupons[0]; // Get the single latest coupon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col" style={{ backgroundColor: '#faf3eb', borderRadius: '20px' }}>
        {/* Decorative Header */}
        <div className="relative flex-shrink-0">
          <div 
            className="h-32 flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #2d6a4f 0%, #6b4423 100%)',
            }}
          >
            {/* Sparkle Effects */}
            <div className="absolute inset-0">
              <Sparkles className="absolute top-4 left-4 h-6 w-6 text-yellow-300 opacity-60" />
              <Sparkles className="absolute top-8 right-8 h-8 w-8 text-yellow-200 opacity-40" />
              <Sparkles className="absolute bottom-4 left-12 h-5 w-5 text-yellow-300 opacity-50" />
              <Sparkles className="absolute bottom-6 right-6 h-7 w-7 text-yellow-200 opacity-30" />
            </div>
            
            {/* Main Content */}
            <div className="relative z-10 text-center">
              <div className="flex justify-center mb-2">
                <Gift className="h-10 w-10 text-white animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Special Offer!</h2>
              <p className="text-white/90 text-sm">Limited time discount just for you</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="space-y-6 py-6">
            {/* Coupon Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl transform rotate-1"></div>
              <div 
                className="relative border-2 border-dashed rounded-2xl p-6 text-center"
                style={{ 
                  borderColor: '#2d6a4f',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 10px 25px rgba(45, 106, 79, 0.1)'
                }}
              >
                {/* Discount Badge */}
                <div className="inline-flex items-center gap-1 mb-4">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-none px-3 py-1 text-sm font-bold">
                    {coupon.discount}% OFF
                  </Badge>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>

                {/* Offer Title */}
                <h3 className="text-xl font-bold mb-3" style={{ color: '#6b4423' }}>
                  {coupon.offerText || `Get ${coupon.discount}% Off!`}
                </h3>

                {/* Coupon Code */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Your Coupon Code:</p>
                  <div className="inline-block">
                    <div 
                      className="px-6 py-3 rounded-lg font-mono font-bold text-xl tracking-wider"
                      style={{ 
                        backgroundColor: '#f0fdf4',
                        color: '#2d6a4f',
                        border: '2px solid #2d6a4f'
                      }}
                    >
                      {coupon.code}
                    </div>
                  </div>
                </div>

                {/* Copy Button */}
                <Button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="w-full py-3 font-semibold transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#2d6a4f',
                    boxShadow: '0 4px 15px rgba(45, 106, 79, 0.3)'
                  }}
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Copied Successfully!
                        <Star className="h-4 w-4" />
                      </span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code & Save
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Description */}
            {coupon.description && (
              <div className="text-center">
                <p className="text-gray-600 text-sm">{coupon.description}</p>
              </div>
            )}

            {/* Expiry Info */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Valid until: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
            </div>

            {/* Terms */}
            {coupon.termsAndConditions && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg text-center">
                <strong>Terms:</strong> {coupon.termsAndConditions}
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={onClose}
                variant="outline"
                className="px-8"
                style={{ borderColor: '#6b4423', color: '#6b4423' }}
              >
                I'll use it later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
