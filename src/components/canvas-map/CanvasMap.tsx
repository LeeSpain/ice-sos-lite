import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Loader2, RotateCcw, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tileCache } from './TileCache';
import { MarkerRenderer } from './MarkerRenderer';

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
  accuracy?: number;
  speed?: number;
  heading?: number;
  batteryLevel?: number;
}

interface Viewport {
  centerLat: number;
  centerLng: number;
  zoom: number;
  width: number;
  height: number;
}

interface RenderStats {
  tilesLoaded: number;
  totalTiles: number;
  cacheHitRate: number;
}

const CanvasMap: React.FC<CanvasMapProps> = ({
  className,
  center = { lat: 0, lng: 0 }, // Will be updated by parent component
  zoom = 13,
  markers = [],
  onMapReady,
  showControls = true,
  interactive = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRenderer = useRef<MarkerRenderer>(new MarkerRenderer());
  const animationFrameRef = useRef<number | null>(null);
  
  const [viewport, setViewport] = useState<Viewport>({
    centerLat: center.lat,
    centerLng: center.lng,
    zoom,
    width: 800,
    height: 600
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [mapMode, setMapMode] = useState<'standard' | 'satellite'>('standard');
  const [renderStats, setRenderStats] = useState<RenderStats>({ 
    tilesLoaded: 0, 
    totalTiles: 0, 
    cacheHitRate: 0 
  });
  const [showAccuracy, setShowAccuracy] = useState(true);

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

  // Professional map rendering with enhanced caching and optimizations
  const drawMap = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // High-performance canvas optimizations
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Clear canvas with professional ocean background
    const gradient = ctx.createLinearGradient(0, 0, 0, viewport.height);
    gradient.addColorStop(0, '#a7c8ed');
    gradient.addColorStop(1, '#8bb5e8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    const tileSize = 256;
    const centerTile = getTileCoords(viewport.centerLat, viewport.centerLng, Math.floor(viewport.zoom));
    const tilesNeeded = Math.ceil(Math.max(viewport.width, viewport.height) / tileSize) + 2;

    let tilesLoaded = 0;
    let totalTiles = 0;

    // Load and draw tiles using professional caching
    const tilePromises: Promise<void>[] = [];
    
    for (let dx = -tilesNeeded; dx <= tilesNeeded; dx++) {
      for (let dy = -tilesNeeded; dy <= tilesNeeded; dy++) {
        const tileX = centerTile.x + dx;
        const tileY = centerTile.y + dy;
        const tileZ = Math.floor(viewport.zoom);

        if (tileX < 0 || tileY < 0 || tileX >= Math.pow(2, tileZ) || tileY >= Math.pow(2, tileZ)) continue;

        totalTiles++;
        
        // Calculate tile position on screen
        const pixelX = ((tileX * tileSize) - (centerTile.x * tileSize)) + (viewport.width) / 2;
        const pixelY = ((tileY * tileSize) - (centerTile.y * tileSize)) + (viewport.height) / 2;

        // Check if tile is already loaded in cache
        const cachedTile = tileCache.getTile(tileX, tileY, tileZ, mapMode);
        
        if (cachedTile) {
          ctx.drawImage(cachedTile, pixelX, pixelY, tileSize, tileSize);
          tilesLoaded++;
        } else if (!tileCache.isLoading(tileX, tileY, tileZ, mapMode)) {
          // Load tile asynchronously
          const tilePromise = tileCache.loadTile(tileX, tileY, tileZ, mapMode).then((img) => {
            if (img && canvas.parentElement) { // Only draw if component still mounted
              requestAnimationFrame(() => drawMap()); // Redraw when tile loads
            }
          });
          tilePromises.push(tilePromise);
        }
      }
    }

    // Update loading state and stats
    const isMapLoading = tilesLoaded < totalTiles * 0.7; // Consider loaded when 70% tiles are ready
    setIsLoading(isMapLoading);
    
    const cacheStats = tileCache.getStats();
    setRenderStats({
      tilesLoaded,
      totalTiles,
      cacheHitRate: cacheStats.hitRate
    });

    // Render markers with professional rendering
    const markerPromises = markers.map(async (marker) => {
      const { x, y } = latLngToPixel(marker.lat, marker.lng);
      
      // Only render visible markers (with some buffer)
      if (x >= -50 && x <= viewport.width + 50 && y >= -50 && y <= viewport.height + 50) {
        await markerRenderer.current.renderMarker(
          ctx,
          {
            id: marker.id,
            lat: marker.lat,
            lng: marker.lng,
            name: marker.name,
            avatar: marker.avatar,
            status: marker.status,
            isEmergency: marker.isEmergency,
            accuracy: marker.accuracy,
            speed: marker.speed,
            heading: marker.heading,
            batteryLevel: marker.batteryLevel
          },
          x,
          y,
          viewport.zoom,
          {
            size: 32,
            showAccuracy,
            showLabel: true,
            animateStatus: true,
            pixelRatio: dpr
          }
        );
      }
    });

    // Wait for all markers to render
    await Promise.all(markerPromises);

    // Add subtle performance indicators
    if (showControls) {
      // Draw GPS accuracy indicator
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      const centerX = (viewport.width) / 2;
      const centerY = (viewport.height) / 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);

      // Performance debug info (development only)
      if (process.env.NODE_ENV === 'development') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = `10px monospace`;
        ctx.fillText(`FPS: ${Math.round(1000 / 33)} | Tiles: ${renderStats.tilesLoaded}/${renderStats.totalTiles}`, 10, 20);
      }
    }
  }, [viewport, markers, latLngToPixel, getTileCoords, showControls, mapMode, showAccuracy, renderStats]);

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

  // Update center when prop changes (only if not being dragged and significantly different)
  useEffect(() => {
    if (isDragging) return; // Don't update center while user is interacting
    
    const latDiff = Math.abs(viewport.centerLat - center.lat);
    const lngDiff = Math.abs(viewport.centerLng - center.lng);
    
    // Only update if center changed significantly (> 0.001 degrees ~ 100m)
    if (latDiff > 0.001 || lngDiff > 0.001 || viewport.zoom !== zoom) {
      setViewport(prev => ({
        ...prev,
        centerLat: center.lat,
        centerLng: center.lng,
        zoom
      }));
    }
  }, [center.lat, center.lng, zoom, viewport.centerLat, viewport.centerLng, viewport.zoom, isDragging]);

  // Update canvas size with high DPI support
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
          // Reset any previous transforms before applying DPR scale
          ctx.setTransform(1, 0, 0, 1, 0, 0);
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

  // Start marker animations
  useEffect(() => {
    markerRenderer.current.startAnimation();
    return () => markerRenderer.current.stopAnimation();
  }, []);

  // Smooth animation loop for redraws
  useEffect(() => {
    let lastDrawTime = 0;
    const fps = 30; // Limit to 30fps for performance
    const frameTime = 1000 / fps;

    const animate = (currentTime: number) => {
      if (currentTime - lastDrawTime >= frameTime) {
        drawMap();
        lastDrawTime = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Only animate if there are emergency markers or online users
    const hasAnimatedMarkers = markers.some(m => m.isEmergency || m.status === 'online');
    if (hasAnimatedMarkers) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      drawMap(); // Single draw for static markers
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [drawMap, markers]);

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
      
      {/* Loading indicator with progress */}
      {isLoading && (
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading tiles... ({renderStats.tilesLoaded}/{renderStats.totalTiles})</span>
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
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAccuracy(!showAccuracy)}
              className="w-8 h-8 p-0 bg-background/90 backdrop-blur-sm hover:bg-background"
              disabled={!interactive}
              title="Toggle accuracy circles"
            >
              <Layers className="h-4 w-4" />
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

          {/* Map info and cache stats */}
          <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-3 w-3" />
              <span>
                {viewport.centerLat.toFixed(4)}, {viewport.centerLng.toFixed(4)} • Z{Math.floor(viewport.zoom)}
              </span>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-muted-foreground/70">
                Cache: {Math.round(renderStats.cacheHitRate * 100)}% • {renderStats.tilesLoaded}/{renderStats.totalTiles}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasMap;