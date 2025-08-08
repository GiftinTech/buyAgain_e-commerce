import User, { IUser } from '../models/userModel';
import factory from './controllerFactory';

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next()
}

const getAllUsers = factory.getAll<IUser>(User, 'users', '-cart');
const getUser = factory.getOne<IUser>(User, 'users', {
  path: 'cart',
  select: 'name price quantity',
});

const addUser = factory.createOne<IUser>(User, 'user');

export default {
  getAllUsers,
  getUser,
  addUser,
  getMe,
};
