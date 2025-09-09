import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CanvasMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapReady?: () => void;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  render: () => React.ReactNode;
}

interface Viewport {
  centerLat: number;
  centerLng: number;
  zoom: number;
  width: number;
  height: number;
}

const CanvasMap: React.FC<CanvasMapProps> = ({
  className,
  center = { lat: 51.505, lng: -0.09 },
  zoom = 13,
  markers = [],
  onMapReady
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

  // Draw the map
  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, viewport.width, viewport.height);

    // Draw simple grid pattern as map tiles
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < viewport.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, viewport.height);
      ctx.stroke();
    }

    for (let y = 0; y < viewport.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(viewport.width, y);
      ctx.stroke();
    }

    // Draw markers
    markers.forEach(marker => {
      const { x, y } = latLngToPixel(marker.lat, marker.lng);
      
      if (x >= -20 && x <= viewport.width + 20 && y >= -20 && y <= viewport.height + 20) {
        // Draw marker background
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.fill();

        // Draw marker border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw center cross for debugging
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;
    const centerX = viewport.width / 2;
    const centerY = viewport.height / 2;
    ctx.beginPath();
    ctx.moveTo(centerX - 10, centerY);
    ctx.lineTo(centerX + 10, centerY);
    ctx.moveTo(centerX, centerY - 10);
    ctx.lineTo(centerX, centerY + 10);
    ctx.stroke();
  }, [viewport, markers, latLngToPixel]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    // Convert pixel movement to lat/lng movement
    const scale = Math.pow(2, viewport.zoom);
    const lngDelta = -deltaX / scale / 256 * 360;
    const latDelta = deltaY / scale / 256 * 180;

    setViewport(prev => ({
      ...prev,
      centerLat: Math.max(-85, Math.min(85, prev.centerLat + latDelta)),
      centerLng: ((prev.centerLng + lngDelta + 180) % 360) - 180
    }));

    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, viewport.zoom]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.5 : 0.5;
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(1, Math.min(18, prev.zoom + zoomDelta))
    }));
  }, []);

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
        className="absolute inset-0 cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(18, prev.zoom + 1) }))}
          className="w-8 h-8 bg-background border rounded flex items-center justify-center text-sm font-bold hover:bg-muted"
        >
          +
        </button>
        <button
          onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(1, prev.zoom - 1) }))}
          className="w-8 h-8 bg-background border rounded flex items-center justify-center text-sm font-bold hover:bg-muted"
        >
          −
        </button>
      </div>

      {/* Map info */}
      <div className="absolute bottom-4 left-4 bg-background/90 border rounded px-2 py-1 text-xs">
        Lat: {viewport.centerLat.toFixed(4)}, Lng: {viewport.centerLng.toFixed(4)}, Zoom: {viewport.zoom}
      </div>
    </div>
  );
};

export default CanvasMap;