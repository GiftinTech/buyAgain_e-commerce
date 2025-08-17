import express from 'express';
import authController from '../controllers/authController';
import productController from '../controllers/productController';
import productImageUploadController from '../controllers/productImageUploadController';
import reviewRouter from './reviewRoutes';

const router = express.Router();

// Unprotected and Unrestricted Routes
router.use('/:productId/reviews', reviewRouter);

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
    productImageUploadController.uploadProductPhotos,
    productImageUploadController.processProductPhotos,
    productController.updateProduct,
  )
  .patch(
    (req, res, next) => {
      console.log('Inside get product Id');
      next();
    },
    productController.getProductId,
    (req, res, next) => {
      console.log('Inside uploadProductPhotos');
      next();
    },
    productImageUploadController.uploadProductPhotos,
    productImageUploadController.processProductPhotos,
    productController.updateProduct,
  );

router.route('/:id').delete(productController.deleteProduct);

export default router;
