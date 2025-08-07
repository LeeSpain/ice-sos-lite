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
import AdminLayout from "./components/admin/AdminLayout";
import AdminSetupPage from "./pages/AdminSetupPage";
import NotFound from "./pages/NotFound";
import DashboardRedirect from "./components/DashboardRedirect";
import WelcomeQuestionnaire from "./components/WelcomeQuestionnaire";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/ai-register" element={<AIRegister />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/welcome" element={<PaymentSuccess />} />
          <Route path="/complete-profile" element={<ProtectedRoute><WelcomeQuestionnaire /></ProtectedRoute>} />
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/simple-dashboard" element={<SimpleDashboard />} />
          <Route path="/full-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/member-dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin-dashboard/*" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>} />
          <Route path="/admin-setup" element={<AdminSetupPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;