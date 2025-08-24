import { NextFunction, Response } from 'express';
import User, { IUser } from '../models/userModel';
import factory from './controllerFactory';
// import catchAsync from '../utils/catchAsync';
// import AppError from '../utils/appError';
import { CustomRequest } from '../types';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

const getMe = (req: CustomRequest, res: Response, next: NextFunction) => {
  req.params.id = req.user?.id;
  next();
};

const getAllUsers = factory.getAll<IUser>(User, 'users');

const getUser = factory.getOne<IUser>(User, 'users');

const addUser = factory.createOne<IUser>(User, 'user');
const updateUser = factory.updateOne<IUser>(User, 'user');

const filterObj = (obj: any, ...allowedFields: string[]) => {
  if (!obj || typeof obj !== 'object') return {}; // prevent crash
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

const updateMe = catchAsync(async (req: CustomRequest, res, next) => {
  // check if the body isnt empty
  if (!req.body) req.body = {};

  // Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You cannot update your password, use /forgot-password to reset it.',
        400,
      ),
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user?.id, filteredBody, {
    new: true,
    runValidators: true,
  }).select('-__v');

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export default {
  getAllUsers,
  getUser,
  addUser,
  getMe,
  updateMe,
  updateUser,
};
