import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/refreshToken', authController.refreshToken);

router.use(authController.protectRoute); // Protect everything below

router.post('/logout', authController.logout);
router.patch('/updatePassword', authController.updatePassword);

export default router;
