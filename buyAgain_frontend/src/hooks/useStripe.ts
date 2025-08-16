import { loadStripe } from '@stripe/stripe-js';

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;
const Publishable_Key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = loadStripe(Publishable_Key);

const buyProduct = async (productId: string) => {
  try {
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe.js failed to load.');
    }

    const response = await fetch(
      `${BUYAGAIN_API_BASE_URL}/orders/checkout-session/${productId}`,
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch checkout session: ${response.statusText}`,
      );
    }

    const sessionData = await response.json();

    await stripe.redirectToCheckout({
      sessionId: sessionData.session.id,
    });
  } catch (err) {
    console.log(err);
  }
};

export default buyProduct;
