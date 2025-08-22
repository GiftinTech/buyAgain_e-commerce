/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './PhotoUpload';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<
    'profile' | 'security' | 'address' | 'payment' | 'notifications'
  >('profile');

  return (
    <>
      <button
        className="mt-10 flex flex-row gap-2 pl-8 hover:font-semibold"
        onClick={() => navigate('/me')}
      >
        <ArrowLeft />
        Back
      </button>
      <div className="mx-auto min-h-screen max-w-3xl bg-white p-6 text-black">
        <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          {['profile', 'security', 'address', 'payment', 'notifications'].map(
            (item) => (
              <button
                key={item}
                className={`pb-2 capitalize ${
                  tab === item
                    ? 'border-b-2 border-pink-500 text-pink-500'
                    : 'text-gray-500'
                }`}
                onClick={() => setTab(item as any)}
              >
                {item}
              </button>
            ),
          )}
        </div>

        {/* Tab Content */}
        {tab === 'profile' && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Personal Information</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-lg border p-2"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border p-2"
              />
              <label className="font-semibold">Upload profile picture:</label>
              <FileUpload />
              <button className="rounded-lg bg-pink-500 px-4 py-2 text-white">
                Save
              </button>
            </form>
          </div>
        )}

        {tab === 'security' && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Security</h2>
            <form className="space-y-4">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full rounded-lg border p-2"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full rounded-lg border p-2"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                className="w-full rounded-lg border p-2"
              />
              <button className="rounded-lg bg-pink-500 px-4 py-2 text-white">
                Update Password
              </button>
            </form>
          </div>
        )}

        {tab === 'address' && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Addresses</h2>
            <p className="mb-2 text-gray-500">
              Add or manage your shipping addresses.
            </p>
            <button className="rounded-lg bg-pink-500 px-4 py-2 text-white">
              Add New Address
            </button>
          </div>
        )}

        {tab === 'payment' && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Payment Methods</h2>
            <p className="mb-2 text-gray-500">
              Manage your saved cards and payment methods.
            </p>
            <button className="rounded-lg bg-pink-500 px-4 py-2 text-white">
              Add Payment Method
            </button>
          </div>
        )}

        {tab === 'notifications' && (
          <div>
            <h2 className="mb-2 text-lg font-semibold">Notifications</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Order Updates
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Promotions & Offers
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Newsletters
            </label>
          </div>
        )}
      </div>
    </>
  );
};

export default AccountSettings;
