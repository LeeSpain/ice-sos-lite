import React from "react";
import { Navigate } from "react-router-dom";

const SimpleDashboard = () => {
  // Redirect to the full dashboard
  return <Navigate to="/member-dashboard" replace />;
};

export default SimpleDashboard;