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
import Cart from '../models/cartModel';
import catchAsync from '../utils/catchAsync';
import Product, { IProduct } from '../models/productModel';
import AppError from '../utils/appError';
import mongoose from 'mongoose';

// Frontend URL
const frontend_url = process.env.FRONTEND_URL;

// Stripe payment config
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-07-30.basil',
});

const getCheckoutSession = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // First, check authentication
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

    // Verify the order belongs to the authenticated user
    if (order.user._id.toString() !== req.user.id) {
      return next(
        new AppError('Unauthorized: Order does not belong to user.', 403),
      );
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
            images: [product.thumbnail],
          },
        },
      };
    });

    const lineItemsResults = await Promise.all(lineItemsPromises);
    // Filter out failed product lookups
    lineItems.push(...lineItemsResults.filter(Boolean));

    // Save the product slug for cancel_url
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
      success_url: `${req.protocol}://${req.get('host')}/api/v1/orders/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontend_url}/orders/${productSlug}`,
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
        userId: req.user.id,
        orderId,
      },
    });

    res.status(200).json({
      status: 'success',
      url: session.url,
      session,
    });
  },
);

// Helper function to create or update an order based on payment status
const createOrderCheckout = async (
  session: Stripe.Checkout.Session,
  isPaid: boolean,
  initialStatus: 'processing' | 'failed' | 'pending' | 'cancelled',
): Promise<void> => {
  try {
    const userEmail = session.customer_details?.email;
    const userId = session.metadata?.userId;

    if (!userEmail) {
      console.error(
        'Customer email is missing from Stripe session. Cannot create order.',
      );
      return;
    }

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      console.error(
        `User with email ${userEmail} not found. Cannot create order.`,
      );
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
      console.error(
        'No order items found in session metadata. Cannot create order.',
      );
      return;
    }

    // Check for existing order using stripeSessionId to prevent duplicates
    // This is crucial for webhook retries and idempotent operations
    let order = await Order.findOne({ stripeSessionId: session.id }).populate(
      'orderItems.product',
    );

    if (order) {
      // If order already exists, update its status if it's different
      if (order.status !== initialStatus || order.paid !== isPaid) {
        order.paid = isPaid;
        order.status = initialStatus;
        await order.save();
        console.log(
          `Order for session ${session.id} updated to status: ${initialStatus}, paid: ${isPaid}.`,
        );
      } else {
        console.log(
          `Order for session ${session.id} already exists with current status: ${initialStatus}, paid: ${isPaid}. No update needed.`,
        );
      }
      // Clear cart even if order already existed (e.g., webhook retry)
      await Cart.findOneAndDelete({ user: userId });
      console.log(
        `Cart cleared for user ${userEmail} after order handling (existing order).`,
      );
      return;
    }

    // Prepare orderItems array
    const orderItems: IOrderItems[] = [];

    for (const item of orderItemsData) {
      const product = await Product.findById(item.productId);
      if (!product) {
        console.error(
          `Product with ID ${item.productId} not found for order. Skipping item.`,
        );
        continue;
      }

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
    // Inside your createOrderCheckout helper function
    console.log('Stripe Session ID:', session.id);
    console.log('Payment Intent ID:', session.payment_intent);
    // Create the new order
    order = await Order.create({
      user: user._id,
      shippingAddress: address,
      orderItems: orderItems,
      price: totalPrice,
      stripeSessionId: session.id,
      name: user.name,
      status: initialStatus,
      paid: isPaid,
      // Store payment intent ID for later updates (if payment fails/succeeds later)
      paymentIntentId: session.payment_intent as string,
    });

    console.log(
      `Order created for user ${user.email} with ${orderItems.length} items. Initial status: ${initialStatus}, paid: ${isPaid}.`,
    );

    // Clear cart after successful order creation or update
    await Cart.findOneAndDelete({ user: user._id });
    console.log(
      `Cart cleared for user ${user.email} after successful order creation.`,
    );
  } catch (error) {
    console.error('Error during createOrderCheckout execution:', error);
  }
};

