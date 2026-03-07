import React, { useEffect, useMemo, useState } from 'react';
import MapLibreMap from '@/components/maplibre/MapLibreMap';
import { useMapLibre } from '@/hooks/useMapLibre';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import type { MapMemberPoint, MarkerState } from '@/types/map';

interface FamilyLiveMapProps {
  className?: string;
  familyGroupId?: string;
}

const FamilyLiveMap: React.FC<FamilyLiveMapProps> = ({ className, familyGroupId }) => {
  const { setMap, setMemberMarkers } = useMapLibre();
  const { getCurrentLocationData, requestLocationPermission, permissionState, isGettingLocation } = useLocationServices();
  const { locations } = useLiveLocation(familyGroupId);

  const [center, setCenter] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(15);

  // Get user's current location on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const loc = await getCurrentLocationData();
        if (mounted && loc) {
          setCenter([loc.longitude, loc.latitude]);
          setZoom(16);
        }
      } catch {
        // silently fail — map will show default
      }
    })();
    return () => { mounted = false; };
  }, [getCurrentLocationData]);

  // Convert live locations to MapMemberPoint[]
  const members: MapMemberPoint[] = useMemo(() => {
    return (locations || []).map(l => ({
      id: `member-${l.user_id}`,
      userId: l.user_id,
      lat: l.latitude,
      lng: l.longitude,
      state: (l.status === 'online' ? 'normal' : l.status === 'away' ? 'warning' : 'offline') as MarkerState,
    }));
  }, [locations]);

  // Push to MapLibre source
  useEffect(() => {
    setMemberMarkers(members);
  }, [members, setMemberMarkers]);

  const handleUseMyLocation = async () => {
    const ok = await requestLocationPermission();
    if (!ok) return;
    const loc = await getCurrentLocationData();
    if (loc) {
      setCenter([loc.longitude, loc.latitude]);
      setZoom(16);
    }
  };

  if (!center) {
    return (
      <div className={`min-h-[600px] ${className || ''}`}>
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <p className="text-sm opacity-80">Waiting for your location...</p>
          <button
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-opacity disabled:opacity-50"
          >
            {permissionState.granted ? 'Recenter to my location' : 'Use my location'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[600px] ${className || ''}`}>
      <MapLibreMap
        className="h-full min-h-[600px] w-full"
        center={center}
        zoom={zoom}
        onMapReady={setMap}
      />
    </div>
  );
};

export default FamilyLiveMap;
