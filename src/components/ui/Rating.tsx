import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
  size?: number;
}

export const Rating = ({ value, onChange, maxStars = 5, size = 6 }: RatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoveredRating(starValue)}
            onMouseLeave={() => setHoveredRating(0)}
            className={cn("transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded", `h-${size} w-${size}`)}
          >
            <Star
              className={cn(
                `h-${size} w-${size}`,
                starValue <= (hoveredRating || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span className="text-sm font-medium text-muted-foreground ml-2">
          {value} out of {maxStars}
        </span>
      )}
    </div>
  );
};

