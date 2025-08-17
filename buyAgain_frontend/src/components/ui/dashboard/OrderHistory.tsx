import React, { useEffect } from 'react';
import useAdmin from '../../../hooks/useAdmin';
import type { IOrder } from '../../../context/AdminContext';
import { Edit, Trash2 } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const { orders, handleFetchOrders } = useAdmin();

  // Fetch orders when component mounts
  useEffect(() => {
    handleFetchOrders();
  }, [handleFetchOrders]);

  console.log('orders:', orders?.orders);

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Manage All Orders</h1>
      {orders?.orders?.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2 text-left">Order ID</th>
              <th className="border p-2 text-left">User ID</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Total</th>
              <th className="border p-2 text-left">Status</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.orders.map((order: IOrder) => (
              <tr key={order._id} className="border-t">
                <td className="border p-2">{order._id}</td>
                <td className="border p-2">{order.user}</td>
                <td className="border p-2">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="border p-2">₦{order.totalPrice}</td>
                <td className="border p-2">{order.status}</td>
                <td className="space-x-2 border p-2">
                  {/* Example actions: update status, delete */}
                  <button
                    className="mr-4 text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300"
                    onClick={() => alert('handleUpdateOrder(order._id)')}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => alert('handleDeleteOrder(order._id)')}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
