import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/contexts/AuthContext";
import { EmmaChatProvider } from "@/contexts/EmmaChatContext";
import DeviceManagerButton from "@/components/devices/DeviceManagerButton";
import { queryClient } from "@/lib/queryClient";
import OptimizedSuspense from '@/components/OptimizedSuspense';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import { usePageTracking } from '@/hooks/usePageTracking';

// Import all pages
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import AuthPage from "./pages/AuthPage";

// Live Map Pages
import MapScreen from "./pages/MapScreen";
import MyCirclesPage from "./pages/MyCirclesPage";
import PlacesManager from "./pages/PlacesManager";
import LocationHistoryPage from "./pages/LocationHistoryPage";
import MapDemo from "./pages/MapDemo";

import AIRegister from "./pages/AIRegister";
import Contact from "./pages/Contact";
import Videos from "./pages/Videos";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import FamilyCheckoutSuccess from "./pages/FamilyCheckoutSuccess";
import FamilyCheckoutCanceled from "./pages/FamilyCheckoutCanceled";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import Support from "./pages/Support";
import TestPage from "./pages/TestPage";
import DeviceIceSosPendant from "./pages/DeviceIceSosPendant";
import RegionalCenterSpain from "./pages/RegionalCenterSpain";
import FamilyCarerAccess from "./pages/FamilyCarerAccess";
import FamilyAccessSetup from "./pages/FamilyAccessSetup";
import FamilyInviteAccept from "./pages/FamilyInviteAccept";
import AdminSetupPage from "./pages/AdminSetupPage";
import SOSHome from "./pages/SOSHome";
import FamilyDashboard from "./pages/FamilyDashboard";
import RegionalDashboard from "./pages/RegionalDashboardTest";

// Import protected routes and components
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import ProtectedSOSRoute from "@/components/ProtectedSOSRoute";
import RegionalProtectedRoute from "@/components/RegionalProtectedRoute";
import DashboardRedirect from "@/components/DashboardRedirect";
import SmartAppRedirect from "@/components/SmartAppRedirect";
import SimpleDashboard from "./pages/SimpleDashboard";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FamilyTrackingApp from "./pages/FamilyTrackingApp";
import GlobalEmmaChat from "@/components/GlobalEmmaChat";
import ScrollToTop from "@/components/ScrollToTop";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";


// Component that handles page tracking inside Router context
const PageTrackingWrapper = ({ children }: { children: React.ReactNode }) => {
  usePageTracking();
  return <>{children}</>;
};

const App = () => {
  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EmmaChatProvider>
          <BrowserRouter>
            <PageTrackingWrapper>
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

              {/* Blog Page */}
              <Route path="/blog" element={
                <OptimizedSuspense skeletonType="card">
                  <Blog />
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
              <Route path="/family-checkout-success" element={
                <OptimizedSuspense skeletonType="card">
                  <FamilyCheckoutSuccess />
                </OptimizedSuspense>
              } />
              <Route path="/family-checkout-canceled" element={
                <OptimizedSuspense skeletonType="card">
                  <FamilyCheckoutCanceled />
                </OptimizedSuspense>
              } />
              <Route path="/registration-success" element={
                <OptimizedSuspense skeletonType="card">
                  <RegistrationSuccess />
                </OptimizedSuspense>
              } />

              {/* Smart Dashboard Routing */}
              <Route path="/dashboard" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />

              {/* Member Dashboard */}
              <Route path="/full-dashboard/*" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <Dashboard />
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

               {/* Owner's SOS Emergency App */}
              <Route path="/app" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedSOSRoute>
                    <SOSHome />
                  </ProtectedSOSRoute>
                </OptimizedSuspense>
              } />
              <Route path="/sos-app" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedSOSRoute>
                    <SOSHome />
                  </ProtectedSOSRoute>
                </OptimizedSuspense>
              } />
              <Route path="/sos" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedSOSRoute>
                    <SOSHome />
                  </ProtectedSOSRoute>
                </OptimizedSuspense>
              } />
              <Route path="/mobile-app" element={
                <OptimizedSuspense skeletonType="card">
                  <SmartAppRedirect />
                </OptimizedSuspense>
              } />

              {/* Family Tracking App */}
              <Route path="/family-app" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <FamilyTrackingApp />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />

               {/* Family Dashboard Routes */}
              <Route path="/family-dashboard/*" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <FamilyDashboard />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />
              <Route path="/family-sos" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <FamilyTrackingApp />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />

              {/* Family Access Setup */}
              <Route path="/family-access-setup" element={
                <OptimizedSuspense skeletonType="card">
                  <FamilyAccessSetup />
                </OptimizedSuspense>
              } />

              {/* Regional Dashboard */}
              <Route path="/regional-dashboard" element={
                <OptimizedSuspense skeletonType="card">
                  <RegionalProtectedRoute>
                    <RegionalDashboard />
                  </RegionalProtectedRoute>
                </OptimizedSuspense>
              } />

              {/* Family Invite Accept */}
              <Route path="/family-invite/:token" element={
                <OptimizedSuspense skeletonType="card">
                  <FamilyInviteAccept />
                </OptimizedSuspense>
              } />

              {/* Live Map Routes */}
              <Route path="/map" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />
              <Route path="/circles" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <MyCirclesPage />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />
              <Route path="/places" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <PlacesManager />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />

              <Route path="/history" element={
                <OptimizedSuspense skeletonType="card">
                  <ProtectedRoute>
                    <LocationHistoryPage />
                  </ProtectedRoute>
                </OptimizedSuspense>
              } />

              <Route path="/map-demo" element={
                <OptimizedSuspense skeletonType="card">
                  <MapDemo />
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
            
            {/* Global Emma Chat - appears only on frontend/marketing pages */}
            {(window.location.pathname === '/' || 
              window.location.pathname === '/contact' || 
              window.location.pathname === '/support' || 
              window.location.pathname === '/blog' || 
              window.location.pathname === '/videos' || 
              window.location.pathname === '/privacy' || 
              window.location.pathname === '/terms') && 
             <GlobalEmmaChat />}
            
            {/* Show device manager only in SOS apps */}
            {(window.location.pathname === '/app' || window.location.pathname === '/sos-app') && <DeviceManagerButton />}
            
            {/* PWA Install Prompt - Disabled */}
            {/* <PWAInstallPrompt /> */}
            </PageTrackingWrapper>
          </BrowserRouter>
          </EmmaChatProvider>
        </AuthProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;