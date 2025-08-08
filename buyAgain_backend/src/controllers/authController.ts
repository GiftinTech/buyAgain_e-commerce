import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { DecodedToken } from '../../types/token';
import { createSendToken, signToken } from '../utils/jwtHelpers';
import Email from '../utils/email';
import { AuthRequest } from '../../types/express';

const jwtSecret = process.env.JWT_SECRET as string;

if (!jwtSecret) throw new Error('ERROR:❌ jwtSecret not found');

// MW to assign user role for development testing
const assignRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    if (req.body.test_role && process.env.NODE_ENV === 'development')
      req.body.role = req.body.test_role;
    else req.body.role = 'user';

    delete req.body.test_role;

    next();
  },
);

// MW to check if auth/logged in user is admin
const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Access denied: You are not an admin.', 403));
  }
};

// MW for admin to delegate roles
const adminDelegateRole = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // i. get user id and newRole
    const { id } = req.params;
    const { newRole } = req.body;

    // ii. validate that the new role is one of the allowed roles
    const validRoles = ['user', 'admin', 'seller'];
    if (!validRoles.includes(newRole))
      return next(new AppError('Invalid role specified.', 400));

    // iii. find user and update their role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      {
        new: true, // return the updated doc
        runValidators: true, // run userModel.role validators
      },
    );

    // iv. check if user was found and updated
    if (!updatedUser) return next(new AppError('User not found', 404));

    // v. send response
    createSendToken(updatedUser, 200, req, res);
  },
);

// signup new customers
const signup = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });

    // send welcome email
    const url = `${req.protocol}://${req.get('host')}/api/v1/users/me`;
    console.log(url);
    const email = new Email(newUser, url);
    await email.sendWelcome(req.body.emailTemplate);

    createSendToken(newUser, 201, req, res);
  },
);

// login customers
const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const { email, password } = req.body;

    //  i. check if email & pwd exist
    if (!email || !password)
      return next(new AppError('Please provide email or password.', 400));

    // ii. check if user exist && pwd correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password)))
      return next(new AppError('Incorrect email or password.', 401));

    /// iii. if everything is ok, send token to client
    createSendToken(user, 200, req, res);
  },
);

// refresh token handler
// @desc    Issue a new access token using a valid refresh token
// @access  Public (but requires refreshToken cookie)
const refreshToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1. Get refresh token from cookies
    const token = req.cookies.refreshToken;
    if (!token) return next(new AppError('No refresh token provided', 401));

    // 2. Verify token and extract payload
    let payload: JwtPayload;
    try {
      payload = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as JwtPayload;
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 403));
    }

    // 3. Check if user still exists
    const user = await User.findById(payload.id);
    if (!user) return next(new AppError('User not found', 404));

    // 4. Issue new access token
    const newAccessToken = signToken(user._id);

    console.log(newAccessToken);

    // 5. Send the new access token in response
    res.status(200).json({
      status: 'success',
      accessToken: newAccessToken,
    });
  },
);

// logout customers
const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({
      status: 'success',
      message: 'You have been logged out successfully.',
    });
  },
);

// protected routes
const protectRoute = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    // i. get token and check if it's in the req.headers
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    )
      token = req.headers.authorization.split(' ')[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;

    // type-guard to check if the token is valid
    if (!token)
      return next(
        new AppError('You are not logged in. Please login to get access.', 401),
      );

    // ii. Verify & decode the JWT token async using the secret
    const decoded = await new Promise<DecodedToken>((res, rej) => {
      jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
        if (err) return rej(err);
        res(decoded as DecodedToken);
      });
    });

    // iii. check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser)
      return next(new AppError("The token's user no longer exist.", 401));

    // iv. check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat))
      return next(
        new AppError(
          'You recently changed your password! Please login again.',
          401,
        ),
      );

    // v. grant access if everything is ok
    req.user = currentUser;
    next();
  },
);

// MW to restrict route access to specific user roles
const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user?.role))
      return next(
        new AppError('You do not have permission to perform this action.', 403),
      );

    next();
  };
};

// forgot password handler
const forgotPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // i. get user based on POSTED email
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return next(
        new AppError('There is no user with this email address.', 404),
      );

    // ii. generate random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // iii. send the resetToken to user's email
    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
      // send resetURL user's email
      const email = new Email(user, resetURL);
      // use this for postman testing
      await email.sendPasswordReset(
        `Hello, ${user.name}. Click <a href=\"${resetURL}\">here</a> to reset your password.`,
      );

      // send this to frontend
      //await email.sendPasswordReset(req.body.emailTemplate);

      res.status(200).json({
        status: 'success',
        message: 'Token sent to email',
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          'There was an error sending the email. Please try again later.',
          500,
        ),
      );
    }
  },
);

// resetPAssword handler
const resetPassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    // i. get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // ii. if token hasn't expired & there's user, set pwd
    if (!user)
      return next(new AppError('Token is invalid or has expired.', 400));

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // iii. update changedPasswordAt prop for the user
    // changedPasswordAt is automatically updated in userModel pre-save hook

    // iv. log user in, send JWT
    createSendToken(user, 200, req, res);
  },
);

// update password handler
const updatePassword = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
    // i. get user from collection
    const user = await User.findById(req.user?.id).select('+password');

    // Check if user was found
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // ii. check if POSTED current password is correct
    const isCorrect = await user.correctPassword(
      req.body.passwordCurrent,
      user.password,
    );

    if (!isCorrect)
      return next(new AppError('Your current password is incorrect', 401));

    // iii. if pwd correct, update pwd
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save(); // triggers pre-save middleware like hashing

    // iv. log user in, send JWT
    createSendToken(user, 200, req, res);
  },
);

export default {
  assignRole,
  requireAdmin,
  adminDelegateRole,
  signup,
  login,
  refreshToken,
  logout,
  protectRoute,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
};
