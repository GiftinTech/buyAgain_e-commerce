/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Home, Users, Package, X, ShoppingCart } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeTab: 'dashboard' | 'users' | 'products' | 'orders';
  setActiveTab: (tab: 'dashboard' | 'users' | 'products') => void;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  setActiveTab,
}) => (
  <aside
    className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-black ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
  >
    <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
      <h2 className="text-lg font-bold text-pink-600">Admin Panel</h2>
      <button
        className="md:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-label="Close sidebar"
      >
        <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
    <nav className="mt-6 flex flex-col space-y-1 px-4">
      {[
        { name: 'Dashboard', id: 'dashboard' },
        { name: 'Users', id: 'users' },
        { name: 'Products', id: 'products' },
        { name: 'Orders', id: 'orders' },
      ].map(({ name, id }) => (
        <button
          key={id}
          onClick={() => {
            setActiveTab(id as any);
            setSidebarOpen(false);
          }}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-700 hover:bg-pink-100 hover:text-pink-600 dark:text-gray-300 dark:hover:bg-pink-700 dark:hover:text-pink-200 ${
            activeTab === id
              ? 'bg-pink-100 text-pink-600 dark:bg-pink-800 dark:text-pink-200'
              : ''
          }`}
        >
          {id === 'dashboard' && <Home className="h-5 w-5" />}
          {id === 'users' && <Users className="h-5 w-5" />}
          {id === 'products' && <Package className="h-5 w-5" />}
          {id === 'orders' && <ShoppingCart className="h-5 w-5" />}
          <span className="font-medium">{name}</span>
        </button>
      ))}
    </nav>
  </aside>
);
export default Sidebar;
