import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Stripe from 'stripe';

import Order, { IOrder } from '../models/orderModel';
import factory from './controllerFactory';
import { CustomRequest } from '../types';
import User from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import Product from '../models/productModel';
import AppError from '../utils/appError';

// Stripe payment config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil',
});

const getCheckoutSession = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated.', 400));
    }

    // 1) Get the currently ordered product
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return next(new AppError('Product not found.', 404));
    }

    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/orders?alert=order`,
      cancel_url: `${req.protocol}://${req.get('host')}/orders/${product.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.productId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'ngn',
            unit_amount: product.price * 100,
            product_data: {
              name: `${product.name} Product`,
              description: product.description,
              images: [
                `${req.protocol}://${req.get('host')}/img/product/${product.thumbnail}`,
              ],
            },
          },
        },
      ],
      mode: 'payment',
    });

    // 3) Create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  },
);

// This helper function handles the post-checkout logic.
// production version
// const createOrderCheckout = async (session: Stripe.Checkout.Session) => {
//   const product = session.client_reference_id;

//   if (!product) {
//     console.error('Product reference ID is missing from Stripe session.');
//     return;
//   }

//   const user = await User.findOne({ email: session.customer_email });

//   if (!user) {
//     console.error(`User with email ${session.customer_email} not found.`);
//     return;
//   }

//   const price = session.amount_total ? session.amount_total / 100 : 0;

//   await Order.create({
//     product: new Types.ObjectId(product),
//     user: user._id,
//     price,
//   });
// };

// Development version, TESTING only
// Update the function to accept a PaymentIntent object
export const createOrderCheckout = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  // Get the product, user, and price from the PaymentIntent object
  // client_reference_id is stored in the metadata for a PaymentIntent
  const product = paymentIntent.metadata.productId;

  // The customer email is not directly on the PaymentIntent;
  // you must retrieve the customer from the PaymentIntent's customer ID.
  const customerId = paymentIntent.customer;
  if (typeof customerId !== 'string') {
    console.error('Customer ID not found on PaymentIntent.');
    return;
  }

  // Retrieve the customer object to get the email
  const customer = (await stripe.customers.retrieve(
    customerId,
  )) as Stripe.Customer;
  const user = await User.findOne({ email: customer.email });

  if (!user) {
    console.error(`User with email ${customer.email} not found.`);
    return;
  }

  // The amount on the PaymentIntent is in cents/kobo; divide by 100 for the actual price
  const price = paymentIntent.amount / 100;

  // Create the new order
  await Order.create({
    product: new Types.ObjectId(product),
    user: user._id,
    price,
  });
};

// A helper function to process a successful payment intent
const handlePaymentIntentSucceeded = (paymentIntent: Stripe.PaymentIntent) => {
  // Implement your logic here, e.g., create an order, update a database
  console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
};

// A helper function to process a successful payment method attachment
const handlePaymentMethodAttached = (paymentMethod: Stripe.PaymentMethod) => {
  // Implement your logic here
  console.log(`PaymentMethod ${paymentMethod.id} was successfully attached.`);
};

export const webhookCheckout = (req: Request, res: Response): void => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  let event: Stripe.Event;

  // Use the raw body for signature verification
  const sig = req.headers['stripe-signature'] as string;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.log(`⚠️  Webhook signature verification failed:`, err.message);
      res
        .status(400)
        .send(`Webhook signature verification failed: ${err.message}`);
      return;
    }
    console.log(`⚠️  Webhook signature verification failed.`);
    res.status(400).send(`Webhook signature verification failed.`);
    return;
  }

  console.log('Webhook received! Event type:', event.type);

  // Handle the event based on its type
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      createOrderCheckout(paymentIntent);
      console.log(
        `✅ PaymentIntent for ${paymentIntent.amount} was successful!`,
      );
      handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object as Stripe.PaymentMethod;
      console.log(`✅ PaymentMethod for ${paymentMethod.id} was successful!`);
      handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      console.log(`Unhandled event type ${event.type}.`);
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// MW to set the filter for user-specific data
const setUserFilter = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  // If the user is logged in, set a filter for their ID.
  req.userFilter = req.user ? { user: req.user._id } : {};
  next();
};

const createOrder = factory.createOne<IOrder>(Order, 'order');

const getAllOrders = factory.getAll<IOrder>(Order, 'orders');

const getOneOrder = factory.getOne<IOrder>(Order, 'order');

const updateOrder = factory.updateOne<IOrder>(Order, 'order');

const deleteOrder = factory.deleteOne<IOrder>(Order, 'order');

export default {
  setUserFilter,
  createOrder,
  getAllOrders,
  getOneOrder,
  updateOrder,
  deleteOrder,
  getCheckoutSession,
  webhookCheckout,
};
