/**
 * Mapbox integration for GPS tracking functionality
 */

// Define types for map markers and routes
export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  icon?: string;
  color?: string;
  size?: number;
  label?: string;
  popupContent?: string;
}

export interface RouteStop {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedTime?: string;
  completed?: boolean;
  isCurrent?: boolean;
}

export interface RouteConfig {
  stops: RouteStop[];
  currentStopIndex?: number;
  routeColor?: string;
}

export interface BusLocation {
  busId: number;
  routeId?: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  status?: string;
  timestamp: string;
}

/**
 * Get Mapbox access token from environment variables
 */
export function getMapboxToken(): string {
  // In a real implementation, this would be provided from environment variables
  // For this example, we'll use a placeholder that will be replaced at runtime
  return 'mapbox_token_placeholder';
}

/**
 * Initialize a new Mapbox map instance
 */
export function initializeMap(
  containerId: string,
  centerLat: number = 40.7128,
  centerLng: number = -74.0060,
  zoom: number = 12
): any {
  // This is a mock implementation since we don't have Mapbox directly available
  // In a real application, this would initialize a Mapbox map
  console.log(`Initializing map in container ${containerId} at [${centerLat}, ${centerLng}] with zoom ${zoom}`);
  
  // Return a mock map object that our components can use
  return {
    containerId,
    center: [centerLng, centerLat],
    zoom,
    markers: new Map(),
    routes: new Map(),
    
    // Methods that simulate Mapbox functionality
    setCenter(lat: number, lng: number) {
      this.center = [lng, lat];
      console.log(`Map center set to [${lat}, ${lng}]`);
    },
    
    setZoom(zoom: number) {
      this.zoom = zoom;
      console.log(`Map zoom set to ${zoom}`);
    },
    
    addMarker(marker: MapMarker) {
      this.markers.set(marker.id, marker);
      console.log(`Added marker ${marker.id} at [${marker.latitude}, ${marker.longitude}]`);
      return marker.id;
    },
    
    updateMarker(markerId: string, latitude: number, longitude: number) {
      const marker = this.markers.get(markerId);
      if (marker) {
        marker.latitude = latitude;
        marker.longitude = longitude;
        console.log(`Updated marker ${markerId} to [${latitude}, ${longitude}]`);
      }
    },
    
    removeMarker(markerId: string) {
      if (this.markers.has(markerId)) {
        this.markers.delete(markerId);
        console.log(`Removed marker ${markerId}`);
      }
    },
    
    addRoute(routeId: string, config: RouteConfig) {
      this.routes.set(routeId, config);
      console.log(`Added route ${routeId} with ${config.stops.length} stops`);
    },
    
    updateRoute(routeId: string, config: RouteConfig) {
      if (this.routes.has(routeId)) {
        this.routes.set(routeId, config);
        console.log(`Updated route ${routeId}`);
      }
    },
    
    removeRoute(routeId: string) {
      if (this.routes.has(routeId)) {
        this.routes.delete(routeId);
        console.log(`Removed route ${routeId}`);
      }
    },
    
    fitBounds(bounds: [[number, number], [number, number]]) {
      console.log(`Fitting map to bounds: ${JSON.stringify(bounds)}`);
    },
    
    resize() {
      console.log('Resizing map');
    }
  };
}

/**
 * Calculate bounds to fit all markers and route stops
 */
export function calculateBounds(
  markers: MapMarker[] = [],
  routeStops: RouteStop[] = []
): [[number, number], [number, number]] | null {
  if (markers.length === 0 && routeStops.length === 0) {
    return null;
  }
  
  const points = [
    ...markers.map(m => ({ lat: m.latitude, lng: m.longitude })),
    ...routeStops.map(s => ({ lat: s.latitude, lng: s.longitude }))
  ];
  
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Add padding
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;
  
  return [
    [minLng - lngPadding, minLat - latPadding],
    [maxLng + lngPadding, maxLat + latPadding]
  ];
}

/**
 * Calculate distance between two points in km
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // Haversine formula
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return distance;
}

/**
 * Estimate travel time between two points based on average speed
 */
export function estimateTravelTime(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  speedKmh: number = 30
): number {
  if (speedKmh <= 0) return 0;
  
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return (distance / speedKmh) * 60; // Return minutes
}

/**
 * Create a bus icon element for the map
 */
export function createBusIcon(heading: number = 0): string {
  // In a real implementation, this would create an SVG icon
  // For now, we'll return a mock representation
  return `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#0047AB" />
      <path d="M8 12h16v6H8z M10 8h12v4H10z M8 18h4v3H8z M20 18h4v3h-4z M11 21a2 2 0 100 4 2 2 0 000-4z M21 21a2 2 0 100 4 2 2 0 000-4z" fill="white" />
      <path d="M16 6v2 M16 24v2" stroke="white" stroke-width="2" stroke-linecap="round" />
      <g transform="rotate(${heading} 16 16)">
        <path d="M16 8l4 4h-8l4-4z" fill="#ffffff" />
      </g>
    </svg>
  `;
}

/**
 * Create a stop icon element for the map
 */
export function createStopIcon(isCompleted: boolean = false, isCurrent: boolean = false): string {
  // Background color based on status
  const bgColor = isCurrent ? '#FFAB00' : isCompleted ? '#4CAF50' : '#9E9E9E';
  
  return `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${bgColor}" />
      <circle cx="12" cy="12" r="6" fill="white" />
      ${isCompleted ? '<path d="M8 12l2 2 6-6" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />' : ''}
    </svg>
  `;
}

/**
 * Generate a mock route between stops
 */
export function generateRoutePath(stops: RouteStop[]): Array<[number, number]> {
  if (stops.length < 2) {
    return stops.map(stop => [stop.longitude, stop.latitude]);
  }
  
  // In a real implementation, this would call a routing API
  // For now, we'll create a simplified path between stops
  const path: Array<[number, number]> = [];
  
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    path.push([stop.longitude, stop.latitude]);
    
    // If not the last stop, add some points between this stop and the next
    if (i < stops.length - 1) {
      const nextStop = stops[i + 1];
      const latDiff = nextStop.latitude - stop.latitude;
      const lngDiff = nextStop.longitude - stop.longitude;
      
      // Add 3 intermediate points
      for (let j = 1; j <= 3; j++) {
        const ratio = j / 4;
        path.push([
          stop.longitude + lngDiff * ratio,
          stop.latitude + latDiff * ratio
        ]);
      }
    }
  }
  
  return path;
}
