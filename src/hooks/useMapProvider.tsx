import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Layers } from "lucide-react";

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

type MapStyle = {
  id: string;
  name: string;
  style: string;
}

const MAP_STYLES: MapStyle[] = [
  { id: 'satellite', name: 'Satellite', style: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'terrain', name: 'Terrain', style: 'mapbox://styles/mapbox/outdoors-v12' },
  { id: 'streets', name: 'Streets', style: 'mapbox://styles/mapbox/streets-v12' },
  { id: 'light', name: 'Light', style: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark', name: 'Dark', style: 'mapbox://styles/mapbox/dark-v11' }
];

export function useMapProvider() {
  const MapView: React.FC<MapViewProps> = ({ className, markers, center, zoom = 13 }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapboxToken, setMapboxToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [currentStyle, setCurrentStyle] = useState<MapStyle>(MAP_STYLES[1]); // Default to terrain

    // Fetch Mapbox token
    useEffect(() => {
      const fetchMapboxToken = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('get-mapbox-token');
          if (error) throw error;
          
          if (data?.token) {
            setMapboxToken(data.token);
            mapboxgl.accessToken = data.token;
          } else {
            throw new Error('No token received');
          }
        } catch (error) {
          console.error('Failed to fetch Mapbox token:', error);
          setTokenError('Failed to load map token');
          // Fallback to demo token for development
          mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTJ1NGRvN3UwM3d6MnNxcGhoOWJhd2ZwIn0.XSoLIv1rDp_bRgVS3KJ5-g';
        }
      };
      
      fetchMapboxToken();
    }, []);

    // Initialize map only once
    useEffect(() => {
      if (!mapContainer.current || !mapboxgl.accessToken || map.current) return;
      
      // Calculate center from markers or use provided center
      const mapCenter = center || (markers.length > 0 ? {
        lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
      } : { lat: 51.505, lng: -0.09 });

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: currentStyle.style,
        center: [mapCenter.lng, mapCenter.lat],
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls only
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, [mapboxgl.accessToken]); // Only depend on access token

    // Update center when it changes without recreating the map
    useEffect(() => {
      if (!map.current || !center) return;
      
      map.current.easeTo({
        center: [center.lng, center.lat],
        duration: 1000
      });
    }, [center]);

    // Handle style changes separately without recreating the map
    const handleStyleChange = (style: MapStyle) => {
      setCurrentStyle(style);
      if (map.current) {
        map.current.setStyle(style.style);
        
        // Re-add markers after style loads
        map.current.once('styledata', () => {
          updateMapMarkers();
        });
      }
    };

    // Create a stable function to update markers
    const updateMapMarkers = React.useCallback(() => {
      if (!map.current) return;

      // Remove existing markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach(markerData => {
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'emergency-marker';
        el.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Create emergency marker styling
        if (markerData.id === 'current-location') {
          el.innerHTML = `
            <div style="
              width: 16px;
              height: 16px;
              background: #ef4444;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
              animation: pulse 2s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
              }
            </style>
          `;
        } else {
          el.innerHTML = `
            <div style="
              width: 16px;
              height: 16px;
              background: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
            "></div>
          `;
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat([markerData.lng, markerData.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers if there are multiple
      if (markers.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => {
          bounds.extend([marker.lng, marker.lat]);
        });
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }, [markers]);

    // Update markers when they change
    useEffect(() => {
      updateMapMarkers();
    }, [updateMapMarkers]);

    if (tokenError) {
      return (
        <div className={`${className || "h-full w-full"} flex items-center justify-center bg-muted`} style={{ minHeight: '400px' }}>
          <div className="text-center p-4">
            <p className="text-destructive font-medium">Map Error</p>
            <p className="text-sm text-muted-foreground">{tokenError}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className || "h-full w-full"}`} style={{ minHeight: '400px' }}>
        <div 
          ref={mapContainer} 
          className="absolute inset-0"
        />
        
        {/* Map Style Selector */}
        <div className="absolute top-4 left-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-background/90 backdrop-blur-sm">
                <Layers className="h-4 w-4 mr-2" />
                {currentStyle.name}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {MAP_STYLES.map((style) => (
                <DropdownMenuItem
                  key={style.id}
                  onClick={() => handleStyleChange(style)}
                  className={currentStyle.id === style.id ? "bg-accent" : ""}
                >
                  {style.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };
  
  return { MapView };
}