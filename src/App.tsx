import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from "@/contexts/AuthContext";
import DeviceManagerButton from "@/components/devices/DeviceManagerButton";
import { queryClient } from "@/lib/queryClient";
import OptimizedSuspense from '@/components/OptimizedSuspense';
import EnhancedErrorBoundary from '@/components/EnhancedErrorBoundary';
import SOSHome from "./pages/SOSHome";


const App = () => {
  return (
    <EnhancedErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Main SOS Home - No authentication required */}
              <Route path="/" element={
                <OptimizedSuspense skeletonType="card">
                  <SOSHome />
                </OptimizedSuspense>
              } />
              {/* Catch all other routes and redirect to SOS */}
              <Route path="*" element={
                <OptimizedSuspense skeletonType="card">
                  <SOSHome />
                </OptimizedSuspense>
              } />
            </Routes>
            
            {/* Always show device manager for Bluetooth functionality */}
            <DeviceManagerButton />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;