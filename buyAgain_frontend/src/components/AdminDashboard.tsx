/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Users,
  Package,
  BarChart,
  Menu,
  X,
  User,
  Home,
  Edit2,
  Trash2,
  Plus,
  XCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import useTheme from '../hooks/useTheme';
import Logout from '../auth/Logout';
import useAuth from '../hooks/useAuth';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type User = { id: number; name: string; email: string; role: string };
type Product = { id: number; name: string; price: string; stock: number };

const PAGE_SIZE = 3;

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const logout = Logout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'products'
  >('dashboard');

  const { theme, toggleTheme } = useTheme();

  // In PROD, use user?.data.dataKey.photo;
  const userProfile = user?.data.users;

  // Users state
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'User' },
    { id: 4, name: 'Alice', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Bob', email: 'bob@example.com', role: 'User' },
  ]);

  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserForm, setNewUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: '',
  });

  // Products state
  const [products, setProducts] = useState<Product[]>([
    { id: 101, name: 'Sneakers', price: '$120', stock: 20 },
    { id: 102, name: 'Wristwatch', price: '$80', stock: 35 },
    { id: 103, name: 'Perfume', price: '$45', stock: 12 },
    { id: 104, name: 'Backpack', price: '$60', stock: 18 },
    { id: 105, name: 'Sunglasses', price: '$75', stock: 10 },
  ]);
  const [productSearch, setProductSearch] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductForm, setNewProductForm] = useState(false);
  const [newProductData, setNewProductData] = useState({
    name: '',
    price: '',
    stock: '',
  });

  // Chart data
  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales ($)',
        data: [5000, 7000, 6000, 8000, 9000, 11000],
        borderColor: '#ec4899', // pink-500
        backgroundColor: 'rgba(236, 72, 153, 0.3)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const salesOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: {
        display: true,
        text: 'Monthly Sales',
        color: '#ec4899',
        font: { size: 18, weight: 'bold' as const },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' },
      },
    },
  };

  // Filtering & Pagination helpers
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.role.toLowerCase().includes(userSearch.toLowerCase()),
      ),
    [users, userSearch],
  );

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, userPage]);

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.price.toLowerCase().includes(productSearch.toLowerCase()),
      ),
    [products, productSearch],
  );

  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, productPage]);

  // User handlers
  const startEditUser = (user: User) => {
    setEditingUser(user);
  };

  const cancelEditUser = () => {
    setEditingUser(null);
  };

  const saveUser = () => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === editingUser.id ? editingUser : u)),
    );
    setEditingUser(null);
  };

  const deleteUser = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  const startAddUser = () => {
    setNewUserForm(true);
    setNewUserData({ name: '', email: '', role: '' });
  };

  const cancelAddUser = () => {
    setNewUserForm(false);
  };

  const saveNewUser = () => {
    if (
      newUserData.name.trim() === '' ||
      newUserData.email.trim() === '' ||
      newUserData.role.trim() === ''
    )
      return alert('Please fill all fields');
    const newUser: User = {
      id: Date.now(),
      ...newUserData,
    };
    setUsers((prev) => [...prev, newUser]);
    setNewUserForm(false);
  };

  // Product handlers
  const startEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
  };

  const saveProduct = () => {
    if (!editingProduct) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p)),
    );
    setEditingProduct(null);
  };

  const deleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const startAddProduct = () => {
    setNewProductForm(true);
    setNewProductData({ name: '', price: '', stock: '' });
  };

  const cancelAddProduct = () => {
    setNewProductForm(false);
  };

  const saveNewProduct = () => {
    if (
      newProductData.name.trim() === '' ||
      newProductData.price.trim() === '' ||
      newProductData.stock.trim() === ''
    )
      return alert('Please fill all fields');
    const newProduct: Product = {
      id: Date.now(),
      name: newProductData.name,
      price: newProductData.price,
      stock: Number(newProductData.stock),
    };
    setProducts((prev) => [...prev, newProduct]);
    setNewProductForm(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-black">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-black ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <h2 className="text-lg font-bold text-pink-600">Admin Panel</h2>
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <nav className="mt-6 flex flex-col space-y-1 px-4">
          {[
            { name: 'Dashboard', id: 'dashboard' },
            { name: 'Users', id: 'users' },
            { name: 'Products', id: 'products' },
          ].map(({ name, id }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id as any);
                setSidebarOpen(false);
              }}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-gray-700 hover:bg-pink-100 hover:text-pink-600 dark:text-gray-300 dark:hover:bg-pink-900 dark:hover:text-pink-400 ${
                activeTab === id
                  ? 'bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400'
                  : ''
              }`}
            >
              {id === 'dashboard' && <Home className="h-5 w-5" />}
              {id === 'users' && <Users className="h-5 w-5" />}
              {id === 'products' && <Package className="h-5 w-5" />}
              <span className="font-medium">{name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
          <button
            className="mr-4 md:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold capitalize text-gray-800 dark:text-gray-200">
            {activeTab}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2"
              title="Toggle dark / light"
            >
              {theme ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="flex items-center gap-1 rounded-md bg-black px-3 py-1 text-white hover:bg-gray-700 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              aria-label="Logout"
              onClick={logout}
            >
              Logout
            </button>
            <div className="max-h-8 max-w-8 cursor-pointer rounded-full bg-gray-300">
              {userProfile?.photo ? (
                <img
                  src={userProfile.photo}
                  alt={userProfile.name || 'user profile photo'}
                  className="rounded-full"
                />
              ) : (
                <User size={18} />
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-grow p-6">
          {/* Tabs nav */}
          <div className="mb-6 flex gap-4 border-b border-gray-300 dark:border-gray-700">
            {['dashboard', 'users', 'products'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`border-b-2 px-3 py-1 font-semibold capitalize ${
                  activeTab === tab
                    ? 'border-pink-500 text-pink-600 dark:border-pink-400 dark:text-pink-400'
                    : 'border-transparent text-gray-600 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'dashboard' && (
            <>
              {/* Stats cards */}
              <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900">
                  <ShoppingCart className="h-8 w-8 text-pink-500" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-300">Orders</p>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      1,234
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-700">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-300">Users</p>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      567
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-900 sm:dark:bg-gray-700">
                  <Package className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-300">Products</p>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      342
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-lg bg-white p-6 shadow dark:bg-gray-700 sm:dark:bg-gray-900">
                  <BarChart className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-gray-500 dark:text-gray-300">Revenue</p>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      $54,321
                    </h2>
                  </div>
                </div>
              </section>

              {/* Sales Chart */}
              <section className="mt-10 rounded-lg bg-white p-6 shadow dark:bg-gray-700">
                <Line data={salesData} options={salesOptions} />
              </section>
            </>
          )}

          {activeTab === 'users' && (
            <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  User Management
                </h2>
                {!newUserForm && (
                  <button
                    onClick={startAddUser}
                    className="inline-flex items-center gap-1 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add User
                  </button>
                )}
              </div>

              {/* New User Form */}
              {newUserForm && (
                <div className="mb-4 rounded border border-pink-500 p-4 dark:border-pink-400">
                  <div className="flex justify-between">
                    <h3 className="mb-2 font-semibold text-pink-600 dark:text-pink-400">
                      Add New User
                    </h3>
                    <button
                      onClick={cancelAddUser}
                      aria-label="Cancel add user"
                    >
                      <XCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveNewUser();
                    }}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={newUserData.name}
                      onChange={(e) =>
                        setNewUserData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={newUserData.email}
                      onChange={(e) =>
                        setNewUserData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={newUserData.role}
                      onChange={(e) =>
                        setNewUserData((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      required
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-pink-600 px-4 py-1 text-white hover:bg-pink-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelAddUser}
                        className="rounded border border-pink-600 px-4 py-1 text-pink-600 hover:bg-pink-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Search */}
              <input
                type="search"
                placeholder="Search users..."
                className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
              />

              {/* Users Table */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 text-sm dark:text-gray-200">
                        {user.id}
                      </td>

                      {/* Editable row */}
                      {editingUser?.id === user.id ? (
                        <>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            <input
                              type="text"
                              value={editingUser.name}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  name: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            <input
                              type="email"
                              value={editingUser.email}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  email: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            <input
                              type="text"
                              value={editingUser.role}
                              onChange={(e) =>
                                setEditingUser({
                                  ...editingUser,
                                  role: e.target.value,
                                })
                              }
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            <button
                              onClick={saveUser}
                              className="mr-2 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEditUser}
                              className="rounded border border-pink-500 px-3 py-1 text-pink-500 hover:bg-pink-100"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            {user.name}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            {user.email}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            {user.role}
                          </td>
                          <td className="px-4 py-2 text-sm dark:text-gray-200">
                            <button
                              onClick={() => startEditUser(user)}
                              className="mr-2 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                              aria-label={`Edit user ${user.name}`}
                            >
                              <Edit2 className="inline h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                              aria-label={`Delete user ${user.name}`}
                            >
                              <Trash2 className="inline h-4 w-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="mt-4 flex justify-between text-gray-600 dark:text-gray-300">
                <button
                  onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                  disabled={userPage === 1}
                  className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                >
                  Previous
                </button>
                <span>
                  Page {userPage} of{' '}
                  {Math.ceil(filteredUsers.length / PAGE_SIZE) || 1}
                </span>
                <button
                  onClick={() =>
                    setUserPage((p) =>
                      p < Math.ceil(filteredUsers.length / PAGE_SIZE)
                        ? p + 1
                        : p,
                    )
                  }
                  disabled={
                    userPage >= Math.ceil(filteredUsers.length / PAGE_SIZE)
                  }
                  className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            </section>
          )}

          {activeTab === 'products' && (
            <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-700">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  Product Management
                </h2>
                {!newProductForm && (
                  <button
                    onClick={startAddProduct}
                    className="inline-flex items-center gap-1 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                )}
              </div>

              {/* New Product Form */}
              {newProductForm && (
                <div className="mb-4 rounded border border-pink-500 p-4 dark:border-pink-400">
                  <div className="flex justify-between">
                    <h3 className="mb-2 font-semibold text-pink-600 dark:text-pink-400">
                      Add New Product
                    </h3>
                    <button
                      onClick={cancelAddProduct}
                      aria-label="Cancel add product"
                    >
                      <XCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveNewProduct();
                    }}
                    className="flex flex-col gap-3"
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={newProductData.name}
                      onChange={(e) =>
                        setNewProductData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      type="text"
                      placeholder="Price (e.g. $50)"
                      className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={newProductData.price}
                      onChange={(e) =>
                        setNewProductData((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      required
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={newProductData.stock}
                      onChange={(e) =>
                        setNewProductData((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                      required
                      min={0}
                    />
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="rounded bg-pink-600 px-4 py-1 text-white hover:bg-pink-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelAddProduct}
                        className="rounded border border-pink-600 px-4 py-1 text-pink-600 hover:bg-pink-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Search */}
              <input
                type="search"
                placeholder="Search products..."
                className="mb-4 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductPage(1);
                }}
              />

              {/* Products Table */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Price
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Stock
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 dark:text-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
                  {paginatedProducts.map((product) =>
                    editingProduct?.id === product.id ? (
                      <tr key={product.id}>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          {product.id}
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          <input
                            type="text"
                            value={editingProduct.name}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                name: e.target.value,
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          <input
                            type="text"
                            value={editingProduct.price}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                price: e.target.value,
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          <input
                            type="number"
                            value={editingProduct.stock}
                            onChange={(e) =>
                              setEditingProduct({
                                ...editingProduct,
                                stock: Number(e.target.value),
                              })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                            min={0}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          <button
                            onClick={saveProduct}
                            className="mr-2 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEditProduct}
                            className="rounded border border-pink-500 px-3 py-1 text-pink-500 hover:bg-pink-100"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={product.id}>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          {product.id}
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          {product.name}
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          {product.price}
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          {product.stock}
                        </td>
                        <td className="px-4 py-2 text-sm dark:text-gray-200">
                          <button
                            onClick={() => startEditProduct(product)}
                            className="mr-2 rounded bg-pink-500 px-3 py-1 text-white hover:bg-pink-600"
                            aria-label={`Edit product ${product.name}`}
                          >
                            <Edit2 className="inline h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                            aria-label={`Delete product ${product.name}`}
                          >
                            <Trash2 className="inline h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>

              {/* Pagination controls */}
              <div className="mt-4 flex justify-between text-gray-600 dark:text-gray-300">
                <button
                  onClick={() => setProductPage((p) => Math.max(p - 1, 1))}
                  disabled={productPage === 1}
                  className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                >
                  Previous
                </button>
                <span>
                  Page {productPage} of{' '}
                  {Math.ceil(filteredProducts.length / PAGE_SIZE) || 1}
                </span>
                <button
                  onClick={() =>
                    setProductPage((p) =>
                      p < Math.ceil(filteredProducts.length / PAGE_SIZE)
                        ? p + 1
                        : p,
                    )
                  }
                  disabled={
                    productPage >=
                    Math.ceil(filteredProducts.length / PAGE_SIZE)
                  }
                  className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
                >
                  Next
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
