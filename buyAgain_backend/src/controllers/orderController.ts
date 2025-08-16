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
    const productId = req.params.productId;
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
            unit_amount: Math.round(product.price * 100),
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

export const webhookCheckout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  // Use the raw body for signature verification
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

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
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    await handlePaymentIntentSucceeded(paymentIntent);
  } else if (event.type === 'checkout.session.completed') {
    // For more reliable data, fetch session again
    const sessionId = (event.data.object as any).id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    await createOrderCheckout(session);
  } else if (event.type === 'payment_method.attached') {
    const paymentMethod = event.data.object as Stripe.PaymentMethod;
    handlePaymentMethodAttached(paymentMethod);
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
};

//This helper function handles the post-checkout logic.
//production version
const createOrderCheckout = async (session: Stripe.Checkout.Session) => {
  const productId = session.client_reference_id;

  if (!productId) {
    console.error('Product reference ID is missing from Stripe session.');
    return;
  }

  const userEmail = await User.findOne({ email: session.customer_email });

  if (!userEmail) {
    console.error(`User with email ${session.customer_email} not found.`);
    return;
  }

  const user = await User.findOne({ email: userEmail });
  if (!user) {
    console.error(`User with email ${userEmail} not found.`);
    return;
  }

  // ensure product exists
  const product = await Product.findById(productId);
  if (!product) {
    console.error(`Product with ID ${productId} not found.`);
    return;
  }

  // Make sure amount_total exists and is accurate
  const amountTotal = session.amount_total ?? 0;
  const price = amountTotal / 100;

  // Prevent duplicate orders: check if an order with same session ID exists
  const existingOrder = await Order.findOne({ stripeSessionId: session.id });
  if (existingOrder) {
    console.log(`Order for session ${session.id} already exists.`);
    return;
  }

  await Order.create({
    product: new Types.ObjectId(productId),
    user: user._id,
    price,
    stripeSessionId: session.id,
  });

  console.log(
    `Order created for user ${user.email} and product ${product.name}`,
  );
};

// handle payment intent success
const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  console.log(
    `PaymentIntent ${paymentIntent.id} succeeded for amount ${paymentIntent.amount}`,
  );
  // Additional logic if needed
};

// handle payment method attached
const handlePaymentMethodAttached = (paymentMethod: Stripe.PaymentMethod) => {
  console.log(`PaymentMethod ${paymentMethod.id} attached successfully`);
  // Additional logic if needed
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
