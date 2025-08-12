import { useState, type ChangeEvent } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // Access auth functions and state from the context
  const { handleLogin, loadingAuth } = useAuth();

  // State for the form inputs and submission status
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  // Navigation hook
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(''); // Clear previous errors

    try {
      // Call the login function from the context with email and password
      const result = await handleLogin(email, password);

      if (result.success) {
        // Clear form inputs on successful login
        setEmail('');
        setPassword('');

        const userProfile = result?.userProfile;
        console.log('USER:', userProfile);

        // check if logged in user is admin | seller
        // in PROD use userProfile?.data.dataKey.role
        if (
          userProfile?.data.users?.role === 'admin' ||
          userProfile?.data.users?.role === 'seller'
        ) {
          navigate('/admin');
        } else {
          navigate('/products'); // Navigate ordinary users to the home page
        }
      } else {
        // Display the error message from the API
        setFormError(result.error || 'An unknown error occurred.');
      }
    } catch (error) {
      // This catch block will handle any unexpected errors during the process
      console.error('Login failed:', error);
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <div className="mb-6 gap-2">
          <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
            Login to shop
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700"
              placeholder="Enter your email"
              required
              disabled={isSubmitting || loadingAuth}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-full border border-gray-300 px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700"
              placeholder="Enter your password"
              required
              disabled={isSubmitting || loadingAuth}
            />
          </div>
          {formError && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-200 dark:text-black">
              {formError}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-full bg-pink-700 py-2 font-bold text-white transition hover:bg-pink-600"
          >
            {isSubmitting || loadingAuth ? 'Logging you in...' : 'Login'}
          </button>
        </form>
        <div className="my-2 flex justify-center text-sm text-blue-800">
          <button
            type="button"
            className="text-blue-600 underline-offset-4 transition-colors hover:text-blue-800 hover:underline focus:outline-none dark:text-blue-400 dark:hover:text-blue-600"
            onClick={() => navigate('/forgot-password')}
            disabled={isSubmitting || loadingAuth}
          >
            Forgot password?
          </button>
        </div>

        <p className="text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-pink-500 underline-offset-4 hover:underline"
            disabled={isSubmitting || loadingAuth}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
