import {
  Schema,
  Types,
  Model,
  model,
  Query,
  Document,
  CallbackError,
} from 'mongoose';
import Product from './productModel';

// Define the IReview interface for embedded reviews
export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  review: string;
  rating: number;
  createdAt: Date;
}

// Interface for the Review Model with custom static methods
interface IReviewModel extends Model<IReview> {
  calcAverageRatings(productId: Types.ObjectId): Promise<void>;
}

// Defines the schema for a single review.
const reviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'A review must belong to a product.'],
    },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// PRE MW:  Populate user and product names on find queries
reviewSchema.pre<Query<IReview[], IReview>>(
  /^find/,
  function (next: (err?: CallbackError) => void) {
    this.populate({
      path: 'product',
      select: 'name', // Selects only the 'name' field of the product
    }).populate({
      path: 'user',
      select: 'name', // Selects only the 'name' field of the user
    });

    next();
  },
);

// STATIC METHOD: Calculate average ratings for a product
reviewSchema.statics.calcAverageRatings = async function (
  productId: Types.ObjectId,
): Promise<void> {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        nRating: { $sum: 1 }, // Count the number of ratings, sum + 1
        avgRating: { $avg: '$rating' }, // Calculate the average rating
      },
    },
  ]);

  if (stats.length > 0) {
    // Update the Product document with the calculated stats
    await Product.findByIdAndUpdate(productId, {
      ratingQuantity: stats[0].nRating,
      rating: stats[0].avgRating,
    });
  } else {
    // If no reviews exist for the product, reset ratings to default
    await Product.findByIdAndUpdate(productId, {
      ratingQuantity: 0,
      rating: 3.8, // Default rating
    });
  }
};

// POST MW: Call calcAverageRatings after saving a review
// `this` refers to the document instance after 'save' hook.
reviewSchema.post('save', function (this: IReview) {
  // `this.constructor` refers to the Model (ReviewModel in this case)
  return (this.constructor as IReviewModel).calcAverageRatings(this.product);
});

// PRE/POST MW for findOneAndUpdate/Delete: Update ratings after review changes:

// Pre-hook to get the document before it's updated/deleted
reviewSchema.pre<Query<IReview, IReview>>(
  /^findOneAnd/,
  async function (next: (err?: CallbackError) => void) {
    // `this.clone().findOne()` creates a new query to get the document
    // before the main query (update/delete) executes.
    // We store it on `this.r` for access in the post-hook.
    // The `Query<IReview, IReview>` type indicates `this` is a query for a single document.
    (this as any).r = await this.clone().findOne();
    next();
  },
);

// Post-hook to re-calculate average ratings using the document fetched in the pre-hook
reviewSchema.post<Query<IReview, IReview>>(
  /^findOneAnd/,
  async function (this: Query<IReview, IReview>) {
    // `this.r` (from the pre-hook) contains the document that was found/updated/deleted.
    // We cast `this` to `any` because `r` is a custom property added to the Query instance.
    if ((this as any).r) {
      // Call the static method on the model constructor from the retrieved document
      await ((this as any).r.constructor as IReviewModel).calcAverageRatings(
        (this as any).r.product,
      );
    }
  },
);

const Review: Model<IReview> = model<IReview, IReviewModel>(
  'Review',
  reviewSchema,
);

export default Review;
