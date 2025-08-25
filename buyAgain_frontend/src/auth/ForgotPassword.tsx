import { useEffect, useState, type ChangeEvent } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const { user, handleForgotPassword, loadingAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UX states for ForgotPassword
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);

  // Hook for navigation
  const navigate = useNavigate();

  // If a user is already logged in, navigate them away from this page
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Email validation logic
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    // Set isEmailValid to true if email is empty (no error if user hasn't typed yet)
    setIsEmailValid(isValid || email.length === 0);
  }, [email]);

  // Determine if the submit button should be disabled
  const canSubmit =
    email.trim() !== '' && isEmailValid && !isSubmitting && !loadingAuth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');
    setError('');

    // Client-side validation before sending to backend
    if (!email.trim()) {
      setError('Please enter your email address.');
      setIsSubmitting(false);
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    const result = await handleForgotPassword(email);
    if (result.success) {
      setStatus(
        result.message || 'A password reset link has been sent to your email.',
      );
      setError('');
      setEmail(''); // Clear email field on success

      console.log('Reset link sent to:', email);
    } else {
      console.log('An error occurred during password reset request');
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
        <button
          className="my-5 -ml-6 flex flex-row gap-2 pl-8 hover:font-semibold"
          onClick={() => navigate('/')}
        >
          <ArrowLeft />
          Home
        </button>
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
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setError(''); // Clear general error on input change
              setStatus(''); // Clear status message on input change
            }}
            onBlur={() => setEmailTouched(true)} // Mark email as touched on blur
            className={`w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-1 ${emailTouched && email.length > 0 && !isEmailValid ? 'border-red-500 focus:ring-red-500' : email.length > 0 && isEmailValid ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
            required
            disabled={isSubmitting || loadingAuth}
          />
          {emailTouched && email.length > 0 && !isEmailValid && (
            <p className="mt-1 text-sm text-red-500">
              Please enter a valid email address.
            </p>
          )}

          {status && (
            <p className="rounded-md bg-green-50 p-2 text-center text-sm text-green-600 dark:bg-green-200 dark:text-black">
              {status}
            </p>
          )}
          {error && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-200 dark:text-black">
              {error}
            </p>
          )}
          <button
            type="submit"
            className={`w-full rounded-lg py-3 font-bold text-white transition ${canSubmit ? 'bg-pink-700 hover:bg-pink-600' : 'cursor-not-allowed bg-gray-400'}`}
            disabled={!canSubmit}
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
