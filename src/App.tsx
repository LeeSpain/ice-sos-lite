import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import RouteChangeTracker from "@/components/RouteChangeTracker";
import ScrollToTop from "@/components/ScrollToTop";
import DeviceManagerButton from "@/components/devices/DeviceManagerButton";
import GlobalEmmaChat from "@/components/GlobalEmmaChat";
import Index from "./pages/Index";

const TestPage = lazy(() => import("./pages/TestPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Register = lazy(() => import("./pages/Register"));
const AIRegister = lazy(() => import("./pages/AIRegister"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const SimpleDashboard = lazy(() => import("./pages/SimpleDashboard"));
const AdminDashboard = lazy(() => import("./components/ai-chat/AdminDashboard"));
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


const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteChangeTracker />
        <ScrollToTop />
        <Suspense fallback={<div className="p-6 text-sm">Loading…</div>}>
          <Routes>
            <Route path="/test" element={<TestPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/register" element={<AIRegister />} />
            <Route path="/ai-register" element={<AIRegister />} />
            <Route path="/register-classic" element={
              <ProtectedRoute>
                <Register />
              </ProtectedRoute>
            } />
            <Route path="/registration-success" element={<RegistrationSuccess />} />
            <Route path="/welcome" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } />
            <Route path="/member-dashboard" element={
              <ProtectedRoute>
                <SimpleDashboard />
              </ProtectedRoute>
            } />
            <Route path="/sos" element={
              <ProtectedRoute>
                <SOSHome />
              </ProtectedRoute>
            } />
            <Route path="/admin-setup" element={<AdminSetupPage />} />
            <Route path="/admin-dashboard/*" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/full-dashboard/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/welcome-questionnaire" element={
              <ProtectedRoute>
                <WelcomeQuestionnaire />
              </ProtectedRoute>
            } />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/support" element={<Support />} />
            <Route path="/devices/ice-sos-pendant" element={<DeviceIceSosPendant />} />
            <Route path="/regional-center/spain" element={<RegionalCenterSpain />} />
            <Route path="/family-carer-access" element={<FamilyCarerAccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        {/* Global floating device/settings button */}
        <DeviceManagerButton />
        
        {/* Global Emma Chat - Available on all pages */}
        <GlobalEmmaChat />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;