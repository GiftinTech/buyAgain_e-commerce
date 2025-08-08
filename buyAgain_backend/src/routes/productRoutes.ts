import express from 'express';
import authController from '../controllers/authController';
import productController from '../controllers/productController';

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    authController.protectRoute,
    authController.restrictTo('seller'),
    productController.addProduct,
  ); // Only the auth seller can add a product

router.route('/:id').get(productController.getOneProduct);

export default router;
