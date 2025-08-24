import { User, ShoppingBag, Heart, ArrowLeft, ChartLine } from 'lucide-react';
import Logout from '../auth/Logout';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const MePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const logout = Logout();

  const userProfile = user?.data?.users;

  return (
    <>
      <button
        className="mt-10 flex flex-row gap-2 pl-8 hover:font-semibold"
        onClick={() => navigate('/')}
      >
        <ArrowLeft />
        Back
      </button>
      <div className="flex min-h-screen flex-col items-center p-6">
        {/* Header */}
        <h1 className="mb-6 text-2xl font-bold">My Account</h1>

        {/* Profile Card */}
        <div className="flex w-full max-w-md flex-col items-center rounded-2xl bg-white p-6 shadow-md">
          <img
            src={userProfile?.photo}
            alt={userProfile?.name}
            className="mb-4 h-24 w-24 rounded-full border-2 border-pink-500"
          />
          <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-900">
            {userProfile?.name}
          </h2>
          <p className="text-gray-500 dark:text-gray-900">
            {userProfile?.email}
          </p>

          <button
            onClick={() => navigate('/me/settings')}
            className="mt-4 w-full rounded-xl bg-pink-500 py-2 text-white transition hover:bg-pink-600"
          >
            Edit Profile
          </button>
        </div>

        {/* Account Options */}
        <div className="mt-6 w-full max-w-md space-y-4">
          {userProfile?.role === 'admin' && (
            <button
              onClick={() => navigate('/admin')}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-b border-gray-200 p-4 hover:bg-pink-50 dark:hover:bg-pink-700"
            >
              <ChartLine className="text-pink-500" />
              <span className="font-medium">Admin Dashboard</span>
            </button>
          )}
          <div
            onClick={() => navigate('/me/orders')}
            className="flex cursor-pointer items-center gap-3 rounded-xl border-b border-gray-200 p-4 hover:bg-pink-50 dark:hover:bg-pink-700"
          >
            <ShoppingBag className="text-pink-500" />
            <span className="font-medium">My Orders</span>
          </div>
          <div className="flex cursor-pointer items-center gap-3 rounded-xl border-b border-gray-200 p-4 hover:bg-pink-50 dark:hover:bg-pink-700">
            <Heart className="text-pink-500" />
            <span className="font-medium">Wishlist</span>
          </div>
          <button
            onClick={() => navigate('/me/settings')}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl border-b border-gray-200 p-4 hover:bg-pink-50 dark:hover:bg-pink-700"
          >
            <User className="text-pink-500" />
            <span className="font-medium">Account Settings</span>
          </button>
          <button
            onClick={logout}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-2 text-red-500 hover:bg-pink-50 dark:hover:bg-pink-700"
          >
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MePage;
