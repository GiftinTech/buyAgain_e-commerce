import { Request } from 'express';
import { Multer } from 'multer';
import { FilterQuery } from 'mongoose';
import { IUser } from '../models/userModel';
import { IProduct } from './../models/productModel';

export interface CustomRequest extends Request {
  user?: IUser;
  userFilter?: FilterQuery<any>;
  product?: IProduct;
  thumbnail?: string;
  images?: string[];
}

// // {
//     [x: string]: any;
//     id: ObjectId;
//     role: string;
//   };
