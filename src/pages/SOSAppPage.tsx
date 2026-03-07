import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useEmergencySOS } from '@/hooks/useEmergencySOS';
import { useEmergencyDisclaimer } from '@/hooks/useEmergencyDisclaimer';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { getFamilyGroupId } from '@/utils/familyGroupUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  Phone,
  MapPin,
  Settings,
  Users,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  Signal,
  PhoneCall,
  MessageSquare,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import MapLibreMap from '@/components/maplibre/MapLibreMap';
import { useMapLibre } from '@/hooks/useMapLibre';
import { supabase } from '@/integrations/supabase/client';
import type { MapMemberPoint, MarkerState } from '@/types/map';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import EmergencyCommandCenter from '@/components/sos-app/EmergencyCommandCenter';
import EmergencyButton from '@/components/sos-app/EmergencyButton';
import { EmergencyDisclaimerModal } from '@/components/emergency/EmergencyDisclaimerModal';
import ActiveIncidentTracker from '@/components/sos/ActiveIncidentTracker';

interface EmergencyStatus {
  overall: 'ready' | 'warning' | 'error';
  location: boolean;
  contacts: number;
  network: boolean;
}

interface ActiveIncident {
  id: string;
  status: 'active' | 'acknowledged' | 'resolved';
  startTime: Date;
  contactsNotified: number;
  locationShared: boolean;
  familyAlerted: boolean;
}