// Main webhook controller
const webhookCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Webhook signature verification failed:', err.message);
      return next(
        new AppError(
          `Webhook signature verification failed: ${err.message}`,
          400,
        ),
      );
    }
    console.error('Webhook signature verification failed (unknown error).');
    return next(new AppError(`Webhook signature verification failed.`, 400));
  }

  console.log('Webhook received! Event type:', event.type);

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // This event signifies that the customer has completed the checkout session.
        // Payment might still be pending or failed, so we retrieve full details.
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        const sessionWithDetails = await stripe.checkout.sessions.retrieve(
          checkoutSession.id,
        );

        let isPaidInitially = false;
        let initialOrderStatus: 'processing' | 'failed' | 'pending' = 'pending';

        // Corrected and complete logic for handling different payment statuses
        if (sessionWithDetails.payment_status === 'paid') {
          isPaidInitially = true;
          initialOrderStatus = 'processing';
        } else if (sessionWithDetails.payment_status === 'unpaid') {
          isPaidInitially = false;
          initialOrderStatus = 'failed';
        } else if (
          sessionWithDetails.payment_status === 'no_payment_required'
        ) {
          isPaidInitially = true;
          initialOrderStatus = 'processing';
        }

        // Create or update the order with its initial status
        await createOrderCheckout(
          sessionWithDetails,
          isPaidInitially,
          initialOrderStatus,
        );
        break;

      case 'payment_intent.succeeded':
        // This event confirms that a PaymentIntent has successfully completed a payment.
        // An order might have been created as 'pending' or 'failed' by checkout.session.completed.
        const paymentIntentSucceeded = event.data
          .object as Stripe.PaymentIntent;
        console.log(`Payment Intent Succeeded: ${paymentIntentSucceeded.id}`);

        const orderSucceeded = await Order.findOne({
          paymentIntentId: paymentIntentSucceeded.id,
        });
        if (
          orderSucceeded &&
          (!orderSucceeded.paid || orderSucceeded.status !== 'processing')
        ) {
          orderSucceeded.paid = true;
          orderSucceeded.status = 'processing';
          await orderSucceeded.save();
          console.log(
            `Order ${orderSucceeded._id} updated to processing (Payment Intent Succeeded).`,
          );
        }
        break;

      case 'payment_intent.payment_failed':
        // This event indicates that a PaymentIntent has failed to complete a payment.
        const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment Intent Failed: ${paymentIntentFailed.id}`);

        const orderFailed = await Order.findOne({
          paymentIntentId: paymentIntentFailed.id,
        });
        if (
          orderFailed &&
          (orderFailed.paid || orderFailed.status !== 'failed')
        ) {
          orderFailed.paid = false;
          orderFailed.status = 'failed';
          await orderFailed.save();
          console.log(
            `Order ${orderFailed._id} updated to failed (Payment Intent Failed).`,
          );
        }
        break;

      case 'charge.failed':
        // This event indicates that a charge has failed.
        // This can happen directly or as part of a PaymentIntent.
        const chargeFailed = event.data.object as Stripe.Charge;
        console.log(`Charge Failed: ${chargeFailed.id}`);

        const orderChargeFailed = await Order.findOne({
          paymentIntentId: chargeFailed.payment_intent,
        });
        if (
          orderChargeFailed &&
          (orderChargeFailed.paid || orderChargeFailed.status !== 'failed')
        ) {
          orderChargeFailed.paid = false;
          orderChargeFailed.status = 'failed';
          await orderChargeFailed.save();
          console.log(
            `Order ${orderChargeFailed._id} updated to failed (Charge Failed).`,
          );
        }
        break;

      case 'checkout.session.expired':
        // This event means a Checkout Session has expired.
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        const orderExpired = await Order.findOne({
          stripeSessionId: expiredSession.id,
        });
        if (
          orderExpired &&
          (orderExpired.status !== 'cancelled' || orderExpired.paid)
        ) {
          orderExpired.paid = false; // Mark as not paid
          orderExpired.status = 'cancelled'; // Mark as cancelled
          await orderExpired.save();
          console.log(
            `Order ${orderExpired._id} for session ${expiredSession.id} marked as cancelled.`,
          );
        }
        break;

      default:
        // Log any event types not explicitly handling
        console.warn(`Unhandled event type ${event.type}.`);
    }
  } catch (error) {
    console.error(`Error processing Stripe event ${event.type}:`, error);
  }

  // Acknowledge receipt of the event
  res.status(200).json({ received: true });
};

// order success handler
const handleOrderSuccess = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { session_id } = req.query;

    if (!session_id) {
      return next(new AppError('Session ID is required.', 400));
    }

    // Redirect to frontend success page
    console.log(
      `Redirecting user to frontend success page for session: ${session_id}`,
    );
    res.redirect(`${frontend_url}orders/success?session_id=${session_id}`);
  },
);

// This controller retrieves an order by its Stripe Session ID
const getOrderBySessionId = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // Get the session ID from the request parameters
    const { sessionId } = req.params;

    if (!sessionId) {
      return next(new AppError('Session ID is required.', 400));
    }

    // Find the order in the database using the stored stripeSessionId
    const order = await Order.findOne({ stripeSessionId: sessionId });

    // Handle case where the order is not found
    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    // Verify the order belongs to the authenticated user
    if (!req.user || order.user.toString() !== req.user.id) {
      return next(
        new AppError('Unauthorized: Order does not belong to user.', 403),
      );
    }

    // Send the order back in the response
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  },
);

// download receipt
const getReceiptPdf = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    if (!req.user) {
      return next(new AppError('User not authenticated.', 401));
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('Order not found.', 404));
    }

    if (order.user.toString() !== req.user.id) {
      return next(
        new AppError('Unauthorized: Order does not belong to user.', 403),
      );
    }

    // get the receipt URL from Stripe
    if (!order.paymentIntentId) {
      return next(
        new AppError('Payment Intent ID not found for this order.', 400),
      );
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        order.paymentIntentId,
      );
      const chargeId = paymentIntent.latest_charge as string; // Get the latest charge ID

      if (!chargeId) {
        return next(
          new AppError('No charge found for this payment intent.', 404),
        );
      }

      const charge = await stripe.charges.retrieve(chargeId);

      if (charge.receipt_url) {
        // Redirect the user to Stripe's hosted receipt page
        return res.redirect(charge.receipt_url);
      } else {
        return next(new AppError('Stripe receipt URL not available.', 404));
      }
    } catch (stripeError: any) {
      console.error('Error retrieving Stripe receipt:', stripeError);
      return next(
        new AppError(`Error fetching receipt: ${stripeError.message}`, 500),
      );
    }
  },
);

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

// GET user orders
const getMyOrders = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.user.id;

    if (!req.user || !userId) {
      console.log('Request from unauthenticated user. Returning empty orders.');
      return res.status(200).json({
        status: 'success',
        data: {
          orders: [],
        },
      });
    }

    const orders = await Order.find({ user: userId })
      .populate({
        path: 'orderItems.product',
        select: 'name thumbnail',
      })
      .select(
        'user displayId paid shippingAddress orderItems status createdAt totalPrice _id paymentIntentId',
      )
      .sort('-createdAt');

    if (!orders) {
      console.log(
        `No orders document found for authenticated user ${userId}. Returning empty orders.`,
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        orders,
      },
    });
  },
);

// Controller for getting a single order's details
const getOrderDetails = catchAsync(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    // i. Get the order ID from the request parameters
    const { orderId } = req.params;

    // ii. Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      return next(
        new AppError('You must be logged in to view order details.', 401),
      );
    }

    // iii. Find the order by its ID and populate necessary fields
    const order = await Order.findById(orderId)
      .populate({
        path: 'orderItems.product',
        select: 'name thumbnail',
      })
      .populate({
        path: 'user',
        select: 'name email',
      });

    // iv. Handle case where no order is found
    if (!order) {
      return next(new AppError('No order found with that ID.', 404));
    }

    // v. Authorization: Ensure the logged-in user is the owner of the order or has an 'admin' role
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return next(
        new AppError('You do not have permission to view this order.', 403),
      );
    }

    // vi. Send the order details in the response
    res.status(200).json({
      status: 'success',
      data: {
        order,
      },
    });
  },
);

const getOneOrder = factory.getOne<IOrder>(Order, 'order');

const updateOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      // Throw error to be caught by catchAsync
      throw new AppError('Order not found', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Order updated successfully',
      data: {
        order: updatedOrder,
      },
    });
  },
);

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
  handleOrderSuccess,
  getOrderBySessionId,
  getReceiptPdf,
  getMyOrders,
  getOrderDetails,
};
