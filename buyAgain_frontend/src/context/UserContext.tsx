// src/context/UserContext.tsx
import {
  useState,
  useMemo,
  type ReactNode,
  useEffect,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { Data } from './AuthContext';
import useAdmin from '../hooks/useAdmin';
import useAuth from '../hooks/useAuth';
import { UserContext } from '../hooks/useUser';

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

// Shape of the AuthContext value
export interface UserContextType {
  user: Data | null;
  isLoading: boolean;
  message: string | null;
  isSuccess: boolean;
  setMessage: Dispatch<SetStateAction<string | null>>;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;

  handleUpdateUser: (user: FormData) => Promise<void>;
  handleUpdateUserPassword: (data: {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
  }) => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
  const { refetchUsers } = useAdmin();
  const { token, user, handleLogout } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Use useEffect to clear the message after a successful update
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setMessage(null);
        setIsSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const authOptions = useMemo(() => {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const handleUpdateUser = async (formData: FormData) => {
    setIsLoading(true);
    setMessage(null);
    setIsSuccess(false);

    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          Authorization: authOptions.headers.Authorization,
        },
        body: formData,
      });

      if (res.status === 401) {
        throw new Error('Incorrect password. Please try again.');
      }
      if (!res.ok) {
        throw new Error('Failed to update user.');
      }

      await refetchUsers();

      setIsSuccess(true);
      setMessage('Profile updated successfully! ✅');
    } catch (error) {
      console.error('Update user error:', error);
      setIsSuccess(false);
      setMessage('Failed to update profile. Please try again. ❌');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserPassword = async (data: {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
  }) => {
    setIsLoading(true);
    setMessage(null);
    setIsSuccess(false);

    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/updatePassword`, {
        method: 'PATCH',
        ...authOptions,
        body: JSON.stringify(data),
      });

      // Check for a 401 Unauthorized response from the backend
      if (res.status === 401) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Incorrect password.');
      }

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || 'Failed to update password.');
      }

      setIsSuccess(true);
      setMessage(
        'Password updated successfully. Please login again with your new password.',
      );
      setTimeout(() => {
        handleLogout();
      }, 3000);
    } catch (error) {
      console.error('Update password error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      console.log('errormessage', errorMessage);
      setIsSuccess(false);
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: UserContextType = {
    user,
    isLoading,
    message,
    isSuccess,
    setMessage,
    setIsSuccess,
    handleUpdateUser,
    handleUpdateUserPassword,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export default UserProvider;
