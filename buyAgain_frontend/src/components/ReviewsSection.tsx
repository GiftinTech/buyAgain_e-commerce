/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { EditIcon, Star, Trash } from 'lucide-react';
import { ReviewSkeleton } from './ui/ReactSkeletonLoader/ProductSkeleton';
import useAdmin from '../hooks/useAdmin';
import useReview from '../hooks/useReview';
import type { IReview } from '../context/ReviewContext';
import useAuth from '../hooks/useAuth';
import StarRating from './ui/ReviewStars';
import ConfirmDialog from './ui/ConfirmDialog';

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const { loading } = useAdmin();
  const {
    reviews,
    reviewError,
    handleFetchReviews,
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
  } = useReview();
  const { user } = useAuth();

  const [showAddReview, setShowAddReview] = useState(false);
  const [editReview, setEditReview] = useState<IReview | null>(null);

  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    handleFetchReviews({ id: productId } as any);
  }, [productId, handleFetchReviews]);

  const productReviews =
    reviews?.review.filter((review: IReview) => review.product === productId) ??
    [];

  const isReviewOwner = (review: IReview) =>
    review.user && user?.data?.users?._id === review.user._id;

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
    return <div className="text-red-500">{reviewError}</div>;
  }

  const handleDeleteClick = (reviewId: React.SetStateAction<string | null>) => {
    setReviewToDelete(reviewId);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (reviewToDelete) {
      await handleDeleteReview(reviewToDelete);
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setReviewToDelete(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-row items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Customer Reviews</h2>

        {/* Add Review Button */}
        {user && (
          <button
            className="mt-4 rounded-full border border-pink-700 px-4 py-2 text-sm font-bold text-pink-100 transition-colors hover:bg-pink-900"
            onClick={() => setShowAddReview(true)}
          >
            Add Review
          </button>
        )}
      </div>

      {/* Scrollable container */}
      <div className="scrollbar-hide max-h-96 overflow-y-auto py-4">
        {productReviews.length > 0 ? (
          <div className="space-y-4">
            {productReviews.map((review) => (
              <div
                key={review.id}
                className="relative rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 shadow-md"
              >
                {/* Review content */}
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
                  {review.user?.photo ? (
                    <img
                      src={review.user.photo}
                      alt={review.user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-white">
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="font-semibold">{review.user?.name}</p>
                  <p className="ml-2 text-xs">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Icons for edit/delete if user owns review */}
                {isReviewOwner(review) && (
                  <>
                    {/* Update review icon */}
                    <button
                      className="absolute right-14 top-10 text-blue-400"
                      onClick={() => {
                        setEditReview(review);
                        setShowAddReview(true);
                      }}
                      title="Edit review"
                    >
                      <EditIcon size={18} />
                    </button>
                    {/* Delete review icon */}
                    <button
                      className="absolute right-5 top-10 text-red-400"
                      onClick={() => {
                        if (review.id) {
                          handleDeleteClick(review.id);
                        }
                      }}
                      title="Delete review"
                    >
                      <Trash size={18} />
                    </button>

                    {/* Custom confirmation dialog */}
                    <ConfirmDialog
                      isOpen={isConfirmOpen}
                      message="Are you sure you want to delete this review?"
                      onConfirm={handleConfirm}
                      onCancel={handleCancel}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">
            No reviews yet. Be the first to leave one!
          </p>
        )}
      </div>

      {/* Show AddReviewModal when triggered */}
      {showAddReview && (
        <AddReviewModal
          productId={productId}
          onClose={() => {
            setShowAddReview(false);
            setEditReview(null);
          }}
          onSubmit={(newReview) => {
            if (editReview) {
              handleUpdateReview(newReview);
            } else {
              handleCreateReview(newReview);
            }
            setShowAddReview(false);
            setEditReview(null);
          }}
          initialReview={editReview}
        />
      )}
    </div>
  );
};

interface AddReviewModalProps {
  productId: string;
  onClose: () => void;
  onSubmit: (review: IReview) => void;
  initialReview?: IReview | null;
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
  productId,
  onClose,
  onSubmit,
  initialReview,
}) => {
  const { user } = useAuth();
  const { handleCreateReview } = useReview();

  const [rating, setRating] = useState<number>(initialReview?.rating || 0);
  const [reviewText, setReviewText] = useState<string>(
    initialReview?.review || '',
  );

  const [reviewId, setReviewId] = useState<string | undefined>(
    initialReview?.id,
  );

  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setReviewText(initialReview.review);
      setReviewId(initialReview.id);
    } else {
      setRating(0);
      setReviewText('');
      setReviewId(undefined);
    }
  }, [initialReview]);

  const handleHandleSubmit = async () => {
    if (rating === 0 || reviewText.trim() === '') {
      alert('Please fill all fields');
      return;
    }

    const reviewData: IReview = {
      id: reviewId || '',
      product: productId,
      rating,
      review: reviewText,
      user: {
        _id: user?.data?.users?._id || '',
        name: user?.data?.users?.name || 'Anonymous',
        photo: user?.data?.users?.photo || '',
      },
      createdAt: initialReview?.createdAt || new Date().toISOString(),
    };

    if (!initialReview) {
      await handleCreateReview(reviewData);
    }

    onSubmit(reviewData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-gray-800 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          {initialReview ? 'Edit Review' : 'Add a Review'}
        </h3>
        {/* Rating Input */}
        <div className="mb-4">
          <label className="mb-1 block text-white">Rating</label>
          <StarRating rating={rating} setRating={setRating} />
        </div>

        {/* Review textarea */}
        <div className="mb-4">
          <label className="mb-1 block text-white">Review</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            className="w-full rounded bg-gray-700 p-2 text-white"
            rows={4}
            placeholder="Write your review..."
          />
        </div>
        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
            onClick={handleHandleSubmit}
            disabled={rating === 0 || reviewText.trim() === ''}
          >
            {initialReview ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;
