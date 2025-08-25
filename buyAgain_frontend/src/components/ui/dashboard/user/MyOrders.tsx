import React from 'react';
import { ArrowLeft, Package, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdmin from '../../../../hooks/useAdmin';
import type { OrderStatus } from '../../../../context/AdminContext';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-pink-200 text-pink-900',
  processing: 'bg-yellow-300 text-black',
  shipped: 'bg-white text-black border border-black',
  delivered: 'bg-pink-500 text-white',
  cancelled: 'bg-gray-400 text-white',
  failed: 'bg-red-500 text-white',
};

const MyOrders: React.FC = () => {
  const { myOrders, loading, myOrderError } = useAdmin();
  const navigate = useNavigate();

  if (loading)
    return <p className="mt-10 h-[60vh] text-center">Loading orders...</p>;
  if (myOrderError)
    return (
      <p className="mt-10 h-[60vh] text-center text-red-500">
        Error loading orders
      </p>
    );

  const orders = myOrders?.orders;
  //console.log('Orders data:', orders);

  return (
    <>
      <button
        className="mt-10 flex flex-row gap-2 pl-8 hover:font-semibold"
        onClick={() => navigate('/me')}
      >
        <ArrowLeft />
        Back
      </button>

      <div className="mt-5 min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 flex items-center gap-2 text-3xl font-bold">
            <ShoppingBag className="text-pink-500" /> My Orders
          </h1>
          {orders && orders.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Package size={48} className="mb-4 text-pink-400" />
              <p className="text-lg">You have no orders yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders?.map((order) => {
                // Determine the statusClass for this specific order
                const statusClass =
                  order.status in statusColors
                    ? statusColors[order.status as OrderStatus]
                    : 'bg-gray-200 text-black';

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-pink-100 bg-white p-6 text-black shadow-lg"
                  >
                    <div className="flex flex-row items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">
                          Order #{order.displayId}
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div className="mt-4 space-y-2">
                      {order.orderItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-row items-center justify-between border-b border-gray-200 pb-2"
                        >
                          <div className="flex items-center gap-3">
                            {typeof item.product === 'object' &&
                              item.product.thumbnail && (
                                <img
                                  src={item.product.thumbnail}
                                  alt="product"
                                  className="h-12 w-12 rounded-md object-cover"
                                />
                              )}
                            <p className="font-medium">
                              {typeof item.product === 'object'
                                ? item.product.name
                                : 'Product Name Unavailable'}
                              <span className="ml-2 text-sm text-gray-500">
                                x{item.quantity}
                              </span>
                            </p>
                          </div>
                          <p className="font-bold text-pink-600">
                            ₦
                            {item.priceAtTimeOfOrder.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Status + Total */}
                    <div className="mt-4 flex flex-row items-center justify-between">
                      <button
                        className="mt-2 rounded-lg border border-pink-500 px-4 py-2 text-pink-600 transition hover:bg-pink-100"
                        onClick={() => navigate(`/me/orders/${order._id}`)}
                      >
                        View Details
                      </button>
                      <p className="mt-2 font-bold">
                        ₦
                        {order.totalPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
