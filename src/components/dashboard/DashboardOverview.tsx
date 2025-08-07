import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Heart, 
  Users, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Bell,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardOverviewProps {
  profile: any;
  subscription: any;
  onProfileUpdate: () => void;
}

const DashboardOverview = ({ profile, subscription, onProfileUpdate }: DashboardOverviewProps) => {
  const { toast } = useToast();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecentActivity();
  }, []);

  const loadRecentActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const handleEmergencyTest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('emergency-sos-enhanced', {
        body: {
          userProfile: {
            first_name: 'Test',
            last_name: 'User',
            emergency_contacts: [{ name: 'Test Contact', phone: '+1234567890', relationship: 'Emergency', email: 'test@example.com' }]
          },
          location: 'Dashboard Test',
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast({
        title: "Emergency Test Successful",
        description: "All systems are working properly",
      });

      // Log the test activity
      await logActivity('emergency_test', 'Emergency system test completed successfully');
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Please contact support if this continues",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (type: string, description: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: type,
          description
        });

      await loadRecentActivity();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'emergency_test': return Shield;
      case 'profile_update': return Users;
      case 'login': return CheckCircle;
      case 'location_update': return MapPin;
      default: return Activity;
    }
  };

  const emergencyContactsCount = profile?.emergency_contacts ? 
    (Array.isArray(profile.emergency_contacts) ? profile.emergency_contacts.length : 0) : 0;
  
  const profileCompletion = profile?.profile_completion_percentage || 0;
  const protectionActive = subscription?.subscribed;

  const quickActions = [
    {
      title: "Test Emergency System",
      description: "Verify all systems are working",
      icon: Shield,
      action: handleEmergencyTest,
      loading: loading,
      variant: "emergency" as const
    },
    {
      title: "Complete Setup",
      description: profileCompletion < 100 ? "Finish your profile setup" : "Review and update profile",
      icon: Users,
      action: () => window.location.href = '/dashboard/profile',
      variant: "outline" as const
    }
  ];

  const statusCards = [
    {
      title: "Emergency Readiness",
      value: `${emergencyContactsCount}/3 contacts`,
      status: emergencyContactsCount >= 3 && protectionActive ? "success" : "warning",
      icon: Shield,
      description: protectionActive && emergencyContactsCount >= 3 ? "Fully prepared for emergencies" : 
                   !protectionActive ? "Activate protection plan" : "Add more emergency contacts"
    },
    {
      title: "Account Health", 
      value: `${profileCompletion}% complete`,
      status: profileCompletion >= 80 && profile?.location_sharing_enabled ? "success" : "warning",
      icon: TrendingUp,
      description: profileCompletion >= 80 && profile?.location_sharing_enabled ? "Account setup complete" :
                   profileCompletion < 80 ? "Complete your profile" : "Enable location sharing"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-emergency/5 border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {profile?.first_name || 'Member'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Your safety dashboard - everything you need at a glance
              </p>
            </div>
            <div className="hidden sm:block">
              <Badge 
                variant={protectionActive ? "default" : "destructive"}
                className={protectionActive ? "bg-emergency text-white" : ""}
              >
                {protectionActive ? "Protected" : "Inactive"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <card.icon className={`h-5 w-5 ${
                  card.status === 'success' ? 'text-emergency' : 'text-orange-500'
                }`} />
                {card.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-emergency" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                onClick={action.action}
                disabled={action.loading}
                className="h-auto p-4 flex flex-col items-start gap-2"
                {...(action.title === "Test Emergency System" ? { "data-test": "emergency-test" } : {})}
              >
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-xs text-left opacity-80">
                  {action.description}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${profile?.first_name ? 'text-emergency' : 'text-muted-foreground'}`} />
                <span className="text-sm">Personal Details</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${emergencyContactsCount > 0 ? 'text-emergency' : 'text-muted-foreground'}`} />
                <span className="text-sm">Emergency Contacts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${profile?.medical_conditions?.length > 0 ? 'text-emergency' : 'text-muted-foreground'}`} />
                <span className="text-sm">Medical Information</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className={`h-4 w-4 ${subscription?.subscribed ? 'text-emergency' : 'text-muted-foreground'}`} />
                <span className="text-sm">Subscription Active</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.activity_type);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;