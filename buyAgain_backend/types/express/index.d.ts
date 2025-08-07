// src/types/express.d.ts
import { Request } from 'express';
import { IUser } from '../../src/models/userModel';

export interface AuthRequest extends Request {
  user?: IUser;
}