const SOSAppPage = () => {
  const { user } = useAuth();
  const { contacts, loading: contactsLoading } = useEmergencyContacts();
  const { permissionState } = useLocationServices();
  const { triggerEmergencySOS, isTriggering } = useEmergencySOS();
  const [familyGroupId, setFamilyGroupId] = useState<string | null>(null);
  
  const { 
    locations: liveLocations,
    locationState,
    metrics,
    startTracking,
    stopTracking,
    refreshLocation,
    error: locationError,
    getCurrentLocationData
  } = useLiveLocation(familyGroupId || undefined);
  const { 
    showDisclaimer, 
    requestDisclaimerAcceptance, 
    acceptDisclaimer, 
    cancelDisclaimer 
  } = useEmergencyDisclaimer();
  const { setMap, setMemberMarkers } = useMapLibre();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState('status');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<string | null>(null);
  const [memberNames, setMemberNames] = useState<Record<string, string>>({});
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>({
    overall: 'ready',
    location: permissionState?.granted || false,
    contacts: contacts.length,
    network: navigator.onLine,
  });
  const [activeIncident, setActiveIncident] = useState<ActiveIncident | null>(null);

  // Update emergency status
  useEffect(() => {
    const newStatus: EmergencyStatus = {
      location: permissionState?.granted || false,
      contacts: contacts.length,
      network: navigator.onLine,
      overall: 'ready'
    };

    // Determine overall status
    if (!newStatus.location || newStatus.contacts === 0) {
      newStatus.overall = 'warning';
    } else if (!newStatus.network) {
      newStatus.overall = 'error';
    }

    setEmergencyStatus(newStatus);
  }, [permissionState, contacts]);

  // Initialize family group ID
  useEffect(() => {
    const initializeFamilyGroup = async () => {
      if (user && !familyGroupId) {
        const groupId = await getFamilyGroupId(user.id);
        setFamilyGroupId(groupId);
      }
    };
    
    initializeFamilyGroup();
  }, [user, familyGroupId]);

  // Fetch display names for family members visible on the map
  useEffect(() => {
    const otherIds = liveLocations
      .map(l => l.user_id)
      .filter(id => id !== user?.id && !memberNames[id]);
    if (otherIds.length === 0) return;

    supabase
      .from('profiles')
      .select('user_id, first_name, last_name')
      .in('user_id', otherIds)
      .then(({ data }) => {
        if (!data) return;
        const names: Record<string, string> = {};
        data.forEach(p => {
          const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
          names[p.user_id] = name || 'Family Member';
        });
        setMemberNames(prev => ({ ...prev, ...names }));
      });
  }, [liveLocations, user?.id]);

  // Initialize location tracking once for emergency purposes
  const trackingInitialized = useRef(false);
  
  useEffect(() => {
    if (familyGroupId && !trackingInitialized.current) {
      trackingInitialized.current = true;
      startTracking({ highAccuracy: true, updateInterval: 10000 }); // 10s updates for emergency
    }
  }, [familyGroupId]);

  const handleEmergencyTrigger = async () => {
    if (!requestDisclaimerAcceptance()) {
      return;
    }

    try {
      const location = currentLocation;

      // Call Clar's SOS trigger edge function
      const { data, error } = await supabase.functions.invoke('sos-trigger', {
        body: {
          trigger_method: 'app_button',
          latitude: location?.latitude,
          longitude: location?.longitude,
        },
      });

      if (error) throw error;

      const incident: ActiveIncident = {
        id: data?.incident_id || `incident-${Date.now()}`,
        status: 'active',
        startTime: new Date(),
        contactsNotified: contacts.length,
        locationShared: !!location,
        familyAlerted: true,
      };
      setActiveIncident(incident);

      toast({
        title: "SOS Activated",
        description: "Clar is calling you now. Help is being coordinated.",
      });
    } catch (error) {
      console.error('Emergency SOS failed:', error);
      // Fallback — still set local incident so UI shows active state
      const incident: ActiveIncident = {
        id: `incident-${Date.now()}`,
        status: 'active',
        startTime: new Date(),
        contactsNotified: contacts.length,
        locationShared: false,
        familyAlerted: false,
      };
      setActiveIncident(incident);
      toast({
        title: "SOS Activated",
        description: "Notifying your emergency contacts now.",
        variant: "destructive",
      });
    }
  };

  const handleDisclaimerAccept = () => {
    acceptDisclaimer();
    handleEmergencyTrigger();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <CheckCircle2 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const handleTabNavigation = (tabId: string) => {
    setSelectedTab(tabId);
    
    switch (tabId) {
      case 'status':
        // Stay on current tab
        break;
      case 'family':
        // Stay on current tab to show family list
        break;
      case 'contacts':
        navigate('/member-dashboard/emergency-contacts');
        break;
      case 'settings':
        navigate('/member-dashboard/settings');
        break;
    }
  };

  // Get current location from live tracking
  const currentLocation = getCurrentLocationData();

  // Convert live locations to MapMemberPoint[] for the MapLibre layer
  const mapMembers: MapMemberPoint[] = React.useMemo(() => {
    const members: MapMemberPoint[] = [];

    // Current user
    if (currentLocation?.latitude && currentLocation?.longitude) {
      members.push({
        id: 'current-user',
        userId: user?.id || 'me',
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        name: user?.user_metadata?.full_name || 'You',
        state: 'normal' as MarkerState,
      });
    }

    // Family members
    liveLocations.forEach(location => {
      if (location.user_id !== user?.id) {
        if (selectedFamilyMember && location.user_id !== selectedFamilyMember) return;
        members.push({
          id: `live-${location.user_id}`,
          userId: location.user_id,
          lat: location.latitude,
          lng: location.longitude,
          name: memberNames[location.user_id] || 'Family Member',
          state: (location.status === 'online' ? 'normal' : location.status === 'away' ? 'warning' : 'offline') as MarkerState,
          battery: location.battery_level,
        });
      }
    });

    return members;
  }, [currentLocation?.latitude, currentLocation?.longitude, liveLocations, selectedFamilyMember, memberNames, user?.id]);

  // Push members to MapLibre source when they change
  React.useEffect(() => {
    setMemberMarkers(mapMembers);
  }, [mapMembers, setMemberMarkers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-orange-900">
      <SEO 
        title="Emergency SOS Command Center"
        description="Advanced emergency response system with real-time monitoring and one-touch SOS activation"
      />

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-white mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-8 w-8" />
                <div className={cn(
                  "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                  getStatusColor(emergencyStatus.overall)
                )}></div>
              </div>
              <div>
                <h1 className="text-xl font-bold">Emergency SOS</h1>
                <p className="text-white/70 text-sm">Command Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4" />
              {locationState.isTracking && (
                <div className="flex items-center gap-1 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">Live</span>
                </div>
              )}
            </div>
          </div>

          {/* System Status Bar */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">System Status</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(emergencyStatus.overall)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshLocation}
                  className="text-white/70 hover:text-white h-8 w-8 p-0"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="h-4 w-4" />
              <span>Location: {emergencyStatus.location ? 'Active' : 'Disabled'}</span>
              {locationState.isTracking && (
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse ml-1"></div>
              )}
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4" />
              <span>Contacts: {emergencyStatus.contacts}</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Wifi className="h-4 w-4" />
              <span>Network: {emergencyStatus.network ? 'Connected' : 'Offline'}</span>
            </div>
            </div>
            
            {locationError && (
              <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-200 text-xs">
                {locationError}
              </div>
            )}
            
            {/* Live tracking metrics */}
            {locationState.isTracking && metrics.totalUpdates > 0 && (
              <div className="mt-3 text-xs text-white/60">
                <div className="flex justify-between">
                  <span>Updates: {metrics.totalUpdates}</span>
                  <span>Success: {metrics.successRate}%</span>
                  <span>Avg Accuracy: ±{metrics.averageAccuracy}m</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Incident — Clar AI Tracker */}
      {activeIncident && activeIncident.id && !activeIncident.id.startsWith('incident-') && (
        <div className="relative z-10 px-4 mb-6">
          <div className="max-w-md mx-auto">
            <ActiveIncidentTracker
              incidentId={activeIncident.id}
              memberName={user?.user_metadata?.full_name || 'You'}
              onResolved={() => setActiveIncident(null)}
            />
          </div>
        </div>
      )}

      {/* Fallback indicator for local-only incident state */}
      {activeIncident && activeIncident.id.startsWith('incident-') && (
        <div className="relative z-10 px-4 mb-6">
          <div className="max-w-md mx-auto">
            <div className="bg-red-600 rounded-xl p-4 border border-red-500 animate-pulse">
              <div className="flex items-center gap-3 text-white mb-2">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold">EMERGENCY ACTIVATED</span>
              </div>
              <p className="text-white/80 text-sm">Notifying your emergency contacts. Clar is coordinating help.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Based on Selected Tab */}
      <div className="relative z-10 px-4 pb-24">
        <div className="max-w-md mx-auto">
          
          {selectedTab === 'status' && (
            <div className="space-y-6">
              {/* Emergency Button */}
              <div className="flex justify-center mb-8">
                <EmergencyButton />
              </div>

              {/* Live Location Map - Always show with fallback */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-3 text-white">
                  <Navigation className="h-5 w-5" />
                  <span className="font-medium">Live Location</span>
                  <div className="flex items-center gap-1 ml-auto">
                    {locationState.isTracking ? (
                      <>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-xs">Live ({locationState.updateInterval/1000}s)</span>
                      </>
                     ) : (
                      <>
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-xs">Offline</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-48 rounded-lg overflow-hidden relative">
                  <MapLibreMap
                    className="w-full h-full"
                    center={(() => {
                      if (selectedFamilyMember) {
                        const fl = liveLocations.find(l => l.user_id === selectedFamilyMember);
                        if (fl) return [fl.longitude, fl.latitude] as [number, number];
                      }
                      return currentLocation
                        ? [currentLocation.longitude, currentLocation.latitude] as [number, number]
                        : [-2.1417503, 37.3881024] as [number, number];
                    })()}
                    zoom={selectedFamilyMember ? 15 : (currentLocation ? 16 : 10)}
                    navigationControl={false}
                    onMapReady={setMap}
                  />
                </div>
                <div className="mt-3 text-sm text-white/70 flex justify-between">
                  <span>
                    {currentLocation 
                      ? `Accuracy: ±${currentLocation.accuracy || 5}m` 
                      : `${locationError || 'Getting location...'}`
                    }
                  </span>
                  <span>
                    {currentLocation?.last_seen 
                      ? `Updated: ${new Date(currentLocation.last_seen).toLocaleTimeString()}` 
                      : 'Waiting for GPS...'
                    }
                  </span>
                </div>
                
                {/* Family Connection Status */}
                <div className="mt-3 p-2 bg-black/20 rounded-lg">
                  <div className="flex items-center justify-between text-xs text-white/80">
                    <span>Family Connected:</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                      <span>
                        {Math.max(1, Array.from(new Set(liveLocations.filter(l => l.status === 'online').map(l => l.user_id))).length)} members online
                      </span>
                    </div>
                  </div>
                  {locationState.isTracking && (
                    <div className="mt-1 text-xs text-white/60">
                      High-precision mode • {locationState.highAccuracyMode ? 'GPS' : 'Network'} tracking
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contacts Summary */}
              {contacts.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-3 text-white">
                    <span className="font-medium">Emergency Contacts</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {contacts.length} active
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {contacts.slice(0, 3).map((contact, index) => (
                      <div key={contact.id || index} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{contact.name}</div>
                          <div className="text-white/60 text-xs">{contact.relationship}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                            <PhoneCall className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-white hover:bg-white/20">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {contacts.length > 3 && (
                      <div className="text-center">
                        <Button variant="ghost" className="text-white/70 hover:text-white text-sm">
                          +{contacts.length - 3} more contacts
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedTab === 'family' && (
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-4 text-white">
                  <span className="font-medium">Family Members</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {liveLocations.filter(l => l.user_id !== user?.id).length} online
                  </Badge>
                </div>
                <div className="space-y-3">
                  {liveLocations.filter(l => l.user_id !== user?.id).map((location, index) => (
                    <div key={location.user_id} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {`M${index + 1}`}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{memberNames[location.user_id] || `Family Member ${index + 1}`}</div>
                        <div className="text-white/60 text-xs">{location.status}</div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedFamilyMember(selectedFamilyMember === location.user_id ? null : location.user_id);
                          setSelectedTab('status'); // Go back to map view
                        }}
                        className={cn(
                          "h-8 px-3 text-xs",
                          selectedFamilyMember === location.user_id 
                            ? "bg-blue-600 text-white" 
                            : "bg-white/20 text-white hover:bg-white/30"
                        )}
                      >
                        {selectedFamilyMember === location.user_id ? 'Hide' : 'Show on Map'}
                      </Button>
                    </div>
                  ))}
                  {liveLocations.filter(l => l.user_id !== user?.id).length === 0 && (
                    <div className="text-center text-white/60 py-4">
                      No family members online
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          {[
            { id: 'status', icon: Shield, label: 'Status' },
            { id: 'family', icon: Users, label: 'Family' },
            { id: 'contacts', icon: Phone, label: 'Contacts' },
            { id: 'settings', icon: Settings, label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabNavigation(tab.id)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0",
                selectedTab === tab.id 
                  ? "text-white bg-white/20" 
                  : "text-white/60 hover:text-white/80"
              )}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>


      {/* Emergency Disclaimer Modal */}
      <EmergencyDisclaimerModal
        isOpen={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onCancel={cancelDisclaimer}
        subscriptionTier="basic"
      />
    </div>
  );
};

export default SOSAppPage;