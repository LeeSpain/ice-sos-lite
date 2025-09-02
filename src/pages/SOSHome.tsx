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
        className="absolute top-6 right-6 z-20 text-white/90 hover:text-white hover:bg-white/10 rounded-full"
      >
        <Settings className="h-6 w-6" />
      </Button>

      {/* Background accent elements */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white/15 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-sm bg-white border-0 shadow-2xl relative z-10">
        <CardContent className="p-10 text-center space-y-8">
          
          {/* Header */}
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-emergency shadow-lg">
              <Shield className="h-12 w-12 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-guardian tracking-tight">ICE SOS</h1>
              <p className="text-muted-foreground font-medium">Emergency Response System</p>
            </div>
          </div>
          
          {/* SOS Button */}
          <div className="space-y-4">
            <SosButton />
            <p className="text-sm text-muted-foreground font-medium">
              Emergency Alert Ready
            </p>
          </div>

          {/* Status Metrics */}
          <div className="space-y-5">
            
            {/* Device Status */}
            {deviceConnected && (
              <div className="bg-muted/20 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                  <Bluetooth className="h-4 w-4" />
                  <span>Device Connected</span>
                </div>
                <div className="flex items-center justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-red-500" />
                    <span className="text-xl font-bold text-foreground">{heartRate}</span>
                    <span className="text-sm text-muted-foreground font-medium">BPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${batteryLevel! > 20 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                    <span className="text-xl font-bold text-foreground">{batteryLevel}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Location Status */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className={`w-3 h-3 rounded-full ${locationGranted ? 'bg-green-500' : 'bg-orange-500'} shadow-sm`}></div>
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {locationGranted ? 'Location Services Active' : 'Location Access Required'}
              </span>
            </div>

          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SOSHome;