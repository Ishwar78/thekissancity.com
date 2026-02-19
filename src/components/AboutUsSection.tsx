import React, { useState } from 'react';

const AboutUsSection = () => {
  const [isReadMore, setIsReadMore] = useState(false);

  const ImageCard = ({ height = "h-80" }: { height?: string }) => (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl border-2"
      style={{ borderColor: '#ffffff' }}
    >
      {/* Top brown bar */}
      <div className="h-10" style={{ backgroundColor: '#333333' }}></div>

      {/* Single Image */}
      <div className={`relative overflow-hidden group ${height}`}>
        <img
          src="/Capture.PNG"
          alt="About us"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black opacity-10"></div>
      </div>

      {/* Bottom Banner */}
      <div
        className="text-white text-center py-4 relative"
        style={{ background: 'linear-gradient(to right, #333333, #666666, #333333)' }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <h3 className="font-bold uppercase tracking-[0.2em] relative z-10 text-sm lg:text-base">
          PERFECT FOR ALL OCCASIONS
        </h3>
      </div>
    </div>
  );

  return (
    <section className="bg-black text-white py-12 lg:py-20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-12 left-8 text-6xl font-bold opacity-20" style={{ color: '#ffffff' }}>///</div>
      <div className="absolute bottom-0 right-0 w-48 h-48 rounded-tl-full opacity-10" style={{ backgroundColor: '#ffffff' }}></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full opacity-5" style={{ backgroundColor: '#ffffff' }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">

          {/* Left Section */}
          <div className="lg:w-[48%] w-full space-y-6">
            <div className="inline-block">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight" style={{ color: '#ffffff' }}>
                OUR STORY
              </h2>
              <div className="w-24 h-1 mt-3 rounded-full" style={{ background: 'linear-gradient(to right, #ffffff, #e0e0e0)' }}></div>
            </div>

            <div className="space-y-5" style={{ color: '#cccccc' }}>
              <p className="text-base lg:text-lg leading-relaxed">
               Kissan City is all about bringing you the purity of the pahad in its most natural form. We specialize in authentic pahaadi goods like pure desi ghee, raw honey, and premium dry fruits sourced directly from the hills.
   Our products are carefully collected from trusted local farmers, preserving traditional methods and natural goodness.
              </p>

              {!isReadMore && (
                <button
                  onClick={() => setIsReadMore(true)}
                  className="font-semibold text-sm uppercase tracking-wider transition-colors duration-200 flex items-center gap-2"
                  style={{ color: '#ffffff' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#cccccc')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
                >
                  Read More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {isReadMore && (
                <>
                  <p className="text-sm lg:text-base leading-relaxed opacity-90">
                    From rich, aromatic ghee to unprocessed honey and handpicked dry fruits, every item reflects quality, freshness, and the true taste of the mountains.

At Kissan City, we aim to deliver health, purity, and tradition straight from the hills to your home.
                  </p>

                  <p className="text-sm lg:text-base leading-relaxed opacity-90">
                    At Kissan City, our mission is to deliver health, purity, and tradition straight from the hills to your home. We believe in bringing you food that is not only delicious but also wholesome, natural, and crafted with care — just the way nature intended.
                  </p>

                  {/* Mobile Image — shown only when Read More expanded */}
                  <div className="lg:hidden w-full mt-6">
                    <ImageCard height="h-64" />
                  </div>

                  <button
                    onClick={() => setIsReadMore(false)}
                    className="font-semibold text-sm uppercase tracking-wider transition-colors duration-200 flex items-center gap-2 mt-4"
                    style={{ color: '#8B3A1A' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C97B3A')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#8B3A1A')}
                  >
                    Read Less
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Section — Desktop only */}
          <div className="hidden lg:block lg:w-[48%] w-full">
            <ImageCard height="h-96" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;