import React from "react";
import { Navigate } from "react-router-dom";

const SimpleDashboard = () => {
  // Redirect to the full dashboard for members
  return <Navigate to="/full-dashboard" replace />;
};

export default SimpleDashboard;