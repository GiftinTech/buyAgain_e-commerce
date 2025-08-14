import React from 'react';
import { ShoppingCart, Users, Package, BarChart } from 'lucide-react';

const DashboardStats: React.FC = () => (
  <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {/* Orders Card */}
    <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
      <ShoppingCart className="h-8 w-8 text-pink-500" />
      <div>
        <p className="text-gray-500 dark:text-gray-300">Orders</p>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          1,234
        </h2>
      </div>
    </div>
    {/* Users Card */}
    <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-700">
      <Users className="h-8 w-8 text-green-500" />
      <div>
        <p className="text-gray-500 dark:text-gray-300">Users</p>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          567
        </h2>
      </div>
    </div>
    {/* Products Card */}
    <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900 sm:dark:bg-gray-700">
      <Package className="h-8 w-8 text-yellow-500" />
      <div>
        <p className="text-gray-500 dark:text-gray-300">Products</p>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          342
        </h2>
      </div>
    </div>
    {/* Revenue Card */}
    <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-700 sm:dark:bg-gray-900">
      <BarChart className="h-8 w-8 text-blue-500" />
      <div>
        <p className="text-gray-500 dark:text-gray-300">Revenue</p>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          $54,321
        </h2>
      </div>
    </div>
  </section>
);
export default DashboardStats;
