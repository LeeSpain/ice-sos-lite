import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapReady?: () => void;
  showControls?: boolean;
  interactive?: boolean;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  render?: () => React.ReactNode;
  avatar?: string;
  name?: string;
  status?: 'online' | 'idle' | 'offline';
  isEmergency?: boolean;
}

interface Viewport {
  centerLat: number;
  centerLng: number;
  zoom: number;
  width: number;
  height: number;
}

interface Tile {
  x: number;
  y: number;
  z: number;
  image: HTMLImageElement | null;
  loading: boolean;
}

const CanvasMap: React.FC<CanvasMapProps> = ({
  className,
  center = { lat: 51.505, lng: -0.09 },
  zoom = 13,
  markers = [],
  onMapReady,
  showControls = true,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<Viewport>({
    centerLat: center.lat,
    centerLng: center.lng,
    zoom,
    width: 800,
    height: 600
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [tiles, setTiles] = useState<Map<string, Tile>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard');

  // Convert lat/lng to pixel coordinates
  const latLngToPixel = useCallback((lat: number, lng: number): { x: number; y: number } => {
    const scale = Math.pow(2, viewport.zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const x = (lng + 180) * (worldWidth / 360);
    const y = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    const viewportX = x - (viewport.centerLng + 180) * (worldWidth / 360) + viewport.width / 2;
    const viewportY = y - (1 - Math.log(Math.tan(viewport.centerLat * Math.PI / 180) + 1 / Math.cos(viewport.centerLat * Math.PI / 180)) / Math.PI) / 2 * worldHeight + viewport.height / 2;

    return { x: viewportX, y: viewportY };
  }, [viewport]);

  // Convert pixel coordinates to lat/lng
  const pixelToLatLng = useCallback((x: number, y: number): { lat: number; lng: number } => {
    const scale = Math.pow(2, viewport.zoom);
    const worldWidth = 256 * scale;
    const worldHeight = 256 * scale;

    const worldX = x - viewport.width / 2 + (viewport.centerLng + 180) * (worldWidth / 360);
    const worldY = y - viewport.height / 2 + (1 - Math.log(Math.tan(viewport.centerLat * Math.PI / 180) + 1 / Math.cos(viewport.centerLat * Math.PI / 180)) / Math.PI) / 2 * worldHeight;

    const lng = (worldX / worldWidth) * 360 - 180;
    const latRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY / worldHeight)));
    const lat = latRad * 180 / Math.PI;

    return { lat, lng };
  }, [viewport]);

  // Get tile coordinates from lat/lng and zoom
  const getTileCoords = useCallback((lat: number, lng: number, zoom: number) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    return { x, y, z: zoom };
  }, []);

  // Load OSM tile
  const loadTile = useCallback(async (x: number, y: number, z: number): Promise<HTMLImageElement | null> => {
    const tileKey = `${x}-${y}-${z}`;
    
    // Check if tile already exists
    const existingTile = tiles.get(tileKey);
    if (existingTile?.image) return existingTile.image;

    // Create new tile entry
    setTiles(prev => new Map(prev.set(tileKey, { x, y, z, image: null, loading: true })));

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise((resolve) => {
        img.onload = () => {
          setTiles(prev => new Map(prev.set(tileKey, { x, y, z, image: img, loading: false })));
          resolve(img);
        };
        img.onerror = () => {
          setTiles(prev => new Map(prev.set(tileKey, { x, y, z, image: null, loading: false })));
          resolve(null);
        };
        
        // Use OpenStreetMap tiles
        const baseUrl = mapMode === 'satellite' 
          ? `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
          : `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
        
        img.src = baseUrl;
      });
    } catch (error) {
      console.error('Failed to load tile:', error);
      setTiles(prev => new Map(prev.set(tileKey, { x, y, z, image: null, loading: false })));
      return null;
    }
  }, [tiles, mapMode]);

  // Draw professional map with OSM tiles
  const drawMap = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with ocean blue background
    ctx.fillStyle = '#a7c8ed';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const tileSize = 256;
    const scale = Math.pow(2, viewport.zoom);
    
    // Calculate tile bounds
    const centerTile = getTileCoords(viewport.centerLat, viewport.centerLng, Math.floor(viewport.zoom));
    const tilesNeeded = Math.ceil(Math.max(viewport.width, viewport.height) / tileSize) + 2;

    let tilesLoaded = 0;
    let totalTiles = 0;

    // Load and draw tiles
    for (let dx = -tilesNeeded; dx <= tilesNeeded; dx++) {
      for (let dy = -tilesNeeded; dy <= tilesNeeded; dy++) {
        const tileX = centerTile.x + dx;
        const tileY = centerTile.y + dy;
        const tileZ = Math.floor(viewport.zoom);

        if (tileX < 0 || tileY < 0 || tileX >= Math.pow(2, tileZ) || tileY >= Math.pow(2, tileZ)) continue;

        totalTiles++;
        
        // Calculate tile position on screen
        const pixelX = ((tileX * tileSize) - (centerTile.x * tileSize)) + viewport.width / 2;
        const pixelY = ((tileY * tileSize) - (centerTile.y * tileSize)) + viewport.height / 2;

        const tileKey = `${tileX}-${tileY}-${tileZ}`;
        const tile = tiles.get(tileKey);

        if (tile?.image) {
          ctx.drawImage(tile.image, pixelX, pixelY, tileSize, tileSize);
          tilesLoaded++;
        } else if (!tile?.loading) {
          loadTile(tileX, tileY, tileZ);
        }
      }
    }

    // Update loading state
    setIsLoading(tilesLoaded < totalTiles * 0.5);

    // Draw markers with professional styling
    markers.forEach(marker => {
      const { x, y } = latLngToPixel(marker.lat, marker.lng);
      
      if (x >= -40 && x <= viewport.width + 40 && y >= -40 && y <= viewport.height + 40) {
        // Draw marker shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(x + 2, y + 2, 14, 0, 2 * Math.PI);
        ctx.fill();

        // Draw marker background based on status/type
        let markerColor = '#3b82f6';
        if (marker.isEmergency) {
          markerColor = '#ef4444';
        } else if (marker.status === 'online') {
          markerColor = '#10b981';
        } else if (marker.status === 'idle') {
          markerColor = '#f59e0b';
        } else if (marker.status === 'offline') {
          markerColor = '#6b7280';
        }

        ctx.fillStyle = markerColor;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, 2 * Math.PI);
        ctx.fill();

        // Draw marker border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw inner icon or status indicator
        if (marker.isEmergency) {
          // Emergency icon
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('!', x, y + 5);
        } else if (marker.status === 'online') {
          // Online pulse
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw name label if provided
        if (marker.name) {
          ctx.fillStyle = '#000000';
          ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          const textY = y + 25;
          
          // Text background
          const textWidth = ctx.measureText(marker.name).width;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x - textWidth/2 - 4, textY - 12, textWidth + 8, 16);
          
          // Text
          ctx.fillStyle = '#1f2937';
          ctx.fillText(marker.name, x, textY);
        }
      }
    });

    // Draw center cross for debugging (smaller and less intrusive)
    if (showControls) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.lineWidth = 1;
      const centerX = viewport.width / 2;
      const centerY = viewport.height / 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 5, centerY);
      ctx.lineTo(centerX + 5, centerY);
      ctx.moveTo(centerX, centerY - 5);
      ctx.lineTo(centerX, centerY + 5);
      ctx.stroke();
    }
  }, [viewport, markers, latLngToPixel, tiles, getTileCoords, loadTile, showControls, mapMode]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [interactive]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    // Convert pixel movement to lat/lng movement with smoother calculation
    const scale = Math.pow(2, viewport.zoom);
    const worldSize = 256 * scale;
    
    const lngDelta = -deltaX / worldSize * 360;
    const latRad = viewport.centerLat * Math.PI / 180;
    const latDelta = deltaY / worldSize * 360 * Math.cos(latRad);

    setViewport(prev => ({
      ...prev,
      centerLat: Math.max(-85, Math.min(85, prev.centerLat + latDelta)),
      centerLng: ((prev.centerLng + lngDelta + 180) % 360) - 180
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, viewport, interactive]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.5 : 0.5;
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(3, Math.min(18, prev.zoom + zoomDelta))
    }));
  }, [interactive]);

  // Reset to center
  const resetToCenter = useCallback(() => {
    setViewport(prev => ({
      ...prev,
      centerLat: center.lat,
      centerLng: center.lng,
      zoom: zoom
    }));
  }, [center, zoom]);

  // Update center when prop changes
  useEffect(() => {
    setViewport(prev => ({
      ...prev,
      centerLat: center.lat,
      centerLng: center.lng,
      zoom
    }));
  }, [center.lat, center.lng, zoom]);

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const canvas = canvasRef.current;
        const dpr = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
        }
        
        setViewport(prev => ({
          ...prev,
          width: rect.width,
          height: rect.height
        }));
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw map when viewport or markers change
  useEffect(() => {
    drawMap();
  }, [drawMap]);

  // Call onMapReady when component is ready
  useEffect(() => {
    if (onMapReady) {
      const timer = setTimeout(onMapReady, 100);
      return () => clearTimeout(timer);
    }
  }, [onMapReady]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden rounded-lg border", className)}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0",
          interactive ? "cursor-move" : "cursor-default"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading map...</span>
        </div>
      )}
      
      {/* Controls */}
      {showControls && (
        <>
          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(18, prev.zoom + 1) }))}
              className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              disabled={!interactive}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(3, prev.zoom - 1) }))}
              className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              disabled={!interactive}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={resetToCenter}
              className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              disabled={!interactive}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Map mode toggle */}
          <div className="absolute top-4 left-4 flex gap-1">
            <Button
              variant={mapMode === 'standard' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setMapMode('standard')}
              className="text-xs h-7 px-2 bg-background/90 backdrop-blur-sm"
              disabled={!interactive}
            >
              Map
            </Button>
            <Button
              variant={mapMode === 'satellite' ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setMapMode('satellite')}
              className="text-xs h-7 px-2 bg-background/90 backdrop-blur-sm"
              disabled={!interactive}
            >
              Satellite
            </Button>
          </div>

          {/* Map info */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>
                {viewport.centerLat.toFixed(4)}, {viewport.centerLng.toFixed(4)} • Z{Math.floor(viewport.zoom)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasMap;