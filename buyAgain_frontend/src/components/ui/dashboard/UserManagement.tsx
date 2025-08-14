import React, { useState, useMemo } from 'react';
import { Plus, XCircle, Edit, Trash2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers }) => {
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserForm, setNewUserForm] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: '',
  });
  const PAGE_SIZE = 3;

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

  return (
    <section className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
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
            <button onClick={cancelAddUser} aria-label="Cancel add user">
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
                setNewUserData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <input
              type="email"
              placeholder="Email"
              className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={newUserData.email}
              onChange={(e) =>
                setNewUserData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <input
              type="text"
              placeholder="Role"
              className="rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={newUserData.role}
              onChange={(e) =>
                setNewUserData((prev) => ({ ...prev, role: e.target.value }))
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
                        setEditingUser({ ...editingUser, name: e.target.value })
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
                        setEditingUser({ ...editingUser, role: e.target.value })
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
                      className="mr-5 rounded"
                      aria-label={`Edit user ${user.name}`}
                    >
                      <Edit className="inline h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="rounded"
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
          Page {userPage} of {Math.ceil(filteredUsers.length / PAGE_SIZE) || 1}
        </span>
        <button
          onClick={() =>
            setUserPage((p) =>
              p < Math.ceil(filteredUsers.length / PAGE_SIZE) ? p + 1 : p,
            )
          }
          disabled={userPage >= Math.ceil(filteredUsers.length / PAGE_SIZE)}
          className="rounded border border-gray-300 px-3 py-1 hover:bg-pink-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600"
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default UserManagement;
