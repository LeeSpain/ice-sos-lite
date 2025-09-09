import { useMemo } from 'react';
import CanvasMap from '@/components/canvas-map/CanvasMap';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  render: () => React.ReactNode;
}

interface MapViewProps {
  className?: string;
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapReady?: () => void;
}

export const useCanvasMap = () => {
  // Memoize the MapView component to prevent unnecessary re-renders
  const MapView = useMemo(() => {
    return ({ className, markers = [], center, zoom = 13, onMapReady }: MapViewProps) => {
      return (
        <CanvasMap
          className={className}
          markers={markers}
          center={center}
          zoom={zoom}
          onMapReady={onMapReady}
        />
      );
    };
  }, []);

  return {
    MapView,
    isLoading: false,
    error: null
  };
};