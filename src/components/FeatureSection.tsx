import React from 'react';
import { Truck, Lock, RefreshCcw, Headphones } from "lucide-react";

export const FeatureSection = () => {
  return (
    <section className="container mx-auto px-4 py-6 sm:py-12">
      <div className="border-t border-b border-red-600 py-4 sm:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Truck className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900">Free Shipping</h3>
            <p className="text-xs sm:text-sm text-gray-600">Free shipping on all order above 1000</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Lock className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900">Security Payment</h3>
            <p className="text-xs sm:text-sm text-gray-600">Simply return it within 30 days for an exchange.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <RefreshCcw className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900">14-Day Return</h3>
            <p className="text-xs sm:text-sm text-gray-600">Simply return the product within 14 days of delivery for an exchange or refund.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex-shrink-0">
            <Headphones className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-gray-900">24/7 Support</h3>
            <p className="text-xs sm:text-sm text-gray-600">Contact us 24 hours a day, 7 day's week</p>
          </div>
        </div>
      </div>
    </section>
  );
}