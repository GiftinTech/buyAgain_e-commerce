/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Clock,
  Mail,
  ArrowRight,
  Download,
  ShoppingBag,
  Truck,
  ArrowLeft,
  XCircle,
  Loader2,
  Check,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';
import { useAlert } from '../hooks/useAlert';
import type { IProduct } from '../context/CartContext';

// Types - matching your existing structure
interface OrderItem {
  product: IProduct;
  thumbnail: string;
  quantity: number;
  priceAtTimeOfOrder: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface IOrder {
  _id: string;
  displayId?: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  totalPrice: number;
  status: string;
  paid: boolean;
  createdAt: string;
  name: string;
  stripeSessionId: string;
}

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

// Success Animation Component
const SuccessAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`mb-8 flex justify-center transition-all duration-1000 ${isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
    >
      <div className="relative">
        <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-pink-600 shadow-lg">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        <div className="absolute -inset-4 animate-ping rounded-full bg-pink-500/20"></div>
      </div>
    </div>
  );
};

// Order Item Component - matching your existing style
const OrderItemCard = ({
  item,
  navigate,
}: {
  item: OrderItem;
  navigate: any;
}) => {
  const handleProductClick = () => {
    if (item.product.slug) {
      navigate(`/product-details/${item.product.slug}`);
    }
  };
  console.log('items:', item.product.slug);

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-600">
      <div className="flex items-center gap-4">
        <img
          src={item.thumbnail}
          alt={item.product.name}
          className="h-16 w-16 cursor-pointer rounded-lg object-cover shadow-sm transition-opacity hover:opacity-80"
          onClick={handleProductClick}
        />
        <div>
          <p
            className="cursor-pointer text-lg font-semibold transition-colors hover:text-pink-600"
            onClick={handleProductClick}
          >
            {item.product.name}
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
  );
};

// Action Buttons Component
const ActionButtons = ({
  orderId,
  navigate,
}: {
  orderId: string;
  navigate: any;
}) => {
  const { showAlert } = useAlert();
  const { token } = useAuth();
  const [downloadStatus, setDownloadStatus] = useState('idle');

  const handleDownloadReceipt = async () => {
    console.log('Attempting to download receipt for order:', orderId);

    if (!token) {
      showAlert('info', 'You must be logged in to download receipts.', 2);
      return;
    }

    setDownloadStatus('downloading');

    try {
      const response = await fetch(
        `${BUYAGAIN_API_BASE_URL}/orders/${orderId}/receipt`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download receipt.');
      }

      const data = await response.json();
      const { receipt_url } = data;

      if (receipt_url) {
        window.open(receipt_url, '_blank');
        setDownloadStatus('success');
        setTimeout(() => setDownloadStatus('idle'), 2000);
        console.log('Opened receipt URL:', receipt_url);
      } else {
        showAlert(
          'error',
          'Receipt URL not received from server. Please try again later.',
          3,
        );
        throw new Error('Receipt URL not received from server.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      showAlert(
        'error',
        'Failed to download receipt. Please try again later.',
        3,
      );
      setDownloadStatus('error');
      setTimeout(() => setDownloadStatus('idle'), 3000);
    }
  };

  const handleViewOrderDetails = () => {
    navigate(`/me/orders/${orderId}`);
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <button
        onClick={handleViewOrderDetails}
        className="flex flex-1 items-center justify-center rounded-lg bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
      >
        <Package className="mr-2 h-5 w-5" />
        View Order Details
      </button>
      <button
        onClick={handleDownloadReceipt}
        disabled={downloadStatus === 'downloading'} // Disable only during download
        className={`flex flex-1 items-center justify-center rounded-lg border px-6 py-3 font-medium transition-colors ${
          downloadStatus === 'downloading'
            ? 'cursor-not-allowed bg-gray-500 text-white'
            : downloadStatus === 'success'
              ? 'bg-green-600 text-white'
              : downloadStatus === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600'
        }`}
      >
        {downloadStatus === 'downloading' ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : downloadStatus === 'success' ? (
          <Check className="mr-2 h-5 w-5" />
        ) : downloadStatus === 'error' ? (
          <XCircle className="mr-2 h-5 w-5" />
        ) : (
          <Download className="mr-2 h-5 w-5" />
        )}
        {downloadStatus === 'downloading'
          ? 'Downloading...'
          : downloadStatus === 'success'
            ? 'Downloaded!'
            : downloadStatus === 'error'
              ? 'Failed to download.'
              : 'Download Receipt'}
      </button>

      <button
        onClick={handleContinueShopping}
        className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        Continue Shopping
      </button>
    </div>
  );
};

// Order Success Page Component
const OrderSuccessPage = () => {
  const { onPaymentSuccess } = useCart();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchOrderDetails = async (retryCount = 0) => {
      try {
        // Get session_id from URL params
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setError('No session ID found');
          setLoading(false);
          return;
        }

        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Fetch order details by session ID
        const response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/orders/session/${sessionId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 404 && retryCount < 5) {
          // wait a few seconds and try again
          console.warn(
            `Order not found for session ${sessionId}, retrying... Attempt ${retryCount + 1}`,
          );
          setTimeout(() => {
            fetchOrderDetails(retryCount + 1);
          }, 2000); // Wait for 2 seconds before retrying
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch order details');
        }

        const data = await response.json();
        const fetchedOrder = data.data.order;

        // Check the order status and redirect if not 'processing' or 'paid'
        if (
          fetchedOrder.status !== 'processing' &&
          fetchedOrder.paid !== true
        ) {
          console.warn(
            'Order status is not processing or paid. Redirecting to failed page.',
          );
          navigate('/orders/payment-failed', { replace: true });
          return;
        }

        setOrder(fetchedOrder);
        onPaymentSuccess();
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, navigate, onPaymentSuccess, token]);

  // Loading state - matching your existing style
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center text-red-500">
        <p className="text-lg">{error}</p>
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
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <Package size={48} className="mb-4 text-gray-400" />
        <p className="text-md">Order not found.</p>
        <button
          onClick={() => navigate('/me/orders')}
          className="mt-4 text-pink-600 hover:underline"
        >
          Go back to orders
        </button>
      </div>
    );
  }

  let orderStatusClass;
  let statusIcon;
  let headerText;
  let subheaderText;

  if (order.status === 'processing' && order.paid) {
    orderStatusClass =
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    statusIcon = <SuccessAnimation />;
    headerText = 'Order Placed Successfully! 🎉';
    subheaderText =
      "Thank you for your purchase. We've received your order and will process it shortly.";
  } else if (order.status === 'pending' || order.paid === false) {
    orderStatusClass =
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    statusIcon = <Clock className="h-24 w-24 text-yellow-500" />;
    headerText = 'Order Pending';
    subheaderText =
      'Your order is pending. We will confirm it as soon as payment is verified.';
  } else {
    orderStatusClass =
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    statusIcon = <XCircle className="h-24 w-24 text-red-500" />;
    headerText = 'Order Failed';
    subheaderText =
      'Something went wrong with your payment. Please check your order status or try again.';
  }

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
        <div className="mx-auto max-w-4xl">
          {/* Success Header */}
          <div className="mb-8 text-center">
            {statusIcon}
            <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              {headerText}
            </h1>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              {subheaderText}
            </p>
            <span
              className={`inline-block rounded-full px-4 py-2 text-base font-medium ${orderStatusClass}`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          {/* Order Summary */}
          <div className="mb-8 rounded-2xl border border-pink-100 bg-white p-8 text-black shadow-lg dark:bg-gray-800 dark:text-white">
            <div className="mb-6 flex items-center justify-between border-b pb-4 dark:border-gray-700">
              <h2 className="flex items-center gap-3 text-2xl font-bold">
                <ShoppingBag className="text-pink-500" /> Order #
                {order.displayId || order._id}
              </h2>
            </div>

            {/* Order Information */}
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
            <h3 className="mb-4 text-2xl font-bold">Items in this Order</h3>
            <div className="space-y-4">
              {order.orderItems.map((item: OrderItem, idx: number) => (
                <OrderItemCard key={idx} item={item} navigate={navigate} />
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

          {/* Action Buttons */}
          <div className="mb-8">
            <ActionButtons orderId={order._id} navigate={navigate} />
          </div>

          {/* Next Steps */}
          <div className="mb-8 rounded-2xl border border-pink-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                What happens next?
              </h3>
            </div>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <ArrowRight className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-pink-500" />
                <p>
                  We'll send you an email confirmation with your order details
                </p>
              </div>
              <div className="flex items-start">
                <ArrowRight className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-pink-500" />
                <p>Your order will be processed within 1-2 business days</p>
              </div>
              <div className="flex items-start">
                <ArrowRight className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-pink-500" />
                <p>You'll receive tracking information once your order ships</p>
              </div>
              <div className="flex items-start">
                <ArrowRight className="mr-3 mt-0.5 h-4 w-4 flex-shrink-0 text-pink-500" />
                <p>Delivery typically takes 3-7 business days</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-2xl border border-pink-100 bg-white p-6 text-center shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-2 text-gray-600 dark:text-gray-300">
              Questions about your order?
            </p>
            <a
              href="mailto:support@buyAgain.com"
              className="inline-flex items-center font-medium text-pink-600 transition-colors hover:text-pink-500"
            >
              <Mail className="mr-2 h-4 w-4" />
              support@buyAgain.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
