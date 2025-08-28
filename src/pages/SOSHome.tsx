import React from 'react';
import SosButton from '@/components/SosButton';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Shield, BatteryCharging, Phone, MapPin, Clock } from 'lucide-react';
import SEO from '@/components/SEO';

const SOSHome = () => {
  // Keep screen awake while on SOS screen
  const { isActive } = useWakeLock(true);

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col p-6 relative overflow-hidden">
      <SEO title="Emergency SOS – ICE SOS Lite" description="Trigger emergency alerts and share live location with one tap." />
      
      {/* Background accent elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-white/20 blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-white/15 blur-xl"></div>
      </div>

      {/* Header Section */}
      <header className="w-full max-w-lg mx-auto pt-8 pb-6 relative z-10">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div className="text-center space-y-4">
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
          </div>
        </div>
      </header>

      {/* Main Action Section */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg mx-auto space-y-8 relative z-10">
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-white text-xl font-semibold">Ready to Help</h2>
          <p className="text-white/80 text-sm">Tap the button below in case of emergency</p>
        </div>
        
        <SosButton />
        
        <div className="text-center text-white/60 text-xs space-y-1">
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

      {/* Bottom Info Cards */}
      <footer className="w-full max-w-lg mx-auto space-y-4 pt-6 relative z-10">
        {/* Voice Activation Card */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <span className="text-white text-lg font-bold">🎤</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-guardian text-base">Voice Activation</h3>
              <p className="text-gray-700 text-sm">Say <span className="font-bold text-emergency">"Help Help Help"</span> to activate emergency mode</p>
            </div>
          </div>
        </div>

        {/* System Status Card */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200">
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
        </div>

        {/* Emergency Notice */}
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-gray-200">
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
      </footer>
    </div>
  );
};

export default SOSHome;
