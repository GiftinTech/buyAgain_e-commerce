import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminContext } from '../hooks/useAdmin';
import type { IProduct } from './CartContext';
import useFetch from '../hooks/useFetch';
import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'seller';
  newRole: string;
  active: boolean;
  photo: string;
}

export interface AdminCreateUser {
  success: boolean;
  users: Partial<IUser[]>;
  user: Pick<IUser, 'name' | 'email' | '_id' | 'newRole'>;
  password?: string;
  passwordConfirm?: string;
}

export interface Product extends IProduct {
  id: string;
  name: string;
  stock: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  product: string | Partial<IProduct>;
  quantity: number;
  priceAtTimeOfOrder: number;
}

export interface IOrder {
  _id: string;
  user: string;
  displayId: string;
  status: string;
  paid: boolean;
  createdAt: string;
  totalPrice: number;
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
}

interface OrdersResponse {
  success: boolean;
  orders: IOrder[];
}

interface AdminContextType {
  // Read-only state from useFetch hooks
  loading: boolean;
  error: string | null;
  orderError: string | null;
  myOrderError: string | null;
  users: AdminCreateUser | null;
  products: IProduct[] | null;
  orders: OrdersResponse | null;
  myOrders: OrdersResponse | null;

  // Functions to trigger CRUD operations
  handleFetchUsers: () => Promise<{
    success: boolean;
    message?: string;
    users?: AdminCreateUser | null;
  }>;

  handleFetchOrders: () => Promise<{
    success: boolean;
    message?: string;
    orders?: OrdersResponse | null;
  }>;

  handleFetchMyOrders: () => Promise<{
    success: boolean;
    message?: string;
    myOrders?: OrdersResponse | null;
  }>;
  handleCreateUser: (user: Partial<AdminCreateUser>) => Promise<void>;
  handleUpdateUser: (user: AdminCreateUser) => Promise<void>;
  handleDeleteUser: () => Promise<void>;

  refetchUsers: () => Promise<void>;

  handleCreateProduct: (product: Omit<IProduct, 'id'>) => Promise<void>;
  handleUpdateProduct: (product: IProduct) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;

  handleUpdateOrder: (
    order: IOrder,
    orderUpdates: Partial<IOrder>,
  ) => Promise<void>;
  handleDeleteOrder: (id: string) => Promise<void>;
}

interface AdminProviderProps {
  children: ReactNode;
}

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

