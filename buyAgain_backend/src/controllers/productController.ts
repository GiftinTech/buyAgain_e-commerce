import Product, { IProduct } from '../models/productModel'; 
import factory from './controllerFactory';

const getAllProducts = factory.getAll<IProduct>(Product, 'products');
const addProduct = factory.createOne<IProduct>(Product, 'product');

export default {
  getAllProducts,
  addProduct,
};