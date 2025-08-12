/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useState, useEffect, type ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

// Shape of the buyAgain User object
interface BuyAgainUser {
  id: number;
  name: string;
  email: string;
  photo?: string;
  role?: string;
}

interface DataKey {
  dataKey: BuyAgainUser;
  users?: BuyAgainUser;
}

interface Data {
  data: DataKey;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

// Shape of the AuthContext value
interface AuthContextType {
  user: Data | null;
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
  ) => Promise<{
    success: boolean;
    error?: string;
    userProfile?: Data;
  }>;
  handleLogout: () => Promise<{ success: boolean; error?: string }>;
  handleForgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; message?: string }>;
  handlePasswordReset: (
    token: string,
    password: string,
    passwordConfirm: string,
  ) => Promise<{ success: boolean; message?: string }>;
  handleFetchProduct: () => Promise<{
    success: boolean;
    message?: string;
    products?: Product[];
  }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Data | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [appError, setAppError] = useState<string>('');

  // Function to decode JWT token to check for expiration
  const decodeJwt = (token: string): boolean => {
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp && decoded.exp * 1000 > Date.now()) {
        return true; // Token is valid and not expired
      }
      return false; // Token is expired
    } catch (error) {
      // Token is malformed or invalid
      console.error('Failed to decode JWT:', error);
      return false;
    }
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
        // console.log('Fetch Users', userData);
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
          error: data.message || 'Signup failed.',
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
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    error?: string;
    userProfile?: Data;
  }> => {
    try {
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const accessToken = data.accessToken;

        if (typeof accessToken === 'string' && accessToken.length > 0) {
          localStorage.setItem('access_token', accessToken);
          const isTokenValid = decodeJwt(accessToken);

          if (isTokenValid) {
            const userProfile = await fetchUserProfile(accessToken);
            setUser(userProfile);
            return { success: true, userProfile };
          } else {
            return {
              success: false,
              error: 'Failed to decode user information from token.',
            };
          }
        } else {
          return {
            success: false,
            error: 'Login successful, but access token was not provided.',
          };
        }
      } else {
        return {
          success: false,
          error: data.message || 'Login failed. Check your credentials.',
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
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setUser(null);
        return { success: true };
      }

      // Send the access token in the Authorization header.
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        console.warn('Logout request failed on server.');
        // You can get the error from the response body for more detail.
        const errorData = await res.json();
        console.error('Server error:', errorData);
      }
      const data = await res.json();
      console.log(data.message);

      localStorage.removeItem('access_token');
      setUser(null);
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);

      localStorage.removeItem('access_token');
      setUser(null);

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
            data.message ||
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
    token: string,
    password: string,
    passwordConfirm: string,
  ): Promise<{ success: boolean; message?: string }> => {
    setLoadingAuth(true);
    try {
      const response = await fetch(
        `${BUYAGAIN_API_BASE_URL}/auth/resetPassword/${token}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password,
            passwordConfirm,
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
            data.message ||
            'Password reset failed. Token expired, please try again.',
        };
      }
    } catch (error: any) {
      console.error('Error during password reset:', error);
      setLoadingAuth(false);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const handleFetchProduct = async (): Promise<{
    success: boolean;
    message?: string;
    products?: Product[];
  }> => {
    setLoadingAuth(true);
    try {
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/products`);
      const data = await response.json();
      console.log('PRODUCTS:', data);
      setLoadingAuth(false);

      if (response.ok) {
        return {
          success: true,
          message: data.message || 'Product Loaded Successfully.',
          products: data.data.products,
        };
      } else {
        return {
          success: false,
          message:
            data.message || 'Failed to fetch products. Please try again.',
        };
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setLoadingAuth(false);
      return {
        success: false,
        message: 'Network error. Please try again.',
      };
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
    handleFetchProduct,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Remove useAuth from this file to fix Fast Refresh error.
// Export only the AuthProvider component from this file.
export default AuthProvider;
export { AuthContext };
