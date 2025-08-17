import { useState, useMemo } from 'react';
import useAdmin from '../../../hooks/useAdmin';
import { Edit, Trash2, PlusCircle, XCircle } from 'lucide-react';
import type { IUser } from '../../../context/AdminContext';

const UserManagement = () => {
  const {
    loading,
    error,
    users,
    // handleCreateUser,
    // handleUpdateUser,
    // handleDeleteUser,
  } = useAdmin();

import { useState, useMemo } from 'react';
import useAdmin from '../../../hooks/useAdmin';
import { Edit, Trash2, PlusCircle, XCircle } from 'lucide-react';
import type { IUser } from '../../../context/AdminContext';

const UserManagement = () => {
  const {
    loading,
    error,
    users,
    // handleCreateUser,
    // handleUpdateUser,
    // handleDeleteUser,
  } = useAdmin();

  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState({
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    role: 'user',
  });

  const PAGE_SIZE = 5;

  console.log('users before pagination:', users);

  const PAGE_SIZE = 5;

  console.log('users before pagination:', users);

  const filteredUsers = useMemo(() => {
    // Extract the users array from the API response
    const usersArr = users?.users || [];
    //console.log('usersArr', users);

    if (!userSearch) {
      return usersArr;
    }

    const searchTerm = userSearch.toLowerCase();

    return usersArr.filter(
      (user: IUser) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm),
    );
  }, [users, userSearch]);

  /// user data not available here
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * PAGE_SIZE;


    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, userPage]);

  const pageCount = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const openModal = (user?: IUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'user' });
    }
    setIsModalOpen(true);
  const pageCount = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const openModal = (user?: IUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, role: user.role });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'user' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'user' });
  };
    setFormData({ name: '', email: '', role: 'user' });
  };

  const handleSave = async () => {
    if (editingUser) {
      // await handleUpdateUser({ ...editingUser, ...formData });
    } else {
      // await handleCreateUser(formData);
    }
    closeModal();
  const handleSave = async () => {
    if (editingUser) {
      // await handleUpdateUser({ ...editingUser, ...formData });
    } else {
      // await handleCreateUser(formData);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log(id);
      // await handleDeleteUser(id);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading users...</div>
    );
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error} users</div>;
  }
  if (!users) {
    return <div className="p-4 text-center text-gray-500">No users found.</div>;
  }

  return (
    <div className="container mx-auto min-h-screen p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add User</span>
        </button>
    <div className="container mx-auto min-h-screen p-4 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 rounded-lg bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700"
        >
          <PlusCircle className="h-5 w-5" />
          <span>Add User</span>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user: IUser, i: number) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    {(userPage - 1) * PAGE_SIZE + i + 1}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={userSearch}
          onChange={(e) => setUserSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user: IUser, i: number) => (
                <tr key={user._id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    {(userPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.role === 'admin'
                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100'
                          : user.role === 'seller'
                            ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                      }`}
                    >
                      {user.role}
                    </span>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800 dark:text-gray-200">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        user.role === 'admin'
                          ? 'bg-pink-100 text-pink-800 dark:bg-pink-700 dark:text-pink-100'
                          : user.role === 'seller'
                            ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => openModal(user)}
                      className="mr-4 text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300"
                      onClick={() => openModal(user)}
                      className="mr-4 text-pink-600 hover:text-pink-900 dark:text-pink-400 dark:hover:text-pink-300"
                    >
                      <Edit className="inline h-5 w-5" />
                      <Edit className="inline h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDelete(user._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="inline h-5 w-5" />
                      <Trash2 className="inline h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button
            onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
            disabled={userPage === 1}
            className="rounded-lg bg-gray-200 px-3 py-1 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
          >
            Previous
          </button>
          <span>
            Page {userPage} of {pageCount}
          </span>
          <button
            onClick={() => setUserPage((prev) => Math.min(prev + 1, pageCount))}
            disabled={userPage === pageCount}
            className="rounded-lg bg-gray-200 px-3 py-1 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
          >
            Next
          </button>
        </div>
      )}

      {/* User Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50 dark:bg-opacity-80">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold">
                {editingUser ? 'Edit User' : 'Add User'}
              </h3>
              <button onClick={closeModal}>
                <XCircle className="h-6 w-6 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="user">user</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
      {/* Pagination Controls */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <button
            onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
            disabled={userPage === 1}
            className="rounded-lg bg-gray-200 px-3 py-1 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
          >
            Previous
          </button>
          <span>
            Page {userPage} of {pageCount}
          </span>
          <button
            onClick={() => setUserPage((prev) => Math.min(prev + 1, pageCount))}
            disabled={userPage === pageCount}
            className="rounded-lg bg-gray-200 px-3 py-1 text-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-200"
          >
            Next
          </button>
        </div>
      )}

      {/* User Management Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600 bg-opacity-50 dark:bg-opacity-80">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-xl font-bold">
                {editingUser ? 'Edit User' : 'Add User'}
              </h3>
              <button onClick={closeModal}>
                <XCircle className="h-6 w-6 text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900"
                >
                  <option value="user">user</option>
                  <option value="seller">seller</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-pink-600 px-4 py-2 text-white hover:bg-pink-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
