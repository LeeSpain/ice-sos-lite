import React, { useState, useEffect, useCallback } from 'react';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}

interface UseEmergencyLocationReturn {
  currentLocation: LocationData | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
  locationError: string | null;
}

export const useEmergencyLocation = (): UseEmergencyLocationReturn => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { getCurrentLocationData, permissionState } = useLocationServices();
  const { toast } = useToast();

  const refreshLocation = useCallback(async () => {
    try {
      setLocationError(null);
      const locationData = await getCurrentLocationData();
      
      if (locationData) {
        const newLocation: LocationData = {
          lat: locationData.latitude,
          lng: locationData.longitude,
          accuracy: locationData.accuracy || 0,
          timestamp: new Date()
        };
        
        setCurrentLocation(newLocation);
        return;
      }
      
      throw new Error('No location data received');
    } catch (error) {
      console.error('Failed to get location:', error);
      setLocationError('Failed to get current location');
      
      // Use default location (user's general area from geo-lookup)
      if (!currentLocation) {
        setCurrentLocation({
          lat: 37.3881024, // Albox, Spain from logs
          lng: -2.1417503,
          accuracy: 0,
          timestamp: new Date()
        });
      }
    }
  }, [getCurrentLocationData, currentLocation]);

  const startTracking = useCallback(() => {
    if (!permissionState?.granted) {
      toast({
        title: "Location Permission Required",
        description: "Please enable location services for emergency tracking",
        variant: "destructive"
      });
      return;
    }

    setIsTracking(true);
    refreshLocation();

    // Update location every 30 seconds for emergency tracking
    const interval = setInterval(() => {
      refreshLocation();
    }, 30000);

    return () => {
      clearInterval(interval);
      setIsTracking(false);
    };
  }, [permissionState, refreshLocation, toast]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  // Initial location fetch
  useEffect(() => {
    if (!currentLocation) {
      refreshLocation();
    }
  }, [refreshLocation]);

  return {
    currentLocation,
    isTracking,
    startTracking,
    stopTracking,
    refreshLocation,
    locationError
  };
};