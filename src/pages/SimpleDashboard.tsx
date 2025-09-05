import React, { useEffect } from "react";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

const SimpleDashboard = () => {
  const { user, loading, isAdmin } = useOptimizedAuth();

  // Debug logging to track the authentication flow
  useEffect(() => {
    console.log('🏠 SimpleDashboard Debug:', {
      user: user?.id || 'none',
      email: user?.email || 'none',
      isAdmin,
      loading,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user, isAdmin, loading]);

  // Show loading while checking authentication and role
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error if no user (shouldn't happen with ProtectedRoute)
  if (!user) {
    console.error('❌ SimpleDashboard: No authenticated user found');
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-white text-center">
          <p>Authentication required. Please log in.</p>
        </div>
      </div>
    );
  }

  // Redirect admin users to admin dashboard
  if (isAdmin) {
    console.log('🏠 SimpleDashboard: Admin user detected, redirecting to admin dashboard');
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Render member dashboard with simplified interface
  return (
    <div>
      <div className="container mx-auto px-4 pt-4">
        <EmailVerificationBanner />
      </div>
      <Dashboard />
    </div>
  );
};

export default SimpleDashboard;