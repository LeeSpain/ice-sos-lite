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
  const [mapbackend, setMapBackend] = useState<'canvas' | 'mapbox' | 'auto'>('auto');
  const [mapboxReady, setMapboxReady] = useState(false);
  const [mapboxTimeout, setMapboxTimeout] = useState(false);

  // Monitor Mapbox readiness with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (mapbackend === 'auto') {
      // Set a timeout for Mapbox to be ready
      timeoutId = setTimeout(() => {
        if (!mapboxReady) {
          console.log('Mapbox timeout - falling back to Canvas');
          setMapboxTimeout(true);
          setMapBackend('canvas');
        }
      }, 800); // 800ms timeout for Mapbox to initialize
      
      // Check if Mapbox token is available
      const checkMapboxToken = async () => {
        try {
          const response = await fetch('/api/mapbox-token');
          if (response.ok) {
            setMapboxReady(true);
            setMapBackend('mapbox');
          } else {
            throw new Error('Token fetch failed');
          }
        } catch (error) {
          console.log('Mapbox token unavailable, using Canvas');
          setMapBackend('canvas');
        }
      };
      
      checkMapboxToken();
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [mapbackend, mapboxReady]);

  // Unified MapView component using JSX for stability
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
    
    // Force Canvas if preferred or if we decided to use Canvas
    const useCanvas = preferCanvas || mapbackend === 'canvas' || mapboxTimeout;
    
    if (useCanvas) {
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
    }

    // Use Mapbox if ready and no preference for Canvas
    if (mapbackend === 'mapbox' && mapboxReady) {
      const MapboxComponent = mapboxProvider.MapView;
      return (
        <MapboxComponent
          className={className}
          markers={markers}
          center={center}
          zoom={zoom}
        />
      );
    }
    
    // Loading state while determining backend
    return (
      <div className={`${className || "h-full w-full"} flex items-center justify-center bg-muted/20`}>
        <div className="text-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }, [mapboxProvider, canvasProvider, mapbackend, mapboxReady, mapboxTimeout]);

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
    isLoading: mapbackend === 'auto' && !mapboxReady && !mapboxTimeout,
    error: mapboxTimeout ? 'Mapbox unavailable' : null,
    hasMapboxToken: mapboxReady,
    currentBackend: mapbackend,
    switchToCanvas,
    switchToMapbox,
    mapboxProvider,
    canvasProvider
  };
};