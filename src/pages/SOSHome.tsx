import React from 'react';
import SosButton from '@/components/SosButton';
import { LocationPermissionPrompt } from '@/components/LocationPermissionPrompt';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Shield, BatteryCharging, Phone, MapPin, Clock, Mic } from 'lucide-react';
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

      {/* Main Container Card */}
      <div className="w-full max-w-lg mx-auto mt-8 mb-6 relative z-10">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-elegant border border-white/20 space-y-8 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-subtle opacity-50 rounded-3xl"></div>
          <div className="relative z-10">{/* Content wrapper for z-index */}
          
          {/* Header Section */}
          <header className="text-center space-y-5 animate-fade-in">
            <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gradient-emergency shadow-emergency transition-transform duration-300 hover:scale-105">
              <Shield className="h-9 w-9 text-white drop-shadow-sm" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-guardian tracking-tight text-shadow-sm">ICE SOS Lite</h1>
              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-primary/10 border border-primary/20">
                <p className="text-primary text-sm font-semibold">Emergency Protection System</p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed px-6 max-w-md mx-auto">
                Instantly alert your emergency contacts and share your precise location with one simple tap
              </p>
            </div>
          </header>

          {/* Divider */}
          <div className="border-t border-border/50"></div>

          {/* Main Action Section */}
          <main className="flex flex-col items-center space-y-6 animate-scale-in">
            <div className="text-center space-y-3">
              <h2 className="text-guardian text-xl font-semibold">Ready to Help</h2>
              <p className="text-muted-foreground text-sm">Tap the button below in case of emergency</p>
            </div>
            
            <SosButton />
            
            {/* Location Permission Status */}
            <LocationPermissionPrompt />
            
            <div className="text-center space-y-3">
              <p className="font-medium text-guardian text-sm">Quick Access Features</p>
              <div className="flex items-center justify-center gap-8 text-xs">
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 transition-all duration-200 hover:bg-primary/10">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-primary font-medium">Auto Call</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 transition-all duration-200 hover:bg-primary/10">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-primary font-medium">Location Share</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 transition-all duration-200 hover:bg-primary/10">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-primary font-medium">Real-time</span>
                </div>
              </div>
            </div>
          </main>

          {/* Divider */}
          <div className="border-t border-border/50"></div>

          {/* Voice Activation Section */}
          <div className="text-center space-y-4 p-4 rounded-2xl bg-gradient-primary/5 border border-primary/10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary shadow-glow transition-transform duration-300 hover:scale-110">
              <Mic className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-guardian text-base">Voice Activation</h3>
              <p className="text-muted-foreground text-sm">Say <span className="font-bold text-emergency px-2 py-1 rounded-md bg-emergency/10">"Help Help Help"</span> to activate emergency mode</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50"></div>

          {/* System Status Section */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/50">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isActive ? 'bg-wellness shadow-glow animate-pulse' : 'bg-warning'} transition-all duration-300`}>
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white' : 'bg-white/80'}`}></div>
              </div>
              <span className="text-sm font-semibold text-guardian">System Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-wellness/10">
                <BatteryCharging className="h-4 w-4 text-wellness" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{isActive ? 'Active & Protected' : 'Standby Mode'}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border/50"></div>

          {/* Emergency Notice Section */}
          <div className="text-center space-y-3 p-4 rounded-2xl bg-emergency/5 border border-emergency/20">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emergency/10 border border-emergency/20">
              <Phone className="h-4 w-4 text-emergency" />
              <span className="text-emergency font-semibold text-sm">Critical Emergency Notice</span>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm mx-auto">
              For life-threatening emergencies, always call your local emergency services (911, 112, etc.) immediately
            </p>
          </div>

          </div>{/* Close content wrapper */}
        </div>
      </div>
    </div>
  );
};

export default SOSHome;
