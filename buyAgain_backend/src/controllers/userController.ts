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

  // allow password data only if an email is also being updated.
  if (req.body.password && !req.body.email) {
    return next(
      new AppError(
        'Password cannot be updated from this route unless the email is also being changed.',
        400,
      ),
    );
  }

  // Validate the password if the email is being changed
  if (req.body.email) {
    const user = await User.findById(req.user?.id).select('+password');

    if (!req.body.password) {
      return next(new AppError('Password is required to change email.', 400));
    }

    const isPasswordCorrect = await user.correctPassword(
      req.body.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect password.', 401));
    }
    // Remove the password from the body so it's not accidentally saved
    delete req.body.password;
  }

  // Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email', 'photo');

  // ensure at least one valid field is being sent
  if (Object.keys(filteredBody).length === 0) {
    return next(new AppError('Please provide data to update.', 400));
  }

  // Update user document
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
