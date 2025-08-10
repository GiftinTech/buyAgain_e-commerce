import React from 'react';

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
}

const OrderHistory: React.FC = () => {
  const orders: Order[] = [
    { id: '001', date: '2025-08-01', total: 120, status: 'Delivered' },
    { id: '002', date: '2025-07-25', total: 250, status: 'Shipped' },
  ];

  return (
    <div className="mx-auto max-w-4xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Order History</h1>
      {orders.length === 0 ? (
        <p>No past orders found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border p-2">Order ID</th>
              <th className="border p-2">Date</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t">
                <td className="border p-2">{order.id}</td>
                <td className="border p-2">{order.date}</td>
                <td className="border p-2">${order.total}</td>
                <td className="border p-2">{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderHistory;
