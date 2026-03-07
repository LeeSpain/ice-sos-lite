import React, { useEffect, useState } from 'react';
import MapLibreMap from '@/components/maplibre/MapLibreMap';
import { useMapLibre } from '@/hooks/useMapLibre';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { useFamilyRole } from '@/hooks/useFamilyRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Users, RefreshCw } from 'lucide-react';
import type { MapMemberPoint, MarkerState } from '@/types/map';

interface FamilyLocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'live' | 'alert' | 'idle';
  lastSeen: string;
}

const FamilyLocationMap = () => {
  const { setMap, setMemberMarkers } = useMapLibre();
  const { getCurrentLocationData } = useLocationServices();
  const { data: familyRole } = useFamilyRole();
  const { data: familyData, isLoading, refetch } = useFamilyMembers(familyRole?.familyGroupId);
  const [familyLocations, setFamilyLocations] = useState<FamilyLocationData[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Mock function to generate family member locations
  const generateMockLocations = (members: any[]): FamilyLocationData[] => {
    const baseLocation = { lat: 40.7589, lng: -73.9851 };
    return members.map((member) => ({
      id: member.id,
      name: member.name || member.email,
      lat: baseLocation.lat + (Math.random() - 0.5) * 0.01,
      lng: baseLocation.lng + (Math.random() - 0.5) * 0.01,
      status: (Math.random() > 0.8 ? 'alert' : Math.random() > 0.6 ? 'idle' : 'live') as 'live' | 'alert' | 'idle',
      lastSeen: Math.random() > 0.7 ? 'Now' : `${Math.floor(Math.random() * 30)}m ago`
    }));
  };

  useEffect(() => {
    if (familyData?.members) {
      setFamilyLocations(generateMockLocations(familyData.members));
    }
  }, [familyData]);

  useEffect(() => {
    getCurrentLocationData().then((location) => {
      if (location) {
        setUserLocation([location.longitude, location.latitude]);
      }
    }).catch(() => {});
  }, [getCurrentLocationData]);

  // Push members to MapLibre layer
  useEffect(() => {
    const statusMap: Record<string, MarkerState> = { live: 'normal', alert: 'urgent', idle: 'warning' };
    const members: MapMemberPoint[] = familyLocations.map(loc => ({
      id: loc.id,
      userId: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      name: loc.name,
      state: statusMap[loc.status] || 'offline',
    }));
    setMemberMarkers(members);
  }, [familyLocations, setMemberMarkers]);

  const handleRefreshLocations = () => {
    refetch();
    if (familyData?.members) {
      setFamilyLocations(generateMockLocations(familyData.members));
    }
  };

  if (isLoading) {
    return (
      <Card className="h-96 bg-white/10 border-white/20 text-white">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 border-white/20 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Family Locations
          </CardTitle>
          <Button
            onClick={handleRefreshLocations}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 rounded-b-lg overflow-hidden relative">
          <MapLibreMap
            className="w-full h-full rounded-b-lg"
            center={userLocation || [-73.9851, 40.7589]}
            zoom={14}
            navigationControl={false}
            onMapReady={setMap}
          />
        </div>

        {familyLocations.length === 0 && (
          <div className="p-6 text-center text-white/60">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No family members with location sharing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FamilyLocationMap;
