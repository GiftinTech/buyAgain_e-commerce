import { useEffect, useState, type ChangeEvent } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const { user, handleForgotPassword, loadingAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hook for navigation
  const navigate = useNavigate();

  // If a user is already logged in, navigate them away from this page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    setError('');

    const result = await handleForgotPassword(email);
    if (result.success) {
      setStatus(
        result.message || 'A password reset link has been sent to your email.',
      );
      setError('');
      setEmail('');

      console.log('Reset link sent to:', email);
    } else {
      console.log('An unknown error ocuurred');
      setStatus('');
      setError(
        result.message ||
          'Failed to send password reset email. Please try again.',
      );
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <h2 className="mb-3 text-center text-2xl font-bold text-black dark:text-white">
          Forgot Password
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Enter your registered email to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-lg border border-gray-300 p-3 text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
            disabled={isSubmitting || loadingAuth}
          />
          {status && (
            <p className="rounded-md bg-green-50 p-2 text-center text-sm text-green-600 dark:bg-green-200 dark:text-black">
              {status}
            </p>
          )}
          {error && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-900 dark:text-red-300">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-lg bg-pink-700 py-3 font-bold text-white transition hover:bg-pink-600"
            disabled={isSubmitting || loadingAuth}
          >
            {isSubmitting || loadingAuth
              ? 'Sending Link...'
              : 'Send Reset Link'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
          Remembered your password?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 underline-offset-4 transition-colors hover:text-blue-800 hover:underline focus:outline-none dark:text-blue-400 dark:hover:text-blue-600"
            disabled={isSubmitting || loadingAuth}
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
