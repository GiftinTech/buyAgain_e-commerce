import React from 'react';

const Checkout: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <form className="space-y-4" name="checkout">
        <div>
          <label className="mb-1 block font-semibold">Full Name</label>
          <input
            name="user name"
            type="text"
            className="w-full rounded border p-2 dark:text-black"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold">Shipping Address</label>
          <textarea
            className="w-full rounded border p-2 dark:text-black"
            placeholder="123 Main St"
          ></textarea>
        </div>
        <div>
          <label className="mb-1 block font-semibold">Payment Method</label>
          <select className="w-full rounded border p-2 dark:text-black">
            <option>Credit Card</option>
            <option>PayPal</option>
            <option>Bank Transfer</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600"
        >
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;
