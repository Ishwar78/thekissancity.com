import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";

const Cart = () => {
  const { items, subtotal, discountAmount, total, appliedCoupon, applyCoupon, removeCoupon, updateQty, removeItem } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [openCheckout, setOpenCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [productData, setProductData] = useState<Record<string, any>>({});

  // Fetch product data for color images
  useEffect(() => {
    const uniqueProductIds = [...new Set(items.map(item => item.id))];
    
    uniqueProductIds.forEach(async (productId) => {
      if (!productData[productId]) {
        try {
          const response = await fetch(`/api/products/${productId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.ok && data.data) {
              setProductData(prev => ({
                ...prev,
                [productId]: data.data
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch product data:', error);
        }
      }
    });
  }, [items]);

  // Helper function to get color-specific image
  const getColorImage = (item: any): string => {
    console.log('Cart getColorImage called with:', {
      hasColor: !!item.meta?.color,
      color: item.meta?.color,
      hasColorVariants: !!item.colorVariants,
      hasColorImages: !!item.colorImages,
      originalImage: item.image
    });
    
    if (!item.meta?.color) return item.image;
    
    // Get product data for color images
    const product = productData[item.id] || (item.colorVariants && item.colorVariants.length > 0 ? item : null);
    
    if (!product) return item.image;
    
    // Try colorVariants first (new structure)
    const colorVariants = product.colorVariants || item.colorVariants;
    if (colorVariants && Array.isArray(colorVariants)) {
      const variant = colorVariants.find((cv: any) => cv.colorName === item.meta.color);
      console.log('Found variant:', variant);
      if (variant && Array.isArray(variant.images) && variant.images.length > 0) {
        console.log('Using variant image:', variant.images[0]);
        return variant.images[0];
      }
    }
    
    // Fallback to colorImages (old structure)
    const colorImages = product.colorImages || item.colorImages;
    if (colorImages && typeof colorImages === 'object' && colorImages[item.meta.color]?.length > 0) {
      console.log('Using colorImages:', colorImages[item.meta.color][0]);
      return colorImages[item.meta.color][0];
    }
    
    // Default to original image
    console.log('Using default image:', item.image);
    return item.image;
  };

  useEffect(() => {
    const couponFromUrl = searchParams.get('coupon');
    if (couponFromUrl && !couponCode && !appliedCoupon) {
      setCouponCode(couponFromUrl);
    }
  }, [searchParams, couponCode, appliedCoupon]);

  const handleDecrease = (cartKey: string, qty: number) => {
    if (qty <= 1) return;
    updateQty(cartKey, qty - 1);
  };
  const handleIncrease = (cartKey: string, qty: number) => updateQty(cartKey, qty + 1);
  const handleRemove = (cartKey: string) => {
    removeItem(cartKey);
    toast({ title: "Removed from cart" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Enter a coupon code");
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // First try to validate as common coupon
      console.log('Trying common coupon validation for:', couponCode);
      console.log('Token available:', !!token);
      console.log('Cart items:', items);
      
      const commonCouponResponse = await fetch("/api/coupons/validate", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ 
          code: couponCode,
          items: items.map(item => ({
            id: item.id,
            title: item.title,
            price: item.price,
            qty: item.qty
          }))
        }),
      });

      const commonCouponData = await commonCouponResponse.json();
      console.log('Common coupon response:', commonCouponResponse.status, commonCouponData);

      if (commonCouponResponse.ok && commonCouponData.ok) {
        // Common coupon applied successfully
        console.log('Common coupon validated:', commonCouponData.data);
        const couponData = {
          code: commonCouponData.data.code,
          discount: commonCouponData.data.discount,
          discountType: 'percentage',
          applicableProducts: [], // Empty means applies to all products
          eligibleItems: items.map(item => item.id) // All items are eligible
        };
        console.log('Applying common coupon with data:', couponData);
        applyCoupon(couponData);
        setCouponCode("");
        
        toast({ 
          title: `Coupon applied!`, 
          description: `${commonCouponData.data.discount}% off on all items` 
        });
      } else if (commonCouponResponse.status === 400 && commonCouponData.message && commonCouponData.message.includes('already used')) {
        // Coupon already used - show alternatives
        console.log('Coupon already used, showing alternatives...');
        
        // Show common coupons as alternatives
        try {
          const alternativesResponse = await fetch("/api/coupons/active", {
            method: "GET",
            headers,
            credentials: "include",
          });

          if (alternativesResponse.ok) {
            const alternativesData = await alternativesResponse.json();
            if (alternativesData.ok && alternativesData.data.length > 0) {
              const availableCoupons = alternativesData.data.filter((c: any) => c.code !== couponCode.trim().toUpperCase());
              const alternativeList = availableCoupons.slice(0, 3).map((c: any) => 
                `${c.code} (${c.discount}%)`
              ).join(', ');
              
              if (alternativeList.length > 0) {
                setCouponError(`You already used this coupon. Try these other coupons: ${alternativeList}`);
              } else {
                setCouponError("You already used this coupon. No other coupons available.");
              }
            } else {
              setCouponError("You already used this coupon. No other coupons available.");
            }
          } else {
            setCouponError("You already used this coupon. Failed to fetch alternatives.");
          }
        } catch (error) {
          console.error('Error fetching alternatives:', error);
          setCouponError("You already used this coupon. Failed to fetch alternatives.");
        }
      } else {
        // If common coupon validation fails, try bulk coupon validation
        const cartItemIds = items.map(item => item.id);
        let applicableCoupon = null;
        let eligibleItems = [];

        // Check each cart item to see if bulk coupon applies
        for (const itemId of cartItemIds) {
          const response = await fetch(`/api/bulk-coupons/check-applicability/${itemId}?couponCode=${encodeURIComponent(couponCode.trim())}`, {
            method: "GET",
            headers,
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.couponChecked && data.data.couponChecked.applicable) {
              applicableCoupon = data.data.couponChecked;
              eligibleItems.push(itemId);
            }
          }
        }

        if (applicableCoupon) {
          const couponData = {
            code: applicableCoupon.code,
            discount: applicableCoupon.discountType === 'percentage' ? applicableCoupon.discountValue : applicableCoupon.discountValue,
            discountType: applicableCoupon.discountType,
            applicableProducts: eligibleItems,
            eligibleItems: eligibleItems
          };
          applyCoupon(couponData);
          setCouponCode("");
          
          const eligibleCount = eligibleItems.length;
          toast({ 
            title: `Coupon applied!`, 
            description: `${applicableCoupon.discountType === 'percentage' ? applicableCoupon.discountValue + '%' : '₹' + applicableCoupon.discountValue} off on ${eligibleCount} eligible item${eligibleCount > 1 ? 's' : ''}` 
          });
        } else {
          // If neither common nor bulk coupons work, show alternatives
          const firstItemId = cartItemIds[0];
          if (firstItemId) {
            const alternativesResponse = await fetch(`/api/bulk-coupons/check-applicability/${firstItemId}`, {
              method: "GET",
              headers,
              credentials: "include",
            });

            if (alternativesResponse.ok) {
              const alternativesData = await alternativesResponse.json();
              
              if (alternativesData.success) {
                const coupons = alternativesData.data.applicableCoupons || [];
                
                if (coupons.length > 0) {
                  const alternativeList = coupons.slice(0, 3).map((c: any) => 
                    `${c.code} (${c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue})`
                  ).join(', ');
                  
                  const message = alternativesData.data.showCommonCoupons 
                    ? `Coupon not valid. Try these common coupons: ${alternativeList}`
                    : `Coupon not applicable to cart items. Try: ${alternativeList}`;
                  
                  setCouponError(message);
                } else {
                  setCouponError("No available coupons for this product. Create some in admin panel!");
                }
              } else {
                setCouponError("Failed to fetch alternative coupons.");
              }
            } else {
              setCouponError("Failed to fetch alternative coupons.");
            }
          } else {
            setCouponError("No items in cart to check coupon applicability.");
          }
        }
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponCode("");
    setCouponError(null);
    toast({ title: "Coupon removed" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 pt-32 md:pt-36 lg:pt-40 pb-12 flex-grow">
        <Link to="/shop" className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8 gap-1">
          <ArrowLeft className="h-4 w-4 flex-shrink-0" />
          Continue Shopping
        </Link>

        <h1 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-8 sm:mb-12">
          Shopping <span className="text-primary">Cart</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <p className="text-base sm:text-xl text-muted-foreground mb-6 sm:mb-8">Your cart is empty</p>
            <Link to="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <Card key={item.cartKey || item.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4">
                    {item.image && <img src={getColorImage(item)} alt={item.title} className="w-16 sm:w-20 h-16 sm:h-20 object-cover rounded flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-xs sm:text-base line-clamp-2">{item.title}</h3>
                        {appliedCoupon?.applicableProducts && appliedCoupon.applicableProducts.length > 0 && (
                          appliedCoupon.applicableProducts.includes(item.id) ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✓ Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              Not eligible
                            </span>
                          )
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {item.meta?.size && <p className="text-xs sm:text-sm text-muted-foreground">Size: {item.meta.size}</p>}
                        {item.meta?.color && <p className="text-xs sm:text-sm text-muted-foreground">Color: {item.meta.color}</p>}
                      </div>
                      <p className="font-bold mt-1 text-xs sm:text-base">₹{(item.price || 0).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center border border-border rounded text-xs sm:text-base">
                      <button className="px-2 sm:px-3 py-1" onClick={() => handleDecrease(item.cartKey || item.id, item.qty)}>-</button>
                      <div className="px-2 sm:px-3 py-1 min-w-[32px] text-center">{item.qty}</div>
                      <button className="px-2 sm:px-3 py-1" onClick={() => handleIncrease(item.cartKey || item.id, item.qty)}>+</button>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-xs sm:text-base">₹{(item.qty * item.price).toLocaleString("en-IN")}</div>
                      <button className="text-xs text-destructive mt-1 inline-flex items-center gap-0.5" onClick={() => handleRemove(item.cartKey || item.id)}>
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-4 sm:p-6 sticky top-24">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Order Summary</h2>

                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>

                  <div className="border-t border-border pt-3 sm:pt-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-2">Have a Coupon?</label>
                    {!appliedCoupon ? (
                      <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <input
  type="text"
  value={couponCode}
  onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
  placeholder="Enter code"
  className="flex-1 rounded px-2 py-1.5 text-sm
             bg-white dark:bg-slate-900
             text-slate-900 dark:text-slate-100
             placeholder:text-slate-400 dark:placeholder:text-slate-500
             caret-slate-900 dark:caret-slate-100
             border border-slate-300 dark:border-slate-700
             focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500"
  disabled={couponLoading}
/>
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 sm:h-9"
                        >
                          Apply
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-2 mb-3">
                        <div className="text-xs flex-1">
                          <span className="font-medium text-green-900 dark:text-green-100">{appliedCoupon.code}</span>
                          <span className="text-green-700 dark:text-green-300 ml-2 font-medium">-{appliedCoupon.discount}%</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="h-6 px-2 text-xs w-full sm:w-auto"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-xs text-destructive mb-2">{couponError}</p>
                    )}
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs sm:text-sm text-green-700 dark:text-green-300">
                      <span>Discount ({appliedCoupon?.discount}%)</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="border-t border-border pt-2 sm:pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-xs sm:text-base">Total</span>
                      <span className="font-bold text-base sm:text-lg">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full text-xs sm:text-sm h-9 sm:h-11" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />

      <CheckoutModal open={openCheckout} setOpen={setOpenCheckout} />
    </div>
  );
};

export default Cart;
