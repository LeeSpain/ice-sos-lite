import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import DashboardOverview from '@/components/admin/pages/DashboardOverview';
import CustomersPage from '@/components/admin/pages/CustomersPage';
import LeadsPage from '@/components/admin/pages/LeadsPage';
import ConversationsPage from '@/components/admin/pages/ConversationsPage';
import SubscriptionsPage from '@/components/admin/pages/SubscriptionsPage';
import ActivityPage from '@/components/admin/pages/ActivityPage';
import RevenueAnalyticsPage from '@/components/admin/pages/RevenueAnalyticsPage';
import UserGrowthPage from '@/components/admin/pages/UserGrowthPage';
import AIAgentPage from '@/components/admin/pages/AIAgentPage';
import AITrainingPage from '@/components/admin/pages/AITrainingPage';
import ProductsPage from '@/components/admin/pages/ProductsPage';
import GlobalProtectionPlansPage from '@/components/admin/pages/GlobalProtectionPlansPage';

const AdminDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="revenue" element={<RevenueAnalyticsPage />} />
        <Route path="growth" element={<UserGrowthPage />} />
        <Route path="ai-agent" element={<AIAgentPage />} />
        <Route path="ai-training" element={<AITrainingPage />} />
        <Route path="ai-settings" element={<div className="p-6"><h1 className="text-3xl font-bold">AI Model Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="protection-plans" element={<GlobalProtectionPlansPage />} />
        <Route path="families" element={<div className="p-6"><h1 className="text-3xl font-bold">Family Accounts</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="ai-metrics" element={<div className="p-6"><h1 className="text-3xl font-bold">AI Performance</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="emergencies" element={<div className="p-6"><h1 className="text-3xl font-bold">Emergency Incidents</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="safety" element={<div className="p-6"><h1 className="text-3xl font-bold">Safety Monitoring</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<div className="p-6"><h1 className="text-3xl font-bold">System Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="reports" element={<div className="p-6"><h1 className="text-3xl font-bold">Reports</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;