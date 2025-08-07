import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import QuickStatsWidget from "@/components/dashboard/QuickStatsWidget";
import MyProductsWidget from "@/components/dashboard/MyProductsWidget";
import PersonalDetailsCard from "@/components/dashboard/PersonalDetailsCard";
import EmergencyContactsCard from "@/components/dashboard/EmergencyContactsCard";
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

const Dashboard = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auto-scroll to top when navigating
  useScrollToTop();

  useEffect(() => {
    loadDashboardData();
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
        <div className="container mx-auto px-4 py-24">
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
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-auto">
            <Routes>
              {/* Main Dashboard Overview */}
              <Route path="/" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                      {/* Main Content */}
                      <div className="xl:col-span-3">
                        <DashboardOverview 
                          profile={profile} 
                          subscription={subscription}
                          onProfileUpdate={loadProfile}
                        />
                      </div>
                      
                      {/* Sidebar Widgets */}
                      <div className="space-y-6">
                        <QuickStatsWidget profile={profile} subscription={subscription} />
                        <MyProductsWidget profile={profile} />
                      </div>
                    </div>
                  </div>
                </div>
              } />

              {/* Products Page */}
              <Route path="/products" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <MyProductsWidget profile={profile} />
                  </div>
                </div>
              } />

              {/* Profile Page */}
              <Route path="/profile" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <PersonalDetailsCard 
                      profile={profile} 
                      onProfileUpdate={loadProfile}
                    />
                  </div>
                </div>
              } />

              {/* Emergency Page */}
              <Route path="/emergency" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <EmergencyContactsCard 
                      profile={profile} 
                      onProfileUpdate={loadProfile}
                    />
                  </div>
                </div>
              } />

              {/* Health Page */}
              <Route path="/health" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto space-y-6">
                    <MedicalInfoCard 
                      profile={profile} 
                      onProfileUpdate={loadProfile}
                    />
                  </div>
                </div>
              } />

              {/* Activity Page */}
              <Route path="/activity" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <ActivityCard />
                  </div>
                </div>
              } />

              {/* Subscription Page */}
              <Route path="/subscription" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <SubscriptionCard subscription={subscription} />
                  </div>
                </div>
              } />

              {/* Mobile App Page */}
              <Route path="/mobile-app" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <MobileAppCard />
                  </div>
                </div>
              } />

              {/* Dashboard pages with proper container spacing */}
              <Route path="/family" element={<FamilyPage />} />
              <Route path="/location" element={<LocationPage />} />
              <Route path="/notifications" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <NotificationsPage />
                  </div>
                </div>
              } />
              <Route path="/security" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <SecurityPage />
                  </div>
                </div>
              } />
              <Route path="/settings" element={
                <div className="container mx-auto px-4 py-6">
                  <div className="max-w-4xl mx-auto">
                    <SettingsPage />
                  </div>
                </div>
              } />
              <Route path="/support" element={<SupportPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;