import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { InquiryFormSolar } from '@/components/InquiryFormSolar';
import { Sun, ShieldCheck, Zap, ThermometerSun } from 'lucide-react';

const SolarDrying = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Navbar />
      
      {/* Hero Section */}
      {/* Hero Section */}
<section className="pt-32 pb-16 px-4">
  <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    
    {/* Left Side - Text */}
    <div className="space-y-6 text-center lg:text-left">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-[#ba8c5c]/20 text-[#6b4423] text-xs font-bold tracking-widest uppercase shadow-sm">
        <Sun className="w-4 h-4 text-[#ba8c5c]" />
        <span>Sustainable Technology</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-black text-[#2d2117] tracking-tight leading-tight font-serif">
  Harness the Power <br />
  of <span className="text-[#2d6a4f]">Solar Drying</span>
</h1>

      <p className="text-gray-600 text-lg md:text-xl max-w-xl font-light leading-relaxed">
        Revolutionizing food preservation with eco-friendly solar technology. 
        Get in touch to learn how our drying solutions can help your farm or business.
      </p>

    
    </div>

    {/* Right Side - Image */}
    <div className="relative">
      <img
        src="/bg.jpeg" 
        alt="Solar Drying"
        className="w-full h-[400px] md:h-[500px] object-cover rounded-3xl shadow-lg"
      />

      {/* Optional floating card */}
      {/* <div className="absolute bottom-[-20px] left-6 bg-white p-4 rounded-xl shadow-md">
        <p className="text-xl font-bold text-[#2d2117]">₹8.4L+</p>
        <p className="text-xs text-gray-500">Avg. First Year Net</p>
      </div> */}
    </div>

  </div>
</section>

      {/* Main Content & Form */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Info Side */}
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: ShieldCheck, title: "Pure & Hygienic", desc: "Closed-loop system prevents dust and insects." },
                { icon: Zap, title: "Zero Fuel Cost", desc: "100% solar powered, no electricity required." },
                { icon: ThermometerSun, title: "Nutrient Retention", desc: "Gentle drying preserves vitamins and color." },
                { icon: Sun, title: "Weather Resistant", desc: "Designed to work even in varied climates." }
              ].map((item, i) => (
                <div key={i} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-[#2d6a4f]/10 rounded-xl flex items-center justify-center mb-4 text-[#2d6a4f]">
                    <item.icon size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-[#2d2117] mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#2d6a4f]/5 p-8 rounded-3xl border border-[#2d6a4f]/10">
  <h3 className="text-xl font-bold text-[#2d6a4f] mb-4">
    Why Choose Solar?
  </h3>

  <p className="text-gray-700 leading-relaxed font-light italic mb-4">
    "Our solar drying technology ensures that farmers can preserve their harvest with zero operational costs, maintaining 100% of the natural goodness and flavor."
  </p>

  <ul className="text-gray-700 space-y-2 text-sm leading-relaxed">
    <li>✔ No electricity cost – पूरी तरह solar powered</li>
    <li>✔ Eco-friendly & sustainable solution</li>
    <li>✔ Longer shelf life of fruits & vegetables</li>
    <li>✔ Better hygiene compared to open sun drying</li>
    <li>✔ Retains nutrients, color & taste</li>
    <li>✔ Low maintenance & easy to use</li>
  </ul>

  <p className="text-gray-600 mt-4 text-sm">
    Solar drying helps farmers increase income by reducing wastage and adding value to their produce.
  </p>
</div>
          </div>

          {/* Form Side */}
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-[#2d2117] mb-2">Inquiry Form</h2>
              <p className="text-gray-500 text-sm">Fill in the details below and our team will contact you within 24 hours.</p>
            </div>
            <InquiryFormSolar />
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SolarDrying;
