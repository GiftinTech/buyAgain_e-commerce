import { Response, NextFunction } from 'express';
import { IReview } from '../models/reviewModel';

import Review from '../models/reviewModel';
// const catchAsync = require('../utils/catchAsync');
import factory from './controllerFactory';
import { AuthRequest } from '../types';

const getAllReview = factory.getAll<IReview>(Review, 'review');
const getReview = factory.getOne<IReview>(Review, 'review');
const createReview = factory.createOne<IReview>(Review, 'review');
const updateReview = factory.updateOne<IReview>(Review, 'review');
const deleteReview = factory.deleteOne<IReview>(Review, 'review');

const setProductAndUserIds = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user?.id;
  next();
};

export default {
  getAllReview,
  getReview,
  setProductAndUserIds,
  createReview,
  updateReview,
  deleteReview,
};
