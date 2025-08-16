/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Star } from 'lucide-react';
import { ReviewSkeleton } from './ui/ReactSkeletonLoader/ProductSkeleton';
import type { IReview } from '../context/AdminContext';
import useAdmin from '../hooks/useAdmin';

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const { reviews, handleFetchReviews, loading, reviewError } = useAdmin();

  // Fetch reviews for product when component mounts or productId changes
  useEffect(() => {
    handleFetchReviews({ id: productId } as any);
  }, [productId, handleFetchReviews]);

  // Filter reviews for current product if your reviews array includes reviews for multiple products
  console.log('reviews:', reviews?.review);
  const productReviews =
    reviews?.review.filter((review: IReview) => review.product === productId) ??
    [];

  if (productReviews.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold text-white">Customer Reviews</h2>
        <p className="text-gray-500">
          No reviews yet. Be the first to leave one!
        </p>
      </div>
    );
  }

  if (loading || !reviews) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-white">Customer Reviews</h2>
        <div className="space-y-6">
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      </div>
    );
  }

  if (reviewError) {
    console.log('review error ui:', reviewError);
    return <div className="text-red-500">{reviewError}</div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Customer Reviews</h2>

      {/* Scrollable container */}
      <div className="scrollbar-hide max-h-96 overflow-y-auto py-4">
        {reviews.review.length > 0 ? (
          <div className="space-y-4">
            {reviews.review.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 shadow-md"
              >
                {/* Review content here (unchanged) */}
                <div className="mb-2 flex items-center">
                  <span className="mr-2 flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill="currentColor"
                        className="text-yellow-400"
                      />
                    ))}
                    {[...Array(5 - review.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-gray-300" />
                    ))}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    {review.rating} Stars
                  </span>
                </div>
                <p className="mb-3 leading-relaxed text-gray-300">
                  {review.review}
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  {review.user.photo ? (
                    <img
                      src={review.user.photo}
                      alt={review.user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold">{review.user.name}</p>
                  <p className="ml-2 text-xs">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to leave one!
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
