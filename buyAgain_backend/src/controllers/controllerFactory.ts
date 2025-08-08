import catchAsync from '../utils/catchAsync';
import APIFeatures from '../utils/apiFeatures'; 
import { Model, Document } from 'mongoose';

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
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination();

    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        [dataKey]: docs, // Use bracket notation to use the dynamic dataKey
      },
    });
  });

export default {
  getAll,
  createOne,
};