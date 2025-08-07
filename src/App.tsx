import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import TestPage from "./pages/TestPage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import AIRegister from "./pages/AIRegister";
import RegistrationSuccess from "./pages/RegistrationSuccess";
import PaymentSuccess from "./pages/PaymentSuccess";
import Dashboard from "./pages/Dashboard";
import SimpleDashboard from "./pages/SimpleDashboard";
import AdminDashboard from "./components/ai-chat/AdminDashboard";
import AdminSetup from "./components/AdminSetup";
import AdminSetupPage from "./pages/AdminSetupPage";
import NotFound from "./pages/NotFound";
import DashboardRedirect from "./components/DashboardRedirect";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/admin-setup" element={<AdminSetupPage />} />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="/full-dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;