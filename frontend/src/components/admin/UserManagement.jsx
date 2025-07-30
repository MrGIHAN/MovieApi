import React, { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { adminMovieService } from '../../services/movieService';
import { useNotification } from '../../context/NotificationContext';
import { SkeletonLoader } from '../common/Loader';
import { formatDate, getInitials } from '../../utils/helpers';
import Modal, { ConfirmModal } from '../common/Modal';

const UserManagement = () => {
  const { success, error } = useNotification();
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, filterRole, filterStatus, sortBy, sortOrder]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersData = await adminMovieService.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  const filterAndSortUsers = useCallback(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => {
        if (filterStatus === 'active') return user.isActive !== false;
        if (filterStatus === 'inactive') return user.isActive === false;
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchQuery, filterRole, filterStatus, sortBy, sortOrder]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await adminMovieService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(user => user.id !== userToDelete.id));
      success(`User ${userToDelete.firstName} ${userToDelete.lastName} deleted successfully`);
    } catch (err) {
      console.error('Error deleting user:', err);
      error('Failed to delete user');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      // In a real implementation, this would call an API to toggle user status
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
      success(`User status updated successfully`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      error('Failed to update user status');
    }
  };

  const handlePromoteUser = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
      // In a real implementation, this would call an API to update user role
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, role: newRole }
          : user
      ));
      success(`User role updated to ${newRole.toLowerCase()}`);
    } catch (err) {
      console.error('Error updating user role:', err);
      error('Failed to update user role');
    }
  };

  const handleSendEmail = (user) => {
    // In a real implementation, this would open an email composer or send an email
    success(`Email functionality would be implemented here for ${user.email}`);
  };

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const UserRow = ({ user }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <tr className="border-b border-netflix-gray hover:bg-netflix-gray/50 transition-colors duration-200">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center text-white font-medium">
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>
            <div>
              <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-netflix-lightGray text-sm">{user.email}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.role === 'ADMIN' 
              ? 'bg-yellow-600 text-white' 
              : 'bg-blue-600 text-white'
          }`}>
            {user.role === 'ADMIN' ? (
              <>
                <ShieldCheckIcon className="h-3 w-3 mr-1" />
                Admin
              </>
            ) : (
              <>
                <UserIcon className="h-3 w-3 mr-1" />
                User
              </>
            )}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user.isActive !== false
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {user.isActive !== false ? (
              <>
                <CheckIcon className="h-3 w-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <XMarkIcon className="h-3 w-3 mr-1" />
                Inactive
              </>
            )}
          </span>
        </td>
        <td className="px-6 py-4 text-netflix-lightGray text-sm">
          {formatDate(user.createdAt || new Date())}
        </td>
        <td className="px-6 py-4 text-netflix-lightGray text-sm">
          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
        </td>
        <td className="px-6 py-4">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-netflix-lightGray hover:text-white transition-colors duration-200"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-8 w-48 bg-netflix-darkGray border border-netflix-gray rounded-lg shadow-2xl z-10">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowUserModal(true);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-netflix-gray"
                >
                  <EyeIcon className="h-4 w-4 inline mr-2" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    handleSendEmail(user);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-netflix-gray"
                >
                  <EnvelopeIcon className="h-4 w-4 inline mr-2" />
                  Send Email
                </button>
                <button
                  onClick={() => {
                    handleToggleUserStatus(user.id, user.isActive !== false);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-netflix-gray"
                >
                  {user.isActive !== false ? (
                    <>
                      <XMarkIcon className="h-4 w-4 inline mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 inline mr-2" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handlePromoteUser(user.id, user.role);
                    setShowActions(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-netflix-gray"
                >
                  <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
                  {user.role === 'USER' ? 'Promote to Admin' : 'Demote to User'}
                </button>
                <div className="border-t border-netflix-gray">
                  <button
                    onClick={() => {
                      setUserToDelete(user);
                      setShowDeleteModal(true);
                      setShowActions(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-netflix-gray"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
                    Delete User
                  </button>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <div className="h-8 bg-netflix-gray rounded w-64 animate-pulse mb-2"></div>
          <div className="h-4 bg-netflix-gray rounded w-96 animate-pulse"></div>
        </div>
        <SkeletonLoader type="list" count={5} />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-netflix-lightGray">
          Manage registered users and their permissions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-netflix-lightGray text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <UserIcon className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-netflix-lightGray text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => user.isActive !== false).length}
              </p>
            </div>
            <CheckIcon className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-netflix-lightGray text-sm font-medium">Admins</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => user.role === 'ADMIN').length}
              </p>
            </div>
            <ShieldCheckIcon className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-netflix-lightGray text-sm font-medium">New This Month</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(user => {
                  const createdAt = new Date(user.createdAt || Date.now());
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return createdAt > monthAgo;
                }).length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-netflix-red" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-netflix-darkGray rounded-lg p-6 border border-netflix-gray">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-netflix-lightGray" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-netflix-gray border border-netflix-lightGray rounded-lg text-white placeholder-netflix-lightGray focus:outline-none focus:ring-2 focus:ring-netflix-red"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-netflix-lightGray" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
              >
                <option value="all">All Roles</option>
                <option value="USER">Users</option>
                <option value="ADMIN">Admins</option>
              </select>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="bg-netflix-gray border border-netflix-lightGray text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-netflix-red"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="firstName-asc">Name A-Z</option>
              <option value="firstName-desc">Name Z-A</option>
              <option value="lastLogin-desc">Last Login</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-netflix-darkGray rounded-lg border border-netflix-gray overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-netflix-gray">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Last Login</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <UserRow key={user.id} user={user} />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-netflix-lightGray">
                      <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium mb-2">No users found</p>
                      <p className="text-sm">
                        {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'No users have registered yet'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-netflix-gray">
            <div className="flex items-center justify-between">
              <div className="text-netflix-lightGray text-sm">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-netflix-gray hover:bg-netflix-lightGray disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = currentPage <= 3 
                      ? index + 1 
                      : currentPage + index - 2;
                    
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`px-3 py-1 rounded transition-colors duration-200 ${
                          currentPage === pageNumber
                            ? 'bg-netflix-red text-white'
                            : 'bg-netflix-gray hover:bg-netflix-lightGray text-white'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-netflix-gray hover:bg-netflix-lightGray disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-netflix-red rounded-full flex items-center justify-center text-white text-xl font-bold">
                {getInitials(`${selectedUser.firstName} ${selectedUser.lastName}`)}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <p className="text-netflix-lightGray">{selectedUser.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.role === 'ADMIN' 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {selectedUser.role}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.isActive !== false
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Account Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">User ID:</span>
                    <span className="text-white">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Email:</span>
                    <span className="text-white">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Role:</span>
                    <span className="text-white">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Status:</span>
                    <span className="text-white">
                      {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Joined:</span>
                    <span className="text-white">
                      {formatDate(selectedUser.createdAt || new Date())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Last Login:</span>
                    <span className="text-white">
                      {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Movies Watched:</span>
                    <span className="text-white">{selectedUser.moviesWatched || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-netflix-lightGray">Favorites:</span>
                    <span className="text-white">{selectedUser.favoritesCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-netflix-gray">
              <button
                onClick={() => handleSendEmail(selectedUser)}
                className="btn btn-outline btn-sm"
              >
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                Send Email
              </button>
              <button
                onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.isActive !== false)}
                className={`btn btn-sm ${
                  selectedUser.isActive !== false
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {selectedUser.isActive !== false ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handlePromoteUser(selectedUser.id, selectedUser.role)}
                className="btn btn-primary btn-sm"
              >
                {selectedUser.role === 'USER' ? 'Promote to Admin' : 'Demote to User'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message={
          userToDelete 
            ? `Are you sure you want to delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone and will remove all user data including favorites, watch history, and comments.`
            : ''
        }
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;