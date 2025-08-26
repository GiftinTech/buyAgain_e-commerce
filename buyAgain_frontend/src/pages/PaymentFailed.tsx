import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, Repeat, ArrowLeft } from 'lucide-react'; // Using XCircle for failure, Repeat for retry

const PaymentFailedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleRetryPayment = () => {
    console.log('User wants to retry payment');
    navigate('/checkout');
  };

  const handleViewOrders = () => {
    navigate('/me/orders');
  };

  return (
    <>
      <button
        className="mt-10 flex items-center gap-2 pl-8 text-gray-700 hover:font-semibold dark:text-gray-300"
        onClick={handleViewOrders}
      >
        <ArrowLeft />
        Back to Orders
      </button>

      <div className="mt-5 min-h-screen p-6">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-center text-center">
          {/* Failure Animation/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-red-500 shadow-lg">
                <XCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -inset-4 animate-ping rounded-full bg-red-500/20"></div>
            </div>
          </div>

          {/* Failure Header */}
          <h1 className="mb-4 text-3xl font-bold text-red-700 dark:text-red-400 md:text-4xl">
            Payment Failed! 😔
          </h1>
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            Unfortunately, your payment could not be processed at this time.
            Please check your payment details or try again.
          </p>

          {/* Action Buttons */}
          <div className="flex w-full flex-col gap-4 sm:flex-row">
            <button
              onClick={handleRetryPayment}
              className="flex flex-1 items-center justify-center rounded-lg bg-pink-600 px-6 py-3 font-medium text-white transition-colors hover:bg-pink-700"
            >
              <Repeat className="mr-2 h-5 w-5" />
              Retry Payment
            </button>
            <button
              onClick={handleViewOrders}
              className="flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              View My Orders
            </button>
          </div>

          {/* Additional Information */}
          <div className="mt-8 text-gray-600 dark:text-gray-300">
            <p>
              If the problem persists, please contact your bank or try a
              different payment method.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentFailedPage;
