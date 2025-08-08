import { Schema, Types } from 'mongoose';

// Define the IReview interface for embedded reviews
export interface IReview {
  user: Types.ObjectId;
  review: string;
  rating: number;
  createdAt: Date;
}

// Defines the schema for a single review.
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user.'],
    },
    review: {
      type: String,
      required: [true, 'A review cannot be empty'],
      trim: true,
      maxlength: [
        200,
        'A product review must have less than or equal to 200 characters.',
      ],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    _id: false,
    toJSON: { virtuals: true }, // Ensure virtuals are included if you add them
    toObject: { virtuals: true },
  },
);

export default reviewSchema;
