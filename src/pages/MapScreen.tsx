import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { CircleSwitcher } from "@/components/map/CircleSwitcher";
import { MemberSheet } from "@/components/map/MemberSheet";
import MapLibreMap, { MapLibreMapRef } from "@/components/maplibre/MapLibreMap";
import MapShell from "@/components/maplibre/MapShell";
import MapSummaryBar from "@/components/maplibre/MapSummaryBar";
import MapSOSButton from "@/components/maplibre/MapSOSButton";
import MapEventFeed from "@/components/maplibre/MapEventFeed";
import { useMapLibre } from "@/hooks/useMapLibre";
import { useLocationServices } from "@/hooks/useLocationServices";
import { useEnhancedCircleRealtime } from "@/hooks/useEnhancedCircleRealtime";
import { useBackgroundLocation } from "@/hooks/useBackgroundLocation";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MapMemberPoint, MarkerState } from "@/types/map";

type Presence = {
  user_id: string;
  lat: number;
  lng: number;
  last_seen?: string;
  battery?: number | null;
  is_paused?: boolean;
};

function presenceToState(p: Presence): MarkerState {
  if (p.is_paused) return 'offline';
  if (!p.last_seen) return 'offline';
  const diff = Date.now() - new Date(p.last_seen).getTime();
  if (diff < 2 * 60 * 1000) return 'normal';
  if (diff < 60 * 60 * 1000) return 'warning';
  return 'offline';
}

export default function MapScreen() {
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Presence | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [zoom, setZoom] = useState(15);

  const mapComponentRef = useRef<MapLibreMapRef>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const { setMap, setMemberMarkers, fitToPoints } = useMapLibre();
  const { getCurrentLocationData, requestLocationPermission, permissionState, isGettingLocation } = useLocationServices();
  const { presences, circles, recentEvents, refresh } = useEnhancedCircleRealtime(activeCircleId);
  const { permission, isTracking, requestPermission } = useBackgroundLocation(locationEnabled);
  const { toast } = useToast();

  // Auto-select first circle
  useEffect(() => {
    if (circles.length > 0 && !activeCircleId) {
      setActiveCircleId(circles[0].id);
    }
  }, [circles, activeCircleId]);

  // Get user's current location on mount
  useEffect(() => {
    if (center !== null) return;
    let mounted = true;
    (async () => {
      try {
        const loc = await getCurrentLocationData();
        if (mounted && loc) {
          setCenter([loc.longitude, loc.latitude]);
          setZoom(16);
        }
      } catch {
        if (mounted && presences.length > 0) {
          const sums = presences.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), { lat: 0, lng: 0 });
          setCenter([sums.lng / presences.length, sums.lat / presences.length]);
        }
      }
    })();
    return () => { mounted = false; };
  }, [getCurrentLocationData, center, presences]);

  // Update member markers via GeoJSON source when presences change
  useEffect(() => {
    const map = mapComponentRef.current?.getMap();
    if (!map) return;

    // Remove old HTML markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Update GeoJSON layer
    const members: MapMemberPoint[] = presences.map(p => ({
      id: p.user_id,
      userId: p.user_id,
      lat: p.lat,
      lng: p.lng,
      state: presenceToState(p),
      battery: p.battery,
      isPaused: p.is_paused,
    }));
    setMemberMarkers(members);

    // Add click handler for member points
    if (!map.getLayer('members-points')) return;

    // We set cursor and click once per map init — handled below in onMapReady
  }, [presences, setMemberMarkers]);

  const handleMapReady = (map: maplibregl.Map) => {
    setMap(map);

    // Click handler for member circle markers
    map.on('click', 'members-points', (e) => {
      const feature = e.features?.[0];
      if (!feature || feature.geometry.type !== 'Point') return;
      const userId = feature.properties?.userId;
      const p = presences.find(pr => pr.user_id === userId);
      if (p) setSelectedMember(p);
    });
    map.on('mouseenter', 'members-points', () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', 'members-points', () => { map.getCanvas().style.cursor = ''; });
  };

  const handleUseMyLocation = async () => {
    const ok = await requestLocationPermission();
    if (!ok) return;
    const loc = await getCurrentLocationData();
    if (loc) {
      const c: [number, number] = [loc.longitude, loc.latitude];
      setCenter(c);
      setZoom(16);
      mapComponentRef.current?.flyTo(c, 16);
    }
  };

  const handleLocationToggle = async () => {
    if (!locationEnabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (granted) setLocationEnabled(true);
    } else {
      setLocationEnabled(!locationEnabled);
    }
  };

  const triggerSOS = async () => {
    try {
      const { useEmergencySOS } = await import("@/hooks/useEmergencySOS");
      const { triggerEmergencySOS } = useEmergencySOS();
      await triggerEmergencySOS();
      toast({
        title: "Family SOS Triggered",
        description: "Emergency alert sent to your family circle with current location.",
        variant: "destructive"
      });
    } catch (error) {
      console.error("SOS error:", error);
      toast({
        title: "SOS Failed",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Loading state — waiting for location
  if (!center) {
    return (
      <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm opacity-80">Waiting for your location...</p>
        <Button
          onClick={handleUseMyLocation}
          disabled={isGettingLocation}
          className="inline-flex items-center gap-2"
        >
          <Target className="w-4 h-4" />
          {permissionState.granted ? 'Recenter to my location' : 'Use my location'}
        </Button>
      </div>
    );
  }

  return (
    <MapShell
      summaryBar={
        <MapSummaryBar
          memberCount={presences.length}
          isTracking={isTracking}
          onToggleTracking={handleLocationToggle}
          onRefresh={refresh}
          onCenterOnMe={handleUseMyLocation}
          topSlot={
            <CircleSwitcher
              circles={circles}
              activeId={activeCircleId}
              onChange={setActiveCircleId}
            />
          }
        />
      }
      bottomLeft={<MapEventFeed events={recentEvents} />}
      bottomRight={<MapSOSButton onTrigger={triggerSOS} />}
    >
      <MapLibreMap
        ref={mapComponentRef}
        center={center}
        zoom={zoom}
        className="h-full min-h-[600px] w-full"
        onMapReady={handleMapReady}
      />

      <MemberSheet
        presence={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </MapShell>
  );
}
