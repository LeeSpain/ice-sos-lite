import React from 'react';
import SosButton from '@/components/SosButton';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Shield, BatteryCharging } from 'lucide-react';
import SEO from '@/components/SEO';


const SOSHome = () => {
  // Keep screen awake while on SOS screen
  const { isActive } = useWakeLock(true);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      <header className="w-full max-w-md mb-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emergency flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-guardian">ICE SOS</h1>
          </div>
          <p className="text-neutral text-sm">Tap to alert contacts and share live location</p>
        </div>
      </header>

      <main className="w-full max-w-md flex flex-col items-center gap-6">
        <SosButton />
        
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 w-full">
          <div className="text-center text-neutral text-xs space-y-2">
            <p className="font-medium">Voice activation supported</p>
            <p className="text-muted-foreground">Say "Help Help Help" to activate</p>
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
              <BatteryCharging className="h-3 w-3 text-wellness" />
              <span className="text-xs">{isActive ? 'Screen wake lock active' : 'Screen may sleep'}</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 max-w-md">
          <p className="text-center text-neutral text-xs">
            If this is a life-threatening emergency, call your local emergency number.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SOSHome;
