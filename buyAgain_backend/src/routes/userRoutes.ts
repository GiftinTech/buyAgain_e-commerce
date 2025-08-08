import express from 'express';
import userController from '../controllers/userController';
import authController from '../controllers/authController';

const router = express.Router();

// Protected Route
router.use(authController.protectRoute);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers);

router.route('/me').get(userController.getMe, userController.getUser);

export default router;
