import Product, { IProduct } from '../models/productModel';
import factory from './controllerFactory';

const getAllProducts = factory.getAll<IProduct>(
  Product,
  'products',
  '-reviews',
); 

const getOneProduct = factory.getOne<IProduct>(Product, 'products', {
  path: 'reviews.user',
  select: 'name _id',
});

const addProduct = factory.createOne<IProduct>(Product, 'product');

const updateProduct = factory.createOne<IProduct>(Product, 'product');

const deleteProduct = factory.createOne<IProduct>(Product, 'product');

export default {
  getAllProducts,
  getOneProduct,
  addProduct,
  updateProduct,
  deleteProduct
};
