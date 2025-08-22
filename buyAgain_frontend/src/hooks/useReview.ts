import { createContext, useContext } from 'react';
import type { ReviewContextType } from '../context/ReviewContext';

//create the context
export const ReviewContext = createContext<ReviewContextType | undefined>(
  undefined,
);

const useReview = () => {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error('useReview must be used within an AdminProvider');
  }
  return context;
};

export default useReview;
