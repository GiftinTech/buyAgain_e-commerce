/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';

import useTheme from '../hooks/useTheme';
import Logout from '../auth/Logout';

import Sidebar from './ui/dashboard/Sidebar';
import Header from './ui/dashboard/Header';
import DashboardStats from './ui/dashboard/Stats';
import SalesChart from './ui/dashboard/SalesChart';
import UserManagement from './ui/dashboard/UserManagement';
import ProductManagement from './ui/dashboard/ProductManagement';
import useCart from '../hooks/useShopping';

import useAuth from '../hooks/useAuth';
import OrderHistory from './ui/dashboard/OrderHistory';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const { setLoading, setError, setProductList, handleFetchProduct } =
    useCart();

  const logout = Logout();
  const { theme, toggleTheme } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'products' | 'orders'
  >('dashboard');

  // get login user profile
  const userProfile = user?.data.users;

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const result = await handleFetchProduct();

      if (result.success && result.products) {
        setProductList(result.products);
      } else {
        setError(result.message || 'Failed to load products.');
        setProductList([]); // Ensure products is empty on error
      }
    } catch (err: unknown) {
      console.error('Error in fetchProductsData:', err);
      setError('An unexpected error occurred while fetching products.');
      setProductList([]);
    } finally {
      setLoading(false);
    }
  }, [handleFetchProduct, setError, setLoading, setProductList]);

  useEffect(() => {
    fetchProduct();
  }, []);

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
            {['dashboard', 'users', 'products', 'orders'].map((tab) => (
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

          {activeTab === 'users' && <UserManagement />}

          {activeTab === 'products' && <ProductManagement />}
          {activeTab === 'orders' && <OrderHistory />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
