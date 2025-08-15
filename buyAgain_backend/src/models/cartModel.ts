import { Types, Schema, Document, model } from 'mongoose';
import { IProduct } from './productModel';

export interface ICartItem {
  _id: Types.ObjectId;
  product: Types.ObjectId | IProduct;
  quantity: number;
}

export interface ICart extends Document {
  user: Types.ObjectId;
  items: ICartItem[];
}

const cartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true, min: 1, default: 1 },
      },
    ],
  },
  {
    id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Cart = model<ICart>('Cart', cartSchema);

export default Cart;
