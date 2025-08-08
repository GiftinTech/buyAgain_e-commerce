import express from 'express';
import authController from '../controllers/authController';
import cartController from '../controllers/cartController';
import orderController from '../controllers/orderController';

const router = express.Router();

router.use(authController.protectRoute, authController.restrictTo('user'));

router
  .route('/')
  .get(orderController.setUserFilter, cartController.getAllCarts) // user gets their own cart
  .post(cartController.createCart); // user add to cart

router
  .route('/:itemId')
  .patch(cartController.updateCartQuantity, cartController.updateCart) // user update quantity only
  .delete(cartController.deleteCart); // user remove item

export default router;
