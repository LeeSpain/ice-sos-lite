import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, AlertTriangle, MessageCircle, Shield, Settings, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

const FamilyAppPage = () => {
  const { user } = useAuth();
  const { data: familyData, isLoading } = useFamilyMembers();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const activeFamilyMembers = familyData?.members?.filter(member => member.status === 'active') || [];
  const emergencyAlerts = 0; // TODO: Implement emergency alerts system

  const getLocationStatus = (member: any) => {
    // Mock location status - in real implementation, this would check recent location updates
    const isOnline = Math.random() > 0.3; // Mock 70% online rate
    return isOnline ? 'online' : 'offline';
  };

  const getLocationTime = (member: any) => {
    // Mock last seen time
    const minutes = Math.floor(Math.random() * 60);
    return minutes === 0 ? 'Now' : `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <SEO 
        title="Family Tracking App"
        description="Real-time family member location tracking and safety monitoring"
      />

      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center text-white py-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Family Tracker</h1>
          </div>
          <p className="text-white/80">Keep your family safe and connected</p>
        </div>

        {/* Status Overview */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Family Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Active Members</span>
              </div>
              <Badge variant="default" className="text-xs">
                {isLoading ? 'Loading...' : activeFamilyMembers.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Emergency Alerts</span>
              </div>
              <Badge variant={emergencyAlerts > 0 ? 'destructive' : 'default'} className="text-xs">
                {emergencyAlerts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to="/map">
            <Button className="w-full h-20 bg-blue-600 hover:bg-blue-700 text-white">
              <div className="flex flex-col items-center gap-2">
                <Map className="h-6 w-6" />
                <span className="text-sm">Live Map</span>
              </div>
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full h-20 bg-white/10 border-white/20 text-white hover:bg-white/20"
            disabled
          >
            <div className="flex flex-col items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              <span className="text-sm">Family Chat</span>
              <span className="text-xs opacity-60">Coming Soon</span>
            </div>
          </Button>
        </div>

        {/* Family Members List */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Family Members</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-white/20 rounded animate-pulse"></div>
                      <div className="h-3 bg-white/10 rounded animate-pulse w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeFamilyMembers.length === 0 ? (
              <div className="text-center py-8 text-white/60">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No family members added yet</p>
                <Link to="/family-dashboard/members" className="text-blue-400 text-xs hover:underline">
                  Add family members
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeFamilyMembers.map((member) => {
                  const locationStatus = getLocationStatus(member);
                  const lastSeen = getLocationTime(member);
                  
                  return (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => setSelectedMember(member.id)}
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          locationStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">
                            {member.name || member.email}
                          </p>
                          <Badge 
                            variant={locationStatus === 'online' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {locationStatus === 'online' ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <MapPin className="h-3 w-3" />
                          <span>Last seen {lastSeen}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Emergency Features */}
        <Card className="bg-white/10 border-white/20 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Safety Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Emergency Notifications</span>
              </div>
              <Badge variant="default" className="text-xs">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Geofence Alerts</span>
              </div>
              <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Settings Link */}
        <div className="flex gap-4">
          <Link to="/family-dashboard" className="flex-1">
            <Button variant="ghost" className="w-full text-white hover:bg-white/10">
              ← Family Dashboard
            </Button>
          </Link>
          <Link to="/family-dashboard/settings">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FamilyAppPage;