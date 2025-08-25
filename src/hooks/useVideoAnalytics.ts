import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export interface VideoAnalytics {
  video_id: string;
  video_title: string;
  total_views: number;
  total_watch_time_minutes: number;
  avg_watch_time_minutes: number;
  completion_rate: number;
  unique_viewers: number;
  top_countries: Array<{ country: string; count: number }>;
}

export interface VideoEvent {
  id: string;
  video_id: string;
  video_title: string;
  event_type: 'play' | 'pause' | 'ended' | 'seek' | 'click';
  watch_duration_seconds: number;
  video_position_seconds: number;
  user_location: {
    country?: string;
    region?: string;
    city?: string;
    lat?: number;
    lng?: number;
  };
  created_at: string;
  device_type: string;
  browser: string;
}

// Hook to fetch video analytics summary
export function useVideoAnalytics() {
  return useQuery({
    queryKey: ['video-analytics'],
    queryFn: async (): Promise<VideoAnalytics[]> => {
      try {
        const { data, error } = await supabase.rpc('get_video_analytics_summary');
        
        if (error) throw error;
        
        return (data || []).map((item: any) => ({
          video_id: item.video_id,
          video_title: item.video_title,
          total_views: parseInt(item.total_views) || 0,
          total_watch_time_minutes: parseFloat(item.total_watch_time_minutes) || 0,
          avg_watch_time_minutes: parseFloat(item.avg_watch_time_minutes) || 0,
          completion_rate: parseFloat(item.completion_rate) || 0,
          unique_viewers: parseInt(item.unique_viewers) || 0,
          top_countries: item.top_countries || []
        }));
      } catch (error) {
        console.error('Error fetching video analytics:', error);
        return [];
      }
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Hook to track video events
export function useVideoTracker() {
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState<any>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  // Get user location on mount
  useEffect(() => {
    const getUserLocation = async () => {
      try {
        // Try to get location from geolocation API first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Get country/region info via our edge function
              try {
                const { data: geoData } = await supabase.functions.invoke('geo-lookup');
                
                if (geoData?.success && geoData?.data) {
                  setUserLocation({
                    country: geoData.data.country,
                    region: geoData.data.region,
                    city: geoData.data.city,
                    lat: latitude,
                    lng: longitude,
                    ip: geoData.data.ip
                  });
                } else {
                  // Fallback with just coordinates
                  setUserLocation({
                    lat: latitude,
                    lng: longitude
                  });
                }
              } catch (error) {
                console.warn('Geo lookup failed, using coordinates only:', error);
                setUserLocation({
                  lat: latitude,
                  lng: longitude
                });
              }
            },
            async () => {
              // Fallback to IP-based location only
              try {
                const { data: geoData } = await supabase.functions.invoke('geo-lookup');
                
                if (geoData?.success && geoData?.data) {
                  setUserLocation({
                    country: geoData.data.country,
                    region: geoData.data.region,
                    city: geoData.data.city,
                    lat: geoData.data.latitude,
                    lng: geoData.data.longitude,
                    ip: geoData.data.ip
                  });
                }
              } catch (error) {
                console.warn('Could not determine user location:', error);
              }
            }
          );
        } else {
          // No geolocation, use IP-based location only
          try {
            const { data: geoData } = await supabase.functions.invoke('geo-lookup');
            
            if (geoData?.success && geoData?.data) {
              setUserLocation({
                country: geoData.data.country,
                region: geoData.data.region,
                city: geoData.data.city,
                lat: geoData.data.latitude,
                lng: geoData.data.longitude,
                ip: geoData.data.ip
              });
            }
          } catch (error) {
            console.warn('Could not determine user location:', error);
          }
        }
      } catch (error) {
        console.warn('Error getting user location:', error);
      }
    };

    getUserLocation();
  }, []);

  const trackVideoEvent = async (
    videoId: string,
    videoTitle: string,
    eventType: 'play' | 'pause' | 'ended' | 'seek' | 'click',
    options: {
      watchDuration?: number;
      videoPosition?: number;
      totalDuration?: number;
    } = {}
  ) => {
    try {
      // Detect device type and browser
      const userAgent = navigator.userAgent;
      const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) ? 'mobile' : 
                        /Tablet|iPad/.test(userAgent) ? 'tablet' : 'desktop';
      
      const browser = userAgent.includes('Chrome') ? 'Chrome' :
                     userAgent.includes('Firefox') ? 'Firefox' :
                     userAgent.includes('Safari') ? 'Safari' :
                     userAgent.includes('Edge') ? 'Edge' : 'Other';

      const eventData = {
        video_id: videoId,
        video_title: videoTitle,
        youtube_id: videoId.includes('youtube') ? videoId : null,
        user_id: user?.id || null,
        session_id: sessionId,
        event_type: eventType,
        watch_duration_seconds: options.watchDuration || 0,
        video_position_seconds: options.videoPosition || 0,
        total_video_duration_seconds: options.totalDuration || null,
        user_location: userLocation,
        ip_address: userLocation?.ip || null,
        user_agent: userAgent,
        referrer: document.referrer,
        device_type: deviceType,
        browser: browser
      };

      const { error } = await supabase
        .from('video_analytics')
        .insert(eventData);

      if (error) {
        console.error('Error tracking video event:', error);
      } else {
        console.log('🎥 Video event tracked:', { videoId, eventType });
      }
    } catch (error) {
      console.error('Error in video tracking:', error);
    }
  };

  return { trackVideoEvent, userLocation, sessionId };
}

// Hook to get recent video events
export function useVideoEvents(limit: number = 50) {
  return useQuery({
    queryKey: ['video-events', limit],
    queryFn: async (): Promise<VideoEvent[]> => {
      try {
        const { data, error } = await supabase
          .from('video_analytics')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        return (data || []).map(item => ({
          id: item.id,
          video_id: item.video_id,
          video_title: item.video_title,
          event_type: item.event_type as 'play' | 'pause' | 'ended' | 'seek' | 'click',
          watch_duration_seconds: item.watch_duration_seconds || 0,
          video_position_seconds: item.video_position_seconds || 0,
          user_location: (typeof item.user_location === 'object' && item.user_location && !Array.isArray(item.user_location)) ? item.user_location : {},
          created_at: item.created_at,
          device_type: item.device_type || 'unknown',
          browser: item.browser || 'unknown'
        }));
      } catch (error) {
        console.error('Error fetching video events:', error);
        return [];
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}