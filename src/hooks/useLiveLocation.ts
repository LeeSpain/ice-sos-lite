import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LiveLocationData {
  id: string;
  user_id: string;
  family_group_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  battery_level?: number;
  status: 'online' | 'idle' | 'offline';
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export const useLiveLocation = (familyGroupId?: string) => {
  const [locations, setLocations] = useState<LiveLocationData[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Update user's location
  const updateLocation = useCallback(async (locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    battery_level?: number;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('live_locations')
        .upsert({
          user_id: user.id,
          family_group_id: familyGroupId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          heading: locationData.heading,
          speed: locationData.speed,
          battery_level: locationData.battery_level,
          status: 'online',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update location:', error);
      setError('Failed to update location');
    }
  }, [user, familyGroupId]);

  // Get current position and update location
  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  }, []);

  // Start live tracking
  const startTracking = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to start location tracking",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get initial position
      const position = await getCurrentPosition();
      
      // Get battery level if available
      let batteryLevel;
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          batteryLevel = Math.round(battery.level * 100);
        } catch (e) {
          // Battery API not supported
        }
      }

      await updateLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        battery_level: batteryLevel
      });

      setIsTracking(true);
      setError(null);

      toast({
        title: "Location Tracking Started",
        description: "Your location is now being shared with family members"
      });

    } catch (error) {
      console.error('Failed to start tracking:', error);
      setError(error instanceof Error ? error.message : 'Failed to start tracking');
      toast({
        title: "Location Access Required",
        description: "Please enable location access to use live tracking",
        variant: "destructive"
      });
    }
  }, [user, getCurrentPosition, updateLocation, toast]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('live_locations')
        .update({
          status: 'offline',
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setIsTracking(false);
      toast({
        title: "Location Tracking Stopped",
        description: "Your location is no longer being shared"
      });

    } catch (error) {
      console.error('Failed to stop tracking:', error);
      setError('Failed to stop tracking');
    }
  }, [user, toast]);

  // Fetch family locations
  const fetchLocations = useCallback(async () => {
    if (!familyGroupId) return;

    try {
      const { data, error } = await supabase
        .from('live_locations')
        .select('*')
        .eq('family_group_id', familyGroupId)
        .gte('last_seen', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

      if (error) throw error;
      setLocations((data || []).map(location => ({
        ...location,
        status: location.status as 'online' | 'idle' | 'offline'
      })));
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setError('Failed to fetch family locations');
    }
  }, [familyGroupId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!familyGroupId) return;

    const channel = supabase
      .channel('live-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_locations',
          filter: `family_group_id=eq.${familyGroupId}`
        },
        (payload) => {
          console.log('Location update:', payload);
          fetchLocations();
        }
      )
      .subscribe();

    // Initial fetch
    fetchLocations();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyGroupId, fetchLocations]);

  // Set up periodic location updates when tracking
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(async () => {
      try {
        const position = await getCurrentPosition();
        
        // Get battery level if available
        let batteryLevel;
        if ('getBattery' in navigator) {
          try {
            const battery = await (navigator as any).getBattery();
            batteryLevel = Math.round(battery.level * 100);
          } catch (e) {
            // Battery API not supported
          }
        }

        await updateLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading || undefined,
          speed: position.coords.speed || undefined,
          battery_level: batteryLevel
        });
      } catch (error) {
        console.error('Failed to update location:', error);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isTracking, getCurrentPosition, updateLocation]);

  return {
    locations,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateLocation,
    refetch: fetchLocations
  };
};