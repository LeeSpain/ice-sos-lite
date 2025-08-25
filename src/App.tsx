import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from "@/contexts/AuthContext";
import { EmmaChatProvider } from "@/contexts/EmmaChatContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";

import ScrollToTop from "@/components/ScrollToTop";
import DeviceManagerButton from "@/components/devices/DeviceManagerButton";
import { useAuth } from "@/contexts/AuthContext";
import GlobalEmmaChat from "@/components/GlobalEmmaChat";
import { queryClient } from "@/lib/queryClient";
import Index from "./pages/Index";
import { usePageTracking } from '@/hooks/usePageTracking';
import OptimizedSuspense from '@/components/OptimizedSuspense';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import { usePageErrorDetection } from '@/hooks/usePageErrorDetection';

const TestPage = lazy(() => import("./pages/TestPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Register = lazy(() => import("./pages/Register"));
const AIRegister = lazy(() => import("./pages/AIRegister"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SimpleDashboard = lazy(() => import("./pages/SimpleDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSetupPage = lazy(() => import("./pages/AdminSetupPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DashboardRedirect = lazy(() => import("./components/DashboardRedirect"));
const WelcomeQuestionnaire = lazy(() => import("./components/WelcomeQuestionnaire"));
const SOSHome = lazy(() => import("./pages/SOSHome"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Support = lazy(() => import("./pages/Support"));
const DeviceIceSosPendant = lazy(() => import("./pages/DeviceIceSosPendant"));
const RegionalCenterSpain = lazy(() => import("./pages/RegionalCenterSpain"));
const FamilyCarerAccess = lazy(() => import("./pages/FamilyCarerAccess"));
const Contact = lazy(() => import("./pages/Contact"));

// Component to conditionally render Emma Chat
const ConditionalEmmaChat = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin-dashboard');
  
  // Don't show Emma chat in admin routes
  if (isAdminRoute) return null;
  
  return <GlobalEmmaChat />;
};

// Component to track page views and errors
const PageTracker = () => {
  usePageTracking();
  const errorDetection = usePageErrorDetection();
  
  // Auto-retry chunk loading errors
  React.useEffect(() => {
    const chunkErrors = errorDetection.errors.filter(e => e.type === 'chunk_load_error');
    if (chunkErrors.length > 0) {
      console.log('🔄 Auto-retrying due to chunk load errors...');
      setTimeout(() => {
        errorDetection.retryChunkLoading();
      }, 1000);
    }
  }, [errorDetection.errors]);
  
  return null;
};

const App = () => {
  // Component to conditionally render Device Manager (only for authenticated dashboard users)
  const ConditionalDeviceManager = () => {
    const location = useLocation();
    const { user } = useAuth();
    
    // Only show on dashboard routes for authenticated users
    const isDashboardRoute = location.pathname.startsWith('/full-dashboard') || 
                            location.pathname.startsWith('/member-dashboard') ||
                            location.pathname === '/sos';
    
    if (!user || !isDashboardRoute) return null;
    
    return <DeviceManagerButton />;
  };

  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EmmaChatProvider>
          <BrowserRouter>
            <ScrollToTop />
            <PageTracker />
            <Routes>
              <Route path="/test" element={
                <OptimizedSuspense skeletonType="card">
                  <TestPage />
                </OptimizedSuspense>
              } />
              <Route path="/" element={
                <OptimizedSuspense skeletonType="dashboard">
                  <Index />
                </OptimizedSuspense>
              } />
              <Route path="/auth" element={
                <OptimizedSuspense skeletonType="form" skeletonCount={3}>
                  <AuthPage />
                </OptimizedSuspense>
              } />
              <Route path="/register" element={
                <OptimizedSuspense skeletonType="form" skeletonCount={6}>
                  <AIRegister />
                </OptimizedSuspense>
              } />
              <Route path="/ai-register" element={
                <OptimizedSuspense skeletonType="form" skeletonCount={6}>
                  <AIRegister />
                </OptimizedSuspense>
              } />
              <Route path="/register-classic" element={
                <ProtectedRoute>
                  <OptimizedSuspense skeletonType="form" skeletonCount={5}>
                    <Register />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } />
              <Route path="/registration-success" element={
                <OptimizedSuspense skeletonType="card">
                  <RegistrationSuccess />
                </OptimizedSuspense>
              } />
              <Route path="/welcome" element={
                <OptimizedSuspense skeletonType="card">
                  <RegistrationSuccess />
                </OptimizedSuspense>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <OptimizedSuspense skeletonType="dashboard">
                    <DashboardRedirect />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } />
              <Route path="/member-dashboard" element={
                <ProtectedRoute>
                  <OptimizedSuspense skeletonType="dashboard">
                    <SimpleDashboard />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } />
              <Route path="/sos" element={
                <ProtectedRoute>
                  <OptimizedSuspense skeletonType="card">
                    <SOSHome />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } />
              <Route path="/admin-setup" element={
                <OptimizedSuspense skeletonType="form" skeletonCount={4}>
                  <AdminSetupPage />
                </OptimizedSuspense>
              } />
              <Route path="/admin-dashboard/*" element={
                <AdminProtectedRoute>
                  <OptimizedSuspense skeletonType="analytics">
                    <AdminDashboard />
                  </OptimizedSuspense>
                </AdminProtectedRoute>
              } />
              <Route path="/full-dashboard/*" element={
                <ProtectedRoute>
                  <OptimizedSuspense skeletonType="dashboard">
                    <Dashboard />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } />
              <Route path="/welcome-questionnaire" element={
                <ProtectedRoute>
                  <OptimizedSuspense skeletonType="form" skeletonCount={8}>
                    <WelcomeQuestionnaire />
                  </OptimizedSuspense>
                </ProtectedRoute>
              } />
              <Route path="/privacy" element={
                <OptimizedSuspense skeletonType="card">
                  <Privacy />
                </OptimizedSuspense>
              } />
              <Route path="/terms" element={
                <OptimizedSuspense skeletonType="card">
                  <Terms />
                </OptimizedSuspense>
              } />
              <Route path="/support" element={
                <OptimizedSuspense skeletonType="card" skeletonCount={3}>
                  <Support />
                </OptimizedSuspense>
              } />
              <Route path="/contact" element={
                <OptimizedSuspense skeletonType="form" skeletonCount={4}>
                  <Contact />
                </OptimizedSuspense>
              } />
              <Route path="/devices/ice-sos-pendant" element={
                <OptimizedSuspense skeletonType="card">
                  <DeviceIceSosPendant />
                </OptimizedSuspense>
              } />
              <Route path="/regional-center/spain" element={
                <OptimizedSuspense skeletonType="card">
                  <RegionalCenterSpain />
                </OptimizedSuspense>
              } />
              <Route path="/family-carer-access" element={
                <OptimizedSuspense skeletonType="card">
                  <FamilyCarerAccess />
                </OptimizedSuspense>
              } />
              <Route path="*" element={
                <OptimizedSuspense skeletonType="card">
                  <NotFound />
                </OptimizedSuspense>
              } />
            </Routes>
            
            {/* Global floating device/settings button - Only for authenticated dashboard users */}
            <ConditionalDeviceManager />
            
            {/* Global Emma Chat - Available on all pages except admin */}
            <ConditionalEmmaChat />
            
            {/* Performance Monitor - Development only */}
            {process.env.NODE_ENV === 'development' && (
              <PerformanceMonitor show={false} />
            )}
          </BrowserRouter>
        </EmmaChatProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;