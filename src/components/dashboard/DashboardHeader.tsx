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
            <h1 className="text-3xl font-light text-white mb-1 drop-shadow-lg">
              Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {userName}
            </h1>
            <p className="text-white/80 text-base drop-shadow-sm">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-white/70">{weather.temp} • {weather.condition}</p>
              <p className="text-xs text-white/60">{weather.location}</p>
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

        {/* Compact Status Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {/* Protection Status */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 mb-0.5">Protection</p>
                <p className={`text-sm font-semibold ${protectionStatus.status === 'Active' ? 'text-green-300' : 'text-red-300'}`}>
                  {protectionStatus.status}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${protectionStatus.status === 'Active' ? 'bg-green-400 shadow-glow' : 'bg-red-400'}`}></div>
            </div>
          </div>

          {/* Location Services */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/70 mb-0.5">Location</p>
                <p className={`text-sm font-semibold ${profile?.location_sharing_enabled ? 'text-green-300' : 'text-red-300'}`}>
                  {profile?.location_sharing_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <MapPin className={`h-3 w-3 ${profile?.location_sharing_enabled ? 'text-green-400' : 'text-red-400'}`} />
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <p className="text-xs font-medium text-white/70 mb-0.5">Profile</p>
                <p className="text-sm font-semibold text-white">{profile?.profile_completion_percentage || 0}%</p>
              </div>
            </div>
            <Progress 
              value={profile?.profile_completion_percentage || 0} 
              className="h-1 bg-white/20"
            />
          </div>

          {/* Emergency SOS */}
          <div className="bg-gradient-to-br from-green-500/90 to-green-600/90 backdrop-blur-sm rounded-lg p-3 text-white shadow-emergency border border-green-400/30">
            <div className="text-center">
              <p className="text-xs font-medium mb-2 text-green-100">Emergency</p>
              <Button
                variant="emergency"
                size="sm"
                onClick={handleEmergency}
                className="w-10 h-10 rounded-full bg-white text-green-600 hover:bg-green-50 shadow-lg mb-1 emergency-pulse"
                aria-label="Emergency SOS Button - Press for immediate help"
              >
                <Phone className="h-3 w-3" />
              </Button>
              <p className="text-xs text-green-100">SOS</p>
            </div>
          </div>
        </div>

        {/* Compact ICE SOS Branding */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/20">
          <div className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-md flex items-center justify-center">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white drop-shadow-sm">ICE SOS</h2>
            <p className="text-xs text-white/70">Emergency Protection Platform</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;