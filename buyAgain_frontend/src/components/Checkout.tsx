/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import useCart from '../hooks/useCart';
import getAuthToken from '../utils/getAuthToken';
import useAuth from '../hooks/useAuth';

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;
const Publishable_Key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = loadStripe(Publishable_Key);

interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const Checkout = () => {
  const { cartItems } = useCart();
  const token = getAuthToken();
  const { user } = useAuth();

  const orderItems = cartItems.map((item) => ({
    product: item.product.id,
    quantity: item.quantity,
    priceAtTimeOfOrder: item.product.price,
  }));

  //console.log('Order Items:', orderItems);

  const [name, setName] = useState('');
  const [shippingAddress, setShippingAddress] = useState<IShippingAddress>({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);

  const authOptions = useMemo(() => {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const createOrder = async () => {
    const response = await fetch(`${BUYAGAIN_API_BASE_URL}/orders`, {
      method: 'POST',
      ...authOptions,
      body: JSON.stringify({
        user: user?.data?.users?._id || user?.data?.users?.email,
        shippingAddress,
        orderItems,
      }),
    });
    const orderData = await response.json();
    return orderData; // contains order ID
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const order = await createOrder();
      console.log('Order created:', order);

      const orderId = order.data.order.id; // id from DB

      console.log('Order id:', orderId);

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe.js failed to load.');

      // send POST req to create session with orderId
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        ...authOptions,
        body: JSON.stringify({ orderId }),
      });
      console.log('Checkout request sent, response:', res);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);

        // If the response is JSON, parse it
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Error details:', errorJson);
        } catch (e) {
          console.error('Response is not JSON:', e, errorText);
        }
      }

      const data = await res.json();
      console.log('Received checkout session data:', data);

      // Check if the backend returned a Stripe checkout URL
      if (data.url) {
        // Redirect user directly to Stripe checkout page
        window.location.href = data.url;

        // or, check if backend returns a session id
      } else if (data.session.id) {
        const result = await stripe.redirectToCheckout({
          sessionId: data.session.id,
        });

        if (result.error) {
          console.error('Stripe redirect error:', result.error);
          alert(result.error.message);
        }
      } else {
        console.error('No sessionId in response:', data);
        alert('Failed to get checkout session');
      }
    } catch (err: any) {
      console.error('Error during checkout:', err);
      alert('Error during checkout: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-6 max-w-2xl px-8 py-4">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <form onSubmit={handleSubmit} className="space-y-4" name="checkout">
        {/* Full Name */}
        <div>
          <label className="mb-1 block font-semibold">Full Name</label>
          <input
            name="name"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value.trim())}
            required
          />
        </div>

        {/* Shipping Address Fields */}
        <div>
          <label className="mb-1 block font-semibold">Street</label>
          <input
            name="street"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="123 Main St"
            value={shippingAddress.street}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                street: e.target.value.trim(),
              })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">City</label>
          <input
            name="city"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="Lagos"
            value={shippingAddress.city}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                city: e.target.value.trim(),
              })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">State</label>
          <input
            name="state"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="Lagos State"
            value={shippingAddress.state}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                state: e.target.value.trim(),
              })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">ZIP Code</label>
          <input
            name="zip"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="100001"
            value={shippingAddress.zip}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                zip: e.target.value.trim(),
              })
            }
            required
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">Country</label>
          <input
            name="country"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="Nigeria"
            value={shippingAddress.country}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                country: e.target.value.trim(),
              })
            }
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`${loading ? 'cursor-not-allowed' : 'cursor-pointer'} w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600 disabled:opacity-50`}
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
