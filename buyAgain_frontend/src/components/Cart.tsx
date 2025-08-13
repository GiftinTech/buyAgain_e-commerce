import React from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useShopping';

const Cart: React.FC = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-5xl py-4 max-md:max-w-xl">
      <h1 className="text-center text-2xl font-bold text-white">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>No items in cart! Please add some items</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="h-16 w-16 rounded object-cover"
                />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">${item.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span>Qty: {item.quantity}</span>
                <button className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-6 flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>Get the total from backend</span>
          </div>
        </div>
      )}
      <div className="h-max rounded-sm bg-gray-100 p-4">
        <h3 className="bord-gray-300 border-b pb-3 text-xl font-extrabold text-gray-950">
          Order Summary
        </h3>
        <ul className="mt-4 space-y-2 text-gray-700">
          <p className="flex flex-wrap gap-4 text-sm font-bold">
            Total{' '}
            <span>
              ${cartItems.reduce((acc, curr) => acc + curr.price, 0).toFixed(2)}
            </span>
          </p>
        </ul>
        <div className="mt-5 flex gap-2">
          <button
            disabled={!(cartItems?.length > 0)}
            className="tex-white bg-black px-4 py-3 text-sm font-extrabold disabled:opacity-50"
          >
            Checkout
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-black px-4 py-3 text-sm font-extrabold text-white"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
