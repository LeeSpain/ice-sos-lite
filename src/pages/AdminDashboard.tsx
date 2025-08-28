
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import EnhancedDashboardOverview from '@/components/admin/pages/EnhancedDashboardOverview';
import CustomersPage from '@/components/admin/pages/CustomersPage';
import LeadsPage from '@/components/admin/pages/LeadsPage';
import ConversationsPage from '@/components/admin/pages/ConversationsPage';
import SubscriptionsPage from '@/components/admin/pages/SubscriptionsPage';
import ActivityPage from '@/components/admin/pages/ActivityPage';
import RevenueAnalyticsPage from '@/components/admin/pages/RevenueAnalyticsPage';
import UserGrowthPage from '@/components/admin/pages/UserGrowthPage';
import AIAgentPage from '@/components/admin/pages/AIAgentPage';
import AITrainingPage from '@/components/admin/pages/AITrainingPage';
import AIModelSettingsPage from '@/components/admin/pages/AIModelSettingsPage';
import AIMarketingPage from '@/components/admin/pages/AIMarketingPage';
import RivenAIConfiguration from '@/components/admin/pages/RivenAIConfiguration';
import EnhancedCommandCenter from '@/components/admin/pages/EnhancedCommandCenter';
import { SocialMediaIntegration } from '@/components/admin/pages/SocialMediaIntegration';
import ContentAutomation from '@/components/admin/pages/ContentAutomation';
import ProductsPage from '@/components/admin/pages/ProductsPage';
import RegionalServicesPage from '@/components/admin/pages/RegionalServicesPage';
import GlobalProtectionPlansPage from '@/components/admin/pages/GlobalProtectionPlansPage';
import CommunicationPage from '@/components/admin/pages/CommunicationPage';
import EmailCampaignsPage from '@/components/admin/pages/EmailCampaignsPage';
import FamilyAccountsPage from '@/components/admin/pages/FamilyAccountsPage';
import SystemSettingsPage from '@/components/admin/pages/SystemSettingsPage';
import ReportsPage from '@/components/admin/pages/ReportsPage';
import SubscriptionPlansPage from '@/components/admin/pages/SubscriptionPlansPage';
import AppTestingPage from '@/components/admin/pages/AppTestingPage';
import FlicControlAdminPage from '@/components/admin/pages/FlicControlAdminPage';
import ContactSubmissionsPage from '@/components/admin/pages/ContactSubmissionsPage';
import AnalyticsPage from '@/components/admin/pages/AnalyticsPage';
import VideoAnalyticsPage from '@/components/admin/pages/VideoAnalyticsPage';
import EmergencyIncidentsPage from '@/components/admin/pages/EmergencyIncidentsPage';
import SafetyMonitoringPage from '@/components/admin/pages/SafetyMonitoringPage';
import WhatsAppIntegrationPage from '@/components/admin/pages/WhatsAppIntegrationPage';
import AIPerformancePage from '@/components/admin/pages/AIPerformancePage';

const AdminDashboard: React.FC = () => {
  useScrollToTop();
  
  console.log('🚀 AdminDashboard component is rendering at:', window.location.pathname);
  
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<EnhancedDashboardOverview />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="video-analytics" element={<VideoAnalyticsPage />} />
        <Route path="revenue" element={<RevenueAnalyticsPage />} />
        <Route path="growth" element={<UserGrowthPage />} />
        <Route path="riven-config" element={<RivenAIConfiguration />} />
        <Route path="command-center" element={<EnhancedCommandCenter />} />
        <Route path="ai-marketing" element={<AIMarketingPage />} />
        <Route path="ai-agent" element={<AIAgentPage />} />
        <Route path="ai-training" element={<AITrainingPage />} />
        <Route path="ai-settings" element={<AIModelSettingsPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="protection-plans" element={<GlobalProtectionPlansPage />} />
        <Route path="families" element={<FamilyAccountsPage />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="conversations" element={<ConversationsPage />} />
        <Route path="ai-metrics" element={<AIPerformancePage />} />
        <Route path="contact-submissions" element={<ContactSubmissionsPage />} />
        <Route path="email-campaigns" element={<EmailCampaignsPage />} />
        <Route path="communication" element={<CommunicationPage />} />
        <Route path="social-media" element={<SocialMediaIntegration />} />
        <Route path="content-automation" element={<ContentAutomation />} />
        <Route path="whatsapp" element={<WhatsAppIntegrationPage />} />
        <Route path="emergencies" element={<EmergencyIncidentsPage />} />
        <Route path="safety" element={<SafetyMonitoringPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="regional-services" element={<RegionalServicesPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="app-testing" element={<AppTestingPage />} />
        <Route path="flic-control" element={<FlicControlAdminPage />} />
        <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminDashboard;
