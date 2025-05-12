import { useEffect, useRef, useState } from 'react';
import { Bus, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createStaticMapUrl } from '@/lib/mapUtils';

interface MapDisplayProps {
  latitude: string;
  longitude: string;
  busMarkers?: Array<{
    id: number;
    latitude: string;
    longitude: string;
    label?: string;
    status?: 'active' | 'delayed' | 'maintenance' | 'inactive';
  }>;
  stops?: Array<{
    id: number;
    name: string;
    latitude: string;
    longitude: string;
    order: number;
  }>;
  height?: string;
  showRoute?: boolean;
  center?: boolean;
  onRefresh?: () => void;
}

export default function MapDisplay({
  latitude,
  longitude,
  busMarkers = [],
  stops = [],
  height = '300px',
  showRoute = true,
  center = false,
  onRefresh
}: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  
  // Use a static map URL as a fallback
  const staticMapUrl = createStaticMapUrl(latitude, longitude);

  useEffect(() => {
    const loadMap = async () => {
      try {
        // This is a placeholder for actual map implementation
        // In a real implementation, you would load a map library (e.g., Mapbox or Leaflet)
        // and initialize the map with the container ref
        
        // Simulate map loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsMapLoaded(true);
      } catch (error) {
        console.error("Error loading map:", error);
        setErrorLoading(true);
      }
    };

    loadMap();
  }, []);

  // This effect would update the map when markers or location changes
  useEffect(() => {
    if (!isMapLoaded) return;
    
    // In a real implementation, you would:
    // 1. Update the map center if necessary
    // 2. Update or add bus markers
    // 3. Draw the route if showRoute is true
    // 4. Add stop markers
    
  }, [latitude, longitude, busMarkers, stops, isMapLoaded, showRoute]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="rounded-lg overflow-hidden bg-gray-100 relative" style={{ height }}>
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{
          backgroundImage: `url(${staticMapUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {errorLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80">
            <div className="text-center p-4">
              <p className="text-gray-700 mb-2">Unable to load interactive map</p>
              <p className="text-sm text-gray-500">Using static map view</p>
            </div>
          </div>
        )}
        
        {busMarkers.map((bus) => (
          <div 
            key={bus.id}
            className="absolute moving-bus"
            style={{ 
              left: `${parseInt(bus.latitude) % 100}%`, 
              top: `${parseInt(bus.longitude) % 100}%`,
              animationDelay: `${bus.id * 5}s`
            }}
          >
            <Bus className={`h-8 w-8 ${
              bus.status === 'active' ? 'text-primary' :
              bus.status === 'delayed' ? 'text-warning' :
              'text-gray-400'
            }`} />
            {bus.label && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                {bus.label}
              </div>
            )}
          </div>
        ))}
        
        {stops.map((stop) => (
          <div 
            key={stop.id}
            className="absolute"
            style={{ 
              left: `${parseInt(stop.latitude) % 100}%`, 
              top: `${parseInt(stop.longitude) % 100}%` 
            }}
          >
            <div className="h-4 w-4 bg-accent rounded-full border-2 border-white shadow-md"></div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded-md text-xs font-bold shadow-sm whitespace-nowrap">
              {stop.order}. {stop.name}
            </div>
          </div>
        ))}
      </div>
      
      {/* Map Controls */}
      <div className="absolute right-3 bottom-3 flex flex-col gap-2">
        {onRefresh && (
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-white shadow-md"
            onClick={handleRefresh}
          >
            <LocateFixed className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
