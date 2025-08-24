import express from 'express';
import userController from '../controllers/userController';
import authController from '../controllers/authController';
import imagesURLController from '../controllers/imagesURLController';

const router = express.Router();

// Protected Route
router.use(authController.protectRoute);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers);

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(
    imagesURLController.uploadUserPhoto,
    imagesURLController.resizeUserPhoto,
    imagesURLController.uploadImagesToCloudinary,
    userController.updateMe,
  );

router
  .route('/:id')
  .get(authController.restrictTo('admin'), userController.getUser)
  .patch(
    authController.requireAdmin,
    authController.adminDelegateRole,
    userController.updateUser,
  );

export default router;
