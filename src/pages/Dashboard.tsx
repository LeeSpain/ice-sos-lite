import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PersonalDetailsCard from "@/components/dashboard/PersonalDetailsCard";
import EmergencyContactsCard from "@/components/dashboard/EmergencyContactsCard";
import MedicalInfoCard from "@/components/dashboard/MedicalInfoCard";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import MobileAppCard from "@/components/dashboard/MobileAppCard";
import ActivityCard from "@/components/dashboard/ActivityCard";

const Dashboard = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gradient-to-br from-muted/20 to-muted/50">
      
      {/* Dashboard Header */}
      <DashboardHeader profile={profile} subscription={subscription} />
      
      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Primary Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Details */}
              <PersonalDetailsCard 
                profile={profile} 
                onProfileUpdate={loadProfile}
              />
              
              {/* Emergency Profile Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <EmergencyContactsCard 
                  profile={profile} 
                  onProfileUpdate={loadProfile}
                />
                <MedicalInfoCard 
                  profile={profile} 
                  onProfileUpdate={loadProfile}
                />
              </div>
              
              {/* Mobile App Integration */}
              <MobileAppCard />
              
              {/* Activity & Testing */}
              <ActivityCard />
            </div>
            
            {/* Right Column - Secondary Information */}
            <div className="space-y-6">
              {/* Subscription Management */}
              <SubscriptionCard subscription={subscription} />
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {subscription?.subscribed ? '✓' : '!'}
                    </div>
                    <div className="text-sm text-muted-foreground">Protection Status</div>
                  </div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {profile?.emergency_contacts ? 
                        (Array.isArray(profile.emergency_contacts) ? profile.emergency_contacts.length : 0) : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Emergency Contacts</div>
                  </div>
                </div>
                
                <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {profile?.profile_completion_percentage || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Profile Complete</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;