import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const ResetPassword = () => {
  const { handlePasswordReset, loadingAuth } = useAuth();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { token } = useParams();

  const navigate = useNavigate();

  useEffect(() => {
    // Ensure token is present
    if (!token) {
      setError(
        'Invalid or expired password reset link. Please request a new one.',
      );

      // Redirect the user to the forgot password page after a short delay
      const timer = setTimeout(() => {
        navigate('/forgot-password');
      }, 3000); // Redirect after 3 seconds

      // Cleanup function to clear the timer if the component unmounts
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('');
    setIsSubmitting(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
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
    } else {
      setError(result.message || 'Something went wrong. Try again.');
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
          <input
            type="password"
            name="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setNewPassword(e.target.value);
            }}
            className="w-full rounded-lg border border-gray-300 p-3 text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
            disabled={isSubmitting || loadingAuth}
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
            }}
            className="w-full rounded-lg border border-gray-300 p-3 text-black focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
            disabled={isSubmitting || loadingAuth}
          />
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
            className="w-full rounded-lg bg-pink-700 py-3 font-bold text-white transition hover:bg-pink-600"
          >
            {isSubmitting || loadingAuth ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
