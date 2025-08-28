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
      <header className="w-full max-w-md mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-white/90 flex items-center justify-center shadow">
            <Shield className="h-6 w-6 text-emergency" />
          </div>
          <h1 className="text-2xl font-bold text-white">ICE SOS</h1>
        </div>
        <p className="text-white/80 text-sm">Tap to alert contacts and share live location</p>
      </header>

      <main className="w-full max-w-md flex flex-col items-center gap-6">
        <SosButton />
        <div className="text-center text-white/80 text-xs">
          <p>Voice activation supported: say “Help Help Help”</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <BatteryCharging className="h-3 w-3" />
            <span>{isActive ? 'Screen wake lock active' : 'Screen may sleep'}</span>
          </div>
        </div>
      </main>

      <footer className="mt-10 text-center text-white/60 text-xs">
        <p>If this is a life-threatening emergency, call your local emergency number.</p>
      </footer>
    </div>
  );
};

export default SOSHome;
