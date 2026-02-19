import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, Flame, Sparkles, Tag, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  refreshTrigger?: number; // Add refreshTrigger prop
};

export const AvailableCoupons: React.FC<Props> = ({ onUseNow, productPrice, refreshTrigger }) => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
  }, [refreshTrigger]);

  const handleUseNow = async (code: string) => {
    if (onUseNow) {
      onUseNow(code);
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
    }
  };

  const handleOpenModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition(target.scrollLeft);
    setCanScrollLeft(target.scrollLeft > 0);
    setCanScrollRight(
      target.scrollLeft < target.scrollWidth - target.clientWidth - 10
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('coupon-scroll-container');
    if (container) {
      const scrollAmount = 250;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = document.getElementById('coupon-scroll-container');
    if (container && coupons.length > 0) {
      setCanScrollRight(container.scrollWidth > container.clientWidth);
    }
  }, [coupons]);

  if (loading || coupons.length === 0) {
    return null;
  }

  return (
    <div className="my-6 bg-white dark:bg-slate-900 rounded-lg overflow-hidden">
      {/* Mobile collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="md:hidden w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700"
      >
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-[#ba8c5c] dark:text-[#d4a574]" />
          <h3 className="font-bold text-base text-gray-900 dark:text-white">Available Coupons</h3>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
      </button>

      {/* Desktop or expanded mobile */}
      {expanded && (
        <div className="px-4 pb-4 pt-2">
          <div className="hidden md:flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-[#ba8c5c] to-[#d4a574] rounded-lg shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Available Coupons</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Exclusive offers just for you</p>
            </div>
          </div>
          
          <div className="relative group">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-800 shadow-xl rounded-full p-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 border border-gray-200 dark:border-slate-600 hover:scale-110"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            )}

            {/* Coupons Container */}
            <div 
              id="coupon-scroll-container"
              className="flex overflow-x-auto gap-4 pb-3 scroll-smooth snap-x snap-mandatory hide-scrollbar"
              onScroll={handleScroll}
            >
              {coupons.map((coupon) => {
                const discountedPrice = productPrice * (1 - coupon.discount / 100);
                const savings = productPrice - discountedPrice;
                const savingsPercent = coupon.discount;
                return (
                  <div
                    key={coupon.code}
                    className="relative flex-shrink-0 w-[280px] snap-start group/card"
                  >
                    {/* Main Card */}
                    <div className="relative h-full rounded-xl border-2 border-[#ba8c5c]/40 dark:border-[#ba8c5c]/50 bg-gradient-to-br from-[#FFF8F0] via-white to-[#FEF9F3] dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:border-[#ba8c5c] dark:hover:border-[#d4a574] hover:scale-[1.02]">
                      {/* Decorative corner accent */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#ba8c5c]/10 to-transparent rounded-bl-full"></div>
                      
                      {/* Top Badge with improved design */}
                      <div className="relative px-4 pt-4 pb-2">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#ba8c5c] via-[#c99a6a] to-[#d4a574] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Save extra with these offers</span>
                        </div>
                      </div>

                      {/* Discount Badge */}
                      <div className="absolute top-3 right-3 bg-gradient-to-br from-red-500 to-red-600 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-10">
                        <span>{savingsPercent}% OFF</span>
                      </div>

                      {/* Content Area */}
                      <div className="px-4 pb-4 space-y-3">
                        {/* Price Display - Enhanced */}
                        {coupon.offerText && (
                          <div className="space-y-1">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wide">
                              {coupon.offerText}
                            </p>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                                ₹{discountedPrice.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 line-through font-medium">
                                ₹{productPrice.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </span>
                              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                Save ₹{savings.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Description with better styling */}
                        {coupon.description && (
                          <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-lg px-3 py-2">
                            <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
                              {coupon.description}
                            </p>
                          </div>
                        )}

                        {/* Elegant Divider */}
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dashed border-[#ba8c5c]/40 dark:border-[#ba8c5c]/50"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-gradient-to-br from-[#FFF8F0] to-white dark:from-slate-800 dark:to-slate-900 px-2">
                              <Tag className="h-3 w-3 text-[#ba8c5c] dark:text-[#d4a574]" />
                            </span>
                          </div>
                        </div>

                        {/* Code Section - Enhanced */}
                        <div className="space-y-2">
                          <div
                            className="flex items-center justify-between bg-white dark:bg-slate-700/50 border-2 border-dashed border-[#ba8c5c]/50 dark:border-[#ba8c5c]/40 rounded-lg px-3 py-2.5 cursor-pointer group/copy hover:border-[#ba8c5c] dark:hover:border-[#d4a574] hover:bg-[#FFF8F0] dark:hover:bg-slate-700 transition-all"
                            onClick={() => handleUseNow(coupon.code)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-gradient-to-br from-[#ba8c5c] to-[#d4a574] rounded-md">
                                <Tag className="h-3.5 w-3.5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Coupon Code</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white tracking-wider">
                                  {coupon.code}
                                </p>
                              </div>
                            </div>
                            <div className="p-2 bg-gray-100 dark:bg-slate-600 rounded-md group-hover/copy:bg-[#ba8c5c] dark:group-hover/copy:bg-[#d4a574] transition-colors">
                              <Copy className="h-4 w-4 text-gray-600 dark:text-gray-300 group-hover/copy:text-white transition-colors" />
                            </div>
                          </div>
                          
                          {coupon.termsAndConditions && (
                            <button
                              onClick={() => handleOpenModal(coupon.termsAndConditions || '')}
                              className="w-full text-xs text-[#ba8c5c] dark:text-[#d4a574] hover:text-[#8b6a42] dark:hover:text-[#ba8c5c] hover:underline focus:outline-none font-medium transition-colors text-center py-1"
                            >
                              View Terms & Conditions
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-800 shadow-xl rounded-full p-2.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 border border-gray-200 dark:border-slate-600 hover:scale-110"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-700 dark:text-gray-200" />
              </button>
            )}
          </div>

          {/* Enhanced Progress Indicator */}
          {coupons.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              {coupons.map((_, index) => {
                const isActive = Math.abs(scrollPosition - (index * 280)) < 140;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      const container = document.getElementById('coupon-scroll-container');
                      if (container) {
                        container.scrollTo({ left: index * 280, behavior: 'smooth' });
                      }
                    }}
                    className={`rounded-full transition-all duration-300 ${
                      isActive 
                        ? 'w-8 h-2 bg-gradient-to-r from-[#ba8c5c] to-[#d4a574] shadow-md' 
                        : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                    aria-label={`Go to coupon ${index + 1}`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Details for the selected coupon offer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-700 dark:text-gray-300">
            {modalContent ? (
              <div dangerouslySetInnerHTML={{ __html: modalContent.replace(/\n/g, '<br/>') }} />
            ) : (
              <p>No terms and conditions available for this coupon.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};