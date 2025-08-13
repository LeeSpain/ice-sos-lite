import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import Dashboard from "./Dashboard";

const SimpleDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading, isAdmin } = useUserRole();

  // Debug logging to track the authentication flow
  useEffect(() => {
    console.log('🏠 SimpleDashboard Debug:', {
      user: user?.id || 'none',
      email: user?.email || 'none',
      role,
      isAdmin,
      authLoading,
      roleLoading,
      currentPath: window.location.pathname,
      timestamp: new Date().toISOString()
    });
  }, [user, role, isAdmin, authLoading, roleLoading]);

  // Show loading while checking authentication and role
  if (authLoading || roleLoading) {
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

  // Directly render the Dashboard component for members
  return <Dashboard />;
};

export default SimpleDashboard;