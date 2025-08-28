import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Users, 
  Activity,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";

interface MetricsDashboardProps {
  profile: any;
  subscription: any;
}

const MetricsDashboard = ({ profile, subscription }: MetricsDashboardProps) => {
  const { t } = useTranslation();
  const [metrics, setMetrics] = useState({
    emergencyContactsCount: 0,
    familyMembersCount: 0,
    recentActivityCount: 0,
    systemHealthScore: 0,
    protectionDays: 0,
    lastActivityDate: null as Date | null
  });
  const [loading, setLoading] = useState(true);

  // Enable real-time updates
  useRealTimeUpdates();

  useEffect(() => {
    loadMetrics();
  }, [profile, subscription]);

  const loadMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Parallel loading of all metrics
      const [
        emergencyContacts,
        familyGroups,
        familyMemberships,
        recentActivity,
        subscriptionData
      ] = await Promise.all([
        supabase.from('emergency_contacts').select('id').eq('user_id', user.id),
        supabase.from('family_groups').select('id').eq('owner_user_id', user.id),
        supabase.from('family_memberships').select('id').eq('user_id', user.id).eq('status', 'active'),
        supabase.from('user_activity').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        supabase.functions.invoke('check-subscription')
      ]);

      // Calculate metrics
      const emergencyContactsCount = emergencyContacts.data?.length || 0;
      const familyOwnedGroups = familyGroups.data?.length || 0;
      const familyMemberOf = familyMemberships.data?.length || 0;
      const totalFamilyConnections = familyOwnedGroups + familyMemberOf;
      const recentActivityCount = recentActivity.data?.length || 0;
      
      // Calculate system health score (0-100)
      let healthScore = 0;
      if (subscription?.subscribed) healthScore += 30;
      if (emergencyContactsCount >= 3) healthScore += 25;
      if (emergencyContactsCount >= 5) healthScore += 15;
      if (profile?.profile_completion_percentage >= 80) healthScore += 20;
      if (profile?.location_sharing_enabled) healthScore += 10;

      // Calculate protection days since subscription start
      let protectionDays = 0;
      if (subscription?.subscribed && subscription?.subscription_start) {
        const startDate = new Date(subscription.subscription_start);
        const today = new Date();
        protectionDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      const lastActivity = recentActivity.data?.[0];
      const lastActivityDate = lastActivity ? new Date(lastActivity.created_at) : null;

      setMetrics({
        emergencyContactsCount,
        familyMembersCount: totalFamilyConnections,
        recentActivityCount,
        systemHealthScore: Math.min(healthScore, 100),
        protectionDays: Math.max(protectionDays, 0),
        lastActivityDate
      });

    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-950';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-950';
    return 'bg-red-100 dark:bg-red-950';
  };

  const formatTimeSince = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                Here's your protection metrics at a glance
              </p>
            </div>
            <div className="hidden sm:block">
              <Badge 
                variant={subscription?.subscribed ? "default" : "destructive"}
                className={subscription?.subscribed ? "bg-emergency text-black" : ""}
              >
                {subscription?.subscribed ? 'Protected' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* System Health Score */}
        <Card className={`hover:shadow-md transition-shadow ${getHealthScoreBg(metrics.systemHealthScore)}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Shield className={`h-6 w-6 ${getHealthScoreColor(metrics.systemHealthScore)}`} />
              <Badge variant="outline" className="text-xs">
                {metrics.systemHealthScore >= 80 ? 'Excellent' : 
                 metrics.systemHealthScore >= 60 ? 'Good' : 'Needs Attention'}
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-bold">{metrics.systemHealthScore}%</p>
              <p className="text-sm font-medium text-muted-foreground">System Health</p>
              <Progress value={metrics.systemHealthScore} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className={`h-6 w-6 ${metrics.emergencyContactsCount >= 5 ? 'text-green-600' : 'text-orange-500'}`} />
              {metrics.emergencyContactsCount >= 5 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              )}
            </div>
            <div>
              <p className="text-3xl font-bold">{metrics.emergencyContactsCount}<span className="text-lg text-muted-foreground">/5</span></p>
              <p className="text-sm font-medium text-muted-foreground">Emergency Contacts</p>
              <Progress value={(metrics.emergencyContactsCount / 5) * 100} className="mt-2 h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Family Connections */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Heart className={`h-6 w-6 ${metrics.familyMembersCount > 0 ? 'text-pink-600' : 'text-muted-foreground'}`} />
              <Badge variant={metrics.familyMembersCount > 0 ? "default" : "secondary"} className="text-xs">
                {metrics.familyMembersCount > 0 ? 'Connected' : 'None'}
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-bold">{metrics.familyMembersCount}</p>
              <p className="text-sm font-medium text-muted-foreground">Family Members</p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.familyMembersCount > 0 ? 'Ready for alerts' : 'Add family connections'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Protection Days */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Calendar className={`h-6 w-6 ${subscription?.subscribed ? 'text-blue-600' : 'text-muted-foreground'}`} />
              <Badge variant={subscription?.subscribed ? "default" : "secondary"} className="text-xs">
                {subscription?.subscribed ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-3xl font-bold">{metrics.protectionDays}</p>
              <p className="text-sm font-medium text-muted-foreground">Days Protected</p>
              <p className="text-xs text-muted-foreground mt-1">
                {subscription?.subscribed ? 'Continuous protection' : 'Activate protection'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity & Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Recent Actions</p>
                  <p className="text-sm text-muted-foreground">
                    {metrics.recentActivityCount} activities in last 10 records
                  </p>
                </div>
                <Badge variant="outline">{metrics.recentActivityCount}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium">Last Activity</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTimeSince(metrics.lastActivityDate)}
                  </p>
                </div>
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion */}
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
                <span className="text-sm text-muted-foreground">{profile?.profile_completion_percentage || 0}%</span>
              </div>
              <Progress value={profile?.profile_completion_percentage || 0} className="h-3" />
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${profile?.first_name ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="text-xs">Personal Details</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${metrics.emergencyContactsCount >= 3 ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="text-xs">Emergency Contacts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${profile?.medical_conditions?.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="text-xs">Medical Info</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-4 w-4 ${profile?.location_sharing_enabled ? 'text-green-600' : 'text-muted-foreground'}`} />
                  <span className="text-xs">Location Sharing</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Health Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            System Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${subscription?.subscribed ? 'bg-green-100 dark:bg-green-950' : 'bg-red-100 dark:bg-red-950'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className={`h-5 w-5 ${subscription?.subscribed ? 'text-green-600' : 'text-red-600'}`} />
                <span className="font-medium">Protection</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {subscription?.subscribed ? 'Active and monitoring' : 'Not activated'}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${metrics.emergencyContactsCount >= 3 ? 'bg-green-100 dark:bg-green-950' : 'bg-yellow-100 dark:bg-yellow-950'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className={`h-5 w-5 ${metrics.emergencyContactsCount >= 3 ? 'text-green-600' : 'text-yellow-600'}`} />
                <span className="font-medium">Contacts</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {metrics.emergencyContactsCount >= 3 ? 'Well configured' : 'Need more contacts'}
              </p>
            </div>

            <div className={`p-4 rounded-lg ${profile?.location_sharing_enabled ? 'bg-green-100 dark:bg-green-950' : 'bg-orange-100 dark:bg-orange-950'}`}>
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`h-5 w-5 ${profile?.location_sharing_enabled ? 'text-green-600' : 'text-orange-600'}`} />
                <span className="font-medium">Location</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {profile?.location_sharing_enabled ? 'Sharing enabled' : 'Enable for better protection'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;