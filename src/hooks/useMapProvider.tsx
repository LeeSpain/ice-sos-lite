import React from "react";

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
    const mapCenter = center || (markers.length > 0 ? {
      lat: markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
      lng: markers.reduce((sum, m) => sum + m.lng, 0) / markers.length
    } : { lat: 51.505, lng: -0.09 });

    return (
      <div className={className || ""} style={{ position: "relative", background: "hsl(var(--muted))" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950">
          <div className="absolute inset-0 grid place-items-center text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="text-lg font-medium">Live Family Map</div>
              <div className="text-sm">
                Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </div>
              <div className="text-xs text-muted-foreground/70">
                Map integration pending (Mapbox/Google)
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-0 pointer-events-none">
          {markers.map((m, index) => {
            const x = 30 + (index * 15) % 40;
            const y = 30 + (index * 20) % 40;
            
            return (
              <div 
                key={m.id} 
                style={{ 
                  position: "absolute", 
                  left: `${x}%`, 
                  top: `${y}%`,
                  transform: "translate(-50%, -50%)"
                }}
              >
                <div className="pointer-events-auto">
                  {m.render()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return { MapView };
}