import express from 'express';
import authController from '../controllers/authController';
import productController from '../controllers/productController';

const router = express.Router();

// Unprotected and Unrestricted Routes
router
  .route('/')
  .get(productController.getAllProducts)
router
  .route('/:id')
  .get(productController.getOneProduct)


// Protected and Restricted Routes
router.use(
  authController.protectRoute,
  authController.restrictTo('seller', 'admin'),
);

router.route('/').post(productController.addProduct);
router.route('/:id').put(productController.updateProduct).patch(productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
