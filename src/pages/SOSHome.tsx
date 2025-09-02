import React, { useState, useEffect } from 'react';
import SosButton from '@/components/SosButton';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Bluetooth, HeartPulse, PlugZap, MapPin, Phone } from 'lucide-react';
import SEO from '@/components/SEO';
import DeviceManagerButton from '@/components/devices/DeviceManagerButton';

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


  return (
    <div className="min-h-screen bg-gradient-to-b from-red-500 to-red-600 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      {/* Main Card */}
      <Card className="w-full max-w-sm bg-white border-0 shadow-2xl relative z-10 rounded-3xl">
        <CardContent className="p-8 text-center space-y-6 relative">
          
          {/* Settings Button - Top Right of Card */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-device-settings'))}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Header */}
          <div className="space-y-4 pt-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-red-900 tracking-tight">ICE SOS</h1>
              <p className="text-gray-600 font-medium">Emergency Response System</p>
            </div>
          </div>

          {/* Device Status */}
          {deviceConnected && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Bluetooth className="h-4 w-4" />
                <span>Device Connected</span>
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-red-500" />
                  <span className="font-bold text-gray-800">{heartRate}</span>
                  <span className="text-xs text-gray-600">BPM</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${batteryLevel! > 20 ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                  <span className="font-bold text-gray-800">{batteryLevel}%</span>
                </div>
              </div>
            </div>
          )}
          
          {/* SOS Button */}
          <div className="space-y-3">
            <SosButton />
          </div>

        </CardContent>
      </Card>
      
      {/* Device Manager */}
      <DeviceManagerButton />
    </div>
  );
};

export default SOSHome;