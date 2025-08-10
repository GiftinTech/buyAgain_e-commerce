import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { IUser } from '../models/userModel';
import { IProduct } from './../models/productModel';

// Keep all default Request props and add your custom ones
export interface CustomRequest extends Request<Record<string, any>, any, any> {
  user?: IUser;
  userFilter?: FilterQuery<any>;
  product?: IProduct;
  thumbnail?: string;
  images?: string[];
}
