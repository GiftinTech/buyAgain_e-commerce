import express from 'express';
import authController from '../controllers/authController';
import productController from '../controllers/productController';

const router = express.Router();

// Unprotected and Unrestricted Routes
router.route('/').get(productController.getAllProducts);
router.route('/:id').get(productController.getProduct);

// Protected and Restricted Routes
router.use(
  authController.protectRoute,
  authController.restrictTo('seller', 'admin'),
);

router.route('/addProduct').post(productController.addProduct);

router
  .route('/uploadPhoto/:id')
  .put(
    productController.getProduct,
    productController.uploadProductPhotos,
    productController.resizeProductPhotos,
    productController.updateProduct,
  )
  .patch(
    productController.getProduct,
    productController.uploadProductPhotos,
    productController.resizeProductPhotos,
    productController.updateProduct,
  );

router.route('/:id').delete(productController.deleteProduct);

export default router;
