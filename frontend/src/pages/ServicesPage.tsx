import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuthStore } from '../stores/authStore';
import { getServices, getServicesByCategory, createOrder } from '../lib/api';
import { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  ShoppingBagIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ServicesPage: React.FC = () => {
  const { hasRole } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  const { data: services, isLoading } = useQuery(
    ['services'],
    getServices
  );

  const { data: categories } = useQuery(
    ['services-by-category', selectedCategory],
    () => selectedCategory === 'all' ? Promise.resolve([]) : getServicesByCategory(selectedCategory),
    { enabled: selectedCategory !== 'all' }
  );

  const createOrderMutation = useMutation(createOrder, {
    onSuccess: () => {
      toast.success('Order created successfully!');
      setShowOrderModal(false);
      setSelectedService(null);
      queryClient.invalidateQueries(['orders']);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to create order');
    },
  });

  const displayServices = selectedCategory === 'all' ? (services || []) : (categories || []);
  
  const filteredServices = displayServices.filter((service: any) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const uniqueCategories = Array.from(new Set((services || []).map((s: any) => s.category))).filter(Boolean) as string[];

  const handleOrderService = (service: any) => {
    setSelectedService(service);
    setShowOrderModal(true);
  };

  const handleConfirmOrder = () => {
    if (selectedService) {
      createOrderMutation.mutate({ service_id: selectedService.id });
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-2 text-sm text-gray-700">
            Browse and discover professional services
          </p>
        </div>
        {hasRole(UserRole.ADMIN) && (
          <Button leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Service
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((category: string, index: number) => (
                <option key={category || index} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingBagIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'No services are currently available'
            }
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service: any, index: number) => (
            <Card key={service.id || index} hover className="flex flex-col">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {service.category}
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${service.price.toFixed(2)}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4">
                  {service.description}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                {hasRole(UserRole.CLIENT) && (
                  <Button 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleOrderService(service)}
                  >
                    Order Now
                  </Button>
                )}
                {hasRole(UserRole.ADMIN) && (
                  <>
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="danger" size="sm">
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Confirmation Modal */}
      {showOrderModal && selectedService && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Order</h3>
              <div className="text-left mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Service:</span> {selectedService.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Category:</span> {selectedService.category}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Price:</span> ${selectedService.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Description:</span> {selectedService.description}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowOrderModal(false)}
                  disabled={createOrderMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  isLoading={createOrderMutation.isLoading}
                  disabled={createOrderMutation.isLoading}
                >
                  Confirm Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
