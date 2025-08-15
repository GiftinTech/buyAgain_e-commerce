import { Response, NextFunction } from 'express';

import Cart from '../models/cartModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import mongoose from 'mongoose';
import { IProduct } from '../models/productModel';

const getUserCart = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Fetch the cart with populated product details
    const cart = await Cart.findOne({ user: userId })
      .populate<{
        items: Array<{ product: IProduct; quantity: number }>;
      }>('items.product')
      .select('items');

    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found.',
      });
    }

    // Calculate totals
    const totals = cart.items.reduce(
      (acc, item) => {
        const product = item.product;
        const price = product.price;
        const discount = product.discountPercentage;
        const quantity = item.quantity;

        const discountedPrice = price * (1 - discount / 100);

        acc.total += price * quantity;
        acc.discountedTotal += discountedPrice * quantity;
        acc.totalProducts += 1;
        acc.totalQuantity += quantity;

        return acc;
      },
      {
        total: 0,
        discountedTotal: 0,
        totalProducts: 0,
        totalQuantity: 0,
      },
    );

    res.status(200).json({
      status: 'success',
      results: cart.items.length,
      data: {
        cartItems: cart.items,
        cartTotals: totals,
      },
    });
  },
);

const addToCart = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // 1. Get user and product details from the request body.
    const userId = req.user._id;
    const { product, quantity } = req.body;

    // Validate incoming product ID
    if (!product || !mongoose.Types.ObjectId.isValid(product)) {
      return next(new AppError('Invalid product ID provided.', 400));
    }

    // 2. Find the user's cart.
    let userCart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product',
      select: '-__v',
    });

    // 3. If no cart exists for the user, create a new one.
    if (!userCart) {
      userCart = await Cart.create({
        user: userId,
        items: [{ product: product, quantity }],
      });

      return res.status(201).json({
        status: 'success',
        message: 'New cart created and item added successfully.',
        data: { cart: userCart },
      });
    }

    // 4. Check if the product is already in the cart.
    const existingItem = userCart.items.find(
      (item: any) => item.product._id.toString() === product,
    );

    if (existingItem) {
      // 5. If the item exists, update its quantity.
      existingItem.quantity += quantity;
    } else {
      // 6. If the item doesn't exist, add it as a new entry to the cart's items array.
      userCart.items.push({
        _id: new mongoose.Types.ObjectId(),
        product: product,
        quantity,
      });
    }

    // 7. Save the updated cart document to the database.
    await userCart.save();

    // 8. Send a success response with the updated cart.
    res.status(200).json({
      status: 'success',
      message: 'Item added to cart or quantity updated successfully.',
      data: {
        cart: userCart,
      },
    });
  },
);

const updateCartQuantity = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // 1. Get user ID and the item ID from the request
    // console.log('User:', req.user);
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // 2. Validate the incoming data
    if (!quantity || quantity < 1) {
      return next(new AppError('Quantity must be a positive number.', 400));
    }

    const itemObjectId = new mongoose.Types.ObjectId(`${itemId}`);

    // 3. Find the cart and atomically update the quantity of the specific item
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId, 'items._id': itemObjectId }, // Find the document
      { $set: { 'items.$.quantity': quantity } }, // update the quantity of the matched item
      { new: true, runValidators: true }, // Return the updated document and run schema validators
    );

    // 4. Handle cases where the cart or item is not found
    if (!updatedCart) {
      return next(
        new AppError(
          'Item not found in cart or no cart exists for this user.',
          404,
        ),
      );
    }

    // 5. Send a success response
    res.status(200).json({
      status: 'success',
      message: 'Cart item quantity updated successfully.',
      data: {
        cart: updatedCart,
      },
    });
  },
);

const deleteCartItem = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    // i. Get user ID and item ID from the request.
    const userId = req.user._id;
    const { itemId } = req.params;

    const itemObjectId = new mongoose.Types.ObjectId(`${itemId}`);

    // ii. Find the user's cart and specific item within it, and remove the item.
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId, 'items._id': itemObjectId },
      { $pull: { items: { _id: itemObjectId } } },
      { new: true },
    );

    // iii. Check the result of the database op.
    if (!updatedCart) {
      return next(
        new AppError(
          'Item not found in cart or no cart exists for this user.',
          404,
        ),
      );
    }

    // iv. Send a success response with the updated cart.
    res.status(200).json({
      status: 'success',
      message: 'Item removed successfully.',
      data: {
        cart: updatedCart,
      },
    });
  },
); // Remove a specific cart item

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
  updateCartQuantity,
  deleteCartItem,
  clearUserCart,
};
