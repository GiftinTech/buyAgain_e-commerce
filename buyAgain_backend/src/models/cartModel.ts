import { Types, Schema, Document, model } from 'mongoose';

export interface CartDoc extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  thumbnail: string;
  discountPercentage: number;
}

const cartSchema = new Schema<CartDoc>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
cartSchema.virtual('total').get(function (this: CartDoc) {
  return this.price * this.quantity;
});

// Virtual for `discountedTotal` on CartItem.
cartSchema.virtual('discountedTotal').get(function (this: CartDoc) {
  const total = this.price * this.quantity;
  const discountAmount = (total * this.discountPercentage) / 100;
  return total - discountAmount;
});

const Cart = model('Cart', cartSchema);

export default Cart;
