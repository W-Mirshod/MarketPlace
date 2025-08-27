import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/authStore';
import { getCurrentUser, updateUser } from '../lib/api';
import { UserUpdate } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
  UserIcon, 
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileUser, isLoading } = useQuery(
    ['currentUser'],
    getCurrentUser
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<UserUpdate>();

  const updateUserMutation = useMutation(
    (data: UserUpdate) => updateUser(user!.id, data),
    {
      onSuccess: (updatedUser) => {
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || 'Failed to update profile');
      },
    }
  );

  const onSubmit = async (data: UserUpdate) => {
    try {
      await updateUserMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const currentUser = profileUser || user;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your account information and settings
          </p>
        </div>
        {!isEditing && (
          <Button
            variant="outline"
            leftIcon={<PencilIcon className="h-5 w-5" />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center">
              <div className="mx-auto h-24 w-24 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {currentUser?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">
                {currentUser?.username}
              </h3>
              <p className="text-sm text-gray-500 capitalize">
                {currentUser?.role}
              </p>
              <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-100 text-success-800">
                <ShieldCheckIcon className="h-4 w-4 mr-2" />
                {currentUser?.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <h3 className="text-lg font-medium text-gray-900 mb-6">Account Information</h3>
            
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    defaultValue={currentUser?.username}
                    {...register('username', { 
                      required: 'Username is required',
                      minLength: {
                        value: 3,
                        message: 'Username must be at least 3 characters'
                      }
                    })}
                    className={`input-field ${errors.username ? 'border-danger-500' : ''}`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    defaultValue={currentUser?.email}
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={`input-field ${errors.email ? 'border-danger-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" isLoading={updateUserMutation.isLoading}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Username</p>
                    <p className="text-sm text-gray-900">{currentUser?.username}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-900">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <ShieldCheckIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Role</p>
                    <p className="text-sm text-gray-900 capitalize">{currentUser?.role}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-sm text-gray-900">
                      {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Account Statistics */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-6">Account Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-sm text-gray-500">Total Orders</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">0</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600">0</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;
