import Order, { IOrder } from '../models/orderModel';
import factory from './controllerFactory';

// MW to set the filter for user-specific data
const setUserFilter = (req, res, next) => {
  // If the user is logged in, set a filter for their ID.
  if (req.user) {
    req.filter = { user: req.user.id };
  }
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
