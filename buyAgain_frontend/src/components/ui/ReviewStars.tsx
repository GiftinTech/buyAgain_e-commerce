import React from 'react';

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating }) => {
  return (
    <div className="flex cursor-pointer space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          className="focus:outline-none"
        >
          {rating >= star ? (
            // Filled star SVG
            <svg
              className="h-6 w-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.21c.969 0 1.371 1.24.588 1.81l-3.404 2.472a1 1 0 00-.364 1.118l1.286 3.956c.3.921-.755 1.688-1.54 1.118l-3.404-2.472a1 1 0 00-1.175 0l-3.404 2.472c-.784.57-1.838-.197-1.54-1.118l1.286-3.956a1 1 0 00-.364-1.118L2.98 9.383c-.783-.57-.38-1.81.588-1.81h4.21a1 1 0 00.95-.69l1.286-3.956z" />
            </svg>
          ) : (
            // Empty star SVG
            <svg
              className="h-6 w-6 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.956a1 1 0 00.95.69h4.21c.969 0 1.371 1.24.588 1.81l-3.404 2.472a1 1 0 00-.364 1.118l1.286 3.956c.3.921-.755 1.688-1.54 1.118l-3.404-2.472a1 1 0 00-1.175 0l-3.404 2.472c-.784.57-1.838-.197-1.54-1.118l1.286-3.956a1 1 0 00-.364-1.118L2.98 9.383c-.783-.57-.38-1.81.588-1.81h4.21a1 1 0 00.95-.69l1.286-3.956z" />
            </svg>
          )}
        </button>
      ))}
    </div>
  );
};

export default StarRating;
