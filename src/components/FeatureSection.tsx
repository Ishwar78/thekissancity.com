import React from 'react';
import { Truck, Lock, RefreshCcw, Headphones } from "lucide-react";

export const FeatureSection = () => {
  return (
    <section className="container mx-auto px-4 py-8 sm:py-12">
      <div 
        className="border-t border-b py-6 sm:py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        style={{
          borderColor: '#c8973a',
          backgroundColor: '#faf3eb'
        }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div 
              className="p-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#6b4423' }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 
              className="text-base sm:text-lg font-bold"
              style={{ color: '#6b4423' }}
            >
              Free Shipping
            </h3>
            <p 
              className="text-sm text-gray-600"
              style={{ color: '#7a5c3a' }}
            >
              Free shipping on all orders above 1000
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div 
              className="p-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#6b4423' }}
            >
              <Lock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 
              className="text-base sm:text-lg font-bold"
              style={{ color: '#6b4423' }}
            >
              Secure Payment
            </h3>
            <p 
              className="text-sm text-gray-600"
              style={{ color: '#7a5c3a' }}
            >
              100% secure payment process
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div 
              className="p-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#6b4423' }}
            >
              <RefreshCcw className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 
              className="text-base sm:text-lg font-bold"
              style={{ color: '#6b4423' }}
            >
              Easy Returns
            </h3>
            <p 
              className="text-sm text-gray-600"
              style={{ color: '#7a5c3a' }}
            >
              30 days return policy
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div 
              className="p-3 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#6b4423' }}
            >
              <Headphones className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h3 
              className="text-base sm:text-lg font-bold"
              style={{ color: '#6b4423' }}
            >
              24/7 Support
            </h3>
            <p 
              className="text-sm text-gray-600"
              style={{ color: '#7a5c3a' }}
            >
              Dedicated customer support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};