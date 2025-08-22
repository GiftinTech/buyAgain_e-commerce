/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AdminContext } from '../hooks/useAdmin';
import type { IProduct } from './ShoppingContext';
import useFetch from '../hooks/useFetch';
import { useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'seller';
  test_role: string;
  active: boolean;
  photo: string;
}

export interface User {
  users: IUser[];
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

interface OrderItem {
  product: string;
  quantity: number;
  priceAtTimeOfOrder: number;
}

export interface IOrder {
  _id: string;
  user: string;
  status: string;
  paid: boolean;
  createdAt: string;
  totalPrice: number;
  shippingAddress: ShippingAddress;
  orderItems: OrderItem[];
}

interface Order {
  orders: IOrder[];
}

interface AdminContextType {
  // Read-only state from useFetch hooks
  loading: boolean;
  error: string | null;
  orderError: string | null;
  users: User | null;
  products: IProduct[] | null;
  orders: Order | null;

  // Functions to trigger CRUD operations
  handleFetchUsers: () => Promise<{
    success: boolean;
    message?: string;
    users?: User | null;
  }>;

  handleFetchOrders: () => Promise<{
    success: boolean;
    message?: string;
    orders?: Order | null;
  }>;
  handleCreateUser: () => Promise<void>;
  handleUpdateUser: () => Promise<void>;
  handleDeleteUser: () => Promise<void>;

  handleCreateProduct: (product: Omit<IProduct, 'id'>) => Promise<void>;
  handleUpdateProduct: (product: IProduct) => Promise<void>;
  handleDeleteProduct: (id: string) => Promise<void>;
}

interface AdminProviderProps {
  children: ReactNode;
}

const BUYAGAIN_API_BASE_URL = import.meta.env.VITE_BUYAGAIN_API_BASE_URL;

// provide the state
const AdminProvider = ({ children }: AdminProviderProps) => {
  const { token } = useAuth();
  const location = useLocation();

  const authOptions = useMemo(() => {
    return {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
  }, [token]);

  const {
    data: fetchedProducts,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useFetch<IProduct[]>('/products');

  // fetch users from DB
  const {
    data: fetchedUsers,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useFetch<User | null>('/users', authOptions);

  // fetch orders from DB
  const {
    data: fetchedOrders,
    loading: ordersLoading,
    error: ordersError,
  } = useFetch<Order>('/orders', authOptions);
  console.log('Orders Data:', fetchedOrders);

  // Local state to hold users
  const [users, setUsers] = useState<User | null>(null);

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

  // This function now just triggers a refetch from the hook
  const handleFetchUsers = async (): Promise<{
    success: boolean;
    message?: string;
    users?: User | null;
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

  const handleFetchOrders = async (): Promise<{
    success: boolean;
    message?: string;
    orders?: Order | null;
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

  // Placeholder functions for CRUD operations
  const handleCreateUser = async () => {
    /* Logic here */
  };
  const handleUpdateUser = async () => {
    /* Logic here */
  };
  const handleDeleteUser = async () => {
    /* Logic here */
  };
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
        `${BUYAGAIN_API_BASE_URL}/products/${product.id}`,
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

  const contextValue: AdminContextType = {
    loading: productsLoading || usersLoading || ordersLoading,
    error: productsError || usersError,
    users,
    products: fetchedProducts,
    orders: fetchedOrders,
    orderError: ordersError,

    handleFetchUsers,
    handleFetchOrders,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminProvider;
export type { AdminContextType };
