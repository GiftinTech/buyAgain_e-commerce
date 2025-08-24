// Cart.tsx
import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';

const Cart: React.FC = () => {
  const {
    cartItems,
    cartTotals,
    handleRemoveFromCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
  } = useCart();

  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl py-8 max-md:max-w-xl">
      <h1 className="text-center text-2xl font-bold text-white">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="mb-4 text-center">
          No items in cart! Please add some items
        </p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id} // Use item._id as key for stability
              className="flex items-center justify-between border-b pb-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item?.product?.thumbnail}
                  alt={item?.product?.name}
                  className="h-16 w-16 rounded object-cover"
                />
                <div>
                  <p className="font-semibold">{item?.product?.name}</p>
                  <p className="text-sm text-gray-500">
                    ₦{' '}
                    {item?.product?.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 rounded-md border p-1">
                  <button
                    onClick={() => handleDecreaseQuantity(item)}
                    className="rounded p-1 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                    disabled={item?.quantity <= 1} // Optional: disable minus button when quantity is 1
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center">{item?.quantity}</span>
                  <button
                    onClick={() => handleIncreaseQuantity(item)}
                    className="rounded p-1 text-gray-700 hover:bg-gray-200"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveFromCart(item, true)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {/* ... The rest of your component remains the same */}
          <div className="mt-6 flex items-center justify-between text-lg font-bold">
            <span className="font-bold">Total:</span>
            <span>
              {' '}
              ₦
              {cartTotals?.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      )}
      <div className="h-max rounded-sm bg-gray-100 p-4">
        <h3 className="bord-gray-300 border-b pb-3 text-xl font-extrabold text-gray-950">
          Order Summary
        </h3>
        <ul className="mt-4 space-y-2 text-gray-700">
          <p className="flex flex-wrap gap-4 text-sm font-bold">
            Total:{' '}
            <span>
              ₦
              {cartTotals?.total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
          <p className="flex flex-wrap gap-4 text-sm font-bold">
            Total Products:
            <span> {cartTotals?.totalProducts}</span>
          </p>
          <p className="flex flex-wrap gap-4 text-sm font-bold">
            Total Quantity:
            <span> {cartTotals?.totalQuantity}</span>
          </p>
          <p className="flex flex-wrap gap-4 text-sm font-bold">
            Total Discount:
            <span>
              {' '}
              ₦
              {cartTotals?.discountedTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </p>
        </ul>
        <div className="mt-5 flex gap-2">
          <button
            disabled={!(cartItems?.length > 0)}
            className="bg-black px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
            onClick={() => navigate('/checkout')}
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
