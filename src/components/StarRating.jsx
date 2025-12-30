import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, interactive = true, size = "md" }) => {
  const sizeClasses = size === "lg" ? "w-8 h-8" : "w-5 h-5";
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button 
          key={star} 
          type="button" 
          disabled={!interactive} 
          onClick={() => interactive && setRating(star)} 
          className={`focus:outline-none transition-transform ${interactive ? 'hover:scale-110' : 'cursor-default'}`}
        >
          <Star 
            className={`${sizeClasses} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} 
            fill={star <= rating ? "currentColor" : "none"} 
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;