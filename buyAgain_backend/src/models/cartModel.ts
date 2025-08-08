import { Types, Schema, Document } from 'mongoose';

export interface CartItemDoc extends Document {
  product: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  discountPercentage: number;
}

const cartItemSchema = new Schema<CartItemDoc>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    thumbnail: String,
    discountPercentage: Number,
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for `total` on CartItem.
// It will be calculated when the document is retrieved.
cartItemSchema.virtual('total').get(function (this: CartItemDoc) {
  return this.price * this.quantity;
});

// Virtual for `discountedTotal` on CartItem.
cartItemSchema.virtual('discountedTotal').get(function (this: CartItemDoc) {
  const total = this.price * this.quantity;
  const discountAmount = (total * this.discountPercentage) / 100;
  return total - discountAmount;
});

export default cartItemSchema;
