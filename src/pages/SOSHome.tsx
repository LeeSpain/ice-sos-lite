import React, { useState, useEffect } from 'react';
import SosButton from '@/components/SosButton';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useCircleRealtime } from '@/hooks/useCircleRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Bluetooth, HeartPulse, PlugZap, MapPin, Users, Map } from 'lucide-react';
import SEO from '@/components/SEO';

const SOSHome = () => {
  const { user } = useAuth();
  const { isActive } = useWakeLock(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyMembers, setNearbyMembers] = useState(0);
  const [familyGroupId, setFamilyGroupId] = useState<string | null>(null);
  
  // Device simulation state
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  
  const { circles, presences } = useCircleRealtime(familyGroupId);

  useEffect(() => {
    loadUserFamilyGroup();
    getCurrentLocation();
    // Simulate device for demo
    simulateDevice();
  }, [user]);

  const simulateDevice = () => {
    // Simulate a connected device for demo purposes
    setDeviceConnected(true);
    setHeartRate(72);
    setBatteryLevel(88);
    
    // Update heart rate occasionally
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const base = prev ?? 72;
        return Math.round(Math.max(60, Math.min(100, base + (Math.random() * 4 - 2))));
      });
      setBatteryLevel(prev => {
        const base = prev ?? 88;
        return Math.max(1, Math.min(100, base - (Math.random() < 0.05 ? 1 : 0)));
      });
    }, 3000);

    return () => clearInterval(interval);
  };

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

  const openDeviceManager = () => {
    // Trigger the device manager dialog
    window.dispatchEvent(new CustomEvent('open-device-settings'));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col p-4 relative overflow-hidden">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      {/* Background accent elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/15 blur-xl"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md mx-auto mt-6 mb-4 relative z-10 space-y-6">
        
        {/* Header & Emergency Button */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-xl">
          <CardContent className="p-6 text-center space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-emergency shadow-emergency">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-guardian tracking-tight">ICE SOS Lite</h1>
                <p className="text-neutral text-sm">Emergency Protection System</p>
              </div>
            </div>
            
            <SosButton />
            
            <div className="text-xs text-gray-600">
              Instantly alert emergency contacts and share location
            </div>
          </CardContent>
        </Card>

        {/* Device & Status Bar */}
        <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
          <CardContent className="p-4 space-y-4">
            
            {/* Device Status Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Bluetooth className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Pendant</span>
                </div>
                {deviceConnected ? (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <PlugZap className="h-3 w-3" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Ready</Badge>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={openDeviceManager}
                className="h-8 px-3 text-xs"
              >
                Manage
              </Button>
            </div>

            {/* Device Metrics */}
            {deviceConnected && (
              <div className="flex items-center justify-center gap-6 py-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <HeartPulse className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{heartRate} BPM</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded-full ${batteryLevel! > 20 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="font-medium">{batteryLevel}%</span>
                </div>
              </div>
            )}

            {/* Location Status */}
            <LocationPermissionPrompt />
            
          </CardContent>
        </Card>

        {/* Family Overview */}
        {familyGroupId && (
          <Card className="bg-white/95 backdrop-blur border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Family Status</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => window.open('/map-screen', '_blank')}
                  className="h-7 px-3 text-xs"
                >
                  <Map className="h-3 w-3 mr-1" />
                  View Map
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-blue-600">{presences.length}</p>
                  <p className="text-xs text-blue-600/70">Online</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-lg font-bold text-green-600">{nearbyMembers}</p>
                  <p className="text-xs text-green-600/70">Nearby</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Emergency Notice */}
      <div className="w-full max-w-md mx-auto relative z-10 mt-auto mb-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-red-800 text-xs font-medium">
            For life-threatening emergencies, call 911 immediately
          </p>
        </div>
      </div>
    </div>
  );
};

export default SOSHome;