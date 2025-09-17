import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { EmmaChatProvider } from "@/contexts/EmmaChatContext";
import GlobalEmmaChat from "@/components/GlobalEmmaChat";
import DeviceManagerButton from "@/components/devices/DeviceManagerButton";
import { queryClient } from "@/lib/queryClient";
import OptimizedSuspense from '@/components/OptimizedSuspense';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { usePageTracking } from '@/hooks/usePageTracking';

// Import all pages
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AuthPage from "./pages/AuthPage";

// Live Map Pages
import MapScreen from "./pages/MapScreen";
import MyCirclesPage from "./pages/MyCirclesPage";
import PlacesManager from "./pages/PlacesManager";
import LocationHistoryPage from "./pages/LocationHistoryPage";
import MapDemo from "./pages/MapDemo";

// Dashboard Pages
import DashboardRedirect from "./components/DashboardRedirect";
import Dashboard from "./pages/Dashboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// App Pages
import SOSAppPage from "./pages/SOSAppPage";
import FamilyAppPage from "./pages/FamilyAppPage";

// Support & Info Pages
import Support from "./pages/Support";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Videos from "./pages/Videos";
import FamilyCarerAccessPage from "./pages/FamilyCarerAccess";
import EmergencyResponseServices from "./pages/EmergencyResponseServices";
import AIEmergencyAssistant from "./pages/AIEmergencyAssistant";
import FamilySafetyMonitoring from "./pages/FamilySafetyMonitoring";
import SeniorEmergencyProtection from "./pages/SeniorEmergencyProtection";

// Interactive and Mobile Pages
import FamilyAccessSetup from "./pages/FamilyAccessSetup";
import AIRegister from "./pages/AIRegister";
import TestRegistration from "./pages/TestRegistration";

// Payment Pages
import PaymentSuccess from "./pages/PaymentSuccess";
import FamilyCheckoutSuccess from "./pages/FamilyCheckoutSuccess";
import FamilyCheckoutCanceled from "./pages/FamilyCheckoutCanceled";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import WelcomeQuestionnaire from "./components/WelcomeQuestionnaire";

// Test Pages  
import TestPage from "./pages/TestPage";

// Device Pages
import DeviceIceSosPendant from "./pages/DeviceIceSosPendant";

// Regional Pages
import RegionalCenterSpain from "./pages/RegionalCenterSpain";

// Protected Route Components
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import RegionalProtectedRoute from "./components/RegionalProtectedRoute";
import ProtectedSOSRoute from "./components/ProtectedSOSRoute";
import SmartAppRedirect from "./components/SmartAppRedirect";

import ScrollToTop from "./components/ScrollToTop";

// Component to handle page tracking inside Router context
function AppWithTracking() {
  usePageTracking();
  
  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={
            <OptimizedSuspense skeletonType="card">
              <Index />
            </OptimizedSuspense>
          } />
                
                {/* Auth Page */}
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
                <Route path="/test-registration" element={
                  <OptimizedSuspense skeletonType="card">
                    <TestRegistration />
                  </OptimizedSuspense>
                } />

                {/* Blog Pages */}
                <Route path="/blog" element={
                  <OptimizedSuspense skeletonType="card">
                    <Blog />
                  </OptimizedSuspense>
                } />
                <Route path="/blog/:slug" element={
                  <OptimizedSuspense skeletonType="card">
                    <BlogPost />
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
                
                
                <Route path="/family-carer-access" element={
                  <OptimizedSuspense skeletonType="card">
                    <FamilyCarerAccessPage />
                  </OptimizedSuspense>
                } />

                {/* New SEO Landing Pages */}
                <Route path="/emergency-response-services" element={
                  <OptimizedSuspense skeletonType="card">
                    <EmergencyResponseServices />
                  </OptimizedSuspense>
                } />
                
                <Route path="/ai-emergency-assistant" element={
                  <OptimizedSuspense skeletonType="card">
                    <AIEmergencyAssistant />
                  </OptimizedSuspense>
                } />
                
                <Route path="/family-safety-monitoring" element={
                  <OptimizedSuspense skeletonType="card">
                    <FamilySafetyMonitoring />
                  </OptimizedSuspense>
                } />
                
                <Route path="/senior-emergency-protection" element={
                  <OptimizedSuspense skeletonType="card">
                    <SeniorEmergencyProtection />
                  </OptimizedSuspense>
                } />

                {/* Payment Success Pages */}
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
                
                <Route path="/welcome-questionnaire" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <WelcomeQuestionnaire />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="dashboard">
                      <DashboardRedirect />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin-dashboard/*" element={
                  <AdminProtectedRoute>
                    <OptimizedSuspense skeletonType="dashboard">
                      <AdminDashboard />
                    </OptimizedSuspense>
                  </AdminProtectedRoute>
                } />

                {/* Member Dashboard - Main user dashboard */}
                <Route path="/member-dashboard/*" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="dashboard">
                      <Dashboard />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* Family Dashboard */}
                <Route path="/family-dashboard/*" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="dashboard">
                      <FamilyDashboard />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* SOS App */}
                <Route path="/sos-app" element={
                  <ProtectedSOSRoute>
                    <OptimizedSuspense skeletonType="card">
                      <SOSAppPage />
                    </OptimizedSuspense>
                  </ProtectedSOSRoute>
                } />

                {/* Family App */}
                <Route path="/family-app" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <FamilyAppPage />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* Mobile Apps */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <SmartAppRedirect />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/mobile-app" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <Dashboard />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* Family Setup and Access */}
                <Route path="/family-access-setup" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <FamilyAccessSetup />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* Live Map Routes */}
                <Route path="/map" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <MapScreen />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/circles" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <MyCirclesPage />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />
                
                <Route path="/places" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <PlacesManager />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                <Route path="/history" element={
                  <ProtectedRoute>
                    <OptimizedSuspense skeletonType="card">
                      <LocationHistoryPage />
                    </OptimizedSuspense>
                  </ProtectedRoute>
                } />

                {/* Demo and Test Pages */}
                <Route path="/map-demo" element={
                  <OptimizedSuspense skeletonType="card">
                    <MapDemo />
                  </OptimizedSuspense>
                } />

                 <Route path="/test" element={
                  <OptimizedSuspense skeletonType="card">
                    <TestPage />
                  </OptimizedSuspense>
                } />

                {/* Device Pages */}
                <Route path="/devices/ice-sos-pendant" element={
                  <OptimizedSuspense skeletonType="card">
                    <DeviceIceSosPendant />
                  </OptimizedSuspense>
                } />

                {/* Regional Pages */}
                <Route path="/regional-center/spain" element={
                  <OptimizedSuspense skeletonType="card">
                    <RegionalCenterSpain />
                  </OptimizedSuspense>
                } />

                {/* Legacy SOS route redirect */}
                <Route path="/sos" element={
                  <ProtectedSOSRoute>
                    <Navigate to="/sos-app" replace />
                  </ProtectedSOSRoute>
                } />

                {/* Catch all route */}
                <Route path="*" element={
                  <OptimizedSuspense skeletonType="card">
                    <Index />
                  </OptimizedSuspense>
                } />
              </Routes>
              <DeviceManagerButton />
            </div>
            <Toaster />
          </>
        );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <EnhancedErrorBoundary>
          <AnalyticsProvider>
            <EmmaChatProvider>
              <AppWithTracking />
              <GlobalEmmaChat />
            </EmmaChatProvider>
          </AnalyticsProvider>
        </EnhancedErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;