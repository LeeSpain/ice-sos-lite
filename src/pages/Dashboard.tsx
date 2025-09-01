import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricsDashboard from "@/components/dashboard/MetricsDashboard";
import EmergencyActionsWidget from "@/components/dashboard/EmergencyActionsWidget";
import MyProductsWidget from "@/components/dashboard/MyProductsWidget";
import PersonalDetailsCard from "@/components/dashboard/PersonalDetailsCard";
import EmergencyContactsCard from "@/components/dashboard/EmergencyContactsCard";
import FamilyAccessPanel from "@/components/dashboard/family/FamilyAccessPanel";
import LiveSOSFamily from "@/components/dashboard/family/LiveSOSFamily";
import MedicalInfoCard from "@/components/dashboard/MedicalInfoCard";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import MobileAppCard from "@/components/dashboard/MobileAppCard";
import ActivityCard from "@/components/dashboard/ActivityCard";
import { FamilyPage } from "@/components/dashboard/pages/FamilyPage";
import { LocationPage } from "@/components/dashboard/pages/LocationPage";
import { NotificationsPage } from "@/components/dashboard/pages/NotificationsPage";
import { SecurityPage } from "@/components/dashboard/pages/SecurityPage";
import { SettingsPage } from "@/components/dashboard/pages/SettingsPage";
import { SupportPage } from "@/components/dashboard/pages/SupportPage";
import { FlicControlPage } from "@/components/dashboard/pages/FlicControlPage";
import FamilyAccessSetup from "@/pages/FamilyAccessSetup";
import MapScreen from "@/pages/MapScreen";
import MyCirclesPage from "@/pages/MyCirclesPage";
import PlacesManager from "@/pages/PlacesManager";
import LocationHistoryPage from "@/pages/LocationHistoryPage";
import { useTranslation } from 'react-i18next';
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

const Dashboard = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-scroll to top when navigating
  useScrollToTop();
  const { t } = useTranslation();

  // Setup real-time updates
  useRealTimeUpdates({
    onSubscriptionUpdate: () => checkSubscription(),
    onFamilyUpdate: () => loadDashboardData(),
    onOrderUpdate: () => loadDashboardData()
  });

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(() => {
      loadDashboardData();
    }, 120000);

    // Listen for page visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for storage events (when user completes payment in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'subscription-updated') {
        loadDashboardData();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        checkSubscription(),
        loadProfile()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-page-top">
          <div className="text-center text-white">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-gradient-to-br from-muted/20 to-muted/50">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header with Sidebar Toggle */}
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 gap-4">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{t('dashboard.title', { defaultValue: 'Dashboard' })}</h1>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto">
            <Routes>
              {/* Main Dashboard Overview - Metrics Only */}
              <Route path="/" element={
                <div className="container mx-auto px-4 py-section">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                      {/* Main Content - Metrics Dashboard */}
                      <div className="xl:col-span-3">
                        <MetricsDashboard 
                          profile={profile} 
                          subscription={subscription}
                        />
                      </div>
                      
                      {/* Sidebar Widgets */}
                      <div className="space-y-6">
                        <EmergencyActionsWidget profile={profile} subscription={subscription} />
                      </div>
                    </div>
                  </div>
                </div>
              } />

              {/* Products Page */}
               <Route path="/products" element={
                 <div className="py-section px-6">
                  <MyProductsWidget profile={profile} />
                </div>
              } />

              {/* Flic Control Page */}
               <Route path="/flic" element={
                 <div className="py-section px-6">
                  <FlicControlPage />
                </div>
              } />

              {/* Profile Page */}
               <Route path="/profile" element={
                 <div className="py-section px-6">
                  <PersonalDetailsCard 
                    profile={profile} 
                    onProfileUpdate={loadProfile}
                  />
                </div>
              } />

              {/* Emergency Page */}
               <Route path="/emergency" element={
                 <div className="py-section px-6 space-y-6">
                  <EmergencyContactsCard 
                    profile={profile} 
                    onProfileUpdate={loadProfile}
                  />
                  <FamilyAccessPanel />
                </div>
              } />

              {/* Family SOS Live View */}
               <Route path="/family-sos" element={
                 <div className="py-section px-6">
                   <LiveSOSFamily />
                 </div>
               } />

               {/* Health Page */}
               <Route path="/health" element={
                 <div className="py-section px-6">
                   <MedicalInfoCard 
                     profile={profile} 
                     onProfileUpdate={loadProfile}
                   />
                 </div>
               } />

               {/* Activity Page */}
               <Route path="/activity" element={
                 <div className="py-section px-6">
                   <ActivityCard />
                 </div>
               } />

               {/* Subscription Page */}
               <Route path="/subscription" element={
                 <div className="py-section px-6">
                   <SubscriptionCard subscription={subscription} />
                 </div>
               } />

               {/* Mobile App Page */}
               <Route path="/mobile-app" element={
                 <div className="py-section px-6">
                   <MobileAppCard />
                 </div>
               } />

              {/* Dashboard pages with proper container spacing */}
              <Route path="/family" element={<FamilyPage />} />
               <Route path="/family-setup" element={
                 <div className="py-section px-6">
                   <div className="max-w-4xl mx-auto">
                     <FamilyAccessSetup />
                   </div>
                 </div>
               } />
               <Route path="/location" element={<LocationPage />} />
               <Route path="/notifications" element={
                 <div className="py-section px-6">
                   <NotificationsPage />
                 </div>
               } />
               <Route path="/security" element={
                 <div className="py-section px-6">
                   <SecurityPage />
                 </div>
               } />
               <Route path="/settings" element={
                 <div className="py-section px-6">
                   <SettingsPage />
                 </div>
               } />
               <Route path="/support" element={
                 <div className="py-section px-6">
                   <SupportPage />
                 </div>
               } />
              
              {/* Live Map Routes */}
              <Route path="/live-map" element={
                <div className="h-full">
                  <MapScreen />
                </div>
              } />
               <Route path="/circles" element={
                 <div className="py-section px-6">
                   <MyCirclesPage />
                 </div>
               } />
               <Route path="/places" element={
                 <div className="py-section px-6">
                   <PlacesManager />
                 </div>
               } />
               <Route path="/location-history" element={
                 <div className="py-section px-6">
                   <LocationHistoryPage />
                 </div>
               } />
            </Routes>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;