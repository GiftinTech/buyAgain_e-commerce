/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import useTheme from '../hooks/useTheme';
import Logout from '../auth/Logout';
import useAuth from '../hooks/useAuth';
import Sidebar from './ui/dashboard/Sidebar';
import Header from './ui/dashboard/Header';
import DashboardStats from './ui/dashboard/Stats';
import SalesChart from './ui/dashboard/SalesChart';
import UserManagement from './ui/dashboard/UserManagement';
import ProductManagement from './ui/dashboard/ProductManagement';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const logout = Logout();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'products'
  >('dashboard');

  // Assume user?.data.users contains user profile info
  const userProfile = user?.data.users;

  // Users state
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User' },
    { id: 4, name: 'Alice', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Bob', email: 'bob@example.com', role: 'User' },
  ]);

  // Products state
  const [products, setProducts] = useState([
    { id: 101, name: 'Sneakers', price: '$120', stock: 20 },
    { id: 102, name: 'Wristwatch', price: '$80', stock: 35 },
    { id: 103, name: 'Perfume', price: '$45', stock: 12 },
    { id: 104, name: 'Backpack', price: '$60', stock: 18 },
    { id: 105, name: 'Sunglasses', price: '$75', stock: 10 },
  ]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        toggleTheme={toggleTheme}
      />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Header */}
        <Header
          toggleTheme={toggleTheme}
          theme={theme}
          logout={logout}
          userProfile={userProfile}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Content */}
        <main className="flex-grow p-6">
          {/* Tabs navigation */}
          <div className="mb-6 flex gap-4 border-b border-gray-300 dark:border-gray-700">
            {['dashboard', 'users', 'products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`border-b-2 px-3 py-1 font-semibold capitalize ${
                  activeTab === tab
                    ? 'border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-400'
                    : 'border-transparent text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'dashboard' && (
            <>
              <DashboardStats />
              <SalesChart />
            </>
          )}

          {activeTab === 'users' && (
            <UserManagement users={users} setUsers={setUsers} />
          )}

          {activeTab === 'products' && (
            <ProductManagement products={products} setProducts={setProducts} />
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
