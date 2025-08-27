import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuthStore } from '../stores/authStore';
import { getOrders, acceptOrder, completeOrder } from '../lib/api';
import { OrderStatus, UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  ClipboardDocumentListIcon, 
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const OrdersPage: React.FC = () => {
  const { user, hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  const { data: orders, isLoading } = useQuery(
    ['orders'],
    getOrders
  );

  const acceptOrderMutation = useMutation(acceptOrder, {
    onSuccess: () => {
      toast.success('Order accepted successfully!');
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to accept order');
    },
  });

  const completeOrderMutation = useMutation(completeOrder, {
    onSuccess: () => {
      toast.success('Order completed successfully!');
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to complete order');
    },
  });

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await acceptOrderMutation.mutateAsync(orderId);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    try {
      await completeOrderMutation.mutateAsync(orderId);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const filteredOrders = orders?.filter((order: any) => {
    const matchesSearch = 
      order.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      [OrderStatus.PENDING]: { color: 'badge-warning', icon: '⏳', text: 'Pending' },
      [OrderStatus.PAID]: { color: 'badge-info', icon: '💳', text: 'Paid' },
      [OrderStatus.COMPLETED]: { color: 'badge-success', icon: '✅', text: 'Completed' },
      [OrderStatus.CANCELED]: { color: 'badge-danger', icon: '❌', text: 'Canceled' }
    };

    const config = statusConfig[status];
    return (
      <span className={`badge ${config.color} flex items-center gap-1`}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage and track your orders
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatus | 'all')}
              className="input-field max-w-xs"
            >
              <option value="all">All Statuses</option>
              <option value={OrderStatus.PENDING}>Pending</option>
              <option value={OrderStatus.PAID}>Paid</option>
              <option value={OrderStatus.COMPLETED}>Completed</option>
              <option value={OrderStatus.CANCELED}>Canceled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No orders are currently available'
            }
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.service.name} - {order.service.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Client:</span>
                      <p className="text-gray-900">{order.client.username}</p>
                      <p className="text-gray-500">{order.client.email}</p>
                    </div>
                    
                    {order.worker && (
                      <div>
                        <span className="font-medium text-gray-700">Worker:</span>
                        <p className="text-gray-900">{order.worker.username}</p>
                        <p className="text-gray-500">{order.worker.email}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-500">
                    Created: {new Date(order.created_at).toLocaleDateString()}
                    {order.updated_at && (
                      <> • Updated: {new Date(order.updated_at).toLocaleDateString()}</>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button size="sm" variant="outline" leftIcon={<EyeIcon className="h-4 w-4" />}>
                    View Details
                  </Button>
                  
                  {hasRole(UserRole.WORKER) && order.status === OrderStatus.PENDING && !order.worker_id && (
                    <Button size="sm" onClick={() => handleAcceptOrder(order.id)}>
                      Accept Order
                    </Button>
                  )}
                  
                  {hasRole(UserRole.WORKER) && order.status === OrderStatus.PAID && order.worker_id === user?.id && (
                    <Button size="sm" onClick={() => handleCompleteOrder(order.id)}>
                      Complete Order
                    </Button>
                  )}
                  
                  {hasRole(UserRole.CLIENT) && order.status === OrderStatus.PENDING && (
                    <Button size="sm">
                      Make Payment
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
