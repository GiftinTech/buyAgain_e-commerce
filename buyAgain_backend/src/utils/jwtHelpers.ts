import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { IUser } from '../models/userModel';

const jwtSecret = process.env.JWT_SECRET as string;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
// Ensure JWT config variables are present, else throw server error
if (!jwtSecret || !jwtExpiresIn)
  throw new Error(
    'JWT_SECRET or JWT_EXPIRES_IN is not defined in environment variables',
  );

// Helper to sign JWT token with user ID
export const signToken = (id: string | number): string => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
};

// Sends token in cookie and response, hides password from output
export const createSendToken = (
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response,
) => {
  const token = signToken(user._id);

  // Convert cookie expiry (in days) to milliseconds
  const jwtCookieExpiresIn: number = Number(process.env.JWT_COOKIE_EXPIRES_IN);

  // Set token as HTTP-only cookie
  res.cookie('jwt', token, {
    expires: new Date(Date.now() + jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
    httpOnly: true, // Cannot be accessed via JavaScript
    secure: process.env.NODE_ENV === 'production',
  });

  // Hide pwd from output
  user.password = undefined as any;

  // Send response with token and user data
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
