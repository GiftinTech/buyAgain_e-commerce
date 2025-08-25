import { useState, useEffect, type ChangeEvent } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert'; // Assuming useAlert is still needed for overall alerts
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'; // Import Lucide React icons for password toggle

const Login = () => {
  const navigate = useNavigate();

  const { handleLogin, loadingAuth } = useAuth();
  const { showAlert } = useAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UX states for Login
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Email validation logic
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);

    setIsEmailValid(isValid || email.length === 0);
  }, [email]);

  // Determine if the submit button should be disabled
  const canSubmit =
    email.trim() !== '' &&
    password.trim() !== '' &&
    isEmailValid &&
    !isSubmitting &&
    !loadingAuth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(''); // Clear previous form-wide errors

    // Client-side validation before sending to backend
    if (!email.trim() || !password.trim()) {
      setFormError('Please fill in both email and password.');
      setIsSubmitting(false);
      return;
    }
    if (!isEmailValid) {
      setFormError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    const result = await handleLogin(email, password);
    //console.log('login result', result);

    if (result.success) {
      showAlert('success', 'Logged in successfully!', 2);

      if (result.userProfile?.data.users?.role === 'admin') navigate('/admin');
      else navigate('/');
    } else {
      setFormError(result.error || 'Login failed. Please try again.');
      showAlert('error', result.error || 'Login failed. Please try again.', 1);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-900">
        <button
          className="my-5 -ml-6 flex flex-row gap-2 pl-8 hover:font-semibold"
          onClick={() => navigate('/')}
        >
          <ArrowLeft />
          Home
        </button>
        <div className="mb-6 gap-2">
          <h1 className="text-center text-2xl font-bold text-gray-800 dark:text-white">
            Login to shop
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                setFormError('');
              }}
              onBlur={() => setEmailTouched(true)}
              className={`w-full rounded-full border px-4 py-2 text-black focus:outline-none focus:ring-1 ${emailTouched && email.length > 0 && !isEmailValid ? 'border-red-500 focus:ring-red-500' : email.length > 0 && isEmailValid ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
              placeholder="Enter your email"
              required
              disabled={isSubmitting || loadingAuth}
            />
            {emailTouched && email.length > 0 && !isEmailValid && (
              <p className="mt-1 text-sm text-red-500">
                Please enter a valid email address.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setPassword(e.target.value);
                  setFormError('');
                }}
                onBlur={() => setPasswordTouched(true)}
                className={`w-full rounded-full border px-4 py-2 pr-10 text-black focus:outline-none focus:ring-1 ${passwordTouched && password.length === 0 ? 'border-red-500 focus:ring-red-500' : password.length > 0 ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
                placeholder="Enter your password"
                required
                disabled={isSubmitting || loadingAuth}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none dark:text-gray-400"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordTouched && password.length === 0 && (
              <p className="mt-1 text-sm text-red-500">Password is required.</p>
            )}
          </div>

          {formError && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-200 dark:text-black">
              {formError}
            </p>
          )}

          <button
            type="submit"
            className={`w-full rounded-full py-2 font-bold text-white transition ${canSubmit ? 'bg-pink-700 hover:bg-pink-600' : 'cursor-not-allowed bg-gray-400'}`}
            disabled={!canSubmit}
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
