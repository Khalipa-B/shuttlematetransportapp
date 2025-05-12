import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Define the MapBox token - should be provided via environment variable
const mapboxToken = process.env.VITE_MAPBOX_TOKEN || '';

interface MapPosition {
  longitude: number;
  latitude: number;
}

interface MapMarker extends MapPosition {
  id: string;
  type: 'bus' | 'school' | 'stop' | 'home';
  label?: string;
  status?: 'active' | 'inactive' | 'delayed';
}

interface MapProps {
  center?: MapPosition;
  zoom?: number;
  markers?: MapMarker[];
  route?: MapPosition[];
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center = { longitude: -74.006, latitude: 40.7128 }, // Default to NYC
  zoom = 12,
  markers = [],
  route,
  onMarkerClick,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [center.longitude, center.latitude],
      zoom: zoom,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update center and zoom when they change
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: [center.longitude, center.latitude],
      zoom: zoom,
      essential: true,
    });
  }, [center.longitude, center.latitude, zoom]);

  // Update markers when they change
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers
    markers.forEach(marker => {
      // Create element for marker
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center';
      
      let iconColor = 'text-royal-blue';
      if (marker.status === 'delayed') iconColor = 'text-yellow-500';
      if (marker.status === 'inactive') iconColor = 'text-gray-500';
      
      let iconType = 'directions_bus';
      if (marker.type === 'school') iconType = 'school';
      if (marker.type === 'stop') iconType = 'place';
      if (marker.type === 'home') iconType = 'home';
      
      el.innerHTML = `
        <div class="bg-white p-2 rounded-full shadow-lg">
          <span class="material-icons ${iconColor}">${iconType}</span>
        </div>
      `;

      // If there's a label, add it
      if (marker.label) {
        const tooltip = new mapboxgl.Popup({ offset: 25 }).setText(marker.label);
        
        // Create the marker
        const mapMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .setPopup(tooltip)
          .addTo(map.current!);
        
        markersRef.current[marker.id] = mapMarker;
        
        // Add click handler if provided
        if (onMarkerClick) {
          el.addEventListener('click', () => {
            onMarkerClick(marker);
          });
        }
      } else {
        // Create marker without popup
        const mapMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .addTo(map.current!);
        
        markersRef.current[marker.id] = mapMarker;
        
        // Add click handler if provided
        if (onMarkerClick) {
          el.addEventListener('click', () => {
            onMarkerClick(marker);
          });
        }
      }
    });
  }, [markers, onMarkerClick]);

  // Add route line
  useEffect(() => {
    if (!map.current || !route || route.length < 2) return;

    // Wait for map to be loaded
    if (!map.current.isStyleLoaded()) {
      map.current.on('load', addRoute);
    } else {
      addRoute();
    }

    function addRoute() {
      // Remove existing route if it exists
      if (map.current?.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Add route source and layer
      map.current?.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            'coordinates': route.map(point => [point.longitude, point.latitude]),
          }
        }
      });

      map.current?.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#0047AB',
          'line-width': 8
        }
      });
    }

    return () => {
      if (map.current?.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
    };
  }, [route]);

  return (
    <div ref={mapContainer} className={`h-full w-full ${className}`}>
      {!mapboxToken && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center p-4">
            <p className="text-lg font-semibold">Map API key not configured</p>
            <p className="text-sm">Please add VITE_MAPBOX_TOKEN to your environment variables</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
