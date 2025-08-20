/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import { ShoppingCartContext } from '../hooks/useShopping';
import getAuthToken from '../utils/getAuthToken';

// interface
interface IProduct {
  _id: string; // Product ID from DB
  name: string;
  price: number;
  description: string;
  thumbnail: string;
  images: string[];
  brand: string;
  category: string;
  availabilityStatus: string;
  discountPercentage: number;
  dimensions: { height: number; depth: number };
  meta: {
    barcode: string;
    qrCode: string;
    createdAt: string;
    updatedAt: string;
  };
  rating: number;
  ratingQuantity: number;
  returnPolicy: string;
  shippingInformation: string;
  sku: string;
  slug: string;
  stock: number;
  tags: string[];
  title: string;
  warrantyInformation: string;
  weight: number;
  createdAt: string;
  updatedAt: string;
  id: string; // The frontend 'id' which maps to _id from DB sometimes. Keeping for consistency with original.
}

interface ICartItem {
  _id: string;
  product: IProduct;
  quantity: number;
}

interface ICart {
  user: string;
  items: ICartItem[];
}

interface CartTotals {
  total: number;
  discountedTotal: number;
  totalProducts: number;
  totalQuantity: number;
}

interface ShopContextType {
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  cartError: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  productList: IProduct[];
  setProductList: React.Dispatch<React.SetStateAction<IProduct[]>>;
  productDetails: IProduct | null;
  setProductDetails: React.Dispatch<React.SetStateAction<IProduct | null>>;
  cartItems: ICartItem[];
  cart: ICart | null;
  cartTotals: CartTotals | null;
  handleAddToCart: (productDetails: IProduct) => Promise<void>;
  handleRemoveFromCart: (
    cartItem: ICartItem,
    isFullyRemoved: boolean,
  ) => Promise<void>;
  fetchCartItems: () => Promise<void>;
  handleFetchProduct: () => Promise<{
    success: boolean;
    message?: string;
    products?: IProduct[];
  }>;
  handleIncreaseQuantity: (cartItem: ICartItem) => Promise<void>;
  handleDecreaseQuantity: (cartItem: ICartItem) => Promise<void>;
}

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

interface ShopProviderProps {
  children: ReactNode;
}

