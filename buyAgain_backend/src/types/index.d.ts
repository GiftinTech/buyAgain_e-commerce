import { Request } from 'express';
import { IUser } from '../models/userModel';

export interface AuthRequest extends Request {
  user?: IUser;
  filter?: { user: ObjectId } | {};
}
