import express from 'express';
import authController from '../controllers/authController';
import productController from '../controllers/productController';

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(authController.restrictTo('seller'), productController.addProduct); // Only the seller can add a product
// router.route('/:')

export default router;
