// src/admin/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Filter } from 'lucide-react';
import AdminAPI from '../services/api';
import { DataTable } from '../components';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    subscription: 'all'
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminAPI.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      setUsers(response.data.users);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'id',
      title: 'ID',
      render: (user) => `#${user.id}`
    },
    {
      key: 'username',
      title: 'Username',
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <img
              className="h-8 w-8 rounded-full"
              src={user.avatar || '/default-avatar.png'}
              alt=""
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {user.username}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'subscription',
      title: 'Subscription',
      render: (user) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.subscription === 'premium'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {user.subscription}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (user) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.isBlocked
            ? 'bg-red-100 text-red-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Joined',
      render: (user) => new Date(user.createdAt).toLocaleDateString()
    }
  ];

  const handleAction = async (action, user) => {
    try {
      switch (action) {
        case 'block':
          await AdminAPI.blockUser(user.id);
          break;
        case 'delete':
          await AdminAPI.deleteUser(user.id);
          break;
        // Add more actions as needed
      }
      loadUsers();
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <button className="btn-primary flex items-center">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded-lg px-4"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
        <select
          value={filters.subscription}
          onChange={(e) => setFilters({ ...filters, subscription: e.target.value })}
          className="border rounded-lg px-4"
        >
          <option value="all">All Subscriptions</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        pagination={pagination}
        onPageChange={(page) => setPagination({ ...pagination, page })}
        loading={loading}
        actions={(user) => (
          <>
            <button
              onClick={() => handleAction('block', user)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {user.isBlocked ? 'Unblock' : 'Block'}
            </button>
            <button
              onClick={() => handleAction('delete', user)}
              className="text-sm text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </>
        )}
      />
    </div>
  );
};

export default Users;