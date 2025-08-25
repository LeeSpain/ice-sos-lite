import React from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Navigate } from 'react-router-dom';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const { user, loading, isAdmin } = useOptimizedAuth();

  console.log('🔐 AdminProtectedRoute:', {
    user: user?.id || 'none',
    isAdmin,
    loading,
    currentPath: window.location.pathname,
    shouldRedirect: !loading && user && !isAdmin
  });

  // Show loading while checking authentication and role
  if (loading) {
    console.log('🔐 AdminProtectedRoute: Still loading, showing spinner');
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    console.log('🔐 AdminProtectedRoute: No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  // Only redirect if we have a definitive role and it's not admin
  if (!isAdmin) {
    console.log('🔐 AdminProtectedRoute: User is not admin, redirecting to member dashboard');
    return <Navigate to="/member-dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;