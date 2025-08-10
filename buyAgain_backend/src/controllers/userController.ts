import { NextFunction, Response } from 'express';
import User, { IUser } from '../models/userModel';
import factory from './controllerFactory';
// import catchAsync from '../utils/catchAsync';
// import AppError from '../utils/appError';
import { CustomRequest } from '../types';

const getMe = (req: CustomRequest, res: Response, next: NextFunction) => {
  req.params.id = req.user?.id;
  next();
};

const getAllUsers = factory.getAll<IUser>(User, 'users');

const getUser = factory.getOne<IUser>(User, 'users');

const addUser = factory.createOne<IUser>(User, 'user');

export default {
  getAllUsers,
  getUser,
  addUser,
  getMe,
};
