import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, MessageSquare, Shield, ChevronDown, ChevronUp, Battery, Clock, CheckCircle2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import { useMapProvider } from '@/hooks/useMapProvider';
import FamilyMarker from '@/components/map/FamilyMarker';
import { cn } from '@/lib/utils';

interface FamilyLocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'live' | 'alert' | 'idle';
  lastSeen: string;
  location: string;
  battery: number;
  avatar?: string;
}

const FamilyAppPage = () => {
  const { user } = useAuth();
  const { data: familyRole } = useFamilyRole();
  const { data: familyData, isLoading } = useFamilyMembers(familyRole?.familyGroupId);
  const { MapView } = useMapProvider();
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);
  const [selectedTab, setSelectedTab] = useState('location');

  const activeFamilyMembers = familyData?.members?.filter(member => member.status === 'active') || [];

  // Generate mock location data for family members
  const generateFamilyLocations = (): FamilyLocationData[] => {
    const baseLocation = { lat: 40.7589, lng: -73.9851 };
    const locations = [
      'Home', 'Work', 'School', 'Gym', 'Coffee Shop', 'Park'
    ];
    
    return activeFamilyMembers.map((member, index) => ({
      id: member.id,
      name: member.name || member.email.split('@')[0],
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.02,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.02,
      status: index === 0 ? 'alert' : Math.random() > 0.7 ? 'idle' : 'live',
      lastSeen: Math.random() > 0.6 ? 'Now' : `${Math.floor(Math.random() * 30)}m ago`,
      location: locations[Math.floor(Math.random() * locations.length)],
      battery: Math.floor(Math.random() * 40) + 60, // 60-100%
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name || member.email}`
    }));
  };

  const familyLocations = generateFamilyLocations();

  const mapMarkers = familyLocations.map((location) => ({
    id: location.id,
    lat: location.lat,
    lng: location.lng,
    render: () => (
      <FamilyMarker
        id={location.id}
        name={location.name}
        avatar={location.avatar || ''}
        status={location.status}
      />
    )
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'alert': return 'bg-red-500';
      case 'idle': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live';
      case 'alert': return 'Alert';
      case 'idle': return 'Idle';
      default: return 'Offline';
    }
  };

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <SEO 
        title="Family Tracker - Live Map"
        description="Real-time family member location tracking with live map view"
      />

      {/* Top Header with Family Selector */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/95 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Select defaultValue="wakeman-family">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select family" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wakeman-family">Wakeman Family</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="absolute inset-0 pt-16">
        <MapView
          className="w-full h-full"
          markers={mapMarkers}
          center={{ lat: 40.7589, lng: -73.9851 }}
          zoom={13}
        />
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-24 left-4 right-4 z-20 flex gap-3 max-w-md mx-auto">
        <Button 
          className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg"
          onClick={() => {/* Handle check in */}}
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Check In
        </Button>
        <Link to="/sos-app" className="flex-1">
          <Button 
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Set Up SOS
          </Button>
        </Link>
      </div>

      {/* Bottom Sheet */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 z-30 bg-background rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out",
          bottomSheetExpanded ? "translate-y-0" : "translate-y-[calc(100%-120px)]"
        )}
        style={{ height: bottomSheetExpanded ? '70vh' : '120px' }}
      >
        {/* Sheet Handle */}
        <div 
          className="flex justify-center py-3 cursor-pointer"
          onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
        >
          <div className="w-12 h-1 bg-border rounded-full"></div>
        </div>

        {/* Sheet Header */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Family</h2>
              <Badge variant="secondary" className="text-xs">
                {familyLocations.length} members
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
            >
              {bottomSheetExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Family Members List */}
        <div className="px-6 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {familyLocations.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                      getStatusColor(member.status)
                    )}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium truncate">{member.name}</h3>
                      <Badge 
                        variant={member.status === 'live' ? 'default' : member.status === 'alert' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {getStatusText(member.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{member.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{member.lastSeen}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        <span>{member.battery}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-background border-t">
        <div className="flex items-center justify-around py-2 max-w-md mx-auto">
          {[
            { id: 'location', icon: MapPin, label: 'Location', active: true },
            { id: 'driving', icon: MessageSquare, label: 'Driving', active: false },
            { id: 'safety', icon: Shield, label: 'Safety', active: false },
            { id: 'membership', icon: Users, label: 'Membership', active: false },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0",
                selectedTab === tab.id 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              <span className="text-xs truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FamilyAppPage;