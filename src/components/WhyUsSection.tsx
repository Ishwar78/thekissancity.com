import React from 'react';

const features = [
  {
    title: "Pure",
    description: "Sourced from the Himalayas, unadulterated and untouched — the way nature intended.",
    illustration: () => (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="#2a9d8f"/>
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="url(#mountainGrad)"/>
        {/* Sky */}
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="#1a7a6e"/>
        {/* Stars */}
        <circle cx="30" cy="28" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="50" cy="22" r="1" fill="white" opacity="0.6"/>
        <circle cx="75" cy="25" r="1.5" fill="white" opacity="0.8"/>
        <circle cx="90" cy="35" r="1" fill="white" opacity="0.5"/>
        <circle cx="40" cy="38" r="1" fill="white" opacity="0.4"/>
        {/* Red moon */}
        <circle cx="35" cy="32" r="7" fill="#e63946"/>
        {/* Water */}
        <ellipse cx="60" cy="85" rx="50" ry="18" fill="#1a6b60"/>
        {/* Mountain back */}
        <polygon points="20,72 55,30 90,72" fill="#e8d5a3"/>
        <polygon points="50,72 75,40 100,72" fill="#f0e0b0"/>
        {/* Snow caps */}
        <polygon points="55,30 48,48 62,48" fill="white" opacity="0.9"/>
        <polygon points="75,40 69,54 81,54" fill="white" opacity="0.9"/>
        {/* Trees */}
        <polygon points="18,72 22,60 26,72" fill="#2d4a22"/>
        <polygon points="25,72 30,58 35,72" fill="#2d4a22"/>
        <polygon points="85,72 90,60 95,72" fill="#2d4a22"/>
        {/* Water ripples */}
        <ellipse cx="60" cy="82" rx="30" ry="4" fill="#1a7a6e" opacity="0.5"/>
        <ellipse cx="60" cy="88" rx="22" ry="3" fill="#1a7a6e" opacity="0.4"/>
        <defs>
          <linearGradient id="mountainGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a42"/>
            <stop offset="100%" stopColor="#2a9d8f"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    title: "Authentic",
    description: "We bring you what the locals use — no shortcuts, no factory imitations.",
    illustration: () => (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="#c8973a"/>
        {/* Sky gradient */}
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="url(#farmerSky)"/>
        {/* Stars */}
        <circle cx="28" cy="25" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="55" cy="20" r="1" fill="white" opacity="0.5"/>
        <circle cx="80" cy="28" r="1.5" fill="white" opacity="0.7"/>
        {/* Red moon */}
        <circle cx="82" cy="30" r="7" fill="#e63946"/>
        {/* Golden wheat field */}
        <ellipse cx="60" cy="90" rx="54" ry="25" fill="#c8973a"/>
        <ellipse cx="60" cy="85" rx="54" ry="20" fill="#e8b44a"/>
        {/* Farmer body */}
        <ellipse cx="60" cy="75" rx="18" ry="20" fill="#e63946"/>
        {/* Farmer head */}
        <circle cx="60" cy="48" r="14" fill="#f4a261"/>
        {/* Hat */}
        <ellipse cx="60" cy="38" rx="20" ry="5" fill="#e63946"/>
        <rect x="50" y="28" width="20" height="12" rx="4" fill="#e63946"/>
        {/* Face - mustache */}
        <path d="M54 52 Q57 55 60 53 Q63 55 66 52" stroke="#4a2c1a" strokeWidth="2" fill="none"/>
        {/* Eyes closed/content */}
        <path d="M55 46 Q57 44 59 46" stroke="#4a2c1a" strokeWidth="1.5" fill="none"/>
        <path d="M61 46 Q63 44 65 46" stroke="#4a2c1a" strokeWidth="1.5" fill="none"/>
        {/* Arms holding wheat */}
        <path d="M42 68 Q30 72 28 80" stroke="#e63946" strokeWidth="8" strokeLinecap="round"/>
        <path d="M78 68 Q90 72 92 80" stroke="#e63946" strokeWidth="8" strokeLinecap="round"/>
        {/* Wheat bundles */}
        <path d="M22 78 Q25 65 28 60" stroke="#c8973a" strokeWidth="2"/>
        <path d="M26 79 Q28 66 30 61" stroke="#c8973a" strokeWidth="2"/>
        <path d="M30 79 Q31 67 32 62" stroke="#c8973a" strokeWidth="2"/>
        <path d="M88 79 Q90 66 90 61" stroke="#c8973a" strokeWidth="2"/>
        <path d="M92 79 Q93 66 94 62" stroke="#c8973a" strokeWidth="2"/>
        <path d="M96 79 Q96 67 96 62" stroke="#c8973a" strokeWidth="2"/>
        <defs>
          <linearGradient id="farmerSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3a4a"/>
            <stop offset="60%" stopColor="#2a6a5a"/>
            <stop offset="100%" stopColor="#c8973a"/>
          </linearGradient>
        </defs>
      </svg>
    )
  },
  {
    title: "Transparency",
    description: "From source to shelf, we show you everything — because trust isn't built on secrets.",
    illustration: () => (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="#1a7a6e"/>
        {/* Stars */}
        <circle cx="25" cy="28" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="50" cy="20" r="1" fill="white" opacity="0.5"/>
        <circle cx="85" cy="25" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="95" cy="40" r="1" fill="white" opacity="0.5"/>
        {/* Red dot */}
        <circle cx="72" cy="32" r="6" fill="#e63946"/>
        {/* Jar shape */}
        <rect x="35" y="42" width="50" height="55" rx="8" fill="#e8f4f2" opacity="0.9"/>
        {/* Jar neck */}
        <rect x="42" y="34" width="36" height="14" rx="4" fill="#d4ede9" opacity="0.9"/>
        {/* Jar lid */}
        <rect x="38" y="30" width="44" height="10" rx="5" fill="#c8973a"/>
        {/* Mountain inside jar */}
        <ellipse cx="60" cy="90" rx="23" ry="8" fill="#1a6b60"/>
        <polygon points="42,88 60,58 78,88" fill="#e8d5a3"/>
        <polygon points="52,88 65,65 80,88" fill="#f0e0b0"/>
        <polygon points="60,58 55,70 65,70" fill="white" opacity="0.8"/>
        {/* Jar shine */}
        <rect x="40" y="46" width="6" height="30" rx="3" fill="white" opacity="0.3"/>
        {/* Label line */}
        <rect x="42" y="72" width="36" height="2" rx="1" fill="#2a9d8f" opacity="0.4"/>
      </svg>
    )
  },
  {
    title: "Lab Tested",
    description: "Every batch goes through rigorous testing — purity you can verify, not just believe.",
    illustration: () => (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <ellipse cx="60" cy="60" rx="54" ry="54" fill="#1a4a6e"/>
        {/* Stars */}
        <circle cx="22" cy="25" r="1.5" fill="white" opacity="0.7"/>
        <circle cx="48" cy="18" r="1" fill="white" opacity="0.5"/>
        <circle cx="75" cy="22" r="1.5" fill="white" opacity="0.7"/>
        {/* Red dot */}
        <circle cx="88" cy="32" r="6" fill="#e63946"/>
        {/* Mountains background */}
        <polygon points="15,85 38,45 60,85" fill="#e8d5a3" opacity="0.7"/>
        <polygon points="40,85 60,50 80,85" fill="#f0e0b0" opacity="0.7"/>
        <polygon points="38,45 33,58 43,58" fill="white" opacity="0.6"/>
        {/* Microscope base */}
        <rect x="62" y="88" width="30" height="6" rx="3" fill="#2a4a6e"/>
        {/* Microscope arm */}
        <rect x="72" y="50" width="8" height="42" rx="4" fill="#3a6a8e"/>
        {/* Microscope head */}
        <rect x="65" y="44" width="22" height="14" rx="5" fill="#2a9d8f"/>
        {/* Eyepiece */}
        <rect x="78" y="34" width="8" height="16" rx="4" fill="#1a7a6e"/>
        {/* Lens */}
        <circle cx="69" cy="62" r="8" fill="#1a4a6e" stroke="#2a9d8f" strokeWidth="2"/>
        <circle cx="69" cy="62" r="5" fill="#0a2a4e"/>
        <circle cx="67" cy="60" r="2" fill="#2a9d8f" opacity="0.5"/>
        {/* Stage / slide */}
        <rect x="60" y="76" width="20" height="4" rx="2" fill="#3a6a8e"/>
        {/* Flask */}
        <path d="M30 55 L30 70 L20 88 L44 88 L34 70 L34 55 Z" fill="#e63946" opacity="0.8"/>
        <rect x="29" y="50" width="6" height="8" rx="2" fill="#c8973a"/>
        <ellipse cx="32" cy="82" rx="8" ry="4" fill="#ff6b6b" opacity="0.5"/>
        {/* Bubbles in flask */}
        <circle cx="27" cy="78" r="2" fill="white" opacity="0.4"/>
        <circle cx="35" cy="74" r="1.5" fill="white" opacity="0.4"/>
      </svg>
    )
  }
];

const WhyUsSection = () => {
  return (
    <section style={{ backgroundColor: '#faf3eb' }} className="py-16 lg:py-24 overflow-hidden">
      {/* Title */}
      <div className="text-center mb-14">
        <h2
          className="text-4xl lg:text-5xl font-bold tracking-wide"
          style={{
            color: 'black',
            fontFamily: "'Georgia', 'Times New Roman', serif",
            letterSpacing: '0.08em'
          }}
        >
          WHY US?
        </h2>
      </div>

      {/* Cards Grid */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {features.map((feature, index) => {
            const Illustration = feature.illustration;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Oval Illustration */}
                <div
                  className="relative mb-6 transition-transform duration-300 group-hover:scale-105"
                  style={{ width: '160px', height: '160px' }}
                >
                  {/* Outer ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'white',
                      boxShadow: '0 4px 20px rgba(139,58,26,0.12), 0 1px 4px rgba(139,58,26,0.08)',
                      padding: '6px'
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <Illustration />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{
                    color: '#2c1a0e',
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: '1.25rem'
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-relaxed max-w-[200px]"
                  style={{
                    color: '#6b4c36',
                    fontFamily: "'Georgia', serif",
                    lineHeight: '1.7'
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;