import { NextFunction, Response } from 'express';

import { Model, Document, Query } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';
import { CustomRequest } from '../types';

const createOne = <T extends Document>(Model: Model<T>, dataKey: string) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        [dataKey]: newDoc,
      },
    });
  });

const getAll = <T extends Document>(Model: Model<T>, dataKey: string) =>
  catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Initialize filter as a simple object
    let filter = {};

    // Check if the user is a regular user and set the filter accordingly
    if (req.user && req.user.role === 'user') {
      filter = { user: req.user._id };
    }

    // check for productId
    if (req.params.productId)
      filter = { ...filter, product: req.params.productId };

    let query: Query<T[], T> = Model.find(filter) as Query<T[], T>;

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const data = await features.query;

    res.status(200).json({
      status: 'success',
      results: data.length,
      data: {
        [dataKey]: data,
      },
    });
  });

const getOne = <T extends Document>(
  Model: Model<T>,
  dataKey: string,
  popOptions?: { path: string; select: string },
) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const data = await query;

    if (!data) return next(new AppError(`No document found with that Id`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        [dataKey]: data,
      },
    });
  });

const updateOne = <T extends Document>(Model: Model<T>, dataKey: string) =>
  catchAsync(async (req: CustomRequest, res, next) => {
    const updatedData = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedData)
      return next(new AppError(`no document found with that Id`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        [dataKey]: updatedData,
      },
    });
  });

const deleteOne = <T extends Document>(Model: Model<T>, dataKey: string) =>
  catchAsync(async (req, res, next) => {
    const data = await Model.findByIdAndDelete(req.params.id);

    if (!data) return next(new AppError(`no document found with that Id`, 404));

    res.status(200).json({
      status: 'success',
      message: `document deleted successfully.`,
      data: null,
    });
  });

export default {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
};
