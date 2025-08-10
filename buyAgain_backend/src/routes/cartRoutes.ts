import express from 'express';
import authController from '../controllers/authController';
import cartController from '../controllers/cartController';
import orderController from '../controllers/orderController';

const router = express.Router();

router.use(
  authController.protectRoute,
  authController.restrictTo('user'),
  orderController.setUserFilter,
);

router
  .route('/')
  .get(cartController.getUserCart)
  .post(cartController.addToCart); // user add to cart

router
  .route('/:itemId')
  .patch(cartController.updateCartQuantity, cartController.updateCartItem) // user update quantity only
  .delete(cartController.deleteCartItem) // remove one item
  .delete(cartController.clearUserCart); // delete cart

export default router;
