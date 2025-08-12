import { useState } from 'react';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  User,
  Sun,
  Moon,
  Heart,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import Logout from '../auth/Logout';

interface NavLinks {
  name: string;
  url: string;
}

const Header = () => {
  const { user } = useAuth();
  const logout = Logout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { toggleTheme, theme } = useTheme();

  const navigate = useNavigate();

  const navLinks: NavLinks[] = [
    {
      name: 'Home',
      url: '#home',
    },
    {
      name: 'Shop',
      url: '#shop',
    },
    {
      name: 'Categories',
      url: '#categories',
    },
  ];

  const popularSearches = [
    'Sneakers',
    'Wristwatches',
    'Perfumes',
    'Laptops',
    'Bags',
  ];

  const filteredSearches = popularSearches.filter((search) =>
    search.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <header className="bg-white dark:bg-black">
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <div className="gap- flex items-center">
          {/* Menu button for medium/small screens */}
          <button
            className="mr-2 md:block lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Brand Logo */}
          <h1 className="dancing-script-brand-font text-2xl tracking-tighter text-pink-600">
            buyAgain
          </h1>
        </div>

        {/* Search Input - Large screens */}
        <div className="relative hidden w-1/3 items-center lg:flex">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search for products..."
              className="w-full rounded-full border bg-gray-100 px-4 py-2 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-pink-700 p-2 text-white hover:bg-pink-500">
              <Search size={18} />
            </button>
          </div>

          {/* Dropdown of popular searches */}
          {searchFocus && filteredSearches.length > 0 && (
            <div className="absolute left-0 top-full mt-2 w-full rounded-lg bg-white p-2 shadow-lg dark:bg-gray-900">
              {filteredSearches.map((item: string, i) => (
                <div
                  key={i}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-pink-50 dark:hover:bg-pink-900"
                >
                  <Search size={16} className="text-pink-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-full p-2 hover:font-bold"
            title="Toggle theme"
          >
            {theme ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <>
              <div className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                Edit Profile
              </div>
              <button
                className="inline-flex items-center gap-1 font-semibold hover:text-pink-500"
                onClick={() => alert('Get Wishlist Items')}
              >
                <Heart size={18} />
              </button>
              {/* <button
                className="inline-flex items-center gap-1 rounded-full bg-black px-4 py-2 font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={() => navigate('/login')}
              >
                Log In
              </button> */}
              <button
                className="flex items-center gap-1 rounded-md bg-black px-3 py-1 text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                aria-label="Logout"
                onClick={logout}
              >
                Logout
              </button>

              <ShoppingCart size={22} className="cursor-pointer" />
              <div className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-300">
                <User size={18} />
                {/* <img src="" alt="user photo" /> */}
              </div>
            </>
          ) : (
            <>
              <button
                className="inline-flex items-center gap-1 font-semibold hover:text-pink-500"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-full bg-black px-4 py-2 font-semibold text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                onClick={() => navigate('/login')}
              >
                Log In
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Input for small screens */}
      <div className="relative mx-auto w-2/3 lg:hidden">
        <div className="relative mb-2 w-full">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full rounded-full border bg-gray-100 px-4 py-2 pl-10 text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setTimeout(() => setSearchFocus(false), 150)}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-pink-700 p-2 text-white hover:bg-pink-500">
            <Search size={18} />
          </button>
        </div>
        {searchFocus && filteredSearches.length > 0 && (
          <div className="absolute left-0 top-full mt-2 w-full rounded-lg bg-white p-2 shadow-lg dark:bg-gray-900">
            {filteredSearches.map((item: string, i) => (
              <div
                key={i}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-pink-50 dark:hover:bg-pink-900"
              >
                <Search size={16} className="text-pink-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black md:block lg:hidden">
          <nav className="flex flex-col space-y-3 p-4">
            {navLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                className="font-semibold hover:text-pink-500"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
