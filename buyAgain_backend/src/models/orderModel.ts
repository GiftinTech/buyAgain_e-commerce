import { model, Schema, Types, Document } from 'mongoose';

// Define the IOrderItems interface for embedded reviews
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

export interface IOrder extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  paid: boolean;
  createdAt: Date;
  status: String;
  shippingAddress: string[];
  orderItems: Types.DocumentArray<IOrderItems>;
}

// Defines the order schema that shows the order records for all successful | failed orders.
const orderSchema = new Schema<IOrder>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Order must belong to a product!'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user!'],
    },
    paid: {
      type: Boolean,
      default: true, // for dev testing, in prod, set to false
    },
    createdAt: {
      type: Date,
      default: Date.now(),
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
      required: [true, 'Please fill in all fields in your shipping address.'],
    },
    orderItems: [orderItemsSchema],
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// virtual property to calculate the total price
orderSchema.virtual('totalPrice').get(function () {
  if (!this.orderItems) return 0;

  return this.orderItems.reduce((total, item) => {
    return total + item.priceAtTimeOfOrder * item.quantity;
  }, 0);
});

const Order = model('Order', orderSchema);

export default Order;
