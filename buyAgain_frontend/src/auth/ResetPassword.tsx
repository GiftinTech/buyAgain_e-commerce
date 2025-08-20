import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'; // Import Lucide React icons
import { useAlert } from '../hooks/useAlert';

const ResetPassword = () => {
  const { handlePasswordReset, loadingAuth } = useAuth();
  const { showAlert } = useAlert();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { token } = useParams();
  const navigate = useNavigate();

  // UX states for password validation
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<
    'none' | 'weak' | 'medium' | 'strong'
  >('none');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Password requirements
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasMixedCase, setHasMixedCase] = useState(false);

  // Function to determine password strength and update requirements checklist
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

  useEffect(() => {
    // Update password strength and checklist for newPassword
    setPasswordStrength(getPasswordStrength(newPassword));

    // Check if passwords match
    if (confirmPassword.length > 0) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true); // Don't show mismatch until confirm password is typed
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    // Ensure token is present
    if (!token) {
      setError(
        'Invalid or expired password reset link. Please request a new one.',
      );

      // Redirect the user to the forgot password page after a short delay
      const timer = setTimeout(() => {
        navigate('/forgot-password');
      }, 3000);

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  // Determine if the submit button should be disabled
  const canSubmit =
    newPassword.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    passwordsMatch &&
    (passwordStrength === 'medium' || passwordStrength === 'strong') && // Require at least medium strength
    !isSubmitting &&
    !loadingAuth &&
    !!token; // Ensure token is present

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setIsSubmitting(true);

    // Client-side validation before sending to backend
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }
    if (passwordStrength === 'weak' || passwordStrength === 'none') {
      setError('Password is too weak. Please choose a stronger password.');
      setIsSubmitting(false);
      return;
    }

    const result = await handlePasswordReset(
      token!,
      newPassword,
      confirmPassword,
    );

    setIsSubmitting(false);

    if (result.success) {
      setStatus(result.message || 'Password reset successful!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate('/login'), 2000);
      showAlert('success', 'Password reset successful.');
    } else {
      setError(result.message || 'Something went wrong. Try again.');
      showAlert('error', 'Error resetting your password. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-900">
        <h2 className="mb-3 text-center text-2xl font-bold text-black dark:text-white">
          Reset Password
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Enter your new secure password
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                id="newPassword"
                placeholder="New Password"
                value={newPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setNewPassword(e.target.value);
                  setError(''); // Clear error on change
                  setStatus(''); // Clear status on change
                }}
                className={`w-full rounded-lg border p-3 pr-10 text-black focus:outline-none focus:ring-1 ${newPassword.length > 0 && (passwordStrength === 'weak' || passwordStrength === 'none') ? 'border-red-500 focus:ring-red-500' : newPassword.length > 0 && (passwordStrength === 'medium' || passwordStrength === 'strong') ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
                required
                disabled={isSubmitting || loadingAuth}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none dark:text-gray-400"
                aria-label={
                  showNewPassword ? 'Hide new password' : 'Show new password'
                }
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {newPassword.length > 0 && (
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

          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassword(e.target.value);
                  setError(''); // Clear error on change
                  setStatus(''); // Clear status on change
                }}
                className={`w-full rounded-lg border p-3 pr-10 text-black focus:outline-none focus:ring-1 ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500 focus:ring-red-500' : confirmPassword.length > 0 && passwordsMatch ? 'border-green-500 focus:ring-green-500' : 'border-gray-300 focus:ring-gray-300 dark:border-gray-700'}`}
                required
                disabled={isSubmitting || loadingAuth}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 focus:outline-none dark:text-gray-400"
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="mt-2 text-sm text-red-500">
                Passwords do not match.
              </p>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 p-2 text-center text-sm text-red-600 dark:bg-red-200 dark:text-black">
              {error}
            </p>
          )}
          {status && (
            <p className="rounded-md bg-green-50 p-2 text-center text-sm text-green-600 dark:bg-green-200 dark:text-black">
              {status}
            </p>
          )}
          <button
            type="submit"
            className={`w-full rounded-lg py-3 font-bold text-white transition ${canSubmit ? 'bg-pink-700 hover:bg-pink-600' : 'cursor-not-allowed bg-gray-400'}`}
            disabled={!canSubmit}
          >
            {isSubmitting || loadingAuth ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
