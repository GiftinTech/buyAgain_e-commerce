import express from 'express';
import reviewController from '../controllers/reviewController';
import authController from '../controllers/authController';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.setProductAndUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .put(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.updateReview,
  )
  .patch(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.updateReview,
  )
  .delete(
    authController.protectRoute,
    authController.restrictTo('user'),
    reviewController.deleteReview,
  );

export default router;
