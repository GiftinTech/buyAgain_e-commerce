import { model, Schema, Types, Document } from 'mongoose';

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
  displayId: string;
  paid: boolean;
  createdAt: Date;
  status: string;
  stripeSessionId: string;
  shippingAddress: IShippingAddress;
  orderItems: Types.DocumentArray<IOrderItems>;
  paymentIntentId: string;
}

// Corrected order schema
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user!'],
    },
    displayId: {
      type: String,
      unique: true,
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
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'failed',
      ],

      default: 'pending',
    },
    stripeSessionId: {
      type: String,
      unique: true,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, required: true },
    },
    orderItems: [orderItemsSchema],
    paymentIntentId: {
      type: String,
      unique: true,
      sparse: true, // Allows null or undefined values to be unique
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// unique and user friendly order Id display
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await (this.constructor as any).countDocuments();
    this.displayId = `ORD-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

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
