import React from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Navigate } from 'react-router-dom';

const DashboardRedirect = () => {
  const { user, loading, isAdmin, role } = useOptimizedAuth();

  console.log('🔄 DashboardRedirect - Enhanced Debug:', {
    user: user?.id || 'none',
    userEmail: user?.email,
    isAdmin,
    role,
    loading,
    currentPath: window.location.pathname,
    href: window.location.href,
    timestamp: new Date().toISOString()
  });

  // Show loading while checking authentication and role
  if (loading) {
    console.log('🔄 DashboardRedirect: Loading state, showing spinner');
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
    console.log('🔄 DashboardRedirect: No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Enhanced role-based routing with explicit admin check
  if (role === 'admin' || isAdmin) {
    console.log('🔄 DashboardRedirect: Admin user detected, redirecting to admin dashboard');
    return <Navigate to="/admin-dashboard" replace />;
  } else {
    console.log('🔄 DashboardRedirect: Regular user, redirecting to member dashboard');
    return <Navigate to="/member-dashboard" replace />;
  }
};

export default DashboardRedirect;