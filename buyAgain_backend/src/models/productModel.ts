// src/models/productModel.ts
import { Schema, Types, Model, model, Document } from 'mongoose';
import slugify from 'slugify';
import reviewSchema, { IReview } from './reviewModel';

// Define the IProduct interface, ensuring it extends Document
export interface IProduct extends Document {
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  discountPercentage?: number;
  rating: number;
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
  reviews: Types.DocumentArray<IReview>;
  returnPolicy: String;
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
      minlength: [
        20,
        'A product must have more than or equal to 20 characters.',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please give a product description.'],
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
      validate: {
        validator: function (this: IProduct, val: number): boolean {
          return val < this.price;
        },
        message: 'Discount price {{VALUE}} must be below the regular price.',
      },
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10,
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
    reviews: [reviewSchema],
    returnPolicy: String,
    images: [String],
    thumbnail: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  },
);

productSchema.index({ price: 1, rating: -1, discountPercentage: -1 }); // Corrected discountedPercentage
productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', description: 'text' });

productSchema.pre<IProduct>('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = model<IProduct>('Product', productSchema);

export default Product;
