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
    <div className="min-h-screen bg-gradient-to-b from-red-500 to-red-600 flex items-center justify-center p-4 relative overflow-hidden">
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

      {/* Main Card */}
      <Card className="w-full max-w-sm bg-white border-0 shadow-2xl relative z-10 rounded-3xl">
        <CardContent className="p-8 text-center space-y-6">
          
          {/* Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-red-900 tracking-tight">ICE SOS</h1>
              <p className="text-gray-600 font-medium">Emergency Response System</p>
            </div>
          </div>

          {/* Emergency Plan Section */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
              <span className="text-sm font-medium text-gray-700">Emergency Plan:</span>
              <Badge variant="outline" className="text-xs bg-white border-gray-300">Basic Contacts</Badge>
            </div>
            
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Emergency contacts will be called sequentially</p>
                <p className="text-xs text-gray-500">Contacts called one-by-one until someone answers (15-second intervals)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">
              <span className="text-lg">⚠️</span>
              <span className="font-medium">Always call 112/911 first for life-threatening emergencies</span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="space-y-3">
            {/* Voice Status */}
            <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg py-2 px-4">
              <span className="text-sm font-medium text-gray-700">🎤 Voice OFF</span>
            </div>

            {/* Location Status */}
            <div className="flex items-center justify-center gap-2 bg-green-100 rounded-lg py-2 px-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <MapPin className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">GPS location sharing enabled</span>
            </div>

            {/* Device Status */}
            {deviceConnected && (
              <div className="bg-gray-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700">
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
          </div>
          
          {/* SOS Button */}
          <div className="space-y-3">
            <SosButton />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-red-600">Emergency SOS</p>
              <p className="text-sm text-gray-600">Tap to alert emergency contacts with GPS location</p>
              <p className="text-sm font-medium text-gray-800">Emergency Alert Ready</p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default SOSHome;