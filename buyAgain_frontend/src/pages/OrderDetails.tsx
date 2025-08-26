import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingBag, Truck } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import useAuth from '../hooks/useAuth';
import type { OrderStatus, IOrder, OrderItem } from '../context/AdminContext';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-pink-200 text-pink-900',
  processing: 'bg-yellow-300 text-black',
  shipped: 'bg-white text-black border border-black',
  delivered: 'bg-pink-500 text-white',
  cancelled: 'bg-gray-400 text-white',
  failed: 'bg-red-500 text-white',
};

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId || !token) {
      setError('Order ID or authentication token missing.');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/orders/my-orders/${orderId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch order details: ${response.statusText}`,
          );
        }

        const data = await response.json();
        setOrder(data.data.order);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token]);

  // Skeleton Loader
  if (loading) {
    return (
      <div className="mt-10 min-h-screen p-6">
        <div className="mx-auto max-w-4xl space-y-6 rounded-2xl border border-pink-100 bg-gray-800 p-8 shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Skeleton width={200} height={32} />
            <Skeleton width={100} height={28} />
          </div>

          {/* Order Summary */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton width={160} height={20} />
              <Skeleton width={140} height={16} />
              <Skeleton width={120} height={16} />
              <Skeleton width={100} height={16} />
            </div>
            <div className="space-y-2">
              <Skeleton width={160} height={20} />
              <Skeleton width={200} height={16} />
              <Skeleton width={180} height={16} />
              <Skeleton width={150} height={16} />
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Order Items */}
          <h2 className="text-2xl font-bold">Items in this Order</h2>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-200 pb-4"
              >
                <div className="flex items-center gap-4">
                  <Skeleton width={64} height={64} />
                  <div>
                    <Skeleton width={180} height={20} />
                    <Skeleton width={100} height={16} />
                  </div>
                </div>
                <Skeleton width={80} height={20} />
              </div>
            ))}
          </div>

          <div className="text-right">
            <Skeleton width={120} height={28} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center text-red-500">
        <p className="text-lg">Error: {error}</p>
        <button
          onClick={() => navigate('/me/orders')}
          className="mt-4 text-pink-600 hover:underline"
        >
          Go back to orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <Package size={48} className="mb-4 text-gray-400" />
        <p className="text-lg">Order not found.</p>
        <button
          onClick={() => navigate('/me/orders')}
          className="mt-4 text-pink-600 hover:underline"
        >
          Go back to orders
        </button>
      </div>
    );
  }

  const orderStatusClass =
    order.status in statusColors
      ? statusColors[order.status as OrderStatus]
      : 'bg-gray-200 text-black';

  return (
    <>
      <button
        className="mt-10 flex items-center gap-2 pl-8 text-gray-700 hover:font-semibold dark:text-gray-300"
        onClick={() => navigate('/me/orders')}
      >
        <ArrowLeft />
        Back to Orders
      </button>

      <div className="mt-5 min-h-screen p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-pink-100 bg-white p-8 text-black shadow-lg dark:bg-gray-800 dark:text-white">
          <div className="mb-6 flex items-center justify-between border-b pb-4 dark:border-gray-700">
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <ShoppingBag className="text-pink-500" /> Order #
              {order.displayId || order._id}
            </h1>
            <span
              className={`rounded-full px-4 py-2 text-base font-medium ${orderStatusClass}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Order Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-lg font-semibold">Order Information</p>
              <p>
                <strong>Order ID:</strong> {order.displayId || order._id}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Paid:</strong> {order.paid ? 'Yes' : 'No'}
              </p>
              <p>
                <strong>Total:</strong> ₦
                {order.totalPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 text-lg font-semibold">
                <Truck size={20} /> Shipping Address
              </p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zip}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <hr className="my-6 border-pink-100 dark:border-gray-700" />

          {/* Order Items */}
          <h2 className="mb-4 text-2xl font-bold">Items in this Order</h2>
          <div className="space-y-4">
            {order.orderItems.map((item: OrderItem, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-600"
              >
                <div className="flex items-center gap-4">
                  {typeof item.product === 'object' &&
                    item.product?.thumbnail && (
                      <img
                        src={item.product.thumbnail}
                        alt={item.product?.name || 'Product'}
                        className="h-16 w-16 rounded-lg object-cover shadow-sm"
                      />
                    )}
                  <div>
                    <p className="text-lg font-semibold">
                      {typeof item.product === 'object'
                        ? item.product.name
                        : 'Product Name Unavailable'}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Quantity: x{item.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-pink-600">
                  ₦
                  {item.priceAtTimeOfOrder.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <p className="text-2xl font-bold">
              Total: ₦
              {order.totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetails;
