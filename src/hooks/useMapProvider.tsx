import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  render: () => React.ReactNode;
}

interface MapViewProps {
  className?: string;
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

// Mapbox public token - this is safe to expose in frontend code
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xtOHBmejdlMDU1cTNlbzNreHl6Ymp6dyJ9.lZThXTz0JfP5WKFPaLUYOg";

export function useMapProvider() {
  const MapView: React.FC<MapViewProps> = ({ 
    className, 
    markers, 
    center, 
    zoom = 13 
  }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Calculate map center
    const mapCenter = center || (markers.length > 0 ? {
      lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
      lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
    } : { lat: 51.505, lng: -0.09 });

    // Initialize map
    useEffect(() => {
      if (!mapContainer.current || map.current) return;

      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [mapCenter.lng, mapCenter.lat],
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add attribution in bottom-right
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true
        }),
        'bottom-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
      });

      return () => {
        map.current?.remove();
        map.current = null;
        setMapLoaded(false);
      };
    }, []);

    // Update map center when center prop changes
    useEffect(() => {
      if (map.current && mapLoaded) {
        map.current.setCenter([mapCenter.lng, mapCenter.lat]);
      }
    }, [mapCenter.lat, mapCenter.lng, mapLoaded]);

    // Update markers
    useEffect(() => {
      if (!map.current || !mapLoaded) return;

      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach((markerData) => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.cursor = 'pointer';
        
        // Create a React root for the marker content
        import('react-dom/client').then(({ createRoot }) => {
          const root = createRoot(el);
          root.render(markerData.render());
        });

        // Create the marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Fit map to markers if we have them
      if (markers.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(m => bounds.extend([m.lng, m.lat]));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }, [markers, mapLoaded]);

    return (
      <div className={className || ""} style={{ position: "relative" }}>
        <div 
          ref={mapContainer} 
          className="absolute inset-0 rounded-lg"
          style={{ minHeight: "400px" }}
        />
        
        {!mapLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <div className="text-sm font-medium">Loading Map...</div>
              <div className="text-xs text-muted-foreground">
                Initializing Mapbox
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  return { MapView };
}