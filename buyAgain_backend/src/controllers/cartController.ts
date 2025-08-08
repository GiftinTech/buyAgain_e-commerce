import { Request, Response, NextFunction } from 'express';

import Cart, { ICart } from '../models/cartModel';
import factory from './controllerFactory';

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

const createCart = factory.createOne<ICart>(Cart, 'cart');

const getAllCarts = factory.getAll<ICart>(Cart, 'carts');

const getOneCart = factory.getOne<ICart>(Cart, 'cart'); // needed?

const updateCart = factory.updateOne<ICart>(Cart, 'cart');

const deleteCart = factory.deleteOne<ICart>(Cart, 'cart');

export default {
  createCart,
  getAllCarts,
  getOneCart,
  updateCart,
  updateCartQuantity,
  deleteCart,
};
