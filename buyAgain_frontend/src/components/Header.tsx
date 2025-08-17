import { useState, useEffect } from 'react'; // Added useEffect and useCallback
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Heart,
  User,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import useTheme from '../hooks/useTheme';
import Logout from '../auth/Logout';

// Assuming a basic structure for products fetched from API for search terms
interface IProductSearch {
  category: string;
  tags: string[];
  // You can add 'title' or 'name' here if you want to use product names as search terms
}

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
  const [popularSearchTerms, setPopularSearchTerms] = useState<string[]>([]); // state for dynamic search terms

  const { toggleTheme, theme } = useTheme();

  const navigate = useNavigate();

  // Base URL for buyAgain buyAgain_backend API
  const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

  const userProfile = user?.data.users; // In PROD, use user?.data.dataKey.photo;

  const navLinks: NavLinks[] = [
    {
      name: 'Home',
      url: '/',
    },
    {
      name: 'Shop',
      url: '/',
    },
    {
      name: 'Categories',
      url: '/',
    },
  ];

  // Fetch popular search terms dynamically
  useEffect(() => {
    const fetchPopularSearchData = async () => {
      try {
        const res = await fetch(`${BUYAGAIN_API_BASE_URL}/products?limit=10`);

        if (!res.ok) {
          console.error('Failed to fetch popular search data:', res.statusText);
          return;
        }
        const result = await res.json();
        const products: IProductSearch[] = result.data.products;

        // Extract unique categories and tags
        const extractedTerms = new Set<string>();
        products.forEach((product) => {
          if (product.category) {
            extractedTerms.add(product.category);
          }
          if (product.tags) {
            product.tags.forEach((tag) => extractedTerms.add(tag));
          }
          // If you want product titles as popular searches:
          // if (product.title) {
          //   extractedTerms.add(product.title);
          // }
        });
        setPopularSearchTerms(Array.from(extractedTerms));
      } catch (err) {
        console.error('Error fetching popular search terms:', err);
      }
    };

    fetchPopularSearchData();
  }, [BUYAGAIN_API_BASE_URL]); // Dependent on backend

  // Filter the dynamic search terms based on user input
  const filteredSearches = popularSearchTerms.filter((term) =>
    term.toLowerCase().includes(searchValue.toLowerCase()),
  );

  return (
    <header className="relative z-40 bg-white dark:bg-black">
      {' '}
      {/* Added z-50 here */}
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center">
          {/* Menu button for medium/small screens */}
          <button
            className="mr-2 md:block lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation menu"
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
              aria-label="Search products"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-pink-700 p-2 text-white hover:bg-pink-500">
              <Search size={18} />
            </button>
          </div>

          {/* Dropdown of popular searches (now dynamic) */}
          {searchFocus && filteredSearches.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg bg-white p-2 shadow-lg dark:bg-gray-900">
              {' '}
              {/* Added z-50 here for the dropdown */}
              {filteredSearches.map((item: string) => (
                <div
                  key={item} // Changed key to item (string) for uniqueness if terms are unique
                  className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-pink-50 dark:hover:bg-pink-900"
                  onClick={() => {
                    setSearchValue(item); // Set search input to clicked term
                    setSearchFocus(false); // Close dropdown
                    // trigger a search
                    navigate(`/products?q=${item}`);
                  }}
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
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}{' '}
            {/* Updated based on your theme state */}
          </button>
          {user ? (
            <>
              <div className="z-60 absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded bg-gray-800 px-2 py-1 text-sm text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                Edit Profile
              </div>
              <button
                className="inline-flex items-center gap-1 font-semibold hover:text-pink-500"
                onClick={() => alert('Get Wishlist Items')} // Consider replacing alert()
                aria-label="View wishlist"
              >
                <Heart size={18} />
              </button>
              <button
                className="flex items-center gap-1 rounded-md bg-black px-3 py-1 text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                aria-label="Logout"
                onClick={logout}
              >
                Logout
              </button>
              <ShoppingCart
                size={22}
                className="cursor-pointer"
                onClick={() => navigate('/cart')}
              />{' '}
              {/* Added onClick for cart */}
              <div className="flex max-h-9 max-w-9 cursor-pointer rounded-full">
                {userProfile?.photo ? (
                  <img
                    src={userProfile.photo}
                    alt={userProfile.name || 'user profile photo'}
                    className="h-full w-full rounded-full object-cover" // Added object-cover to prevent distortion
                  />
                ) : (
                  <User size={18} />
                )}
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
            aria-label="Search products"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-pink-700 p-2 text-white hover:bg-pink-500">
            <Search size={18} />
          </button>
        </div>
        {searchFocus && filteredSearches.length > 0 && (
          <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg bg-white p-2 shadow-lg dark:bg-gray-900">
            {' '}
            {/* Added z-50 here */}
            {filteredSearches.map((item: string) => (
              <div
                key={item} // Changed key to item
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 hover:bg-pink-50 dark:hover:bg-pink-900"
                onClick={() => {
                  setSearchValue(item); // Set search input to clicked term
                  setSearchFocus(false); // Close dropdown
                  // Trigger search logic here
                }}
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
        <div className="z-40 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-black md:block lg:hidden">
          {' '}
          {/* Adjusted z-index for sidebar */}
          <nav className="flex flex-col space-y-3 p-4">
            {navLinks.map((link, i) => (
              <a
                key={i}
                onClick={() => navigate(link.url)}
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