// provide the state
const AdminProvider = ({ children }: AdminProviderProps) => {
  const { token } = useAuth();
  const location = useLocation();
  // Local state to hold users
  const [users, setUsers] = useState<AdminCreateUser | null>(null);

  //const userProfile = user?.data.users;

  const authOptions = useMemo(() => {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  // fetch products from DB
  const {
    data: fetchedProducts,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useFetch<IProduct[]>('/products');

  // fetch users from DB
  // fetch users only when user is admin
  const {
    data: fetchedUsers,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useFetch<AdminCreateUser>(
    '/users',
    authOptions,
    location.pathname === '/' || location.pathname === '/admin',
  );

  // fetch all orders only on admin dashboard
  const {
    data: fetchedOrders,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useFetch<OrdersResponse>(
    '/orders',
    authOptions,
    location.pathname === '/admin',
  );

  // fetch *my orders* only when logged in & on my orders page
  const {
    data: fetchedMyOrders,
    loading: myOrdersLoading,
    error: myOrdersError,
  } = useFetch<OrdersResponse>(
    '/orders/my-orders',
    authOptions,
    location.pathname === '/me/orders',
  );

  // Trigger refetch of users only when route is /admin
  useEffect(() => {
    const fetchData = async () => {
      if (location.pathname === '/admin') {
        await refetchUsers();
      }
    };
    fetchData();
  }, [location.pathname, refetchUsers]);

  // Update local users state when fetchedUsers changes
  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers);
    }
  }, [fetchedUsers]);

  // User management
  // This function now just triggers a refetch from the hook
  const handleFetchUsers = async (): Promise<{
    success: boolean;
    message?: string;
    users?: AdminCreateUser | null;
  }> => {
    await refetchUsers();
    if (usersError) {
      return { success: false, message: usersError };
    }
    return {
      success: true,
      message: 'Users fetched successfully.',
      users: fetchedUsers,
    };
  };

  // Placeholder functions for CRUD operations
  const handleCreateUser = async (user: Partial<AdminCreateUser>) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/auth/signup`, {
        method: 'POST',
        ...authOptions,
        body: JSON.stringify(user),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create user.');
      }

      await refetchUsers();
    } catch (error) {
      console.error('Create user error:', error);
    }
  };

  const handleUpdateUser = async (user: AdminCreateUser) => {
    try {
      const res = await fetch(
        `${BUYAGAIN_API_BASE_URL}/users/${user.user._id}`,
        {
          method: 'PATCH',
          ...authOptions,
          body: JSON.stringify(user),
        },
      );
      if (!res.ok) throw new Error('Failed to update user.');
      // Refetch the list to update the UI
      await refetchUsers();
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const handleDeleteUser = async () => {
    /* Logic here */
  };

  // Product management
  const handleCreateProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/products/addProduct`, {
        method: 'POST',
        ...authOptions,
        body: JSON.stringify(product),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create product.');
      }

      await refetchProducts();
    } catch (error) {
      console.error('Create product error:', error);
    }
  };

  const handleUpdateProduct = async (product: Product) => {
    try {
      const res = await fetch(
        `${BUYAGAIN_API_BASE_URL}/products/updateProduct/${product.id}`,
        {
          method: 'PATCH',
          ...authOptions,
          body: JSON.stringify(product),
        },
      );
      if (!res.ok) throw new Error('Failed to update product.');
      // Refetch the list to update the UI
      await refetchProducts();
    } catch (error) {
      console.error('Update product error:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        ...authOptions,
      });
      if (!res.ok) throw new Error('Failed to delete product.');
      // Refetch the list to update the UI
      await refetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  // Order Management
  const handleFetchOrders = async (): Promise<{
    success: boolean;
    message?: string;
    orders?: OrdersResponse | null;
  }> => {
    if (ordersError) {
      return { success: false, message: ordersError };
    }

    return {
      success: true,
      message: 'Orders fetched successfully.',
      orders: fetchedOrders,
    };
  };

  const handleFetchMyOrders = async (): Promise<{
    success: boolean;
    message?: string;
    myOrders?: OrdersResponse | null;
  }> => {
    if (myOrdersError) {
      return { success: false, message: ordersError! };
    }
    return {
      success: true,
      message: 'Orders fetched successfully.',
      myOrders: fetchedMyOrders,
    };
  };

  const handleUpdateOrder = async (
    order: IOrder,
    orderUpdates: Partial<IOrder>,
  ) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/orders/${order._id}`, {
        method: 'PATCH',
        ...authOptions,
        body: JSON.stringify(orderUpdates),
      });
      if (!res.ok) throw new Error('Failed to update order status.');
      // Refetch the list to update the UI
      await refetchOrders();
    } catch (error) {
      console.error('Update order error:', error);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`${BUYAGAIN_API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        ...authOptions,
      });
      if (!res.ok) throw new Error('Failed to delete order.');
      // Refetch the list to update the UI
      await refetchOrders();
    } catch (error) {
      console.error('Delete order error:', error);
    }
  };

  const contextValue: AdminContextType = {
    loading:
      productsLoading || usersLoading || ordersLoading || myOrdersLoading,
    error: productsError || usersError,
    users,
    products: fetchedProducts,
    orders: fetchedOrders,
    orderError: ordersError,
    myOrders: fetchedMyOrders,
    myOrderError: myOrdersError,

    refetchUsers,

    handleFetchUsers,
    handleFetchOrders,
    handleFetchMyOrders,

    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleUpdateOrder,
    handleDeleteOrder,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
export type { AdminContextType };
