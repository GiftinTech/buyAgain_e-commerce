import crypto from 'crypto';
import { Document, Model, Query, Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  role: 'user' | 'admin' | 'seller';
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  active: boolean;

  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
  correctPassword(candidatePwd: string, userPwd: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please tell us your name.'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email.'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'seller'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please enter a strong password.'],
      validate: {
        validator: function (val: string): boolean {
          return validator.isStrongPassword(val, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          'Password must be 8 characters or more: include uppercase, lowercase, number and symbol.',
      },
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password.'],
      validate: {
        validator: function (this: IUser, el: string): boolean {
          return el === this.password;
        },
        message: 'Your passwords do not match.',
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: {
      type: String,
      select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: false }, // omit all virtuals, including the id
    toObject: { virtuals: false },
  },
);

// MIDDLEWARE
// middleware to hash password before saving to DB
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

// Set passwordChangedAt slightly in the past to prevent JWT issues
userSchema.pre<IUser>('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Filter out inactive users from all find queries
userSchema.pre<Query<any, IUser>>(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// METHODS
// Compares the entered password with the user's hashed password in the DB
userSchema.methods.correctPassword = async function (
  candidatePwd: string,
  userPwd: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePwd, userPwd);
};

// Check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number,
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// Generate password reset token and expiry
userSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
