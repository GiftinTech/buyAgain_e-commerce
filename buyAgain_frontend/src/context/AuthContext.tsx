/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useEffect, type ReactNode } from 'react';

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;
console.log(BUYAGAIN_API_BASE_URL);

// Shape of the buyAgain User object
interface BuyAgainUser {
  id: number;
  name: string;
  email: string;
  photo?: string;
  role?: string;
}

// Shape of the AuthContext value
interface AuthContextType {
  user: BuyAgainUser | null;
  loadingAuth: boolean;
  appError: string;
  handleSignup: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<{ success: boolean; error?: string }>;
  handleLogin: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  handleLogout: () => Promise<{ success: boolean; error?: string }>;
  handleForgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; message?: string }>;
  handlePasswordReset: (
    reset_token: string,
    new_password: string,
    confirm_password: string,
  ) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<BuyAgainUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [appError, setAppError] = useState<string>('');

  // Function to decode JWT token to get user info
  const decodeJwt = (token: string): string => {
    console.log(token);
    return 'success';
  };

  // Function to fetch the full user profile from buyAgain_backend
  const fetchUserProfile = async (accessToken: string) => {
    try {
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log(userData);
        if (userData) {
          setUser(userData);
        } else {
          console.error('User data from backend is missing a username field.');
          setUser(null);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }

        return userData;
      } else {
        console.error('Failed to fetch user profile:', response.statusText);
        setUser(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return null;
      }
    } catch (error) {
      console.error('Network error fetching user profile:', error);
      setUser(null);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return null;
    }
  };

  useEffect(() => {
    // On component mount, check for existing JWT token in localStorage
    const loadUserFromToken = async () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        const decodedToken = decodeJwt(accessToken);
        if (decodedToken) {
          // Fetch full user profile using the token
          await fetchUserProfile(accessToken);
        } else {
          // Token invalid or expired, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setUser(null);
          console.log('AuthContext: Invalid token, user logged out.');
        }
      }
      setLoadingAuth(false);
      //console.log('AuthContext: Initial auth loading complete.');
    };

    loadUserFromToken();
  }, []);

  const handleSignup = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          passwordConfirm,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, immediately try to log in
        return handleLogin(email, password);
      } else {
        return {
          success: false,
          error:
            data.email?.[0] ||
            data.name?.[0] ||
            data.password?.[0] ||
            data.detail ||
            'Signup failed.',
        };
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setAppError(error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during signup.',
      };
    }
  };

  const handleLogin = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Call buyAgain Simple JWT token obtain endpoint
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        const decodedToken = decodeJwt(data.access);
        if (decodedToken) {
          // Fetch the full user profile after getting the token
          await fetchUserProfile(data.access);
          return { success: true };
        } else {
          return {
            success: false,
            error: 'Failed to decode user information from token.',
          };
        }
      } else {
        return {
          success: false,
          error: data.detail || 'Login failed. Check your credentials.',
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during login.',
      };
    }
  };

  const handleLogout = async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    try {
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/logout`);
      console.log(response);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred during logout.',
      };
    }
  };

  const handleForgotPassword = async (
    email: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoadingAuth(true);
    try {
      const response = await fetch(
        `${BUYAGAIN_API_BASE_URL}/auth/forgotPassword`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();
      setLoadingAuth(false);

      if (response.ok) {
        return {
          success: true,
          message:
            data.message ||
            'A password reset link has been sent to your email.',
        };
      } else {
        return {
          success: false,
          message:
            data.email?.[0] ||
            data.detail ||
            'Password reset failed. Please check your email address.',
        };
      }
    } catch (error: any) {
      console.error('Error sending email:', error);
      setLoadingAuth(false);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handlePasswordReset = async (
    reset_token: string,
    new_password: string,
    confirm_password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoadingAuth(true);
    try {
      const response = await fetch(
        `${BUYAGAIN_API_BASE_URL}auth/resetPassword/${reset_token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reset_token,
            new_password,
            confirm_password,
          }),
        },
      );

      const data = await response.json();
      setLoadingAuth(false);

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Password reset succesfull.',
        };
      } else {
        return {
          success: false,
          message:
            data.email?.[0] ||
            data.detail ||
            'Password reset failed. Token expired, please try again.',
        };
      }
    } catch (error: any) {
      console.error('Error during password reset:', error);
      setLoadingAuth(false);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const contextValue: AuthContextType = {
    user,
    loadingAuth,
    appError,
    handleSignup,
    handleLogin,
    handleLogout,
    handleForgotPassword,
    handlePasswordReset,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Remove useAuth from this file to fix Fast Refresh error.
// Export only the AuthProvider component from this file.
export default AuthProvider;
export { AuthContext };
