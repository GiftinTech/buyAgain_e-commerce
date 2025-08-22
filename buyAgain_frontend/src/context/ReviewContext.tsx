/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, type ReactNode } from 'react';
import { ReviewContext } from '../hooks/useReview';
import useFetch from '../hooks/useFetch';
import type { IUser, Product } from './AdminContext';
import useAuth from '../hooks/useAuth';
import { useAlert } from '../hooks/useAlert';

export interface IReview {
  id?: string;
  product: string;
  user: Partial<IUser>;
  review: string;
  rating: number;
  createdAt: string;
}

export interface Review {
  review: IReview[];
}

interface ReviewContextType {
  reviewLoading: boolean;
  reviewError: string | null;
  reviews: Review | null;

  // Functions to trigger CRUD operations
  handleFetchReviews: (product: Product) => Promise<{
    success: boolean;
    message?: string;
    reviews?: Review | null;
  }>;

  handleCreateReview: (review: Omit<IReview, 'id'>) => Promise<void>;
  handleUpdateReview: (review: IReview) => Promise<void>;
  handleDeleteReview: (id: string | undefined) => Promise<void>;
}

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

interface ReviewProviderProps {
  children: ReactNode;
}

//provide the state
const ReviewProvider = ({ children }: ReviewProviderProps) => {
  const { token } = useAuth();
  const { showAlert } = useAlert();

  const authOptions = useMemo(() => {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);
  // fetch reviews from DB
  const {
    data: fetchedReviews,
    loading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useFetch<Review>('/reviews');

  //console.log('ReviewsError:', reviewsError);

  const handleFetchReviews = async (
    product: Product,
  ): Promise<{
    success: boolean;
    message?: string;
    reviews?: Review | null;
  }> => {
    try {
      const res = await fetch(
        `${BUYAGAIN_API_BASE_URL}/products/${product.id}/reviews`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch reviews.');
      }

      const reviewsData: Review = await res.json();

      // Refetch the list to update the UI
      return { success: true, reviews: reviewsData };
    } catch (error: any) {
      console.error('Fetch reviews error:', error);
      return { success: false, message: error.message };
    }
  };

  const handleCreateReview = async (review: Omit<IReview, 'id'>) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/reviews`, {
        method: 'POST',
        ...authOptions,
        body: JSON.stringify(review),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create a review.');
      }
      showAlert('success', 'Thank you for leaving a review😊', 1);
      await refetchReviews();
    } catch (err) {
      console.error('Create review error:', err);
    }
  };

  const handleUpdateReview = async (review: IReview) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/reviews/${review.id}`, {
        method: 'PATCH',
        ...authOptions,
        body: JSON.stringify(review),
      });
      if (!res.ok) throw new Error('Failed to update review.');
      showAlert('success', 'Review updated', 2);
      await refetchReviews();
    } catch (err) {
      console.error('Update review error:', err);
    }
  };

  const handleDeleteReview = async (id: string | undefined) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/reviews/${id}`, {
        method: 'DELETE',
        ...authOptions,
      });

      if (!res.ok) throw new Error('Failed to delete review.');
      showAlert('success', 'Review deleted', 2);
      await refetchReviews();
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const contextValue: ReviewContextType = {
    reviewLoading: reviewsLoading,
    reviewError: reviewsError,
    reviews: fetchedReviews,
    handleFetchReviews,
    handleCreateReview,
    handleUpdateReview,
    handleDeleteReview,
  };

  return (
    <ReviewContext.Provider value={contextValue}>
      {children}
    </ReviewContext.Provider>
  );
};
export default ReviewProvider;
export type { ReviewContextType };
