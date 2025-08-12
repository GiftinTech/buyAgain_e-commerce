import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const { handleSignup, loadingAuth } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    const result = await handleSignup(name, email, password, passwordConfirm);

    if (result.success) {
      setName('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');

      navigate('/products');
    } else {
      setFormError(
        result.error ||
          'An unknown error occurred. Please try signing up again',
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="mb-6">
          <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
            Sign Up to Shop
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="user name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700"
              placeholder="Enter your password"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <input
              name="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700"
              placeholder="Enter your password"
              required
            />
          </div>

          {formError && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-900 dark:text-red-300">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-pink-700 py-2 font-bold text-white transition hover:bg-pink-600"
          >
            {isSubmitting || loadingAuth ? 'Signing you up...' : 'Signup'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-pink-700 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