//provide the state
const ShoppingCartProvider = ({ children }: ShopProviderProps) => {
  const { user } = useAuth();
  const token = getAuthToken();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [cartError, setError] = useState<string>('');

  const [productList, setProductList] = useState<IProduct[]>([]);
  const [productDetails, setProductDetails] = useState<IProduct | null>(null);
  const [cartItems, setCartItems] = useState<Array<ICartItem>>([]);
  const [cart, setCart] = useState<ICart | null>(null);
  const [cartTotals, setCartTotals] = useState<CartTotals | null>(null);

  const navigate = useNavigate();

  // Get all products
  const handleFetchProduct = async (): Promise<{
    success: boolean;
    message?: string;
    products?: IProduct[];
  }> => {
    setLoading(true);

    if (!token) {
      navigate('/');
    }

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
    } catch (cartError: unknown) {
      setError(
        'cartError fetching products from the server. Please try check your internet connection or try again later.',
      );
      console.log('cartError fetching products:', cartError);
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
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Redirect to login

        return;
      }

      if (!response.ok) {
        const cartErrorData = await response.json();
        throw new Error(cartErrorData.message || 'Failed to fetch cart items.');
      }

      const cartData = await response.json();

      const { data } = cartData;

      const { cartItems, cartTotals } = data;
      setCart(cartItems);
      setCartItems(cartItems);
      setCartTotals(cartTotals);
    } catch (error: unknown) {
      console.error('cartError fetching cart:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An unknown cartError occurred.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  // Load cart items on component mount

  useEffect(() => {
    if (location.pathname === '/cart') fetchCartItems();
  }, [location.pathname, fetchCartItems]);

  // Updates the quantity of an existing item in the cart
  const updateCartItemQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/cart/${cartItemId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity: newQuantity }),
          },
        );

        if (!response.ok) {
          const updateErrorData = await response.json();
          throw new Error(
            updateErrorData.message || 'Failed to update item quantity.',
          );
        }

        await fetchCartItems();
      } catch (updateError: any) {
        console.error('Error updating cart item:', updateError);
        setError(updateError.message);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchCartItems],
  );

  // Adds product or increments quantity in backend cart
  const addProductToCart = useCallback(
    async (productDetails: IProduct) => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${BUYAGAIN_API_BASE_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product: productDetails.id,
            user: user?.data.users?._id,
            quantity: 1,
          }),
        });
        console.log('User object:', user);
        console.log('User ID:', user?.data?.users?._id);

        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          setCart(data.data);
          setCartItems(data.data.items);
        } else {
          const cartErrorData = await response.json();
          throw new Error(
            cartErrorData.message || 'Failed to add item to cart.',
          );
        }

        // Re-fetch the entire cart to ensure state consistency after modification
        await fetchCartItems();
        navigate('/cart'); // Navigate to cart page after successful addition
      } catch (cartError: any) {
        console.error('cartError adding to cart:', cartError);
        setError(cartError.message);
      } finally {
        setLoading(false);
      }
    },
    [user, token, fetchCartItems, navigate],
  );

  const handleAddToCart = useCallback(
    async (productDetails: IProduct) => {
      const existingCartItem = cartItems.find(
        (item) => item.product.id === productDetails.id,
      );

      if (existingCartItem) {
        // If the item exists, update its quantity
        const newQuantity = existingCartItem.quantity + 1;
        await updateCartItemQuantity(existingCartItem._id, newQuantity);
      } else {
        // If the item doesn't exist, add it as a new item
        await addProductToCart(productDetails);
      }
      navigate('/cart');
    },
    [cartItems, updateCartItemQuantity, addProductToCart, navigate],
  );

  // Removes product or decrements quantity in backend cart
  const handleRemoveFromCart = useCallback(
    async (cartItem: ICartItem, isFullyRemoved: boolean) => {
      setLoading(true);
      setError('');

      try {
        let response;
        let method;
        let body;

        const newQuantity = cartItem.quantity - 1;

        if (isFullyRemoved || newQuantity <= 0) {
          // If we want to remove the item entirely or the new quantity would be zero or less,
          // we send a DELETE request.
          method = 'DELETE';
        } else {
          // Otherwise, we decrement the quantity by one with a PATCH request.
          method = 'PATCH';
          body = JSON.stringify({ quantity: newQuantity });
        }

        // Perform unified API call.
        response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/cart/${cartItem._id}`,
          {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body,
          },
        );

        if (!response.ok) {
          const cartErrorData = await response.json();
          throw new Error(
            cartErrorData.message || 'Failed to remove item from cart.',
          );
        }

        // Re-fetch the entire cart to ensure state consistency
        await fetchCartItems();
      } catch (cartError: any) {
        console.error('cartError removing from cart:', cartError);
        setError(cartError.message);
      } finally {
        setLoading(false);
      }
    },
    [user, fetchCartItems, navigate],
  );

  // increase quantity
  const handleIncreaseQuantity = async (cartItem: ICartItem) => {
    const newQuantity = cartItem.quantity + 1;

    try {
      const response = await fetch(
        `${BUYAGAIN_API_BASE_URL}/cart/${cartItem._id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: newQuantity }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to increase quantity.');
      }

      await fetchCartItems();
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  // decrease quantity
  const handleDecreaseQuantity = async (cartItem: ICartItem) => {
    const newQuantity = cartItem.quantity - 1;

    try {
      let response;
      if (newQuantity <= 0) {
        // If quantity becomes 0 or less, remove the item entirely
        response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/cart/${cartItem._id}`,
          {
            method: 'DELETE',
          },
        );
      } else {
        // Otherwise, update the quantity
        response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/cart/${cartItem._id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ quantity: newQuantity }),
          },
        );
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decrease quantity.');
      }

      await fetchCartItems();
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  useEffect(() => {
    if (location.pathname === '/') handleFetchProduct();
  }, []);

  const contextValue: ShopContextType = {
    loading,
    setLoading,
    productList,
    setProductList,
    cartError,
    setError,
    productDetails,
    setProductDetails,
    handleFetchProduct,
    cartItems,
    cart,
    cartTotals,
    handleAddToCart,
    handleRemoveFromCart,
    fetchCartItems,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export default ShoppingCartProvider;
export type { IProduct, ICart, ICartItem, ShopContextType };
