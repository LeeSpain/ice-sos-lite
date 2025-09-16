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
  const [hasMapboxError, setHasMapboxError] = useState(false);

  // Monitor mapbox errors - useMapProvider doesn't return error, so track internal state
  useEffect(() => {
    // Assume mapbox works by default unless we explicitly switch to canvas
  }, []);

  // Unified MapView component that intelligently switches between backends
  const MapView = useMemo(() => {
    return ({ 
      className, 
      markers = [], 
      center, 
      zoom = 13, 
      onMapReady, 
      showControls = true, 
      interactive = true,
      preferCanvas = false
    }: UnifiedMapViewProps) => {
      
      // Use Canvas if preferred or if Mapbox fails
      if (preferCanvas || hasMapboxError) {
        const CanvasComponent = canvasProvider.MapView as any;
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

      // Default to Mapbox with Canvas fallback - adjust props for mapbox
      const mapboxProps = {
        className,
        markers: markers || [],
        center,
        zoom,
      } as any;

      // Support both return shapes from useMapProvider: either an object with MapView or the component directly
      const MapboxComponent = (mapboxProvider as any)?.MapView || (mapboxProvider as any);
      if (typeof MapboxComponent !== 'function' && typeof MapboxComponent !== 'object') {
        // Fallback to Canvas if Mapbox component isn't available
        const CanvasComponent = canvasProvider.MapView as any;
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

      return <MapboxComponent {...mapboxProps} />;
    };
  }, [mapboxProvider, canvasProvider, hasMapboxError]);

  const switchToCanvas = useCallback(() => {
    setHasMapboxError(true);
    return canvasProvider.MapView;
  }, [canvasProvider]);

  const switchToMapbox = useCallback(() => {
    setHasMapboxError(false);
    return mapboxProvider.MapView;
  }, [mapboxProvider]);

  return {
    MapView,
    isLoading: canvasProvider.isLoading,
    error: hasMapboxError ? 'Mapbox unavailable' : null,
    hasMapboxToken: !hasMapboxError,
    switchToCanvas,
    switchToMapbox,
    mapboxProvider,
    canvasProvider
  };
};