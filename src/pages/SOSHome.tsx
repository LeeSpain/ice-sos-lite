import React, { useState, useEffect } from 'react';
import SosButton from '@/components/SosButton';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Bluetooth, HeartPulse, PlugZap, MapPin } from 'lucide-react';
import SEO from '@/components/SEO';

const SOSHome = () => {
  const { user } = useAuth();
  const { isActive } = useWakeLock(true);
  
  // Device simulation state
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    checkLocationPermission();
    simulateDevice();
  }, [user]);

  const checkLocationPermission = () => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationGranted(result.state === 'granted');
      });
    } else if (navigator.geolocation) {
      // Fallback for browsers without permissions API
      navigator.geolocation.getCurrentPosition(
        () => setLocationGranted(true),
        () => setLocationGranted(false),
        { timeout: 1000 }
      );
    }
  };

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


  const openDeviceManager = () => {
    // Trigger the device manager dialog
    window.dispatchEvent(new CustomEvent('open-device-settings'));
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      {/* Settings Button - Top Right */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={openDeviceManager}
        className="absolute top-4 right-4 z-20 text-white/80 hover:text-white hover:bg-white/10"
      >
        <Settings className="h-5 w-5" />
      </Button>

      {/* Background accent elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/15 blur-xl"></div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-sm bg-white/95 backdrop-blur border-0 shadow-2xl relative z-10">
        <CardContent className="p-8 text-center space-y-8">
          
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-emergency shadow-emergency">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-guardian tracking-tight">ICE SOS</h1>
              <p className="text-muted-foreground text-sm font-medium">Emergency Protection</p>
            </div>
          </div>
          
          {/* SOS Button */}
          <div className="space-y-3">
            <SosButton />
            <p className="text-xs text-muted-foreground">
              Instantly alert emergency contacts
            </p>
          </div>

          {/* Status Metrics */}
          <div className="space-y-4">
            
            {/* Device Status */}
            {deviceConnected && (
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Bluetooth className="h-4 w-4" />
                  <span>Device Connected</span>
                </div>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-4 w-4 text-red-500" />
                    <span className="font-semibold text-foreground">{heartRate}</span>
                    <span className="text-xs text-muted-foreground">BPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${batteryLevel! > 20 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="font-semibold text-foreground">{batteryLevel}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Status */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${locationGranted ? 'bg-green-500' : 'bg-orange-500'}`}></div>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {locationGranted ? 'Location Ready' : 'Location Required'}
              </span>
            </div>

          </div>

          {/* Emergency Notice */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              For life-threatening emergencies, call <span className="font-semibold text-red-600">911</span> immediately
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SOSHome;