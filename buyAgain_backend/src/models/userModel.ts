import crypto from 'crypto';
import { Types, Document, Model, Query, Schema, model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

interface CartItem {
  productId: Types.ObjectId;
  quantity: number;
}

interface IUser extends Document {
  name: string;
  email: string;
  role: 'user' | 'admin' | 'seller';
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshToken?: string;
  active: boolean;
  cart: CartItem[];

  changedPasswordAfter(JWTTimestamp: number): boolean;
  createPasswordResetToken(): string;
}

const cartItemSchema = new Schema<CartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    _id: false, // prevents Mongoose from creating _id for each cart item
  },
);

const userSchema = new Schema<IUser>({
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
  cart: [cartItemSchema],
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
});

// MIDDLEWARE
// middleware to hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // only hash if pwd was modified(changed)

  this.password = await bcrypt.hash(this.password, 12); // hash pwd with cost of 12. NB: the higher the cost, the higher the running time

  this.passwordConfirm = undefined; // Don't save confirm field in DB
  next();
});

// Set passwordChangedAt slightly in the past to prevent JWT issues
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// Filter out inactive users from all find queries
userSchema.pre(/^find/, function (this: Query<any, IUser>, next) {
  this.find({ active: { $ne: false } });
  next();
});

// METHODS
// Check if user changed password after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );

    return JWTTimestamp < changedTimestamp; // true means password was changed after token
  }

  return false; // Password not changed
};

// Generate password reset token and expiry
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex'); // Create raw reset token

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex'); // Save hashed token in DB

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins expiry

  return resetToken; // Send raw token via email/SMS/link
};

const User: Model<IUser> = model<IUser>('User', userSchema);

export default User;
