/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

import { CartContext } from '../hooks/useCart';
import { useAlert } from '../hooks/useAlert';
import useFetch from '../hooks/useFetch';

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

interface IProductResponse {
  status?: string;
  products: IProduct[];
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

interface CartResponse {
  data: {
    cart: ICart;
    cartItems: ICartItem[];
    cartTotals: CartTotals;
  };
  status: string;
}

interface CartContextType {
  loading: boolean;
  productLoading: boolean;
  productError: string | null;
  cartError: string | null;

  productList: IProductResponse | null;
  handleFetchProduct: (searchTerm?: string | null) => Promise<{
    success: boolean;
    message?: string;
    products?: IProductResponse;
  }>;

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
  handleIncreaseQuantity: (cartItem: ICartItem) => Promise<void>;
  handleDecreaseQuantity: (cartItem: ICartItem) => Promise<void>;
  mergeLocalCartToBackend: () => Promise<void>;
}

// Base URL for buyAgain buyAgain_backend API
const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

interface ShopProviderProps {
  children: ReactNode;
}

// ocal storage key for unauthenticated carts
const LOCAL_STORAGE_CART_KEY = 'buyagain_anon_cart';

// Helper function to calculate cart totals for local storage carts
const calculateLocalCartTotals = (items: ICartItem[]): CartTotals => {
  let total = 0;
  let discountedTotal = 0;
  let totalProducts = 0; // count of unique products
  let totalQuantity = 0; // sum of quantities

  items.forEach((item) => {
    totalProducts++;
    totalQuantity += item.quantity;
    const itemPrice = item.product.price;
    const itemDiscount = item.product.discountPercentage || 0;

    total += itemPrice * item.quantity;
    discountedTotal += itemPrice * (1 - itemDiscount / 100) * item.quantity;
  });

  return {
    total: parseFloat(total.toFixed(2)),
    discountedTotal: parseFloat(discountedTotal.toFixed(2)),
    totalProducts,
    totalQuantity,
  };
};

//provide the state
const CartProvider = ({ children }: ShopProviderProps) => {
  const { user, loadingAuth, token } = useAuth();
  const { showAlert } = useAlert();

  const navigate = useNavigate();

  // Initialize cartItems from local storage
  const [cartItems, setCartItems] = useState<Array<ICartItem>>(() => {
    const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  const [productDetails, setProductDetails] = useState<IProduct | null>(null);

  const [cart, setCart] = useState<ICart | null>(null);
  const [cartTotals, setCartTotals] = useState<CartTotals | null>(() => {
    const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
    const localCart: ICartItem[] = storedCart ? JSON.parse(storedCart) : [];
    return calculateLocalCartTotals(localCart);
  });

  // Helper to save cart to local storage
  const saveLocalCart = useCallback((cart: ICartItem[]) => {
    localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    setCartTotals(calculateLocalCartTotals(cart));
  }, []);

  // Get all products
  const {
    data: fetchedProducts,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useFetch<IProductResponse | null>(
    '/products',
    undefined,
    location.pathname === '/' || location.pathname === '/admin',
  );

  console.log('fetchedProduct from cartContext', fetchedProducts);

  // Fetch Cart Items
  // Fetch cart only once on mount or when token changes
  const {
    data: fetchedCart,
    loading: cartLoading,
    error: cartError,
    refetch: refetchCart,
  } = useFetch<CartResponse>(
    '/cart',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    false,
    //location.pathname === '/cart',
  );

  // Only update state if user or fetchedCart.data changes
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // unauthenticated → load from localStorage
      const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      const localCart: ICartItem[] = storedCart ? JSON.parse(storedCart) : [];
      setCartItems(localCart);
      setCart(null);
      setCartTotals(calculateLocalCartTotals(localCart));
      return;
    }

    console.log('fetch cart:', fetchedCart?.data.cartItems);
    if (fetchedCart?.data.cart) {
      // Only update state if new cart is different
      console.log('cart', fetchedCart?.data.cart);
      console.log('cart data', fetchedCart?.data);

      const cartItemsWithId = fetchedCart.data.cartItems.map((item: any) => ({
        ...item,
        _id: item._id,
      }));

      setCart(fetchedCart.data.cart);
      setCartItems(cartItemsWithId);
      setCartTotals(fetchedCart.data.cartTotals);
      hasFetchedRef.current = true;
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    }

    // Fallback if fetch fails
    if (cartError) {
      const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      const localCart: ICartItem[] = storedCart ? JSON.parse(storedCart) : [];
      setCartItems(localCart);
      setCart(null);
      setCartTotals(calculateLocalCartTotals(localCart));
    }
  }, [user, fetchedCart, cartError]);

  const handleFetchProduct = useCallback(
    async (
      searchTerm?: string | null,
    ): Promise<{
      success: boolean;
      message?: string;
      products?: IProductResponse;
    }> => {
      try {
        // Build the query URL
        const query = searchTerm ? `/products?q=${searchTerm}` : '/products';

        // Call refetchProducts from useFetch
        await refetchProducts(query);

        // Use the latest fetchedProducts from the context
        if (fetchedProducts && Array.isArray(fetchedProducts)) {
          return {
            success: true,
            products: fetchedProducts,
            message: 'Products loaded successfully.',
          };
        } else {
          return {
            success: false,
            message: 'No products found.',
          };
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        return {
          success: false,
          message: err?.message || 'Unknown error occurred',
        };
      }
    },
    [refetchProducts, fetchedProducts],
  );

  // Updates the quantity of an existing item in the cart
  const updateCartItemQuantity = useCallback(
    async (cartItemId: string, newQuantity: number) => {
      console.log('cartitem id', cartItemId);
      if (!user) {
        // Handle locally for unauthenticated users
        setCartItems((prevItems) => {
          const updatedCart = prevItems.map((item) =>
            item._id === cartItemId ? { ...item, quantity: newQuantity } : item,
          );
          saveLocalCart(updatedCart); // Save updated local cart
          return updatedCart;
        });
        return; // Exit if unauthenticated
      }

      try {
        const response = await fetch(
          `${BUYAGAIN_API_BASE_URL}/cart/${cartItemId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
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

        await refetchCart();
      } catch (updateError: any) {
        console.error('Error updating cart item:', updateError);
      }
    },
    [user, saveLocalCart, refetchCart],
  );

  // Adds product or increments quantity in backend cart
  const addProductToCart = useCallback(
    async (productDetails: IProduct) => {
      if (!user) {
        // Handle locally for unauthenticated users
        setCartItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (item) => item.product.id === productDetails.id,
          );
          let updatedCart: ICartItem[];

          if (existingItemIndex > -1) {
            updatedCart = [...prevItems];
            updatedCart[existingItemIndex] = {
              ...updatedCart[existingItemIndex],
              quantity: updatedCart[existingItemIndex].quantity + 1,
            };
          } else {
            // Assign a temporary unique ID for local storage cart items
            updatedCart = [
              ...prevItems,
              {
                _id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                product: productDetails,
                quantity: 1,
              },
            ];
          }
          saveLocalCart(updatedCart); // Save updated local cart
          return updatedCart;
        });

        return; // Exit if unauthenticated
      }

      try {
        const response = await fetch(`${BUYAGAIN_API_BASE_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product: productDetails,
            user: user?.data.users?._id,
            quantity: 1,
          }),
        });
        console.log('User object for authenticated add:', user);
        console.log('User ID for authenticated add:', user?.data?.users?._id);

        if (response.ok) {
          const data = await response.json();
          console.log('API response data:', data);
          setCart(data.data);
          setCartItems(data.data.items);
          console.log('items:', data.data.items);

          await refetchCart();
        } else {
          const cartErrorData = await response.json();
          throw new Error(
            cartErrorData.message || 'Failed to add item to cart.',
          );
        }
      } catch (cartError: any) {
        console.error('cartError adding to cart:', cartError);
      }
    },
    [user, token, refetchCart, saveLocalCart, navigate],
  );

