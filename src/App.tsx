import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/contexts/AuthContext";
import { EmmaChatProvider } from "@/contexts/EmmaChatContext";
import DeviceManagerButton from "@/components/devices/DeviceManagerButton";
import { queryClient } from "@/lib/queryClient";
import OptimizedSuspense from '@/components/OptimizedSuspense';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';

// Import all pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";

import AIRegister from "./pages/AIRegister";
import Contact from "./pages/Contact";
import Videos from "./pages/Videos";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import Support from "./pages/Support";
import TestPage from "./pages/TestPage";
import DeviceIceSosPendant from "./pages/DeviceIceSosPendant";
import RegionalCenterSpain from "./pages/RegionalCenterSpain";
import FamilyCarerAccess from "./pages/FamilyCarerAccess";
import FamilyAccessSetup from "./pages/FamilyAccessSetup";
import AdminSetupPage from "./pages/AdminSetupPage";
import SOSHome from "./pages/SOSHome";

// Import protected routes and components
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import ProtectedSOSRoute from "@/components/ProtectedSOSRoute";
import DashboardRedirect from "@/components/DashboardRedirect";
import SimpleDashboard from "./pages/SimpleDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import GlobalEmmaChat from "@/components/GlobalEmmaChat";
import ScrollToTop from "@/components/ScrollToTop";


const App = () => {
  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EmmaChatProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Main Homepage */}
              <Route path="/" element={
                <OptimizedSuspense skeletonType="card">
                  <Index />
                </OptimizedSuspense>
              } />

              {/* Authentication Routes */}
              <Route path="/auth" element={
                <OptimizedSuspense skeletonType="card">
                  <AuthPage />
                </OptimizedSuspense>
              } />
              <Route path="/ai-register" element={
                <OptimizedSuspense skeletonType="card">
                  <AIRegister />
                </OptimizedSuspense>
              } />

              {/* Public Pages */}
              <Route path="/contact" element={
                <OptimizedSuspense skeletonType="card">
                  <Contact />
                </OptimizedSuspense>
              } />
              <Route path="/videos" element={
                <OptimizedSuspense skeletonType="card">
                  <Videos />
                </OptimizedSuspense>
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
                <OptimizedSuspense skeletonType="card">
                  <Support />
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

              {/* Success Pages */}
              <Route path="/payment-success" element={
                <OptimizedSuspense skeletonType="card">
                  <PaymentSuccess />
                </OptimizedSuspense>
              } />
              <Route path="/registration-success" element={
                <OptimizedSuspense skeletonType="card">
                  <RegistrationSuccess />
                </OptimizedSuspense>
              } />

              {/* Dashboard Routes */}
              <Route path="/dashboard" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />
              <Route path="/full-dashboard/*" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <SimpleDashboard />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />

              {/* Admin Routes */}
              <Route path="/admin-setup" element={
                <OptimizedSuspense skeletonType="card">
                  <AdminSetupPage />
                </OptimizedSuspense>
              } />
              <Route path="/admin-dashboard/*" element={
                <OptimizedSuspense skeletonType="card">
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                </OptimizedSuspense>
              } />

              {/* Protected SOS Emergency App */}
              <Route path="/app" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedSOSRoute>
                    <SOSHome />
                  </ProtectedSOSRoute>
                </OptimizedSuspense>
              } />

              {/* Family Access Setup */}
              <Route path="/family-access-setup" element={
                <OptimizedSuspense skeletonType="card">
                  <FamilyAccessSetup />
                </OptimizedSuspense>
              } />

              {/* Test Page */}
              <Route path="/test" element={
                <OptimizedSuspense skeletonType="card">
                  <TestPage />
                </OptimizedSuspense>
              } />

              {/* 404 Page */}
              <Route path="*" element={
                <OptimizedSuspense skeletonType="card">
                  <NotFound />
                </OptimizedSuspense>
              } />
            </Routes>
            
            {/* Global Emma Chat - appears on all pages except SOS app and admin dashboard */}
            {window.location.pathname !== '/app' && !window.location.pathname.startsWith('/admin-dashboard') && <GlobalEmmaChat />}
            
            {/* Show device manager only in protected SOS app */}
            {window.location.pathname === '/app' && <DeviceManagerButton />}
          </BrowserRouter>
          </EmmaChatProvider>
        </AuthProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;