import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

interface DashboardOverviewProps {
  profile: any;
  subscription: any;
  onProfileUpdate: () => void;
}

const DashboardOverview = ({ profile, subscription, onProfileUpdate }: DashboardOverviewProps) => {
  const { toast } = useToast();
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // Enable real-time updates
  useRealTimeUpdates();

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

  // Get actual emergency contacts count from the emergency_contacts table
  const [emergencyContactsCount, setEmergencyContactsCount] = useState(0);
  const [familyConnectionStatus, setFamilyConnectionStatus] = useState(false);
  
  const profileCompletion = profile?.profile_completion_percentage || 0;
  const protectionActive = subscription?.subscribed;

  // Load real emergency contacts count and family status
  useEffect(() => {
    loadEmergencyData();
  }, [profile, subscription]);

  const loadEmergencyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get actual emergency contacts count
      const { data: emergencyContacts } = await supabase
        .from('emergency_contacts')
        .select('id')
        .eq('user_id', user.id);

      setEmergencyContactsCount(emergencyContacts?.length || 0);

      // Check family connection status
      const [groupResponse, membershipResponse] = await Promise.all([
        supabase.from('family_groups').select('id').eq('owner_user_id', user.id),
        supabase.from('family_memberships').select('id').eq('user_id', user.id).eq('status', 'active')
      ]);

      const hasFamily = (groupResponse.data && groupResponse.data.length > 0) || 
                       (membershipResponse.data && membershipResponse.data.length > 0);
      setFamilyConnectionStatus(hasFamily);
    } catch (error) {
      console.error('Error loading emergency data:', error);
    }
  };
  const quickActions = [
    {
      title: t('dashboardOverview.actions.testEmergency.title', { defaultValue: 'Test Emergency System' }),
      description: t('dashboardOverview.actions.testEmergency.description', { defaultValue: 'Verify all systems are working' }),
      icon: Shield,
      action: handleEmergencyTest,
      loading: loading,
      variant: "emergency" as const
    },
    {
      title: t('dashboardOverview.actions.completeSetup.title', { defaultValue: 'Complete Setup' }),
      description: profileCompletion < 100 
        ? t('dashboardOverview.actions.completeSetup.descriptionIncomplete', { defaultValue: 'Finish your profile setup' })
        : t('dashboardOverview.actions.completeSetup.descriptionComplete', { defaultValue: 'Review and update profile' }),
      icon: Users,
      action: () => window.location.href = '/dashboard/profile',
      variant: "outline" as const
    }
  ];

  const statusCards = [
    {
      title: t('dashboardOverview.status.emergency.title', { defaultValue: 'Emergency Readiness' }),
      value: `${emergencyContactsCount}/5 contacts`,
      status: emergencyContactsCount >= 5 && protectionActive ? "success" : "warning",
      icon: Shield,
      description: protectionActive && emergencyContactsCount >= 5 
        ? t('dashboardOverview.status.emergency.ready', { defaultValue: 'Fully prepared for emergencies' }) 
        : !protectionActive 
          ? t('dashboardOverview.status.emergency.activatePlan', { defaultValue: 'Activate protection plan' }) 
          : t('dashboardOverview.status.emergency.addContacts', { defaultValue: 'Add more emergency contacts' })
    },
    {
      title: t('dashboardOverview.status.account.title', { defaultValue: 'Account Health' }), 
      value: `${profileCompletion}% complete`,
      status: profileCompletion >= 80 && profile?.location_sharing_enabled ? "success" : "warning",
      icon: TrendingUp,
      description: profileCompletion >= 80 && profile?.location_sharing_enabled 
        ? t('dashboardOverview.status.account.complete', { defaultValue: 'Account setup complete' }) 
        : profileCompletion < 80 
          ? t('dashboardOverview.status.account.completeProfile', { defaultValue: 'Complete your profile' }) 
          : t('dashboardOverview.status.account.enableLocation', { defaultValue: 'Enable location sharing' })
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
                {t('dashboardOverview.welcome', { name: profile?.first_name || 'Member' })}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('dashboardOverview.subtitle')}
              </p>
            </div>
            <div className="hidden sm:block">
              <Badge 
                variant={protectionActive ? "default" : "destructive"}
                className={protectionActive ? "bg-emergency text-black" : ""}
              >
                {protectionActive ? t('dashboardOverview.protected') : t('dashboardOverview.inactive')}
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

      {/* Emergency Summary Card - Simplified for overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Emergency Protection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Protection Status</p>
                <p className="text-sm text-muted-foreground">
                  {protectionActive ? 'Active protection plan' : 'No active protection'}
                </p>
              </div>
              {protectionActive ? (
                <Badge className="bg-emergency/10 text-emergency">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Emergency Contacts</p>
                <p className="text-sm text-muted-foreground">
                  {emergencyContactsCount} of 5 contacts configured
                </p>
              </div>
              <Badge variant={emergencyContactsCount >= 5 ? "default" : "secondary"}>
                {emergencyContactsCount >= 5 ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Family Connection</p>
                <p className="text-sm text-muted-foreground">
                  {familyConnectionStatus ? 'Family members connected' : 'No family connections'}
                </p>
              </div>
              <Badge variant={familyConnectionStatus ? "default" : "secondary"}>
                {familyConnectionStatus ? 'Connected' : 'Not connected'}
              </Badge>
            </div>

            {(!protectionActive || emergencyContactsCount < 5) && (
              <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Complete your emergency setup for full protection
                </p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.href = '/full-dashboard/products'}
                >
                  View Products & Setup
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('dashboardOverview.quickActions')}
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
                  <span className={`font-medium ${action.variant === 'emergency' ? 'text-primary' : ''}`}>{action.title}</span>
                </div>
                <span className={`text-xs text-left opacity-80 ${action.variant === 'emergency' ? 'text-primary' : ''}`}>
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
            {t('dashboardOverview.profileCompletion')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{t('dashboardOverview.overallProgress')}</span>
              <span className="text-sm text-muted-foreground">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-3" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${profile?.first_name ? 'text-emergency' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{t('dashboardOverview.checklist.personalDetails', { defaultValue: 'Personal Details' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${emergencyContactsCount >= 5 ? 'text-emergency' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{t('dashboardOverview.checklist.emergencyContacts', { defaultValue: 'Emergency Contacts' })} ({emergencyContactsCount}/5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${profile?.medical_conditions?.length > 0 ? 'text-emergency' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{t('dashboardOverview.checklist.medicalInformation', { defaultValue: 'Medical Information' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${subscription?.subscribed ? 'text-emergency' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{t('dashboardOverview.checklist.subscriptionActive', { defaultValue: 'Subscription Active' })}</span>
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
            {t('dashboardOverview.recentActivity')}
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
              <p className="text-sm text-muted-foreground">{t('dashboardOverview.noRecentActivity')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;