import { Model, Document, Query } from 'mongoose';
import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures';
import AppError from '../utils/appError';

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

const getAll = <T extends Document>(
  Model: Model<T>,
  dataKey: string,
  selectOpt?: string,
) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    let query: Query<T[], T> = Model.find(filter) as Query<T[], T>;

    if (selectOpt) query = query.select(selectOpt);

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

    const dataKey = await query;

    if (!dataKey)
      return next(new AppError(`No ${dataKey} found with that Id`, 404));

    res.status(200).json({
      status: 'success',
      data: {
        dataKey,
      },
    });
  });

export default {
  getAll,
  getOne,
  createOne,
};
