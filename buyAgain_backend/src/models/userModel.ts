import mongoose, { Document, Model, Schema } from 'mongoose';
import validator from 'validator';

interface IUser extends Document {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'seller';
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordExpires?: Date;
  active: boolean;
}

const userSchema = new mongoose.Schema<IUser>({
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
  role: {
    type: String,
    enum: ['user', 'admin', 'seller'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please enter a strong password.'],
    validate: {
      validator: function (val: string) {
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
      // NB: this only works on Create and save reqs
      validator: function (this: IUser, el: string): boolean {
        return el === this.password;
      },
      message: 'Your passwords do not match.',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
