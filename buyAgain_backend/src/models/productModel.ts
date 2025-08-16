// src/models/productModel.ts
import { Schema, Types, Model, model, Document } from 'mongoose';

import slugify from 'slugify';

import AppError from '../utils/appError';

// Define the interface for the meta sub-document
export interface IProductMeta {
  createdAt: Date;
  updatedAt: Date;
  barcode?: string;
  qrCode?: string;
}

// Define the IProduct interface, ensuring it extends Document
export interface IProduct extends Document {
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  ratingQuantity: number;
  stock?: number;
  tags?: string[];
  brand?: string;
  sku?: string;
  weight?: number;
  dimensions?: {
    weight?: number;
    height?: number;
    depth?: number;
  };
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy: String;
  meta: IProductMeta;
  images: [String];
  thumbnail: String;
}

const productSchema = new Schema<IProduct>(
  {
    slug: String,
    name: {
      type: String,
      required: [true, 'A product must be named.'],
      unique: true,
      trim: true,
      maxlength: [
        70,
        'A product must have less than or equal to 70 characters.',
      ],
      minlength: [5, 'A product must have more than or equal to 5 characters.'],
    },
    description: {
      type: String,
      // required: [true, 'Please give a product description.'],
      trim: true,
      maxlength: [
        400,
        'A product description must have less than or equal to 400 characters.',
      ],
      minlength: [
        50,
        'A product description must have more than or equal to 50 characters.',
      ],
    },
    category: String,
    price: {
      type: Number,
      required: [true, 'A product must have a price.'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    ratingQuantity: {
      type: Number,
      default: 0,
    },
    stock: Number,
    tags: [String],
    brand: String,
    sku: String,
    weight: Number,
    dimensions: {
      weight: Number,
      height: Number,
      depth: Number,
    },
    warrantyInformation: String,
    shippingInformation: String,
    availabilityStatus: String,
    returnPolicy: String,
    meta: {
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      barcode: String,
      qrCode: String,
    },
    images: [String],
    thumbnail: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

productSchema.index({ price: 1, rating: -1, discountPercentage: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', description: 'text' });

productSchema.pre<IProduct>('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

productSchema.pre('save', function (next) {
  // Check if the discountPercentage exists and is a valid number
  if (this.discountPercentage && this.discountPercentage > 0) {
    if (this.discountPercentage >= this.price) {
      next(
        new AppError(
          'Discount percentage must be less than the regular price.',
          404,
        ),
      );
    }
  }
  next();
});

const Product = model<IProduct>('Product', productSchema);

export default Product;
