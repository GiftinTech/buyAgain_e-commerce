/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, CheckCircle, Eye, EyeOff, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './PhotoUpload';
import useUser from '../hooks/useUser';

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();

  const {
    user,
    handleUpdateUser,
    handleUpdateUserPassword,
    isLoading,
    message,
    isSuccess,
    setMessage,
    setIsSuccess,
  } = useUser();

  const [tab, setTab] = useState<
    'profile' | 'security' | 'address' | 'payment' | 'notifications'
  >('profile');

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');

  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const [passwordCurrent, setPasswordCurrent] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Password validation UX states
  const [passwordStrength, setPasswordStrength] = useState<
    'none' | 'weak' | 'medium' | 'strong'
  >('none');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [isCurrentPwdVisible, setIsCurrentPwdVisible] =
    useState<boolean>(false);
  const [isNewPwdVisible, setIsNewPwdVisible] = useState<boolean>(false);
  const [isConfirmPwdVisible, setIsConfirmPwdVisible] =
    useState<boolean>(false);

  // Password requirements
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [hasMixedCase, setHasMixedCase] = useState(false);

  // Functions to determine password strength and requirements
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

  // Effects for password validation
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(newPassword));
    if (confirmPassword.length > 0) {
      setPasswordsMatch(newPassword === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [newPassword, confirmPassword]);

  useEffect(() => {
    if (user?.data?.users) {
      setName(user.data.users.name || '');
      setEmail(user.data.users.email || '');
    }
  }, [user]);

  // Helper function to convert a URL to a File object
  const urlToFile = async (
    url: string,
    filename: string,
  ): Promise<File | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('Error converting URL to File:', error);
      return null;
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    let hasChanges = false;
    const isEmailChanged = user?.data?.users?.email !== email;

    if (name !== (user?.data?.users?.name || '')) {
      formData.append('name', name);
      hasChanges = true;
    }

    if (isEmailChanged) {
      if (!password) {
        setShowPasswordInput(true);
        return;
      }
      formData.append('email', email);
      hasChanges = true;
      formData.append('password', password);
    }

    if (photo) {
      formData.append('photo', photo);
      hasChanges = true;
    } else if (user?.data?.users?.photo) {
      const existingPhotoFile = await urlToFile(
        user.data.users.photo,
        'user_photo.jpg',
      );
      if (existingPhotoFile) {
        formData.append('photo', existingPhotoFile);
      }
    }

    if (!hasChanges) {
      console.log('No changes to save.');
      return;
    }

    await handleUpdateUser(formData);
    setPassword('');
    setShowPasswordInput(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!passwordsMatch) {
      setMessage("Passwords don't match.");
      setIsSuccess(false);
      return;
    }
    if (passwordStrength === 'weak' || passwordStrength === 'none') {
      setMessage('Password is too weak. Please choose a stronger password.');
      setIsSuccess(false);
      return;
    }

    const passwordData = {
      passwordCurrent,
      password: newPassword,
      passwordConfirm: confirmPassword,
    };

    // console.log('Data being sent to the API:', passwordData);

    await handleUpdateUserPassword(passwordData);

    // Clear fields only on success
    if (isSuccess) {
      setPasswordCurrent('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <>
      <button
        className="mt-10 flex flex-row gap-2 pl-8 hover:font-semibold"
        onClick={() => navigate('/me')}
      >
        <ArrowLeft />
        Back
      </button>
      <div className="mx-auto min-h-screen max-w-3xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Account Settings</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-none">
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
          <div className="text-black sm:px-10">
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">
              Personal Information
            </h2>
            <form className="space-y-4" onSubmit={handleProfileUpdate}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-lg border p-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border p-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {/* Conditionally rendered password input */}
              {showPasswordInput && (
                <div className="relative">
                  <h1 className="mb-2 text-sm text-pink-600 dark:text-pink-400">
                    Changing your email?
                  </h1>
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="Enter your password to proceed"
                    className="w-full rounded-lg border p-2 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={true}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute right-0 top-10 flex items-center px-3 text-gray-500"
                  >
                    {isPasswordVisible ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              )}

              <FileUpload
                onFileChange={setPhoto}
                initialPhotoUrl={user?.data?.users?.photo}
              />

              {/* Loading and message feedback */}
              <div className="flex items-center gap-4 pt-6">
                <button
                  type="submit"
                  className={`text-md overflow-hidden text-ellipsis whitespace-nowrap rounded-lg p-2 text-white transition-colors ${
                    isLoading
                      ? 'cursor-not-allowed bg-pink-300'
                      : 'cursor-pointer bg-pink-500 hover:bg-pink-600'
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                {message && (
                  <p
                    className={`text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        {tab === 'security' && (
          <div className="text-black sm:px-10">
            <h2 className="mb-2 text-lg font-semibold dark:text-white">
              Security
            </h2>
            <form className="space-y-4" onSubmit={handlePasswordUpdate}>
              {/* Current Password Field */}
              <div className="relative">
                <input
                  type={isCurrentPwdVisible ? 'text' : 'password'}
                  placeholder="Current Password"
                  className="w-full rounded-lg border p-2 pr-10"
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCurrentPwdVisible(!isCurrentPwdVisible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                >
                  {isCurrentPwdVisible ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {/* New Password Field */}
              <div className="relative">
                <input
                  type={isNewPwdVisible ? 'text' : 'password'}
                  placeholder="New Password"
                  className={`w-full rounded-lg border p-2 pr-10 ${newPassword.length > 0 && (passwordStrength === 'weak' || passwordStrength === 'none') ? 'border-red-500' : ''} ${newPassword.length > 0 && (passwordStrength === 'medium' || passwordStrength === 'strong') ? 'border-green-500' : ''}`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsNewPwdVisible(!isNewPwdVisible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                >
                  {isNewPwdVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {newPassword.length > 0 && (
                <div className="mt-2 text-sm">
                  <p
                    className={`font-semibold ${passwordStrength === 'none' ? 'text-gray-500' : ''} ${passwordStrength === 'weak' ? 'text-red-500' : ''} ${passwordStrength === 'medium' ? 'text-yellow-500' : ''} ${passwordStrength === 'strong' ? 'text-green-500' : ''}`}
                  >
                    Password Strength:{' '}
                    {passwordStrength.charAt(0).toUpperCase() +
                      passwordStrength.slice(1)}
                  </p>
                  <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className={`h-2.5 rounded-full ${passwordStrength === 'none' ? 'w-0' : ''} ${passwordStrength === 'weak' ? 'w-1/4 bg-red-500' : ''} ${passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : ''} ${passwordStrength === 'strong' ? 'w-full bg-green-500' : ''}`}
                    ></div>
                  </div>
                  {/* Password Requirements Checklist */}
                  <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                    <li className="flex items-center">
                      {hasMinLength ? (
                        <CheckCircle
                          size={16}
                          className="mr-2 text-green-500"
                        />
                      ) : (
                        <XCircle size={16} className="mr-2 text-red-500" />
                      )}
                      Minimum 8 characters
                    </li>
                    <li className="flex items-center">
                      {hasMixedCase ? (
                        <CheckCircle
                          size={16}
                          className="mr-2 text-green-500"
                        />
                      ) : (
                        <XCircle size={16} className="mr-2 text-red-500" />
                      )}
                      Mixed case (uppercase and lowercase)
                    </li>
                    <li className="flex items-center">
                      {hasNumber ? (
                        <CheckCircle
                          size={16}
                          className="mr-2 text-green-500"
                        />
                      ) : (
                        <XCircle size={16} className="mr-2 text-red-500" />
                      )}
                      At least one number
                    </li>
                    <li className="flex items-center">
                      {hasSpecialChar ? (
                        <CheckCircle
                          size={16}
                          className="mr-2 text-green-500"
                        />
                      ) : (
                        <XCircle size={16} className="mr-2 text-red-500" />
                      )}
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}

              {/* Confirm New Password Field */}
              <div className="relative">
                <input
                  type={isConfirmPwdVisible ? 'text' : 'password'}
                  placeholder="Confirm New Password"
                  className={`w-full rounded-lg border p-2 pr-10 ${confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500' : ''} ${confirmPassword.length > 0 && passwordsMatch ? 'border-green-500' : ''}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsConfirmPwdVisible(!isConfirmPwdVisible)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                >
                  {isConfirmPwdVisible ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="mt-2 text-sm text-red-500">
                  Passwords do not match.
                </p>
              )}

              {/* Submit button and feedback messages */}
              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  className={`text-md w-1/2 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg p-2 text-white transition-colors ${
                    isLoading
                      ? 'cursor-not-allowed bg-pink-300'
                      : 'cursor-pointer bg-pink-500 hover:bg-pink-600'
                  }`}
                  disabled={
                    isLoading ||
                    newPassword.length === 0 ||
                    passwordCurrent.length === 0 ||
                    !passwordsMatch ||
                    passwordStrength === 'none' ||
                    passwordStrength === 'weak'
                  }
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
                {message && (
                  <p
                    className={`text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {message}
                  </p>
                )}
              </div>
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
