import React, { useState, useEffect } from "react";
import { Shield, Phone, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
      return { status: "Active", color: "text-green-500", icon: "✓" };
    }
    return { status: "Inactive", color: "text-red-500", icon: "!" };
  };

  const protectionStatus = getProtectionStatus();

  return (
    <div className="bg-gradient-hero border-b border-white/10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Welcome Section */}
          <div className="flex items-center gap-4">
            <Shield className="h-12 w-12 text-emergency" />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {profile?.first_name || user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Member'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-medium ${protectionStatus.color}`}>
                  {protectionStatus.icon} Emergency Protection: {protectionStatus.status}
                </span>
              </div>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {/* Emergency SOS Button */}
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="emergency"
                size="emergency"
                onClick={handleEmergency}
                className="relative"
                aria-label="Emergency SOS Button - Press for immediate help"
              >
                <Phone className="h-8 w-8" />
              </Button>
              <span className="text-xs text-white/80">Emergency SOS</span>
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
        </div>

        {/* Profile Completion */}
        {profile && (
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Profile Completion</span>
              <span className="text-sm text-white/80">{profile.profile_completion_percentage || 0}%</span>
            </div>
            <Progress 
              value={profile.profile_completion_percentage || 0} 
              className="h-2 bg-white/20"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;