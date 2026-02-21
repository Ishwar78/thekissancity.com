import React from 'react';
import { Leaf, Tractor, ShieldCheck, HeartHandshake } from 'lucide-react';

const features = [
  {
    title: "100% Organic",
    description: "No pesticides, no chemicals. Just pure, natural goodness straight from certified organic farms.",
    icon: <Leaf className="w-7 h-7" style={{ color: '#3a7d44' }} />,
  },
  {
    title: "Farm Direct",
    description: "From the farmer's hands to your home. No middlemen, ensuring freshness and fair prices.",
    icon: <Tractor className="w-7 h-7" style={{ color: '#3a7d44' }} />,
  },
  {
    title: "No Preservatives",
    description: "Traditional preparation methods without any artificial preservatives or additives.",
    icon: <ShieldCheck className="w-7 h-7" style={{ color: '#3a7d44' }} />,
  },
  {
    title: "Supporting Farmers",
    description: "Every purchase directly supports local farming communities and sustainable agriculture.",
    icon: <HeartHandshake className="w-7 h-7" style={{ color: '#3a7d44' }} />,
  },
];

const WhyUsSection = () => {
  return (
    <section style={{ backgroundColor: '#F5F5E8' }} className="py-16 lg:py-24">
      {/* Section Title */}
      <div className="text-center mb-14">
        <h2
          className="text-4xl lg:text-5xl font-bold tracking-wide"
          style={{
            color: '#6b4423',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            letterSpacing: '0.08em',
          }}
        >
          WHY US?
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center bg-white rounded-2xl px-6 py-10 group transition-shadow duration-300 hover:shadow-md"
              style={{
                boxShadow: '0 2px 12px rgba(139,95,58,0.08)',
              }}
            >
              {/* Icon Circle */}
              <div
                className="flex items-center justify-center rounded-full mb-7 transition-transform duration-300 group-hover:scale-105"
                style={{
                  width: '72px',
                  height: '72px',
                  backgroundColor: '#EDEEE6',
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="font-bold mb-4"
                style={{
                  color: '#3b1f0e',
                  fontFamily: "'Georgia', 'Times New Roman', serif",
                  fontSize: '1.2rem',
                  lineHeight: '1.3',
                }}
              >
                {feature.title}
              </h3>

              {/* Description */}
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: '#7a5c45',
                  fontFamily: "'Georgia', serif",
                  lineHeight: '1.75',
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;