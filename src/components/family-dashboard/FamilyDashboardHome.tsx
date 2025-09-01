import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { useToast } from '@/hooks/use-toast';
import ConnectionHeader from '@/components/family-dashboard/ConnectionHeader';
import WhoWeProtectCard from '@/components/family-dashboard/WhoWeProtectCard';
import FamilyNetworkMap from '@/components/family-dashboard/FamilyNetworkMap';
import MyRoleCard from '@/components/family-dashboard/MyRoleCard';
import EmergencyStatusCenter from '@/components/family-dashboard/EmergencyStatusCenter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FamilyDashboardHome = () => {
  const { user } = useOptimizedAuth();
  const { data: familyRole } = useFamilyRole();
  const { toast } = useToast();
  
  const [activeSOSEvents, setActiveSOSEvents] = useState<any[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<any>(null);
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

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
      // Load family group data
      const { data: groupData, error: groupError } = await supabase
        .from('family_groups')
        .select('*')
        .eq('id', familyRole.familyGroupId)
        .single();

      if (groupError) {
        console.error('Error loading family group:', groupError);
        throw groupError;
      }

      if (groupData) {
        setFamilyGroup(groupData);
        
        // Load owner profile separately
        if (groupData.owner_user_id) {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', groupData.owner_user_id)
            .single();

          if (ownerError) {
            console.error('Error loading owner profile:', ownerError);
          } else {
            setOwnerProfile(ownerData);
          }
        }
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

      // Load emergency contacts
      const { data: contacts } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', groupData.owner_user_id);

      setEmergencyContacts(contacts || []);
      setLastSync(new Date());

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

  // Define user access permissions based on role
  const userAccess = {
    canViewLocation: true, // Most family members can view location
    canViewMedical: familyRole?.role === 'owner' || emergencyContacts.some(c => c.email === user?.email),
    canReceiveAlerts: true, // All family members receive alerts
    canContactEmergency: true // All family members can contact emergency
  };

  return (
    <div className="p-6 space-y-6">
      {/* Connection Header */}
      <ConnectionHeader 
        ownerProfile={ownerProfile}
        familyRole={familyRole}
        isConnected={true}
        lastSync={lastSync}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Who We're Protecting */}
          <WhoWeProtectCard 
            ownerProfile={ownerProfile}
            familyRole={familyRole}
            emergencyContacts={emergencyContacts}
            userAccess={userAccess}
          />
          
          {/* My Role & Responsibilities */}
          <MyRoleCard 
            familyRole={familyRole}
            userAccess={userAccess}
            ownerName={ownerProfile?.first_name || 'the family owner'}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Emergency Status Center */}
          <EmergencyStatusCenter 
            activeSOSEvents={activeSOSEvents}
            recentAlerts={recentAlerts}
            ownerName={ownerProfile?.first_name || 'the family owner'}
            onSOSAcknowledge={handleSOSAcknowledge}
          />
          
          {/* Family Network Map */}
          {familyRole?.familyGroupId && (
            <FamilyNetworkMap 
              familyGroupId={familyRole.familyGroupId}
              ownerProfile={ownerProfile}
              currentUserRole={familyRole}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FamilyDashboardHome;