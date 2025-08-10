import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { IUser } from '../models/userModel';
import { IProduct } from './../models/productModel';

// Keep all default Express.Request props and add ours
export interface CustomRequest<
  P = any,
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: IUser;
  userFilter?: FilterQuery<any>;
  product?: IProduct;
  thumbnail?: string;
  images?: string[];
}
