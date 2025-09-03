import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundMapProps {
  className?: string;
}

export const BackgroundMap: React.FC<BackgroundMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Fetch Mapbox token
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        
        if (data?.token) {
          mapboxgl.accessToken = data.token;
        } else {
          // Fallback for development
          mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbTJ1NGRvN3UwM3d6MnNxcGhoOWJhd2ZwIn0.XSoLIv1rDp_bRgVS3KJ5-g';
        }

        // Initialize map
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-0.09, 51.505], // London coordinates
          zoom: 11,
          interactive: false, // Make it non-interactive
          attributionControl: false,
          logoPosition: 'bottom-left'
        });

        console.log('Background map initialized');

        // Disable all interactions
        map.current.dragPan.disable();
        map.current.scrollZoom.disable();
        map.current.boxZoom.disable();
        map.current.dragRotate.disable();
        map.current.keyboard.disable();
        map.current.doubleClickZoom.disable();
        map.current.touchZoomRotate.disable();

        // Add load event listener
        map.current.on('load', () => {
          console.log('Background map loaded successfully');
        });

      } catch (error) {
        console.error('Failed to initialize background map:', error);
      }
    };

    initializeMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div 
      className={`absolute inset-0 opacity-80 pointer-events-none ${className || ''}`}
      style={{ filter: 'blur(0.5px)' }}
    >
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />
      {/* Overlay gradient to blend with background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/20" />
    </div>
  );
};