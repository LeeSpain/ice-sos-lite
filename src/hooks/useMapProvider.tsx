import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Layers, MapPin } from "lucide-react";

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
  const MapView: React.FC<MapViewProps> = React.memo(({ className, markers, center, zoom = 13 }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [mapboxToken, setMapboxToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const [currentStyle, setCurrentStyle] = useState<MapStyle>(MAP_STYLES[2]); // Default to Streets
    const [isLoaded, setIsLoaded] = useState(false);

    // Fetch Mapbox token - singleton pattern to prevent multiple fetches
    useEffect(() => {
      if (mapboxgl.accessToken) return; // Don't fetch if already set
      
      const fetchMapboxToken = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('get-mapbox-token');
          let token = (data as any)?.token as string | undefined;
          if (error) {
            console.warn('Mapbox token function error:', error);
          }

          // Fallback to VITE_MAPBOX_PUBLIC_TOKEN if function didn't return
          if (!token) {
            const viteToken = (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN;
            if (viteToken && viteToken !== 'undefined') {
              token = viteToken as string;
            }
          }

          if (token) {
            setMapboxToken(token);
            mapboxgl.accessToken = token;
            setTokenError(null);
          } else {
            setTokenError('Failed to load map token');
          }
        } catch (err) {
          console.error('Failed to fetch Mapbox token:', err);
          const viteToken = (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN;
          if (viteToken && viteToken !== 'undefined') {
            setMapboxToken(viteToken);
            mapboxgl.accessToken = viteToken;
            setTokenError(null);
          } else {
            setTokenError('Failed to load map token');
          }
        }
      };
      
      fetchMapboxToken();
    }, []); // Empty dependency array - fetch once only

    // Initialize map only once when token is available
    useEffect(() => {
      if (!mapContainer.current || !mapboxgl.accessToken || map.current) return;
      
      // Calculate center from markers or use provided center
      const mapCenter = center || (markers.length > 0 ? {
        lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
        lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
      } : { lat: 37.3838, lng: -2.1424 }); // Default to user's location

      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: currentStyle.style,
          center: [mapCenter.lng, mapCenter.lat],
          zoom: zoom,
          attributionControl: false,
          antialias: true
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Wait for map to load before showing markers
        map.current.on('load', () => {
          setIsLoaded(true);
          updateMapMarkers();
          // Ensure correct sizing after initial render
          map.current?.resize();
        });

        // Surface style/source errors clearly instead of rendering a blank map
        map.current.on('error', (e) => {
          const message = (e as any)?.error?.message || '';
          if (typeof message === 'string' && (message.toLowerCase().includes('unauthorized') || message.includes('401') || message.includes('403'))) {
            setTokenError('Map authorization failed');
          } else {
            setTokenError('Map failed to load');
          }
          console.error('Mapbox error:', e);
        });

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setTokenError('Map initialization failed');
      }

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    }, [mapboxgl.accessToken, currentStyle.style]); // Only reinit on token or style change

    // Update center when it changes - only once per significant change
    const centerKey = center ? `${center.lat.toFixed(4)}_${center.lng.toFixed(4)}` : null;
    const [lastCenterKey, setLastCenterKey] = useState<string | null>(null);
    
    useEffect(() => {
      if (!map.current || !center?.lat || !center?.lng || centerKey === lastCenterKey) return;
      
      setLastCenterKey(centerKey);
      
      const timeoutId = setTimeout(() => {
        if (map.current && center.lat && center.lng) {
          map.current.easeTo({
            center: [center.lng, center.lat],
            duration: 800,
            essential: true
          });
        }
      }, 200);

      return () => clearTimeout(timeoutId);
    }, [centerKey]);

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

    // Update markers when they change - prevent loops
    const markersKey = markers.map(m => `${m.id}_${m.lat.toFixed(4)}_${m.lng.toFixed(4)}`).join('|');
    const [lastMarkersKey, setLastMarkersKey] = useState<string>('');
    
    useEffect(() => {
      if (markersKey === lastMarkersKey) return;
      
      setLastMarkersKey(markersKey);
      updateMapMarkers();
    }, [markersKey]);

    if (tokenError) {
      return (
        <div className={`${className || "h-full w-full"} flex items-center justify-center bg-muted/20 backdrop-blur-sm`} style={{ minHeight: '400px' }}>
          <div className="text-center p-4">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Map temporarily unavailable</p>
            <p className="text-xs text-muted-foreground/70">
              {tokenError.includes('fetch') 
                ? 'Please check your connection and try again' 
                : 'Loading map services...'}
            </p>
          </div>
        </div>
      );
    }

    if (!mapboxgl.accessToken) {
      return (
        <div className={`${className || "h-full w-full"} flex items-center justify-center bg-muted/20 backdrop-blur-sm`} style={{ minHeight: '400px' }}>
          <div className="text-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative ${className || "h-full w-full"}`} style={{ minHeight: '400px' }}>
        {/* Static image fallback while vector tiles load */}
        {!isLoaded && mapboxToken && (
          (() => {
            const fbCenter = center || (markers.length > 0
              ? {
                  lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
                  lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length,
                }
              : { lat: 37.7749, lng: -122.4194 });
            const staticUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${fbCenter.lng},${fbCenter.lat},${zoom ?? 13}/1280x720?access_token=${mapboxToken}`;
            return (
              <img
                src={staticUrl}
                alt="Map loading preview"
                className="absolute inset-0 w-full h-full object-cover"
                aria-hidden
              />
            );
          })()
        )}

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
  });
  
  return { MapView };
}