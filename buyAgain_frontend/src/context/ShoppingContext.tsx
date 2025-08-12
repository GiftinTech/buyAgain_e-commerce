/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

// interface
interface IProduct {
  id: string;
  name: string;
  price: number;
  images: string[];
  title?: string;
  thumbnail: string;
  rating: number;
  ratingQuantity: number;
}

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

interface ICart extends IProduct {
  quantity: number;
  totalPrice: number;
}

interface ShopContextType {
  user: Data | null;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  productList: IProduct[];
  setProductList: React.Dispatch<React.SetStateAction<IProduct[]>>;
  productDetails: IProduct | null;
  setProductDetails: React.Dispatch<React.SetStateAction<IProduct | null>>;
  cartItems: ICart[];
  handleAddToCart: (productDetails: IProduct) => Promise<void>;
  handleRemoveFromCart: (
    getProductDetails: IProduct,
    isFullyRemoved: boolean,
  ) => Promise<void>;
  fetchCartItems: () => Promise<void>;
  handleFetchProduct: () => Promise<{
    success: boolean;
    message?: string;
    products?: IProduct[];
  }>;
}

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

// Placeholder for authentication token retrieval
// In a real app, you'd get this from your AuthContext or similar global state
const getAuthToken = (): string | null => {
  // Example: Retrieve token from localStorage or your authentication state
  return localStorage.getItem('authToken'); // Adjust based on your auth implementation
};

//create the context
const ShoppingCartContext = createContext<ShopContextType | undefined>(
  undefined,
);

interface ShopProviderProps {
  children: ReactNode;
}

//provide the state
const ShoppingCartProvider = ({ children }: ShopProviderProps) => {
  const [user, setUser] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [productList, setProductList] = useState<IProduct[]>([]);
  const [productDetails, setProductDetails] = useState<IProduct | null>(null);
  const [cartItems, setCartItems] = useState<
    Array<IProduct & { quantity: number; totalPrice: number }>
  >([]);

  const navigate = useNavigate();

  // Get all products
  const handleFetchProduct = async (): Promise<{
    success: boolean;
    message?: string;
    products?: IProduct[];
  }> => {
    setLoading(true);
    try {
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/products`);
      const data = await response.json();
      console.log('PRODUCTS:', data);
      setLoading(false);

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
    } catch (error: unknown) {
      setError(
        'Error fetching products from the server. Please try check your internet connection or try again later.',
      );
      console.log('Error fetching products:', error);
      setProductList([]);
      setLoading(false);

      return {
        success: false,
        message: 'Network error. Please try again.',
      };
    }
  };

  // Fetch Cart Items
  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) {
        // Handle unauthenticated user. Maybe redirect to login or show a message.
        setError('Authentication required to load cart.');
        setLoading(false);
        // navigate('/login'); // Optional: redirect to login if cart depends on auth
        return;
      }

      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Send auth token
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch cart items.');
      }

      const data = await response.json();
      // Assuming your API returns the cart items in a 'cart' property
      setCartItems(data.cart || []);
    } catch (error: unknown) {
      console.error('Error fetching cart:', error);
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies: none, as this is for initial load and manual refetch

  // Load cart items on component mount
  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  // Adds product or increments quantity in backend cart
  const handleAddToCart = async (productDetails: IProduct) => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required to add to cart.');
        navigate('/login'); // Redirect to login if unauthenticated
        return;
      }

      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/cart`, {
        method: 'POST', // Or 'PATCH' if your API has a specific endpoint for incrementing
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productDetails.id, // Send the product's ID
          quantity: 1, // Indicate adding one unit
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to cart.');
      }

      // Re-fetch the entire cart to ensure state consistency after modification
      await fetchCartItems();
      navigate('/cart'); // Navigate to cart page after successful addition
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Removes product or decrements quantity in backend cart
  const handleRemoveFromCart = async (
    productDetails: IProduct,
    isFullyRemoved: boolean,
  ) => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required to modify cart.');
        navigate('/login'); // Redirect to login if unauthenticated
        return;
      }

      let response;
      if (isFullyRemoved) {
        // API call to remove the item completely
        response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/cart/${productDetails.id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        // API call to decrement quantity or remove if quantity becomes 0/1
        const currentItem = cartItems.find(
          (item) => item.id === productDetails.id,
        );
        if (!currentItem || currentItem.quantity <= 1) {
          // If quantity is 1 or less, treat as full removal to avoid 0 quantity items
          response = await fetch(
            `${BUYAGAIN_API_BASE_URL}/cart/${productDetails.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } else {
          // Send the new quantity to the backend
          response = await fetch(
            `${BUYAGAIN_API_BASE_URL}/cart/${productDetails.id}`,
            {
              method: 'PATCH', // Or 'PUT' depending on your API design for updates
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                quantity: currentItem.quantity - 1,
              }),
            },
          );
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to remove item from cart.',
        );
      }

      // Re-fetch the entire cart to ensure state consistency
      await fetchCartItems();
    } catch (error: any) {
      console.error('Error removing from cart:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchProduct();
  }, []);

  //console.log(productList);
  console.log(cartItems);

  const contextValue: ShopContextType = {
    user,
    loading,
    setLoading,
    productList,
    setProductList,
    error,
    setError,
    productDetails,
    setProductDetails,
    handleFetchProduct,
    cartItems,
    handleAddToCart,
    handleRemoveFromCart,
    fetchCartItems,
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartProvider;
export { type IProduct, ShoppingCartContext };
