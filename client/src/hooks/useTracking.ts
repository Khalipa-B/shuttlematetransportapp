import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { TripLocation } from '@shared/schema';

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export function useTracking() {
  const { user } = useAuth();
  const { socket, isConnected, sendMessage, addMessageListener } = useSocket();
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve active trip for driver
  const { data: activeTrip } = useQuery({
    queryKey: ['/api/trips/active'],
    enabled: !!user && user.role === 'driver',
  });

  // Start tracking location
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    setError(null);

    // Start watching position
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;
        
        const locationData = {
          latitude,
          longitude,
          accuracy,
          timestamp,
        };
        
        setCurrentLocation(locationData);
        
        // If we're connected and have an active trip, send the location update
        if (isConnected && activeTrip?.id && user?.role === 'driver') {
          sendMessage({
            type: 'location_update',
            tripId: activeTrip.id,
            data: {
              latitude: String(latitude),
              longitude: String(longitude),
              timestamp: new Date().toISOString(),
            },
          });
        }
      },
      (err) => {
        if (err.code === 1) {
          setError('Location permission denied. Please enable location services.');
        } else if (err.code === 2) {
          setError('Location unavailable. Please try again later.');
        } else {
          setError('Error getting location: ' + err.message);
        }
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    setWatchId(id);
  }, [isConnected, sendMessage, activeTrip, user]);

  // Stop tracking location
  const stopTracking = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  }, [watchId]);

  // Start tracking automatically if user is a driver and has an active trip
  useEffect(() => {
    if (user?.role === 'driver' && activeTrip?.id && !isTracking) {
      startTracking();
    }
    
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [user, activeTrip, isTracking, startTracking, stopTracking]);

  // Add listener for location update messages (for parents tracking buses)
  useEffect(() => {
    if (user?.role === 'parent') {
      const removeListener = addMessageListener((event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'location_update' && data.tripId) {
            // Update local state with the latest bus location
            const locationUpdate: TripLocation = data.data;
            if (locationUpdate.latitude && locationUpdate.longitude) {
              // Process location update, maybe trigger refetch of query
              queryClient.invalidateQueries({ 
                queryKey: ['/api/trips', data.tripId, 'location'] 
              });
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      });
      
      return removeListener;
    }
  }, [user, addMessageListener]);

  return {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}
