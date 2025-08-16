/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;
const Publishable_Key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = loadStripe(Publishable_Key);

const Checkout: React.FC<{ productId: string | undefined }> = ({
  productId,
}) => {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js failed to load.');

      const res = await fetch(
        `${BUYAGAIN_API_BASE_URL}/api/create-checkout-session/${productId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            address,
            paymentMethod,
          }),
        },
      );

      const data = await res.json();

      if (data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        alert('Failed to create checkout session');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error during checkout: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4" name="checkout">
        <div>
          <label className="mb-1 block font-semibold">Full Name</label>
          <input
            name="fullName"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">Shipping Address</label>
          <textarea
            className="w-full rounded border p-2 dark:text-black"
            placeholder="123 Main St"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label className="mb-1 block font-semibold">Payment Method</label>
          <select
            className="w-full rounded border p-2 dark:text-black"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option>Credit Card</option>
            <option>PayPal</option>
            <option>Bank Transfer</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
