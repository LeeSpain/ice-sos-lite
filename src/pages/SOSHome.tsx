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
import { FamilyContactsList } from '@/components/sos/FamilyContactsList';

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
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-orange-600 flex items-center justify-center p-4 relative overflow-hidden">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-white/5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Main Card */}
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl relative z-10 rounded-3xl overflow-hidden">
        <CardContent className="p-8 text-center space-y-8 relative">
          
          {/* Settings Button - Top Right of Card */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.dispatchEvent(new CustomEvent('open-device-settings'))}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-8 w-8 transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Header with enhanced styling */}
          <div className="space-y-4 pt-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-lg opacity-30"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-xl">
                <Shield className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-800 to-red-600 bg-clip-text text-transparent tracking-tight">
                ICE SOS
              </h1>
              <p className="text-gray-600 font-medium text-lg">Emergency Response System</p>
              <div className="w-16 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>
          </div>

          {/* Device Status with enhanced styling */}
          {deviceConnected && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Bluetooth className="h-4 w-4 text-blue-600" />
                <span>Device Connected</span>
              </div>
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                    <HeartPulse className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-gray-800 text-lg">{heartRate}</span>
                    <span className="text-xs text-gray-600">BPM</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    batteryLevel! > 20 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}>
                    <PlugZap className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-gray-800 text-lg">{batteryLevel}%</span>
                    <span className="text-xs text-gray-600">Battery</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* SOS Button with enhanced spacing */}
          <div className="py-4">
            <SosButton />
          </div>

          {/* Family Contacts List */}
          <div className="pt-4 border-t border-gray-100">
            <FamilyContactsList />
          </div>

        </CardContent>
      </Card>
      
      {/* Device Manager */}
      <DeviceManagerButton />
    </div>
  );
};

export default SOSHome;