import express from 'express';
import authController from '../controllers/authController';
import productController from '../controllers/productController';
import imageUploadController from '../controllers/productImageUploadController';

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
  .route('/updateProduct/:id')
  .put(
    productController.getProductId,
    imageUploadController.uploadProductPhotos,
    imageUploadController.resizeProductPhotos,
    productController.updateProduct,
  )
  .patch(
    productController.getProductId,
    imageUploadController.uploadProductPhotos,
    imageUploadController.resizeProductPhotos,
    productController.updateProduct,
  );

router.route('/:id').delete(productController.deleteProduct);

export default router;
