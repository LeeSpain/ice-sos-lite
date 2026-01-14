import React, { useEffect, useState } from 'react';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const DashboardRedirect = () => {
  const { user, loading, isAdmin, role } = useOptimizedAuth();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.id || isAdmin || role === 'admin') {
        setOnboardingChecked(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('onboarding_progress')
          .select('completed')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // If no record exists or not completed, needs onboarding
        if (!data || !data.completed) {
          setNeedsOnboarding(true);
        }
      } catch (err) {
        console.error('Error checking onboarding:', err);
      } finally {
        setOnboardingChecked(true);
      }
    };

    if (user?.id && !loading) {
      checkOnboarding();
    }
  }, [user?.id, loading, isAdmin, role]);

  console.log('🔄 DashboardRedirect - Enhanced Debug:', {
    user: user?.id || 'none',
    userEmail: user?.email,
    isAdmin,
    role,
    loading,
    onboardingChecked,
    needsOnboarding,
    currentPath: window.location.pathname,
    timestamp: new Date().toISOString()
  });

  // Show loading while checking authentication, role, and onboarding
  if (loading || !onboardingChecked) {
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

  // Check if user just completed payment - allow payment flow to complete
  const justCompletedPayment = sessionStorage.getItem('payment-completed');
  const fromPaymentSuccess = document.referrer.includes('/payment-success');
  
  if (justCompletedPayment || fromPaymentSuccess) {
    console.log('🔄 DashboardRedirect: Payment flow detected, allowing welcome questionnaire');
    // Clear the payment flag and redirect to welcome questionnaire
    sessionStorage.removeItem('payment-completed');
    return <Navigate to="/welcome-questionnaire" replace />;
  }

  // Check onboarding for non-admin users
  if (needsOnboarding && !isAdmin && role !== 'admin') {
    console.log('🔄 DashboardRedirect: User needs onboarding, redirecting');
    return <Navigate to="/dashboard/onboarding" replace />;
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
