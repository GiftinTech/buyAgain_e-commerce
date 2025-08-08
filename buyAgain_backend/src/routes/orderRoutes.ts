import express from 'express';
import authController from '../controllers/authController';
import orderController from '../controllers/orderController';

const router = express.Router();

// Protected Routes
router.use(authController.protectRoute);

router
  .route('/')
  .get(orderController.setUserFilter, orderController.getAllOrders)
  .post(orderController.createOrder);

// Protected and Restricted Routes
router
  .route('/all')
  .get(authController.restrictTo('admin'), orderController.getAllOrders);

router.use(authController.restrictTo('admin', 'seller'));

router
  .route('/:orderId')
  .put(orderController.updateOrder) // update full order details
  .patch(orderController.updateOrder); // update partial order details like order status

export default router;
