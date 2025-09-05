import React from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user, loading, isAdmin } = useOptimizedAuth();

  console.log('🔄 DashboardRedirect:', {
    user: user?.id || 'none',
    userEmail: user?.email,
    isAdmin,
    loading,
    currentPath: window.location.pathname,
    href: window.location.href
  });

  // Show loading while checking authentication and role
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Checking access level...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect based on user role
  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  } else {
    return <Navigate to="/member-dashboard" replace />;
  }
};

export default DashboardRedirect;