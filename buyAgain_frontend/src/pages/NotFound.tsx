import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Frown } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Set the page title directly
    document.title = 'Page Not Found';
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center dark:bg-gray-900">
      <div className="max-w-md">
        <div className="mb-6 flex justify-center text-pink-600 dark:text-pink-400">
          <Frown size={80} strokeWidth={1.5} />
        </div>
        <h1 className="mb-4 text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl md:text-8xl">
          404
        </h1>
        <h2 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
          Page Not Found
        </h2>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-flex items-center rounded-full bg-pink-600 px-6 py-3 text-lg font-medium text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-pink-700 focus:outline-none focus:ring-4 focus:ring-pink-300 dark:focus:ring-pink-800"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
