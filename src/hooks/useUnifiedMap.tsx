import { useMemo, useCallback, useState, useEffect } from 'react';
import { useMapProvider } from './useMapProvider';
import { useCanvasMap } from './useCanvasMap';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  render: () => React.ReactNode;
}

interface UnifiedMapViewProps {
  className?: string;
  markers?: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapReady?: () => void;
  showControls?: boolean;
  interactive?: boolean;
  preferCanvas?: boolean;
}

export const useUnifiedMap = () => {
  const mapboxProvider = useMapProvider();
  const canvasProvider = useCanvasMap();
  const [mapbackend, setMapBackend] = useState<'canvas' | 'mapbox'>('canvas'); // Default to canvas for stability
  const [mapboxReady, setMapboxReady] = useState(false);

  // Check for Mapbox token only when explicitly requested
  const checkMapboxAvailability = useCallback(async () => {
    try {
      // Check if we have the MAPBOX_PUBLIC_TOKEN secret
      const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN;
      if (token && token !== 'undefined') {
        setMapboxReady(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Mapbox token not available, using Canvas');
      return false;
    }
  }, []);

  // Unified MapView component - always use Canvas for stability
  const MapView = useCallback(({ 
    className, 
    markers = [], 
    center, 
    zoom = 13, 
    onMapReady, 
    showControls = true, 
    interactive = true,
    preferCanvas = false
  }: UnifiedMapViewProps) => {
    
    // Always use Canvas for now to prevent flashing
    const CanvasComponent = canvasProvider.MapView;
    return (
      <CanvasComponent
        className={className}
        markers={markers}
        center={center}
        zoom={zoom}
        onMapReady={onMapReady}
        showControls={showControls}
        interactive={interactive}
      />
    );
  }, [canvasProvider]);

  const switchToCanvas = useCallback(() => {
    setMapBackend('canvas');
    return canvasProvider.MapView;
  }, [canvasProvider]);

  const switchToMapbox = useCallback(() => {
    if (mapboxReady) {
      setMapBackend('mapbox');
      return mapboxProvider.MapView;
    }
    return null;
  }, [mapboxProvider, mapboxReady]);

  return {
    MapView,
    isLoading: false, // No loading state needed since we always use Canvas
    error: null,
    hasMapboxToken: mapboxReady,
    currentBackend: mapbackend,
    switchToCanvas,
    switchToMapbox,
    checkMapboxAvailability,
    mapboxProvider,
    canvasProvider
  };
};