import React, { useState, useEffect } from 'react';
import Map from '@/components/ui/map';
import { useQuery } from '@tanstack/react-query';
import { useTracking } from '@/hooks/useTracking';
import { useToast } from '@/hooks/use-toast';
import { 
  Bus,
  BusStop,
  TripLocation, 
  Route as BusRoute, 
  Trip 
} from '@shared/schema';

interface BusMapProps {
  tripId?: number;
  busId?: number;
  routeId?: number;
  showRoute?: boolean;
  showStops?: boolean;
  showSchool?: boolean;
  showHome?: boolean;
  onBusLocationUpdate?: (location: TripLocation) => void;
  className?: string;
}

const BusMap: React.FC<BusMapProps> = ({
  tripId,
  busId,
  routeId,
  showRoute = true,
  showStops = true,
  showSchool = true,
  showHome = true,
  onBusLocationUpdate,
  className = '',
}) => {
  const { toast } = useToast();
  const { currentLocation } = useTracking();
  const [mapCenter, setMapCenter] = useState({ latitude: 40.7128, longitude: -74.006 });
  const [mapZoom, setMapZoom] = useState(12);
  
  // Fetch trip data if tripId is provided
  const { data: trip, isLoading: isLoadingTrip } = useQuery({
    queryKey: ['/api/trips', tripId],
    enabled: !!tripId,
  });

  // Fetch bus data if busId is provided
  const { data: bus } = useQuery({
    queryKey: ['/api/buses', busId || (trip as Trip)?.busId],
    enabled: !!busId || !!(trip as Trip)?.busId,
  });

  // Fetch route data if routeId is provided
  const { data: route } = useQuery({
    queryKey: ['/api/routes', routeId || (trip as Trip)?.routeId],
    enabled: !!routeId || !!(trip as Trip)?.routeId,
  });

  // Fetch stops for the route
  const { data: stops } = useQuery({
    queryKey: ['/api/routes', routeId || (trip as Trip)?.routeId, 'stops'],
    enabled: showStops && (!!routeId || !!(trip as Trip)?.routeId),
  });

  // Fetch the latest location update for the trip
  const { 
    data: location, 
    isLoading: isLoadingLocation
  } = useQuery({
    queryKey: ['/api/trips', tripId, 'location'],
    enabled: !!tripId,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
  });

  // If we have a location update, pass it up to the parent component
  useEffect(() => {
    if (location && onBusLocationUpdate) {
      onBusLocationUpdate(location);
    }
  }, [location, onBusLocationUpdate]);

  // Center map on bus location when it updates
  useEffect(() => {
    if (location) {
      setMapCenter({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      });
    }
  }, [location]);

  // Prepare markers for the map
  const markers = React.useMemo(() => {
    const result = [];
    
    // Add bus marker
    if (location) {
      result.push({
        id: 'bus',
        type: 'bus' as const,
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        label: bus ? `Bus ${(bus as Bus).busNumber}` : 'School Bus',
        status: 'active' as const,
      });
    }
    
    // Add stop markers
    if (showStops && stops && Array.isArray(stops)) {
      stops.forEach((stop: BusStop) => {
        if (stop.latitude && stop.longitude) {
          result.push({
            id: `stop-${stop.id}`,
            type: 'stop' as const,
            latitude: parseFloat(stop.latitude),
            longitude: parseFloat(stop.longitude),
            label: stop.name,
          });
        }
      });
    }
    
    // Add school marker
    if (showSchool && route) {
      const schoolStop = (stops as BusStop[])?.find((stop) => stop.name.toLowerCase().includes('school'));
      if (schoolStop && schoolStop.latitude && schoolStop.longitude) {
        result.push({
          id: 'school',
          type: 'school' as const,
          latitude: parseFloat(schoolStop.latitude),
          longitude: parseFloat(schoolStop.longitude),
          label: 'School',
        });
      }
    }
    
    // Add home marker if we're showing it and there's a stop named "Home"
    if (showHome) {
      const homeStop = (stops as BusStop[])?.find((stop) => stop.name.toLowerCase().includes('home'));
      if (homeStop && homeStop.latitude && homeStop.longitude) {
        result.push({
          id: 'home',
          type: 'home' as const,
          latitude: parseFloat(homeStop.latitude),
          longitude: parseFloat(homeStop.longitude),
          label: 'Home',
        });
      }
    }
    
    return result;
  }, [location, bus, stops, showStops, showSchool, showHome, route]);

  // Prepare route line
  const routeLine = React.useMemo(() => {
    if (!showRoute || !stops || !Array.isArray(stops) || stops.length < 2) {
      return undefined;
    }
    
    // Sort stops by sequence
    const sortedStops = [...stops].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
    
    // Create route line from stops
    return sortedStops
      .filter((stop) => stop.latitude && stop.longitude)
      .map((stop) => ({
        latitude: parseFloat(stop.latitude!),
        longitude: parseFloat(stop.longitude!),
      }));
  }, [stops, showRoute]);

  const handleMarkerClick = (marker: any) => {
    setMapCenter({
      latitude: marker.latitude,
      longitude: marker.longitude,
    });
    setMapZoom(14);
  };

  // If we're still loading and have no data, show a loading state
  if ((isLoadingTrip || isLoadingLocation) && !location) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-blue mx-auto mb-4"></div>
          <p className="text-gray-500">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <Map
      center={mapCenter}
      zoom={mapZoom}
      markers={markers}
      route={routeLine}
      onMarkerClick={handleMarkerClick}
      className={className}
    />
  );
};

export default BusMap;
