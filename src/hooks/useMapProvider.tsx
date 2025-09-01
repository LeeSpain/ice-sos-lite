import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';

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

export function useMapProvider() {
  const MapView: React.FC<MapViewProps> = ({ className, markers, center, zoom = 13 }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
      if (!mapContainer.current) return;

      // Initialize Mapbox
      mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTJ1NGRvN3UwM3d6MnNxcGhoOWJhd2ZwIn0.XSoLIv1rDp_bRgVS3KJ5-g';
      
      // Calculate center from markers or use provided center
      const mapCenter = center || (markers.length > 0 ? {
        lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
      } : { lat: 51.505, lng: -0.09 });

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [mapCenter.lng, mapCenter.lat],
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      return () => {
        map.current?.remove();
      };
    }, []);

    // Update markers when they change
    useEffect(() => {
      if (!map.current) return;

      // Remove existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach(markerData => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        
        // Render the custom marker component
        const markerComponent = markerData.render();
        if (markerComponent) {
          const tempDiv = document.createElement('div');
          // This is a simplified approach - in production you'd want to use ReactDOM.render
          el.innerHTML = '<div style="width: 40px; height: 40px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>';
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers if there are any
      if (markers.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => {
          bounds.extend([marker.lng, marker.lat]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }, [markers]);

    return (
      <div 
        ref={mapContainer} 
        className={className || "h-full w-full"}
        style={{ minHeight: '400px' }}
      />
    );
  };
  
  return { MapView };
}