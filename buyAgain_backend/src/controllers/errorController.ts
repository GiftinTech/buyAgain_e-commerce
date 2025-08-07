import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';

// Handles Mongoose "CastError" (e.g., invalid ObjectId)

const handleCastErrorDB = (err: any): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handles duplicate field errors in MongoDB (e.g., unique field conflicts)

const handleDuplicateFieldsDB = (err: any): AppError => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

// Handles Mongoose validation errors (e.g., missing required fields)

const handleValidationError = (err: any): AppError => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// Handles invalid JWT error

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

//Handles expired JWT error

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired. Please log in again.', 401);

// Sends detailed error in development mode

const sendErrorDev = (err: any, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err, // Full error object
    message: err.message,
    stack: err.stack, // Stack trace for debugging
  });
};

// Sends clean error response in production

const sendErrorProd = (err: any, res: Response): void => {
  // For known, trusted (operational) errors, show the message
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // For programming or unknown errors, hide details
    console.error('ERROR 💥', err); // Log internally
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong.',
    });
  }
};

//  Global error handler middleware (registered in app.ts)

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Set default values
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development mode: send full error
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);

    // Production mode: sanitize output
  } else if (process.env.NODE_ENV === 'production') {
    // clone the error to avoid mutation
    let error = Object.create(Object.getPrototypeOf(err));
    Object.getOwnPropertyNames(err).forEach((key) => {
      (error as any)[key] = err[key];
    });

    // Handle known error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send final response
    sendErrorProd(error, res);
  }

  next();
};

export default globalErrorHandler;
