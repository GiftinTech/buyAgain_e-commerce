import Product, { IProduct } from '../models/productModel';
import factory from './controllerFactory';

import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { CustomRequest } from '../types';

// product handlers
const getProductId = catchAsync(async (req: CustomRequest, res, next) => {
  // Fetch the product document from the database
  const product = await Product.findById(req.params.id);

  // Handle case where product is not found
  if (!product) {
    return next(new AppError('No product found with that ID', 404));
  }

  res.locals.product = product;
  req.product = product;
  next();
});

const updateProduct = catchAsync(async (req: CustomRequest, res, next) => {
  // Get the existing product from the request (set by getProduct middleware)
  const product = req.product;
  if (!product) {
    return next(new AppError('Product not found on request.', 404));
  }

  // Build updated data object
  const updatedData = {
    ...product, // start with existing product data
    ...req.body,
    images: [
      ...(Array.isArray(product.images) ? product.images : []),
      ...((req.body.images as string[]) || []),
    ],
  };

  // Update the product in the database
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updatedData,
    {
      new: true, // return the updated document
      runValidators: true, // enforce schema validation
    },
  );

  // Handle case where product ID is invalid or not found
  if (!updatedProduct) {
    return next(new AppError('No product found with that ID.', 404));
  }

  // Send updated product back to client
  res.status(200).json({
    status: 'success',
    data: {
      product: updatedProduct,
    },
  });
});

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
