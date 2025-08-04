import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import TestPage from "./pages/TestPage";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SimpleDashboard from "./pages/SimpleDashboard";
import AdminDashboard from "./components/ai-chat/AdminDashboard";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/test" element={<TestPage />} />
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/register" element={
            <ProtectedRoute>
              <Register />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SimpleDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="/full-dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;