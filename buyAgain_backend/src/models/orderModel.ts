import { model, Schema, Types, Document, CallbackError, Query } from 'mongoose';

// Define the IOrderItems interface
export interface IOrderItems {
  product: Types.ObjectId;
  quantity: number;
  priceAtTimeOfOrder: number;
  thumbnail: string;
}

const orderItemsSchema = new Schema<IOrderItems>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  priceAtTimeOfOrder: {
    type: Number,
    required: true,
  },
  thumbnail: String,
});

// Define the shipping address type
export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

// Corrected IOrder interface
export interface IOrder extends Document {
  user: Types.ObjectId;
  paid: boolean;
  createdAt: Date;
  status: string;
  shippingAddress: IShippingAddress;
  orderItems: Types.DocumentArray<IOrderItems>;
}

// Corrected order schema
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user!'],
    },
    paid: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    orderItems: [orderItemsSchema],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

orderSchema.virtual('totalPrice').get(function () {
  if (!this.orderItems) return 0;
  return this.orderItems.reduce((total, item) => {
    return total + item.priceAtTimeOfOrder * item.quantity;
  }, 0);
});

// orderSchema.pre(/^find/, function (this: Query<any, any>, next: Function) {
//   this.populate('user').populate({
//     path: 'product',
//     select: 'name',
//   });
//   next();
// });

const Order = model<IOrder>('Order', orderSchema);

export default Order;
