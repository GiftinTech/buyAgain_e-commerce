import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert';
import { CheckCircle, Eye, EyeOff, XCircle } from 'lucide-react';

const Signup = () => {
  const { handleSignup, loadingAuth } = useAuth();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UX states
  const [nameTouched, setNameTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    'none' | 'weak' | 'medium' | 'strong'
  >('none');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Password requirements
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasMixedCase, setHasMixedCase] = useState(false);

  // Email validation
  const [isEmailValid, setIsEmailValid] = useState(true);

  const navigate = useNavigate();

  // Function to determine password strength
  const getPasswordStrength = (
    pwd: string,
  ): 'none' | 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    setHasMinLength(pwd.length >= 8);
    if (pwd.length >= 8) strength++;

    setHasMixedCase(/[a-z]/.test(pwd) && /[A-Z]/.test(pwd));
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;

    setHasNumber(/\d/.test(pwd));
    if (/\d/.test(pwd)) strength++;

    setHasSpecialChar(/[^a-zA-Z0-9]/.test(pwd));
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength === 0) return 'none';
    if (strength <= 1) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  };

  // Effect to update password strength and confirm password match
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
    if (passwordConfirm.length > 0) {
      setPasswordsMatch(password === passwordConfirm);
    } else {
      setPasswordsMatch(true); // Don't show mismatch until confirm password is typed
    }
  }, [password, passwordConfirm]);

  // Effect for email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setIsEmailValid(isValid || email.length === 0); // empty as temporarily valid
  }, [email]);

  // Determine if the submit button should be disabled
  const canSubmit =
    name.trim() !== '' &&
    email.trim() !== '' &&
    isEmailValid &&
    password.trim() !== '' &&
    passwordConfirm.trim() !== '' &&
    passwordsMatch &&
    (passwordStrength === 'medium' || passwordStrength === 'strong') && // Require at least medium strength
    !isSubmitting &&
    !loadingAuth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Additional client-side validation before sending to backend
    if (!passwordsMatch) {
      setError("Passwords don't match.");
      setIsSubmitting(false);
      return;
    }
    if (passwordStrength === 'weak' || passwordStrength === 'none') {
      setError('Password is too weak. Please choose a stronger password.');
      setIsSubmitting(false);
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    const result = await handleSignup(name, email, password, passwordConfirm);

    if (result.success) {
      showAlert('success', `Signup successful 🎉! Welcome, ${name}😊`, 2);
      navigate('/');

      // Clear form fields on success
      setName('');
      setEmail('');
      setPassword('');
      setPasswordConfirm('');
      setError(''); // Clear any previous errors
    } else {
      setError(
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
          {/* Full Name Input */}
          <div>
            <label
              htmlFor="name"
              className="mb-1 block text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="user name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onBlur={() => setNameTouched(true)}
              className={`w-full rounded-full border px-4 py-2 text-black focus:outline-none focus:ring-1 ${nameTouched && name.trim() === '' ? 'border-red-500 focus:ring-red-500' : name.length > 0 ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
              placeholder="Enter your name"
              required
              disabled={isSubmitting || loadingAuth}
            />
            {/* Display error message for name if touched and empty */}
            {nameTouched && name.trim() === '' && (
              <p className="mt-1 text-sm text-red-500">
                Full Name is required.
              </p>
            )}
          </div>

          {/* Email Input */}
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              className={`w-full rounded-full border px-4 py-2 text-black focus:outline-none focus:ring-1 ${email.length > 0 && !isEmailValid ? 'border-red-500 focus:ring-red-500' : email.length > 0 && isEmailValid ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
              placeholder="Enter your email"
              required
              disabled={isSubmitting || loadingAuth}
            />
            {email.length > 0 && !isEmailValid && (
              <p className="mt-1 text-sm text-red-500">
                Please enter a valid email address.
              </p>
            )}
          </div>

          {/* Password Input */}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(''); // Clear general error on change
                }}
                // Conditional styling based on password strength
                className={
                  `w-full rounded-full border px-4 py-2 pr-10 text-black focus:outline-none focus:ring-1 ${password.length > 0 && (passwordStrength === 'weak' || passwordStrength === 'none') ? 'border-red-500 focus:ring-red-500' : password.length > 0 && (passwordStrength === 'medium' || passwordStrength === 'strong') ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}` // Conditional styling
                }
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
            {/* Keep password strength and checklist UX as is */}
            {password.length > 0 && (
              <div className="mt-2 text-sm">
                <p
                  className={` ${passwordStrength === 'none' ? 'text-gray-500' : ''} ${passwordStrength === 'weak' ? 'text-red-500' : ''} ${passwordStrength === 'medium' ? 'text-yellow-500' : ''} ${passwordStrength === 'strong' ? 'text-green-500' : ''} `}
                >
                  Password Strength:{' '}
                  {passwordStrength.charAt(0).toUpperCase() +
                    passwordStrength.slice(1)}
                </p>
                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-2.5 rounded-full ${passwordStrength === 'none' ? 'w-0' : ''} ${passwordStrength === 'weak' ? 'w-1/4 bg-red-500' : ''} ${passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : ''} ${passwordStrength === 'strong' ? 'w-full bg-green-500' : ''} `}
                  ></div>
                </div>

                {/* Password Requirements Checklist */}
                <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    {hasMinLength ? (
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                    ) : (
                      <XCircle size={16} className="mr-2 text-red-500" />
                    )}
                    Minimum 8 characters
                  </li>
                  <li className="flex items-center">
                    {hasMixedCase ? (
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                    ) : (
                      <XCircle size={16} className="mr-2 text-red-500" />
                    )}
                    Mixed case (uppercase and lowercase)
                  </li>
                  <li className="flex items-center">
                    {hasNumber ? (
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                    ) : (
                      <XCircle size={16} className="mr-2 text-red-500" />
                    )}
                    At least one number
                  </li>
                  <li className="flex items-center">
                    {hasSpecialChar ? (
                      <CheckCircle size={16} className="mr-2 text-green-500" />
                    ) : (
                      <XCircle size={16} className="mr-2 text-red-500" />
                    )}
                    At least one special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label
              htmlFor="passwordConfirm"
              className="mb-1 block text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => {
                  setPasswordConfirm(e.target.value);
                  setError(''); // Clear general error on change
                }}
                // Conditional styling based on password match
                className={
                  `w-full rounded-full border px-4 py-2 pr-10 text-black focus:outline-none focus:ring-1 ${passwordConfirm.length > 0 && !passwordsMatch ? 'border-red-500 focus:ring-red-500' : passwordConfirm.length > 0 && passwordsMatch ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}` // Conditional styling
                }
                placeholder="Confirm your password"
                required
                disabled={isSubmitting || loadingAuth}
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none dark:text-gray-400"
                aria-label={
                  showPasswordConfirm
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showPasswordConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {passwordConfirm.length > 0 && !passwordsMatch && (
              <p className="mt-2 text-sm text-red-500">
                Passwords do not match.
              </p>
            )}
          </div>

          {/* Show any error */}
          {error && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-200 dark:text-black">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={`w-full rounded-full py-2 font-bold text-white transition ${canSubmit ? 'bg-pink-700 hover:bg-pink-600' : 'cursor-not-allowed bg-gray-400'}`}
            disabled={!canSubmit}
          >
            {isSubmitting || loadingAuth ? 'Signing you up...' : 'Signup'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-pink-700 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
