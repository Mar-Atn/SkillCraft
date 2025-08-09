// Admin User Management Interface
// Allows admins to add/delete users and change admin status
// Preserves all existing data flows while enabling user management

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userManagementService, User } from '../services/userManagementService';
import { Users, UserPlus, Trash2, Shield, ShieldOff, Mail, User as UserIcon, Eye, EyeOff } from 'lucide-react';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user' as 'user' | 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = userManagementService.getAllUsersArray();
    setUsers(allUsers);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      userManagementService.addUserManually(
        newUser.email,
        newUser.password,
        newUser.firstName,
        newUser.lastName,
        newUser.role
      );
      
      setSuccess(`User ${newUser.email} has been created successfully!`);
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user'
      });
      setShowAddUser(false);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDeleteUser = (email: string) => {
    if (email === currentUser?.email) {
      setError('You cannot delete your own account');
      return;
    }

    if (confirm(`Are you sure you want to delete user ${email}?`)) {
      try {
        userManagementService.deleteUser(email);
        setSuccess(`User ${email} has been deleted successfully!`);
        loadUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete user');
      }
    }
  };

  const handleToggleRole = (email: string, currentRole: 'user' | 'admin') => {
    if (email === currentUser?.email) {
      setError('You cannot change your own role');
      return;
    }

    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      userManagementService.updateUserRole(email, newRole);
      setSuccess(`User ${email} role updated to ${newRole}!`);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        </div>
        <p className="text-slate-600">Manage system users and permissions</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearMessages} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{success}</span>
          <button onClick={clearMessages} className="text-green-400 hover:text-green-600">×</button>
        </div>
      )}

      {/* Add User Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Add New User</h2>
          
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full pl-4 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create password (min 4 characters)"
                  required
                  minLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value as 'user' | 'admin'})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowAddUser(false)}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">System Users</h2>
          <p className="text-slate-600 mt-1">Total: {users.length} users</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {user.email === currentUser?.email && (
                          <span className="text-xs text-blue-600 font-medium">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleRole(user.email, user.role)}
                        disabled={user.email === currentUser?.email}
                        className={`p-2 rounded-lg transition-colors ${
                          user.email === currentUser?.email
                            ? 'text-slate-300 cursor-not-allowed'
                            : user.role === 'admin'
                            ? 'text-purple-600 hover:bg-purple-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={user.role === 'admin' ? 'Remove admin privileges' : 'Grant admin privileges'}
                      >
                        {user.role === 'admin' ? <ShieldOff className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.email)}
                        disabled={user.email === currentUser?.email}
                        className={`p-2 rounded-lg transition-colors ${
                          user.email === currentUser?.email
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete user"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}