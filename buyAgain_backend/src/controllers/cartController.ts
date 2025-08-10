import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import Cart, { ICart } from '../models/cartModel';
import factory from './controllerFactory';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const getUserCart = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Aggregation pipeline to calculate totals
    const totalsPromise = Cart.aggregate([
      { $match: { user: userId } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $multiply: ['$quantity', '$productDetails.price'] },
          },
          discountedTotal: {
            $sum: {
              $multiply: [
                '$quantity',
                {
                  $multiply: [
                    '$productDetails.price',
                    {
                      $subtract: [
                        1,
                        {
                          $divide: ['$productDetails.discountPercentage', 100],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    // Find and populate the cart items
    const cartItemsPromise = Cart.find({ user: userId }).select('-__v').populate({
      path: 'product',
      select: 'name price discountPercentage thumbnail',
    });

    // Execute both queries in parallel for efficiency
    const [totals, cartItems] = await Promise.all([
      totalsPromise,
      cartItemsPromise,
    ]);

    const cartTotals = totals[0] || {
      total: 0,
      discountedTotal: 0,
      totalProducts: 0,
      totalQuantity: 0,
    };

    res.status(200).json({
      status: 'success',
      results: cartItems.length,
      data: {
        cartItems,
        cartTotals,
      },
    });
  },
);

export const updateCartQuantity = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Check if req.body exists and is an object
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({
      status: 'fail',
      message: 'Request body must be a valid object.',
    });
  }

  // Define a new object to hold only the allowed fields
  const allowedUpdates: { quantity?: number } = {};

  // Check if 'quantity' is present in the request body
  if (req.body.quantity) {
    // Check if the 'quantity' is a valid number
    if (typeof req.body.quantity !== 'number' || req.body.quantity <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quantity must be a positive number.',
      });
    }
    // If valid, assign it to the new object
    allowedUpdates.quantity = req.body.quantity;
  } else {
    // If 'quantity' is not present, no updates can be made
    return res.status(400).json({
      status: 'fail',
      message: 'Only the "quantity" field can be updated.',
    });
  }

  // Replace the original request body with the sanitized one
  req.body = allowedUpdates;

  // Proceed to next MW
  next();
};

const addToCart = factory.createOne<ICart>(Cart, 'cart');

const updateCartItem = factory.updateOne<ICart>(Cart, 'cart');

const deleteCartItem = factory.deleteOne<ICart>(Cart, 'cart'); // Remove a specific cart item

const clearUserCart = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const cart = await Cart.deleteMany();

    if (!cart) return next(new AppError('No cart found with this Id', 404));

    res.status(200).json({
      status: 'success',
      message: 'Cart deleted successfully.',
      data: null,
    });
  },
); // Clear the entire cart for a user

export default {
  addToCart,
  getUserCart,
  updateCartItem,
  updateCartQuantity,
  deleteCartItem,
  clearUserCart,
};
