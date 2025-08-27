import React from 'react';
import { useQuery } from 'react-query';
import { useAuthStore } from '../stores/authStore';
import { getOrders, getServices, getUsers } from '../lib/api';
import { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  ShoppingBagIcon, 
  ClipboardDocumentListIcon, 
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();

  const { data: orders, isLoading: ordersLoading } = useQuery(
    ['orders'],
    getOrders
  );

  const { data: services, isLoading: servicesLoading } = useQuery(
    ['services'],
    getServices
  );

  const { data: users, isLoading: usersLoading } = useQuery(
    ['users'],
    getUsers,
    { enabled: hasRole(UserRole.ADMIN) }
  );

  const isLoading = ordersLoading || servicesLoading || (hasRole(UserRole.ADMIN) && usersLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pendingOrders = orders?.filter((order: any) => order.status === 'pending') || [];
  const completedOrders = orders?.filter((order: any) => order.status === 'completed') || [];
  const totalRevenue = orders?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'badge-warning', icon: ClockIcon },
      paid: { color: 'badge-info', icon: CheckCircleIcon },
      completed: { color: 'badge-success', icon: CheckCircleIcon },
      canceled: { color: 'badge-danger', icon: ExclamationTriangleIcon }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`badge ${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back, {user?.username}! Here's what's happening with your account.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary-100 rounded-lg">
            <ShoppingBagIcon className="w-6 h-6 text-primary-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Total Services</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{services?.length || 0}</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-warning-100 rounded-lg">
            <ClipboardDocumentListIcon className="w-6 h-6 text-warning-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Pending Orders</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{pendingOrders.length}</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-success-100 rounded-lg">
            <CheckCircleIcon className="w-6 h-6 text-success-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Completed Orders</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{completedOrders.length}</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-lg">
            <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
        </Card>
      </div>

      {/* Role-specific content */}
      {hasRole(UserRole.ADMIN) && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <Button size="sm">View All Users</Button>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users?.slice(0, 5).map((user: any) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-success-100 text-success-800' : 'bg-danger-100 text-danger-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          <Button size="sm" variant="outline">View All Orders</Button>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.slice(0, 5).map((order: any) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.service.name}</div>
                    <div className="text-sm text-gray-500">{order.service.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
