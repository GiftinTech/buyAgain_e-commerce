import React, { useEffect, useMemo, useState } from 'react';
import useAdmin from '../../../hooks/useAdmin';
import type { IOrder } from '../../../context/AdminContext';
import { EditIcon, Trash2 } from 'lucide-react';
import ConfirmDialog from '../ConfirmDialog';

const OrderManagement: React.FC = () => {
  const { orders, handleFetchOrders, handleUpdateOrder, handleDeleteOrder } =
    useAdmin();

  const [orderSearch, setOrderSearch] = useState('');
  const [orderPage, setOrderPage] = useState(1);
  const [editingOrder, setEditingOrder] = useState<IOrder | null>(null);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);

  const PAGE_SIZE = 5;

  // Fetch orders on component mount
  useEffect(() => {
    handleFetchOrders();
  }, [handleFetchOrders]);

  console.log('orders', orders);

  // Filter orders based on search
  const filteredOrders = orders?.orders?.filter((order) => {
    const lowerSearch = orderSearch.toLowerCase();
    return (
      order._id.toLowerCase().includes(lowerSearch) ||
      order.user.toLowerCase().includes(lowerSearch) ||
      order.status.toLowerCase().includes(lowerSearch) ||
      new Date(order.createdAt)
        .toLocaleString()
        .toLowerCase()
        .includes(lowerSearch)
    );
  });

  // Pagination
  let pageCount = 1;
  if (filteredOrders) {
    pageCount = Math.ceil(filteredOrders.length / PAGE_SIZE);
  }

  const paginatedOrders = useMemo(() => {
    return filteredOrders?.slice(
      (orderPage - 1) * PAGE_SIZE,
      orderPage * PAGE_SIZE,
    );
  }, [filteredOrders, orderPage]);

  // Start editing an order
  const startEditOrder = (order: IOrder) => {
    setEditingOrder(order);
  };

  // Cancel editing
  const cancelEditOrder = () => {
    setEditingOrder(null);
  };

  // Handle status change during editing
  const handleStatusChange = (newStatus: string) => {
    if (editingOrder) {
      setEditingOrder({ ...editingOrder, status: newStatus });
    }
  };

  // Save only the status update
  const saveOrder = async () => {
    if (!editingOrder) return;
    await handleUpdateOrder(editingOrder, { status: editingOrder.status });
    setEditingOrder(null);
  };

  // Delete an order
  const deleteOrder = (orderId: string) => {
    setOrderToDelete(orderId);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (orderToDelete) {
      await handleDeleteOrder(orderToDelete);
    }
    setConfirmOpen(false);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setOrderToDelete(null);
  };

  if (location.pathname !== '/admin') return null;

  return (
    <div className="container mx-auto min-h-screen p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manage All Orders</h2>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders by order id or user id..."
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      {/* Orders Table or No Orders Message */}
      {filteredOrders?.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  S/N
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Order ID
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  User ID
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Date
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Total
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Status
                </th>
                <th className="border-b border-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedOrders?.map((order: IOrder, i: number) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {/* Serial Number */}
                  <td className="whitespace-nowrap border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    {(orderPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  {/* Order ID */}
                  <td className="whitespace-nowrap border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    {order._id}
                  </td>
                  {/* User ID */}
                  <td className="whitespace-nowrap border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    {order.user}
                  </td>
                  {/* Date */}
                  <td className="whitespace-nowrap border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>
                  {/* Total Price */}
                  <td className="whitespace-nowrap border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    ₦
                    {order.totalPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  {/* Status with conditional editing */}
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    {editingOrder && editingOrder._id === order._id ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={editingOrder.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          className="rounded border border-gray-300 bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="failed">Failed</option>
                        </select>

                        <button
                          onClick={saveOrder}
                          className="rounded bg-green-500 px-2 py-1 text-white hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditOrder}
                          className="rounded bg-gray-300 px-2 py-1 text-gray-800 hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="capitalize">{order.status}</span>
                        <button
                          onClick={() => startEditOrder(order)}
                          className="text-blue-500 hover:underline"
                        >
                          <EditIcon size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                  {/* Actions: Delete */}
                  <td className="border-b border-gray-200 px-6 py-4 text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200">
                    <button
                      onClick={() => deleteOrder(order._id)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="my-4 flex justify-between px-7 text-gray-600 dark:text-gray-300">
            <button
              onClick={() => setOrderPage((prev) => Math.max(prev - 1, 1))}
              disabled={orderPage === 1}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-pink-900"
            >
              Previous
            </button>
            <span className="flex items-center font-medium">
              Page {orderPage} of {pageCount}
            </span>
            <button
              onClick={() =>
                setOrderPage((prev) => Math.min(prev + 1, pageCount))
              }
              disabled={orderPage === pageCount}
              className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:hover:bg-pink-900"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Delete */}
      {isConfirmOpen && (
        <ConfirmDialog
          isOpen={isConfirmOpen}
          message="Are you sure you want to delete this order?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default OrderManagement;
