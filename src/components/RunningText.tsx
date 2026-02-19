import { useState, useEffect } from 'react';

export const RunningText = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Debug log
      console.log('Scroll position:', currentScrollY, 'Visible:', currentScrollY <= 10);
      
      // Hide immediately when scrolling down, show only when at very top
      if (currentScrollY > 10) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const messages = [
    "UNI10 - is Live Now",
    "For the First 50 Unique Personalities ....",
    "UNI10 - The Ultimate Shopping Experience",
  ];

  // Create extended message array with spacing for seamless loop
  const extendedMessages = [...messages, ...messages];

  return (
    <div className={`fixed top-16 left-0 right-0 z-50 bg-black border-b border-gray-800 overflow-hidden h-8 transition-all duration-300 ease-in-out ${
      isVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'
    }`}>
      <div className="relative flex items-center h-full w-full">
        <div className="flex animate-marquee whitespace-nowrap">
          {extendedMessages.map((message, index) => (
            <span key={index} className="mx-12 text-sm font-semibold text-white">
              {message}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
