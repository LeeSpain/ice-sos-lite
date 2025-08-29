import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  MapPin, 
  Phone, 
  Bell, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Users,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { useToast } from '@/hooks/use-toast';

const FamilyDashboardHome = () => {
  const { user } = useOptimizedAuth();
  const { data: familyRole } = useFamilyRole();
  const { toast } = useToast();
  
  const [activeSOSEvents, setActiveSOSEvents] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (familyRole?.familyGroupId) {
      loadDashboardData();
    } else if (familyRole && familyRole.role === 'none') {
      // User is authenticated but has no family role - show empty state
      setIsLoading(false);
    } else if (familyRole && !familyRole.familyGroupId) {
      // Handle cases where family role exists but no group ID
      setIsLoading(false);
    }
  }, [familyRole]);

  const loadDashboardData = async () => {
    if (!familyRole?.familyGroupId) return;

    try {
      // Load family group and owner details
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .select(`
          *,
          owner_profile:profiles!family_groups_owner_user_id_fkey(*)
        `)
        .eq('id', familyRole.familyGroupId)
        .single();

      if (groupError) {
        console.error('Error loading family group:', groupError);
        throw groupError;
      }

      if (groupData) {
        setFamilyGroup(groupData);
        setOwnerProfile(groupData.owner_profile);
      }

      // Load active SOS events for the family group
      const { data: sosEvents } = await supabase
        .from('sos_events')
        .select('*')
        .eq('group_id', familyRole.familyGroupId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      setActiveSOSEvents(sosEvents || []);

      // Load recent family alerts
      const { data: alerts } = await supabase
        .from('family_alerts')
        .select('*')
        .eq('family_user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentAlerts(alerts || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load family emergency information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSOSAcknowledge = async (eventId: string) => {
    try {
      const { error } = await supabase.functions.invoke('family-sos-acknowledge', {
        body: {
          event_id: eventId,
          response_type: 'received_and_on_it'
        }
      });

      if (error) throw error;

      toast({
        title: "Response Sent",
        description: "Your family has been notified that you received the alert and are on your way."
      });

      loadDashboardData();
    } catch (error) {
      console.error('Error acknowledging SOS:', error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show empty state if user has no family role or access
  if (familyRole && (familyRole.role === 'none' || !familyRole.familyGroupId)) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Card className="p-8 text-center max-w-md">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Family Access</h3>
            <p className="text-muted-foreground mb-4">
              You don't have access to any family emergency systems yet. Contact the emergency plan owner to get invited.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Main Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {ownerProfile ? `${ownerProfile.first_name}'s Emergency Dashboard` : 'Family Emergency Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {familyRole?.role === 'owner' 
              ? 'Manage your family emergency protection system'
              : ownerProfile 
                ? `Connected to ${ownerProfile.first_name} ${ownerProfile.last_name}'s emergency system` 
                : 'Stay connected with your family\'s safety'
            }
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-2">
            <Heart className="h-3 w-3" />
            {familyRole?.role === 'owner' ? 'Account Owner' : 'Family Access'}
          </Badge>
          {ownerProfile && (
            <Badge variant="secondary" className="gap-2">
              <Shield className="h-3 w-3" />
              Protected by {ownerProfile.first_name}'s Plan
            </Badge>
          )}
        </div>
      </div>

      {/* Active SOS Events - Critical Priority */}
      {activeSOSEvents.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Active Emergency Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSOSEvents.map((event) => (
              <div key={event.id} className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-red-900">Emergency SOS Active</h3>
                    <p className="text-sm text-red-700">
                      Started: {new Date(event.created_at).toLocaleString()}
                    </p>
                    {event.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.address}
                      </p>
                    )}
                  </div>
                  <Badge variant="destructive">ACTIVE</Badge>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleSOSAcknowledge(event.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Received & On My Way
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/family-dashboard/emergency-map?event=${event.id}`, '_blank')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Live Map
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Emergency Status */}
        <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Shield className="h-5 w-5" />
              Emergency Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Family Network:</span>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                  {activeSOSEvents.length === 0 ? 'All Safe' : 'Emergency Active'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Status:</span>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications:</span>
                <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                  Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Family Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Network
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Owner:</span>
                <Badge variant="outline">
                  {ownerProfile ? `${ownerProfile.first_name} ${ownerProfile.last_name}` : 'Loading...'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Your Access:</span>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {familyRole?.role === 'owner' ? 'Full Access' : 'Emergency Monitor'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {familyRole?.role === 'owner' 
                  ? 'You own this emergency protection plan'
                  : `Connected to ${ownerProfile?.first_name || 'owner'}'s emergency account`
                }
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-3"
                onClick={() => window.location.href = '/family-dashboard/emergency-map'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                View Network Map
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/family-dashboard/notifications'}
              >
                <Bell className="h-4 w-4 mr-2" />
                View All Alerts
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/family-dashboard/profile'}
              >
                <Shield className="h-4 w-4 mr-2" />
                Update My Info
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/app'}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency SOS App
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{alert.alert_type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    variant={alert.status === 'delivered' ? 'default' : 'secondary'}
                  >
                    {alert.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Emergencies - Safe State */}
      {activeSOSEvents.length === 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">All Family Members Safe</h3>
            <p className="text-muted-foreground mb-4">
              No active emergency alerts. Your family network is connected and protected.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Network Active
              </div>
              <div className="flex items-center gap-1">
                <Bell className="h-4 w-4 text-blue-500" />
                Alerts Enabled
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                Family Protected
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyDashboardHome;