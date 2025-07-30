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
    <div className="bg-gradient-hero border-b border-white/10">
      <div className="container mx-auto px-4 py-8">
        {/* Top Status Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          {/* Time and Weather Info */}
          <div className="flex items-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-lg font-semibold">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              <span className="text-sm">{weather.temp} • {weather.condition}</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Main Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Welcome Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Good {currentTime.getHours() < 12 ? 'Morning' : currentTime.getHours() < 18 ? 'Afternoon' : 'Evening'}, {userName}
                </h1>
                <p className="text-white/80 text-lg">
                  Welcome to your ICE SOS Emergency Protection Dashboard
                </p>
              </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${protectionStatus.status === 'Active' ? 'bg-green-400' : 'bg-orange-400'}`}></div>
                  <div>
                    <p className="text-white font-medium">Emergency Protection</p>
                    <p className={`text-sm ${protectionStatus.color}`}>
                      {protectionStatus.status}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-white/80" />
                  <div>
                    <p className="text-white font-medium">Location Services</p>
                    <p className="text-sm text-white/80">
                      {profile?.location_sharing_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Emergency SOS Section */}
          <div className="flex flex-col items-center justify-center">
            <Card className="bg-white/5 backdrop-blur-sm border-white/20 p-8 text-center">
              <h3 className="text-white font-semibold mb-4 text-lg">Emergency Response</h3>
              <div className="flex flex-col items-center gap-4">
                <Button
                  variant="emergency"
                  size="emergency"
                  onClick={handleEmergency}
                  className="relative w-24 h-24 rounded-full shadow-2xl"
                  aria-label="Emergency SOS Button - Press for immediate help"
                >
                  <Phone className="h-10 w-10" />
                </Button>
                <div>
                  <p className="text-white font-medium">Emergency SOS</p>
                  <p className="text-xs text-white/70">Press for immediate assistance</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Profile Completion */}
        {profile && (
          <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-white font-semibold">Profile Completion</h3>
                <p className="text-white/70 text-sm">Complete your profile for full emergency protection</p>
              </div>
              <span className="text-2xl font-bold text-white">{profile.profile_completion_percentage || 0}%</span>
            </div>
            <Progress 
              value={profile.profile_completion_percentage || 0} 
              className="h-3 bg-white/20"
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;