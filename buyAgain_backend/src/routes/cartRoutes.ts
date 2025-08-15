import express from 'express';
import authController from '../controllers/authController';
import cartController from '../controllers/cartController';
import orderController from '../controllers/orderController';

const router = express.Router({ mergeParams: true });

router.use(
  authController.protectRoute,
  authController.restrictTo('user'),
  orderController.setUserFilter,
);

router
  .route('/')
  .get(cartController.getUserCart)
  .post(cartController.addToCart) // user add to cart
  .delete(cartController.clearUserCart); // delete cart

router
  .route('/:itemId')
  .patch(cartController.updateCartQuantity) // user update quantity only
  .delete(cartController.deleteCartItem); // remove one item

export default router;
