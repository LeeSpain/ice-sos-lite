import { useMemo, useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  const [decided, setDecided] = useState(false);

  // Check for Mapbox token only when explicitly requested
  const checkMapboxAvailability = useCallback(async () => {
    try {
      // Prefer fetching token from Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('get-mapbox-token');
      if (error) {
        console.warn('Mapbox token fetch error:', error);
      }
      const token = (data as any)?.token;
      if (token && typeof token === 'string' && token.length > 0) {
        setMapboxReady(true);
        return true;
      }

      // Fallback to VITE_MAPBOX_PUBLIC_TOKEN if present
      const viteToken = (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN;
      if (viteToken && viteToken !== 'undefined') {
        setMapboxReady(true);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Mapbox token not available, using Canvas');
      return false;
    }
  }, []);

  // Decide backend once on mount to avoid flicker
  useEffect(() => {
    let mounted = true;
    (async () => {
      const available = await checkMapboxAvailability();
      if (!mounted) return;
      if (available) {
        setMapBackend('mapbox');
      } else {
        setMapBackend('canvas');
      }
      setDecided(true);
    })();
    return () => { mounted = false; };
  }, [checkMapboxAvailability]);

  // Unified MapView component - choose backend deterministically
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
    const CanvasComponent = canvasProvider.MapView;
    const MapboxComponent = mapboxProvider.MapView;

    // While deciding, show a stable placeholder to avoid flicker
    if (!decided) {
      return (
        <div className={className || ''}>
          <div className="h-full w-full min-h-[300px] bg-muted/20 animate-pulse" />
        </div>
      );
    }

    // Lock backend: preferCanvas overrides, otherwise use decided backend
    const backend = preferCanvas ? 'canvas' : mapbackend;

    if (backend === 'mapbox') {
      return (
        <MapboxComponent
          className={className}
          markers={markers}
          center={center}
          zoom={zoom}
        />
      );
    }

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
  }, [canvasProvider, mapboxProvider, mapbackend, decided]);

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
    isLoading: !decided,
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