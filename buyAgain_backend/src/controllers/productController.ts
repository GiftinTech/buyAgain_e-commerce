import Product, { IProduct } from '../models/productModel';
import factory from './controllerFactory';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { CustomRequest } from '../types';

// Middleware to get product ID and attach to request
const getProductId = catchAsync(async (req: CustomRequest, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }
  req.product = product;
  next();
});

// Update product with image handling
const updateProduct = catchAsync(async (req: CustomRequest, res, next) => {
  // console.log('after line 18');
  const product = req.product;
  if (!product) {
    return next(new AppError('Product not found on request.', 404));
  }

  // console.log('BODY:', req.body);
  // console.log('FILE:', req.files);

  // Remove protected fields
  const { _id, id, createdAt, updatedAt, __v, ...updateBody } = req.body;

  // Handle images - merge existing with new if needed
  if (req.body.images) {
    // If client sends keepImages array, use those + new images
    if (req.body.keepImages && Array.isArray(req.body.keepImages)) {
      updateBody.images = [...req.body.keepImages, ...(req.body.images || [])];
    } else if (Array.isArray(product.images)) {
      // If no keepImages specified but we have existing images, keep them all
      updateBody.images = [...product.images, ...(req.body.images || [])];
    }
  }

  // Handle thumbnail - use new one if provided, otherwise keep existing
  if (!req.body.thumbnail && product.thumbnail) {
    updateBody.thumbnail = product.thumbnail;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateBody,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProduct) {
    return next(new AppError('No product found with that ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct,
    },
  });
});

// Factory functions
const getAllProducts = factory.getAll<IProduct>(Product, 'products');
const getProduct = factory.getOne<IProduct>(Product, 'products');
const addProduct = factory.createOne<IProduct>(Product, 'product');
const deleteProduct = factory.deleteOne<IProduct>(Product, 'product');

export default {
  getAllProducts,
  getProductId,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
};
