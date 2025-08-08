import { Response, NextFunction } from 'express';

import Order, { IOrder } from '../models/orderModel';
import factory from './controllerFactory';
import { AuthRequest } from '../types';

// MW to set the filter for user-specific data
const setUserFilter = (req: AuthRequest, res: Response, next: NextFunction) => {
  // If the user is logged in, set a filter for their ID.
  req.filter = req.user ? { user: req.user._id } : {};
  next();
};

const createOrder = factory.createOne<IOrder>(Order, 'order');

const getAllOrders = factory.getAll<IOrder>(Order, 'orders');

const getOneOrder = factory.getOne<IOrder>(Order, 'order');

const updateOrder = factory.updateOne<IOrder>(Order, 'order');

const deleteOrder = factory.deleteOne<IOrder>(Order, 'order');

export default {
  setUserFilter,
  createOrder,
  getAllOrders,
  getOneOrder,
  updateOrder,
  deleteOrder,
};
