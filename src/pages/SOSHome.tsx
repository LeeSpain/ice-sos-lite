import React, { useState, useEffect } from 'react';
import SosButton from '@/components/SosButton';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useCircleRealtime } from '@/hooks/useCircleRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, BatteryCharging, Phone, MapPin, Clock, Map, Users } from 'lucide-react';
import SEO from '@/components/SEO';

const SOSHome = () => {
  const { user } = useAuth();
  const { isActive } = useWakeLock(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyMembers, setNearbyMembers] = useState(0);
  const [familyGroupId, setFamilyGroupId] = useState<string | null>(null);
  
  const { circles, presences } = useCircleRealtime(familyGroupId);

  useEffect(() => {
    loadUserFamilyGroup();
    getCurrentLocation();
  }, [user]);

  const loadUserFamilyGroup = async () => {
    if (!user) return;
    
    try {
      // Try to get user's own family group first
      const { data: ownGroup } = await supabase
        .from('family_groups')
        .select('id')
        .eq('owner_user_id', user.id)
        .single();

      if (ownGroup) {
        setFamilyGroupId(ownGroup.id);
        return;
      }

      // If no own group, try to get a group where user is a member
      const { data: memberGroup } = await supabase
        .from('family_memberships')
        .select('group_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberGroup) {
        setFamilyGroupId(memberGroup.group_id);
      }
    } catch (error) {
      console.error('Error loading family group:', error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error('Error getting location:', error),
        { enableHighAccuracy: true }
      );
    }
  };

  useEffect(() => {
    if (userLocation && presences.length > 0) {
      // Calculate nearby members (within 5km)
      const nearby = presences.filter(presence => {
        if (!presence.lat || !presence.lng) return false;
        const distance = getDistance(
          userLocation.lat, userLocation.lng,
          presence.lat, presence.lng
        );
        return distance <= 5000; // 5km in meters
      });
      setNearbyMembers(nearby.length);
    }
  }, [userLocation, presences]);

  // Calculate distance between two coordinates using Haversine formula
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col p-6 relative overflow-hidden">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      {/* Background accent elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/15 blur-xl"></div>
      </div>

      {/* Main Container Card */}
      <div className="w-full max-w-lg mx-auto mt-8 mb-6 relative z-10">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 space-y-8">
          
          {/* Header Section */}
          <header className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-emergency shadow-emergency">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-guardian tracking-tight">ICE SOS Lite</h1>
              <p className="text-neutral text-base font-medium">Emergency Protection System</p>
              <p className="text-gray-600 text-sm leading-relaxed px-4">
                Instantly alert your emergency contacts and share your precise location with one simple tap
              </p>
            </div>
          </header>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Main Action Section */}
          <main className="flex flex-col items-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-guardian text-xl font-semibold">Ready to Help</h2>
              <p className="text-gray-600 text-sm">Tap the button below in case of emergency</p>
            </div>
            
            <SosButton />
            
            {/* Location Permission Status */}
            <LocationPermissionPrompt />
            
            <div className="text-center text-gray-500 text-xs space-y-1">
              <p className="font-medium">Quick Access Features</p>
              <div className="flex items-center justify-center gap-6 text-xs mt-3">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>Auto Call</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>Location Share</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </main>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Voice Activation Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <span className="text-white text-lg font-bold">🎤</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-guardian text-base">Voice Activation</h3>
              <p className="text-gray-700 text-sm">Say <span className="font-bold text-emergency">"Help Help Help"</span> to activate emergency mode</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* System Status Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-wellness animate-pulse' : 'bg-warning'}`}></div>
              <span className="text-sm font-medium text-guardian">System Status</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <BatteryCharging className="h-4 w-4 text-wellness" />
              <span>{isActive ? 'Active & Protected' : 'Standby Mode'}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Live Map Mini Widget */}
          {familyGroupId && (
            <Card className="border-2 border-primary/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Family Status</span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => window.open('/map-screen', '_blank')}>
                    <Map className="h-3 w-3 mr-1" />
                    Full Map
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-blue-600">{presences.length}</p>
                    <p className="text-xs text-muted-foreground">Family Online</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{nearbyMembers}</p>
                    <p className="text-xs text-muted-foreground">Nearby (5km)</p>
                  </div>
                </div>

                {userLocation && (
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>Your Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Emergency Notice Section */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-emergency font-semibold text-sm">
              <Phone className="h-4 w-4" />
              <span>Critical Emergency Notice</span>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed">
              For life-threatening emergencies, always call your local emergency services (911, 112, etc.) immediately
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SOSHome;
