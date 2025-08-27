import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuthStore } from './stores/authStore';
import { getCurrentUser } from './lib/api';
import { UserRole } from './types';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ServicesPage from './pages/ServicesPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user, token, setUser, setToken, isAuthenticated } = useAuthStore();

  // Check if user is authenticated on app load
  const { isLoading } = useQuery(
    ['currentUser'],
    getCurrentUser,
    {
      enabled: !!token && !user,
      onSuccess: (userData) => {
        setUser(userData);
      },
      onError: () => {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
      },
      retry: false,
    }
  );

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('access_token');
    if (existingToken && !token) {
      setToken(existingToken);
    }
  }, [token, setToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} 
      />

      {/* Protected routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" />} />
        
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="services" 
          element={
            <ProtectedRoute>
              <ServicesPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="orders" 
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="admin" 
          element={
            <ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
