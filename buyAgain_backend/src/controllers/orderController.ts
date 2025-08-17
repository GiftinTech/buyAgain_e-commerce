import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import Stripe from 'stripe';

import Order, {
  IOrder,
  IOrderItems,
  IShippingAddress,
} from '../models/orderModel';
import factory from './controllerFactory';
import { CustomRequest } from '../types';
import User, { IUser } from '../models/userModel';
import catchAsync from '../utils/catchAsync';
import Product, { IProduct } from '../models/productModel';
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

    const { orderId } = req.body;

    // Validate orderId
    if (!orderId) {
      return next(new AppError('Order ID is required.', 400));
    }

    // Fetch order from database
    const order = await Order.findById(orderId)
      .populate<{ user: IUser }>('user')
      .exec();

    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    const { shippingAddress, orderItems } = order;
    const name = order.user.name;

    const lineItems: any[] = [];

    // Fetch all products in parallel
    const lineItemsPromises = orderItems.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        console.error(`Product with ID ${item.product} not found.`);
        return null;
      }
      return {
        quantity: item.quantity,
        price_data: {
          currency: 'ngn',
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name,
            image: product.thumbnail,
          },
        },
      };
    });

    const lineItemsResults = await Promise.all(lineItemsPromises);
    // Filter out failed product lookups
    lineItems.push(...lineItemsResults.filter(Boolean));

    // Save the product slug for cancel_url (assuming all products are from the same order)
    let productSlug = '';
    if (orderItems.length > 0) {
      const firstProduct = await Product.findById(orderItems[0].product);
      if (firstProduct) {
        productSlug = firstProduct.slug;
      }
    }

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      //    success_url: `${req.protocol}://${req.get('host')}/orders/?product=${
      //   req.params.productId
      // }&user=${req.user.id}&price=${product.price}`, // remove in prod
      success_url: `${req.protocol}://${req.get('host')}/?alert=order`,

      cancel_url: `${req.protocol}://${req.get('host')}/orders/${productSlug}`,
      customer_email: req.user.email,
      client_reference_id: orderId,
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        name,
        address: JSON.stringify(shippingAddress),
        orderItems: JSON.stringify(
          orderItems.map((item) => ({
            productId: item.product,
            quantity: item.quantity,
          })),
        ),
      },
    });

    res.status(200).json({
      status: 'success',
      url: session.url,
      session,
    });
  },
);

const webhookCheckout = async (req: Request, res: Response): Promise<void> => {
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
  if (event.type === 'checkout.session.completed') {
    // For more reliable data, fetch session again
    const sessionId = (event.data.object as any).id;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    await createOrderCheckout(session);
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
};

//This helper function handles the post-checkout logic.
//production version
const createOrderCheckout = async (session: Stripe.Checkout.Session) => {
  const userEmail = session.customer_email;

  if (!userEmail) {
    console.error('Customer email is missing from Stripe session.');
    return;
  }

  // Find user
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    console.error(`User with email ${userEmail} not found.`);
    return;
  }

  // Parse shipping address from session metadata
  const addressStr = session.metadata?.address;
  const address: IShippingAddress = addressStr ? JSON.parse(addressStr) : {};

  // Parse orderItems from session metadata
  const orderItemsStr = session.metadata?.orderItems;
  const orderItemsData: { productId: string; quantity: number }[] =
    orderItemsStr ? JSON.parse(orderItemsStr) : [];

  if (!orderItemsData || orderItemsData.length === 0) {
    console.error('No order items found in session metadata.');
    return;
  }

  // Check for existing order
  const existingOrder = await Order.findOne({ stripeSessionId: session.id });
  if (existingOrder) {
    console.log(`Order for session ${session.id} already exists.`);
    return;
  }

  // Prepare orderItems array
  const orderItems: IOrderItems[] = [];

  for (const item of orderItemsData) {
    const product = await Product.findById(item.productId);
    if (!product) {
      console.error(`Product with ID ${item.productId} not found.`);
      continue; // handle error
    }

    // Populate order item details
    orderItems.push({
      product: product._id as Types.ObjectId,
      quantity: item.quantity,
      priceAtTimeOfOrder: product.price,
      thumbnail: product.thumbnail as string,
    });
  }

  // Calculate total price
  const amountTotal = session.amount_total ?? 0;
  const totalPrice = amountTotal / 100;

  // Create order
  await Order.create({
    user: user._id,
    shippingAddress: address,
    orderItems: orderItems,
    price: totalPrice,
    stripeSessionId: session.id,
    name: user.name,
    status: 'pending',
    paid: true,
  });

  console.log(
    `Order created for user ${user.email} with ${orderItems.length} items.`,
  );
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

// Controller to create a new order
const createOrder = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { shippingAddress, orderItems } = req.body;

    // Validate required fields
    if (
      !shippingAddress ||
      !orderItems ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return next(
        new AppError('Shipping address and order items are required.', 400),
      );
    }

    // Create new order document
    const newOrder = await Order.create({
      user: req.user._id,
      shippingAddress,
      orderItems,
      paid: false,
      status: 'pending',
    });

    // Respond with order data
    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: {
        order: newOrder,
      },
    });
  },
);

const getAllOrders = factory.getAll<IOrder>(Order, 'orders');

const getOneOrder = factory.getOne<IOrder>(Order, 'order');

const updateOrder = factory.updateOne<IOrder>(Order, 'order');

const deleteOrder = factory.deleteOne<IOrder>(Order, 'order');

// after successful payment
// const alerts = (req: Request, res: Response, next: NextFunction) => {
//   const { alert } = req.query;
//   if (alert === 'booking')
//     res.alert =
//       "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up here immediatly, please come back later.";
//   next();
// };

// const getMyOrders = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
//   // Find all orders
//   const order = await Order.find({ user: req.user.id })
//   // Find product with the returned IDs
//   const { orderItems } = order;

//   const productIDs = orderItems.map((item) => item.product);
//   const products = await Product.find({ _id: { $in: productIDs } });

//   res.status(200).json({
//     status: 'success',
//     title: 'My Products',
//     products,
//   });
//});

export default {
  setUserFilter,
  createOrder,
  getAllOrders,
  getOneOrder,
  updateOrder,
  deleteOrder,
  getCheckoutSession,
  webhookCheckout,
  // alerts,
  // getMyOrders,
};
