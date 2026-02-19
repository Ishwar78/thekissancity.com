import { useEffect } from 'react';

export const useButtonActiveStateFix = () => {
  useEffect(() => {
    // iOS-optimized button state fix - remove aggressive polling
    const resetAllButtons = () => {
      // Target only carousel and navigation buttons to avoid performance issues
      const specificButtons = document.querySelectorAll('button[class*="carousel"], button[class*="Carousel"], [data-carousel="previous"], [data-carousel="next"]');
      
      specificButtons.forEach(button => {
        const element = button as HTMLElement;
        
        // Minimal reset for iOS compatibility
        if (element && element.blur) {
          element.blur();
        }
        
        // Only reset essential styles for mobile
        if (window.innerWidth <= 768) {
          element.style.removeProperty('background-color');
          element.style.removeProperty('transform');
          element.style.removeProperty('box-shadow');
        }
      });
    };

    // Single event handler with passive listeners for iOS performance
    const handleInteraction = () => {
      // Single delayed reset instead of multiple
      setTimeout(resetAllButtons, 50);
    };

    // Add minimal event listeners
    document.addEventListener('touchend', handleInteraction, { passive: true });
    document.addEventListener('mouseup', handleInteraction, { passive: true });

    // Initial reset only
    setTimeout(resetAllButtons, 100);

    // Cleanup
    return () => {
      document.removeEventListener('touchend', handleInteraction);
      document.removeEventListener('mouseup', handleInteraction);
    };
  }, []);
};
