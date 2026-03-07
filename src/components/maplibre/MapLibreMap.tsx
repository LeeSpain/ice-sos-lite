import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { TILE_STYLES, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/types/map';
import { cn } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MapLibreMapProps {
  className?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  tileStyle?: keyof typeof TILE_STYLES;
  interactive?: boolean;
  attributionControl?: boolean;
  navigationControl?: boolean;
  onMapReady?: (map: maplibregl.Map) => void;
  onMoveEnd?: (center: [number, number], zoom: number) => void;
  onClick?: (lngLat: { lng: number; lat: number }) => void;
  children?: React.ReactNode;
}

export interface MapLibreMapRef {
  getMap: () => maplibregl.Map | null;
  flyTo: (center: [number, number], zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]], padding?: number) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

const MapLibreMap = forwardRef<MapLibreMapRef, MapLibreMapProps>(({
  className,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  minZoom = 2,
  maxZoom = 18,
  tileStyle = 'osm',
  interactive = true,
  attributionControl = true,
  navigationControl = true,
  onMapReady,
  onMoveEnd,
  onClick,
  children,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    flyTo: (c, z) => {
      mapRef.current?.flyTo({ center: c, zoom: z ?? mapRef.current.getZoom(), duration: 1200 });
    },
    fitBounds: (bounds, padding = 60) => {
      mapRef.current?.fitBounds(bounds, { padding, duration: 1200 });
    },
  }));

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const style = TILE_STYLES[tileStyle]?.style ?? TILE_STYLES.osm.style;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      minZoom,
      maxZoom,
      interactive,
      attributionControl,
    });

    if (navigationControl) {
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');
    }

    map.on('load', () => {
      mapRef.current = map;
      setIsReady(true);
      onMapReady?.(map);
    });

    if (onMoveEnd) {
      map.on('moveend', () => {
        const c = map.getCenter();
        onMoveEnd([c.lng, c.lat], map.getZoom());
      });
    }

    if (onClick) {
      map.on('click', (e) => {
        onClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      setIsReady(false);
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center/zoom when props change (after initial mount)
  useEffect(() => {
    if (!mapRef.current || !isReady) return;
    mapRef.current.flyTo({ center, zoom, duration: 800 });
  }, [center[0], center[1], zoom, isReady]);

  return (
    <div className={cn('relative w-full h-full', className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {/* Render children (overlay controls, panels, etc.) */}
      {isReady && children}
    </div>
  );
});

MapLibreMap.displayName = 'MapLibreMap';
export default MapLibreMap;