  // merge local cart with backend cart
  const mergeLocalCartToBackend = useCallback(async () => {
    if (!user || !user.data?.users?._id) {
      console.warn(
        'Cannot merge cart: User not authenticated or missing backend ID.',
      );
      return;
    }

    const localCartString = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
    if (!localCartString) {
      console.log('No local cart to merge.');
      return;
    }

    const localCart: ICartItem[] = JSON.parse(localCartString);
    if (localCart.length === 0) {
      console.log('Local cart is empty, no merge needed.');
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY); // Clear empty local cart
      return;
    }

    try {
      console.log('Sending POST request to /cart/merge');
      const response = await fetch(`${BUYAGAIN_API_BASE_URL}/cart/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.data.users._id,
          localCartItems: localCart.map((item) => ({
            productId: item.product._id,
            quantity: item.quantity,
          })),
        }),
      });

      console.log(
        'Received response from /cart/merge. Status:',
        response.status,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to merge cart.');
      }

      console.log(
        'Merge successful. Clearing local storage and refetching cart.',
      );
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY);

      // re-sync cart from backend
      await refetchCart();
    } catch (mergeError: any) {
      console.error('Error merging local cart to backend:', mergeError);
      // ❌ don’t clear local cart on failure
    }
  }, [user, token, refetchCart]);

  // ensures merge attempt happens only once, after user is loaded and not during initial loading.
  const hasMergedRef = useRef(false);

  useEffect(() => {
    if (
      !loadingAuth &&
      user &&
      user.data?.users?._id &&
      !hasMergedRef.current
    ) {
      // Only merge if there are items in local storage AND user just logged in/signed up
      const localCartString = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      const localCart = localCartString ? JSON.parse(localCartString) : [];

      if (localCart.length > 0) {
        console.log('Auth state detected, attempting to merge local cart.');
        mergeLocalCartToBackend();
        hasMergedRef.current = true; // Mark as merged for this session
      } else {
        // If user logged in but no local cart items, just clear the flag
        hasMergedRef.current = true; // Mark as 'checked' for this session
      }
    }

    // Reset hasMergedRef if user logs out or changes
    if (user === null) {
      if (hasMergedRef.current) {
        console.log('[MERGE EFFECT] User logged out. Resetting merge flag.');
      }
      hasMergedRef.current = false;
    }
  }, [loadingAuth, user, mergeLocalCartToBackend]);

  const handleAddToCart = useCallback(
    async (productDetails: IProduct) => {
      const existingCartItem = cartItems.find(
        (item) => item.product.id === productDetails.id,
      );
      console.log('db prod id', productDetails.id);

      console.log('existing id:', existingCartItem?._id);

      if (existingCartItem) {
        // If the item exists, update its quantity
        const newQuantity = existingCartItem.quantity + 1;
        await updateCartItemQuantity(existingCartItem._id, newQuantity);
      } else {
        // If the item doesn't exist, add it as a new item
        await addProductToCart(productDetails);
      }
      showAlert('success', `${productDetails.name} added to cart`, 1);
    },
    [cartItems, updateCartItemQuantity, addProductToCart, navigate],
  );

  // Removes product or decrements quantity in backend cart
  const handleRemoveFromCart = useCallback(
    async (cartItem: ICartItem, isFullyRemoved: boolean) => {
      if (!user) {
        // Handle locally for unauthenticated users
        setCartItems((prevItems) => {
          let updatedCart: ICartItem[];
          const newQuantity = cartItem.quantity - 1;

          if (isFullyRemoved || newQuantity <= 0) {
            updatedCart = prevItems.filter((item) => item._id !== cartItem._id); // Filter by _id (local temp ID)
          } else {
            updatedCart = prevItems.map((item) =>
              item._id === cartItem._id // Update by _id
                ? { ...item, quantity: newQuantity }
                : item,
            );
          }
          saveLocalCart(updatedCart); // Save updated local cart
          return updatedCart;
        });
        return; // Exit if unauthenticated
      }

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
              Authorization: `Bearer ${token}`,
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
        showAlert('success', `${cartItem.product.name} removed from cart`, 1);
        // Re-fetch the entire cart to ensure state consistency
        await refetchCart();
      } catch (cartError: any) {
        console.error('cartError removing from cart:', cartError);
      }
    },
    [user, refetchCart, saveLocalCart],
  );

  // increase quantity
  const handleIncreaseQuantity = async (cartItem: ICartItem) => {
    const newQuantity = cartItem.quantity + 1;

    if (!user) {
      // Handle locally for unauthenticated users
      setCartItems((prevItems) => {
        const updatedCart = prevItems.map((item) =>
          item._id === cartItem._id // Update by _id (local temp ID)
            ? { ...item, quantity: newQuantity }
            : item,
        );
        saveLocalCart(updatedCart);

        return updatedCart;
      });
      return; // Exit if unauthenticated
    }

    try {
      const response = await fetch(
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to increase quantity.');
      }

      await refetchCart();
    } catch (error) {
      console.error('Error increasing quantity:', error);
    }
  };

  // decrease quantity
  const handleDecreaseQuantity = async (cartItem: ICartItem) => {
    const newQuantity = cartItem.quantity - 1;

    if (!user) {
      // Handle locally for unauthenticated users
      setCartItems((prevItems) => {
        let updatedCart: ICartItem[];
        if (newQuantity <= 0) {
          updatedCart = prevItems.filter((item) => item._id !== cartItem._id); // Filter by _id (local temp ID)
        } else {
          updatedCart = prevItems.map((item) =>
            item._id === cartItem._id // Update by _id
              ? { ...item, quantity: newQuantity }
              : item,
          );
        }
        saveLocalCart(updatedCart);

        return updatedCart;
      });
      return;
    }

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

      await refetchCart();
    } catch (error) {
      console.error('Error decreasing quantity:', error);
    }
  };

  const contextValue: CartContextType = {
    loading: cartLoading,
    productLoading: productsLoading,
    productList: fetchedProducts,
    productError: productsError,
    cartError: cartError,
    cartItems: cartItems,
    cart: cart,
    cartTotals: cartTotals,

    productDetails,
    setProductDetails,

    handleFetchProduct,
    handleAddToCart,
    handleRemoveFromCart,
    handleIncreaseQuantity,
    handleDecreaseQuantity,
    mergeLocalCartToBackend,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};

export default CartProvider;
export type { IProduct, IProductResponse, ICart, ICartItem, CartContextType };
