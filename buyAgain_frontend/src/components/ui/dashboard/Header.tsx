/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Menu, Sun, Moon, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleTheme: () => void;
  theme: 'dark' | 'light';
  logout: () => void;
  userProfile?: any;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleTheme,
  theme,
  logout,
  userProfile,
  setSidebarOpen,
}) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
      <button
        className="mr-4 md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      <h1 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-200">
        Dashboard
      </h1>
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2"
          title="Toggle dark / light"
        >
          {theme ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          className="flex items-center gap-1 rounded-md bg-black px-3 py-1 text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          aria-label="Logout"
          onClick={logout}
        >
          Logout
        </button>
        <button
          onClick={() => navigate('/me')}
          className="cursor-pointer rounded-full bg-gray-300"
        >
          {userProfile?.photo ? (
            <img
              src={userProfile.photo}
              alt={userProfile.name || 'user profile photo'}
              className="max-h-8 max-w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center">
              <User size={18} />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
export default Header;
