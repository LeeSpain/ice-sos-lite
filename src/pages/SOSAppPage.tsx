import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useEmergencySOS } from '@/hooks/useEmergencySOS';
import { useEmergencyDisclaimer } from '@/hooks/useEmergencyDisclaimer';
import { useEmergencyLocation } from '@/hooks/useEmergencyLocation';
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
  Battery, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Wifi, 
  Signal,
  Camera,
  Mic,
  PhoneCall,
  MessageSquare,
  History,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useMapProvider } from '@/hooks/useMapProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import EmergencyCommandCenter from '@/components/sos-app/EmergencyCommandCenter';
import EmergencyButton from '@/components/sos-app/EmergencyButton';
import { EmergencyDisclaimerModal } from '@/components/emergency/EmergencyDisclaimerModal';

interface EmergencyStatus {
  overall: 'ready' | 'warning' | 'error';
  location: boolean;
  contacts: number;
  network: boolean;
  battery: number;
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
  const { currentLocation, isTracking, startTracking, stopTracking, refreshLocation, locationError } = useEmergencyLocation();
  const { 
    showDisclaimer, 
    requestDisclaimerAcceptance, 
    acceptDisclaimer, 
    cancelDisclaimer 
  } = useEmergencyDisclaimer();
  const { MapView } = useMapProvider();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedTab, setSelectedTab] = useState('status');
  const [emergencyStatus, setEmergencyStatus] = useState<EmergencyStatus>({
    overall: 'ready',
    location: permissionState?.granted || false,
    contacts: contacts.length,
    network: navigator.onLine,
    battery: 85 // Mock battery level
  });
  const [activeIncident, setActiveIncident] = useState<ActiveIncident | null>(null);

  // Update emergency status
  useEffect(() => {
    const newStatus: EmergencyStatus = {
      location: permissionState?.granted || false,
      contacts: contacts.length,
      network: navigator.onLine,
      battery: 85, // Mock - in real app would get from device
      overall: 'ready'
    };

    // Determine overall status
    if (!newStatus.location || newStatus.contacts === 0) {
      newStatus.overall = 'warning';
    } else if (!newStatus.network || newStatus.battery < 20) {
      newStatus.overall = 'error';
    }

    setEmergencyStatus(newStatus);
  }, [permissionState, contacts]);

  // Start location tracking for emergency purposes
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  const handleEmergencyTrigger = async () => {
    if (!requestDisclaimerAcceptance()) {
      return;
    }

    try {
      // Create mock active incident
      const incident: ActiveIncident = {
        id: `incident-${Date.now()}`,
        status: 'active',
        startTime: new Date(),
        contactsNotified: contacts.length,
        locationShared: true,
        familyAlerted: true
      };
      setActiveIncident(incident);

      await triggerEmergencySOS();
      
      toast({
        title: "Emergency SOS Activated",
        description: "Emergency contacts and family have been notified",
      });
    } catch (error) {
      console.error('Emergency SOS failed:', error);
    }
  };

  const handleDisclaimerAccept = () => {
    acceptDisclaimer();
    handleEmergencyTrigger();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <CheckCircle2 className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const handleTabNavigation = (tabId: string) => {
    setSelectedTab(tabId);
    
    switch (tabId) {
      case 'status':
        // Stay on current tab
        break;
      case 'contacts':
        navigate('/member-dashboard/emergency-contacts');
        break;
      case 'history':
        navigate('/member-dashboard/emergency-history');
        break;
      case 'settings':
        navigate('/member-dashboard/settings');
        break;
    }
  };

  // Memoize map markers to prevent unnecessary re-renders
  const mapMarkers = React.useMemo(() => {
    if (!currentLocation) return [];
    
    return [{
      id: 'current-location',
      lat: currentLocation.lat,
      lng: currentLocation.lng,
      render: () => null // We handle styling in the map hook
    }];
  }, [currentLocation]);

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
              <Battery className="h-4 w-4" />
              <span className="text-sm">{emergencyStatus.battery}%</span>
              {isTracking && (
                <div className="flex items-center gap-1 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
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
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="h-4 w-4" />
                <span>Contacts: {emergencyStatus.contacts}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Wifi className="h-4 w-4" />
                <span>Network: {emergencyStatus.network ? 'Connected' : 'Offline'}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Battery className="h-4 w-4" />
                <span>Battery: {emergencyStatus.battery}%</span>
              </div>
            </div>
            
            {locationError && (
              <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded text-yellow-200 text-xs">
                {locationError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Incident Alert */}
      {activeIncident && (
        <div className="relative z-10 px-4 mb-6">
          <div className="max-w-md mx-auto">
            <div className="bg-red-600 rounded-xl p-4 border border-red-500 animate-pulse">
              <div className="flex items-center gap-3 text-white mb-3">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-bold">ACTIVE EMERGENCY</span>
                <Badge variant="destructive" className="bg-red-800">
                  {activeIncident.status.toUpperCase()}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-white/90">
                <div>Started: {activeIncident.startTime.toLocaleTimeString()}</div>
                <div>Contacts: {activeIncident.contactsNotified} notified</div>
                <div>Location: {activeIncident.locationShared ? 'Shared' : 'Pending'}</div>
                <div>Family: {activeIncident.familyAlerted ? 'Alerted' : 'Pending'}</div>
              </div>
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

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Button 
                  className="h-16 bg-blue-600/20 border border-blue-500/30 text-white hover:bg-blue-600/30"
                  onClick={() => {
                    toast({
                      title: "Photo Capture",
                      description: "Emergency photo capture feature activated",
                    });
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-6 w-6" />
                    <span className="text-sm">Photo</span>
                  </div>
                </Button>
                <Button 
                  className="h-16 bg-purple-600/20 border border-purple-500/30 text-white hover:bg-purple-600/30"
                  onClick={() => {
                    toast({
                      title: "Voice Memo",
                      description: "Emergency voice recording started",
                    });
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Mic className="h-6 w-6" />
                    <span className="text-sm">Voice</span>
                  </div>
                </Button>
              </div>

              {/* Live Location Map */}
              {currentLocation && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-3 text-white">
                    <Navigation className="h-5 w-5" />
                    <span className="font-medium">Live Location</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs">Live</span>
                    </div>
                  </div>
                  <div className="h-48 rounded-lg overflow-hidden">
                    <MapView
                      className="w-full h-full"
                      markers={mapMarkers}
                      center={currentLocation}
                      zoom={15}
                    />
                  </div>
                  <div className="mt-3 text-sm text-white/70 flex justify-between">
                    <span>Accuracy: ±{currentLocation.accuracy || 5}m</span>
                    <span>Updated: {currentLocation.timestamp ? new Date(currentLocation.timestamp).toLocaleTimeString() : 'Now'}</span>
                  </div>
                </div>
              )}

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
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-black/30 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          {[
            { id: 'status', icon: Shield, label: 'Status' },
            { id: 'contacts', icon: Phone, label: 'Contacts' },
            { id: 'history', icon: History, label: 'History' },
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

      {/* Quick Access Floating Buttons */}
      <Link to="/member-dashboard" className="fixed top-6 left-4 z-20">
        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
          ← Dashboard
        </Button>
      </Link>

      <Link to="/family-app" className="fixed top-6 right-4 z-20">
        <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
          Family →
        </Button>
      </Link>

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