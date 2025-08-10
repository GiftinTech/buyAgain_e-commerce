import { Types, Schema, Document, model, Model } from 'mongoose';

export interface ICart extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  quantity: number;
}

const cartSchema = new Schema<ICart>(
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
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  {
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Cart: Model<ICart> = model<ICart>('Cart', cartSchema);

export default Cart;
