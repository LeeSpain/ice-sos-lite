import React, { useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin } = useUserRole();

  console.log('🔄 DashboardRedirect Debug:', {
    user: user?.id || 'none',
    email: user?.email || 'none',
    role,
    isAdmin,
    authLoading,
    roleLoading,
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // Show loading while checking authentication and role
  if (authLoading || roleLoading) {
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