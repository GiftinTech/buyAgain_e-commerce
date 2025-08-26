import express from 'express';
import authController from '../controllers/authController';
import orderController from '../controllers/orderController';

const router = express.Router();

router.get('/success', orderController.handleOrderSuccess);

// Protected Routes
router.use(authController.protectRoute);

router.post('/checkout', orderController.getCheckoutSession);

router
  .route('/')
  .get(orderController.setUserFilter, orderController.getAllOrders)
  .post(orderController.createOrder);

router.route('/my-orders').get(orderController.getMyOrders);
router.route('/my-orders/:orderId').get(orderController.getOrderDetails); // get order details

router.get('/session/:sessionId', orderController.getOrderBySessionId);

// Protected and Restricted Routes
router
  .route('/all')
  .get(authController.restrictTo('admin'), orderController.getAllOrders);

router.use(authController.restrictTo('admin', 'seller'));

router.route('/:orderId').patch(orderController.updateOrder); // update order status

export default router;
