import { Request } from 'express';
import { FilterQuery } from 'mongoose';
import { IUser } from '../models/userModel';

export interface AuthRequest extends Request {
  user?: IUser;
  userFilter?: FilterQuery<any>;
}

// // {
//     [x: string]: any;
//     id: ObjectId;
//     role: string;
//   };
