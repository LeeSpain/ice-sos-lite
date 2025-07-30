import React, { useState, useEffect } from "react";
import { Shield, Phone, LogOut, Clock, MapPin, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  profile: any;
  subscription: any;
}

const DashboardHeader = ({ profile, subscription }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: "22°C", condition: "Partly Cloudy", location: "Current Location" });

  useEffect(() => {
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Mock weather data - in production this would be from a weather API
    const loadWeather = () => {
      // Simulated weather data
      setWeather({
        temp: `${Math.floor(Math.random() * 10) + 18}°C`,
        condition: ["Sunny", "Partly Cloudy", "Cloudy", "Clear"][Math.floor(Math.random() * 4)],
        location: "Your Location"
      });
    };

    loadWeather();

    return () => {
      clearInterval(timeInterval);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEmergency = () => {
    console.log("Emergency SOS triggered!");
    // Emergency SOS functionality would be implemented here
  };

  const getProtectionStatus = () => {
    if (subscription?.subscribed) {
      return { status: "Active", color: "text-green-400", icon: "✓" };
    }
    return { status: "Inactive", color: "text-orange-400", icon: "!" };
  };

  const protectionStatus = getProtectionStatus();
  const userName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Member';
  const fullName = profile?.first_name && profile?.last_name 
    ? `${profile.first_name} ${profile.last_name}` 
    : userName;

  return (
    <div className="relative bg-gradient-hero shadow-2xl border-b border-white/10">
      {/* Professional Shadow Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-6 py-6 relative z-10">
        {/* Professional Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-white mb-1 drop-shadow-lg">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {userName}
            </h1>
            <p className="text-white/80 text-sm drop-shadow-sm">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right text-white/80">
              <p className="text-sm font-medium">{weather.temp}</p>
              <p className="text-xs">{weather.condition}</p>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Professional Status Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {/* Protection Status */}
          <div className="bg-emergency backdrop-blur-sm border border-emergency-glow/30 rounded-lg p-3 shadow-lg">
            <div className="text-center space-y-2">
              <div className={`w-3 h-3 rounded-full mx-auto ${protectionStatus.status === 'Active' ? 'bg-white shadow-sm' : 'bg-red-400'}`}></div>
              <div>
                <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Protection</p>
                <p className={`text-sm font-bold ${protectionStatus.status === 'Active' ? 'text-white' : 'text-red-300'}`}>
                  {protectionStatus.status}
                </p>
              </div>
            </div>
          </div>

          {/* Location Services */}
          <div className="bg-emergency backdrop-blur-sm border border-emergency-glow/30 rounded-lg p-3 shadow-lg">
            <div className="text-center space-y-2">
              <MapPin className={`w-4 h-4 mx-auto ${profile?.location_sharing_enabled ? 'text-white' : 'text-red-300'}`} />
              <div>
                <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Location</p>
                <p className={`text-sm font-bold ${profile?.location_sharing_enabled ? 'text-white' : 'text-red-300'}`}>
                  {profile?.location_sharing_enabled ? 'On' : 'Off'}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-emergency backdrop-blur-sm border border-emergency-glow/30 rounded-lg p-3 shadow-lg">
            <div className="text-center space-y-2">
              <div className="w-10 h-2 bg-white/20 rounded-full mx-auto overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${profile?.profile_completion_percentage || 0}%` }}
                ></div>
              </div>
              <div>
                <p className="text-xs font-medium text-white/90 uppercase tracking-wide">Profile</p>
                <p className="text-sm font-bold text-white">{profile?.profile_completion_percentage || 0}%</p>
              </div>
            </div>
          </div>

          {/* Emergency SOS */}
          <div className="bg-emergency border border-emergency-glow/50 rounded-lg p-3 shadow-xl">
            <div className="text-center space-y-2">
              <Button
                variant="emergency"
                size="sm"
                onClick={handleEmergency}
                className="w-8 h-8 rounded-full bg-white text-emergency hover:bg-gray-50 shadow-lg emergency-pulse mx-auto border-0"
                aria-label="Emergency SOS Button"
              >
                <Phone className="h-3.5 w-3.5" />
              </Button>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wide">SOS</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional ICE SOS Branding */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 backdrop-blur-sm rounded-md flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">ICE SOS</h2>
              <p className="text-xs text-white/70">Emergency Protection</p>
            </div>
          </div>
          <div className="text-right text-white/60">
            <p className="text-xs">Professional Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;