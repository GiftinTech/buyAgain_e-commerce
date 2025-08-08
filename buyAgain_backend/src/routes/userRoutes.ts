import express from 'express';
import userController from '../controllers/userController';
import authController from '../controllers/authController';

const router = express.Router();

router.route('/').get(authController.protectRoute, authController.restrictTo('admin'), userController.getAllUsers);

export default router;
