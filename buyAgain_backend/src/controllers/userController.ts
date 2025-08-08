import User, { IUser } from '../models/userModel';
import factory from './controllerFactory';

const getAllUsers = factory.getAll<IUser>(User, 'users', '-cart');
const getOneUser = factory.getOne<IUser>(User, 'users', {
  path: 'cart',
  select: 'name price quantity',
});
const addUser = factory.createOne<IUser>(User, 'user');

export default {
  getAllUsers,
  getOneUser,
  addUser,
};
